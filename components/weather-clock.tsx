'use client'

import { WidgetGrid, WidgetViewport, WIDGET_BODY_GAP, widgetClampRelief, widgetInsetStyle, widgetTypeStyle, wu, type WidgetSize } from '@atom63/widgets';
import { WidgetCard } from '@atom63/widgets/primitives';
import { WidgetStateFeedback, widgetStateCopy } from '@atom63/widgets/state';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { site } from '@/content/site';
import './weather-clock.css';

const LOCATION = site.location;
const TIME_ZONE = site.timeZone;
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
  latitude: String(site.coordinates.latitude),
  longitude: String(site.coordinates.longitude),
  current: 'temperature_2m,weather_code,is_day',
  hourly: 'weather_code',
  daily: 'temperature_2m_max,temperature_2m_min',
  temperature_unit: 'celsius',
  timezone: TIME_ZONE,
  forecast_days: '1',
});

type WeatherConditions = {
  temperature: number;
  high: number;
  low: number;
  code: number;
  isDay: boolean;
};

type WeatherResponse = {
  current?: { temperature_2m?: number; weather_code?: number; is_day?: number; time?: string };
  hourly?: { time?: string[]; weather_code?: number[] };
  daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
};

type WeatherState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; conditions: WeatherConditions; stale?: boolean };

const weatherCopy = widgetStateCopy({
  empty: 'No weather data yet',
  error: 'Unable to load weather',
  loading: 'Loading weather',
});

async function fetchWeather(signal: AbortSignal): Promise<WeatherConditions> {
  const response = await fetch(WEATHER_URL, { signal });
  if (!response.ok) throw new Error('Weather request failed');

  const data: WeatherResponse = await response.json();
  const current = data.current;
  const hour = current?.time?.slice(0, 13);
  const hourIndex = hour ? data.hourly?.time?.findIndex((time) => time.startsWith(hour)) : undefined;
  const code = (hourIndex === undefined ? undefined : data.hourly?.weather_code?.[hourIndex]) ?? current?.weather_code;
  const temperature = current?.temperature_2m;
  const high = data.daily?.temperature_2m_max?.[0];
  const low = data.daily?.temperature_2m_min?.[0];
  if (typeof temperature !== 'number' || typeof high !== 'number' || typeof low !== 'number' ||
    typeof code !== 'number' || ![temperature, high, low, code].every(Number.isFinite)) {
    throw new Error('Weather data is incomplete');
  }

  return { temperature, high, low, code, isDay: current?.is_day === 1 };
}

const CONDITIONS = {
  0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime Fog',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle', 57: 'Freezing Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  66: 'Light Freezing Rain', 67: 'Freezing Rain',
  71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
  80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
  85: 'Light Snow Showers', 86: 'Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Thunderstorm with Heavy Hail',
} satisfies Record<number, string>;

