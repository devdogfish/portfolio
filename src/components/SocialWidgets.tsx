import { Avatar, AvatarFallback, AvatarImage, Button } from '@atom63/ui-react';
import { WidgetGrid, WidgetViewport, widgetClampRelief, widgetInsetStyle, widgetTypeStyle, wu } from '@atom63/widgets';
import { WidgetCard } from '@atom63/widgets/primitives';
import './social-widgets.css';

const instagramUrl = 'https://www.instagram.com/atom63_/';
const behanceUrl = 'https://www.behance.net/youzhang';

const features = [
  { label: 'Behance', mark: '', background: '#004fff', color: '#fff', count: null },
  { label: 'Graphic Design', mark: 'Gr', background: '#ad9058', color: '#fff', count: 2 },
  { label: 'Illustration', mark: 'Il', background: '#ad9058', color: '#fff', count: 3 },
  { label: '3D Art', mark: '3d', background: '#ad9058', color: '#fff', count: 11 },
  { label: 'Adobe Illustrator', mark: 'Ai', background: '#330000', color: '#ff9a00', count: 2 },
  { label: 'Adobe Photoshop', mark: 'Ps', background: '#001e36', color: '#31a8ff', count: 6 },
  { label: 'Adobe After Effects', mark: 'Ae', background: '#00005b', color: '#9999ff', count: 4 },
];
const stats = [
  [{ name: 'Followers', value: '15K' }, { name: 'Views', value: '526K' }],
  [{ name: 'Appreciations', value: '46K' }, { name: 'Updated', value: 'Jul 19', date: '2026-07-19' }],
];

function SocialIcon({ name }: { name: 'instagram' | 'behance' }) {
  return <span aria-hidden="true" className={`sw-icon sw-icon-${name}`} />;
}

export function InstagramWidget() {
  return (
    <WidgetViewport size="small" aria-label="ATOM63 on Instagram">
      <WidgetCard size="small" className="size-full" data-widget-kind="instagram">
        <div className="sw-instagram" style={widgetInsetStyle('small', 'face')}>
          <div className="sw-instagram-profile">
            <div className="sw-profile-copy">
              <a className="sw-profile-link" href={instagramUrl} target="_blank" rel="noopener noreferrer"
                aria-label="View @atom63_ profile on Instagram" title="@atom63_">
                <SocialIcon name="instagram" />
                <span style={{ ...widgetTypeStyle('name', 'small', { weight: 500, leading: 1 }), ...widgetClampRelief() }}>atom63_</span>
              </a>
              <p className="sw-followers" style={widgetTypeStyle('body', 'small', { leading: 1 })}>
                <strong>14K</strong> Followers
              </p>
            </div>
            <span className="sw-avatar-ring" aria-hidden="true">
              <Avatar>
                <AvatarImage src="/assets/home-profile.png" alt="" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </span>
          </div>
          <a className="sw-instagram-posts" href={instagramUrl} target="_blank" rel="noopener noreferrer"
            aria-label="View @atom63_ posts on Instagram. 14K followers.">
            {Array.from({ length: 6 }, (_, index) => (
              <span className="sw-post" key={index}>
                <img src={`/assets/ins-0${index + 1}.webp`} alt={`Instagram post ${index + 1}`} loading="lazy" />
              </span>
            ))}
          </a>
        </div>
      </WidgetCard>
    </WidgetViewport>
  );
}

export function BehanceWidget() {
  return (
    <WidgetViewport size="small" aria-label="Behance profile stats">
      <WidgetCard size="small" className="size-full" data-widget-kind="behance">
        <div className="sw-behance" style={widgetInsetStyle('small', 'body')}>
          <ul className="sw-badges" aria-label="Behance features">
            {features.map(({ label, mark, background, color, count }) => (
              <li key={label}>
                <span className="sr-only">Featured in {label}</span>
                <span className="sw-badge-box" aria-hidden="true">
                  <span className="sw-badge" style={{ background, color }}>
                    {mark || <SocialIcon name="behance" />}
                  </span>
                </span>
                <span className="sw-badge-count" aria-hidden={count === null}>{count}</span>
              </li>
            ))}
          </ul>
          <dl className="sw-stats">
            {stats.map((row) => (
              <div className="sw-stat-row" key={row[0].name}>
                {row.map(({ name, value, date }) => (
                  <div className="sw-stat" key={name}>
                    <dt style={{ ...widgetTypeStyle('label', 'small', { leading: 1 }), ...widgetClampRelief() }}>{name}</dt>
                    <dd style={widgetTypeStyle('stat', 'small', { leading: 1 })}>
                      {date ? <time dateTime={date}>{value}</time> : value}
                    </dd>
                  </div>
                ))}
              </div>
            ))}
          </dl>
          <Button
            className="sw-behance-link"
            render={<a href={behanceUrl} target="_blank" rel="noopener noreferrer" />}
            size="sm"
            variant="secondary"
            style={{ ...widgetTypeStyle('body', 'small'), height: wu(36), minHeight: wu(36), paddingInline: wu(12) }}
          >
            <SocialIcon name="behance" /> View Behance
          </Button>
        </div>
      </WidgetCard>
    </WidgetViewport>
  );
}

export function SocialWidgets() {
  return (
    <WidgetGrid className="sw-grid">
      <InstagramWidget />
      <BehanceWidget />
    </WidgetGrid>
  );
}
