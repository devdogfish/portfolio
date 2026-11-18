import type { CSSProperties } from 'react'

export function PageCount({ total }: { total: number }) {
  const formatted = total.toLocaleString('en-CA')
  return (
    <span className="page-counter">
      <span className="sr-only">{formatted} pages</span>
      <span aria-hidden="true">
        {Array.from(formatted, (char, index) => {
          if (char === ',') return char
          const steps = Number(char) || 10
          return (
            <span className="counter-window" key={index}>
              <span className="counter-sizing-digit">{char}</span>
              <span className="counter-reel" style={{
                '--travel': steps + 'em',
                '--duration': (780 + index * 90) + 'ms',
              } as CSSProperties}>
                {Array.from({ length: steps + 1 }, (_, i) => <span key={i}>{i % 10}</span>)}
              </span>
            </span>
          )
        })} pages
      </span>
    </span>
  )
}