function weatherAppearance(code: number, isDay: boolean) {
  if (code === 0 || code === 1) {
    const sky = isDay ? 'clear-day' : 'clear-night';
    return { icon: sky, tone: sky };
  }
  if (code === 2) {
    const sky = isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
    return { icon: sky, tone: sky };
  }
  if (code === 45 || code === 48) return { icon: 'fog', tone: 'fog' };
  if (code >= 95) return { icon: 'thunderstorms', tone: 'storm' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { icon: 'snow', tone: 'snow' };
  if (code >= 51 && code <= 57) return { icon: 'drizzle', tone: 'rain' };
  if (code >= 61 && code <= 82) return { icon: 'rain', tone: 'rain' };
  return { icon: 'cloudy', tone: 'overcast' };
}

export function WeatherWidget({ size = 'small', location = false }: { size?: WidgetSize; location?: boolean } = {}) {
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [unit, setUnit] = useState<'F' | 'C'>('C');

  useEffect(() => {
    const lifetime = new AbortController();
    let refreshing = false;
    async function refresh() {
      if (refreshing) return;
      refreshing = true;
      const request = new AbortController();
      const cancel = () => request.abort();
      lifetime.signal.addEventListener('abort', cancel, { once: true });
      const timeout = window.setTimeout(cancel, 10_000);
      try {
        const conditions = await fetchWeather(request.signal);
        if (!lifetime.signal.aborted) setWeather({ status: 'ready', conditions });
      } catch (error) {
        if (!lifetime.signal.aborted) {
          setWeather((previous) => previous.status === 'ready' ? { ...previous, stale: true } : { status: 'error', error });
        }
      } finally {
        window.clearTimeout(timeout);
        lifetime.signal.removeEventListener('abort', cancel);
        refreshing = false;
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 30 * 60 * 1_000);
    window.addEventListener('online', refresh);
    return () => {
      lifetime.abort();
      window.clearInterval(timer);
      window.removeEventListener('online', refresh);
    };
  }, [attempt]);

  function convert(value: number) {
    return Math.round(unit === 'F' ? value * 9 / 5 + 32 : value);
  }

  const appearance = weather.status === 'ready'
    ? weatherAppearance(weather.conditions.code, weather.conditions.isDay)
    : undefined;

  return (
    <WidgetViewport size={size} aria-label={location ? LOCATION + ' weather and time' : LOCATION + ' weather'}>
      <WidgetCard size={size} data-widget-kind={location ? 'location' : 'weather'} data-weather-tone={appearance?.tone}>
        {weather.status === 'ready' && appearance ? (
          <div className={location ? 'wc-weather wc-weather-location' : 'wc-weather'} style={widgetInsetStyle(size, 'face')}>
            <span className="wc-location" style={{
              ...widgetTypeStyle('title', size, { leading: 1.2 }),
              ...widgetClampRelief(),
            }}>{location && <MapPin aria-hidden="true" />}{LOCATION}</span>
            <button
              className="wc-temp"
              type="button"
              aria-label={convert(weather.conditions.temperature) + ' degrees ' +
                (unit === 'F' ? 'Fahrenheit. Switch to Celsius' : 'Celsius. Switch to Fahrenheit')}
              onClick={() => setUnit(unit === 'F' ? 'C' : 'F')}
              style={widgetTypeStyle('display', size, { weight: location ? 600 : 200, leading: 1, trackingEm: -0.05 })}
            >
              {convert(weather.conditions.temperature)}
              {location ? (
                <span className="wc-location-unit">
                  <img alt="" className="wc-weather-icon" src={`/weather/weather-${appearance.icon}.svg`} />
                  <span>°{unit}</span>
                </span>
              ) : <>°{unit}</>}
            </button>
            <div className="wc-conditions">
              <div className="wc-conditions-text">
                <span className="wc-condition" style={widgetTypeStyle('body', size, { weight: 500 })}>
                  {CONDITIONS[weather.conditions.code as keyof typeof CONDITIONS] ?? 'Unknown conditions'}
                </span>
                <span className="wc-high-low" style={widgetTypeStyle('body', size)}>
                  H:{convert(weather.conditions.high)}°{'  '}L:{convert(weather.conditions.low)}°
                </span>
                {weather.stale && <span className="wc-stale" style={widgetTypeStyle('label', 'small')}>Last reported</span>}
              </div>
              {!location && <img alt="" className="wc-weather-icon" src={`/weather/weather-${appearance.icon}.svg`} />}
            </div>
            {location && <PacificClock />}
          </div>
        ) : (
          <WidgetStateFeedback
            size={size}
            state={weather.status === 'error' ? 'error' : 'loading'}
            copy={weather.status === 'error' ? weatherCopy('error', weather.error) : weatherCopy('loading')}
            onRetry={() => {
              setWeather({ status: 'loading' });
              setAttempt((value) => value + 1);
            }}
          />
        )}
      </WidgetCard>
    </WidgetViewport>
  );
}

const pacificTime = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const pacificDate = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric',
});

function PacificClock() {
  const [time, setTime] = useState(() => new Date(0));
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="wc-pacific">
      <span style={widgetTypeStyle('label', 'small')}>{pacificDate.format(time)} · AT</span>
      <time style={widgetTypeStyle('displayCompact', 'small', { leading: 1 })} dateTime={time.toISOString()}>{pacificTime.format(time)}</time>
    </div>
  );
}

const clockFormat = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: TIME_ZONE,
});

const clockSize = 164;
const center = clockSize / 2;
const fixed = (value: number) => Math.round(value * 1000) / 1000;
const ticks = Array.from({ length: 12 }, (_, index) => {
  const radians = (index * 30 - 90) * Math.PI / 180;
  return {
    x1: fixed(center + clockSize * 0.38 * Math.cos(radians)),
    y1: fixed(center + clockSize * 0.38 * Math.sin(radians)),
    x2: fixed(center + clockSize * 0.42 * Math.cos(radians)),
    y2: fixed(center + clockSize * 0.42 * Math.sin(radians)),
    strokeWidth: index % 3 === 0 ? 2 : 1,
  };
});

export function AnalogClockFace({ now, size = clockSize }: { now: Date; size?: number }) {
  const localTime = clockFormat.format(now);
  const [hour, minute, second] = localTime.split(':').map(Number);
  const hourAngle = (hour % 12 + minute / 60) * 30;
  const minuteAngle = (minute + second / 60) * 6;
  const secondAngle = second * 6;

  return (
    <svg aria-label={localTime + ' local time'} role="img" viewBox="0 0 164 164" style={{ width: wu(size) }}>
      <circle className="wc-clock-face" cx={center} cy={center} r={center - 2} strokeWidth={1.5} />
      <g className="wc-ticks" strokeLinecap="round">
        {ticks.map((tick, index) => <line key={index} {...tick} />)}
      </g>
      <g className="wc-clock-hands" strokeLinecap="round">
        <line x1={center} x2={center} y1={center} y2={center - clockSize * 0.25}
          strokeWidth={3} transform={`rotate(${hourAngle} ${center} ${center})`} />
        <line x1={center} x2={center} y1={center} y2={center - clockSize * 0.35}
          strokeWidth={2} transform={`rotate(${minuteAngle} ${center} ${center})`} />
        <line className="wc-clock-second" x1={center} x2={center} y1={center + clockSize * 0.08}
          y2={center - clockSize * 0.38} strokeWidth={1} transform={`rotate(${secondAngle} ${center} ${center})`} />
      </g>
      <circle className="wc-clock-pin" cx={center} cy={center} r={3} />
    </svg>
  );
}

export function AnalogClockWidget() {
  const [now, setNow] = useState(() => new Date(0));

  useEffect(() => {
    let timer: number;
    function tick() {
      const time = new Date();
      setNow(time);
      timer = window.setTimeout(tick, 1000 - time.getMilliseconds());
    }
    tick();
    return () => window.clearTimeout(timer);
  }, []);


  return (
    <WidgetViewport size="small" aria-label="Local time">
      <WidgetCard size="small" data-widget-kind="local-time">
        <figure className="wc-clock" style={{
          ...widgetInsetStyle('small', 'face', { gap: false }),
          gap: wu(WIDGET_BODY_GAP.small),
        }}>
          <AnalogClockFace now={now} />
          <figcaption style={{
            ...widgetTypeStyle('label', 'small', { leading: 1 }),
            ...widgetClampRelief(),
          }}>{LOCATION}</figcaption>
        </figure>
      </WidgetCard>
    </WidgetViewport>
  );
}

export function WeatherClock() {
  return (
    <WidgetGrid className="wc-pair">
      <WeatherWidget />
      <AnalogClockWidget />
    </WidgetGrid>
  );
}
