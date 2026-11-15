// The site mark: a bare G drawn in currentColor, so it takes the text colour of
// wherever it sits instead of carrying its own tile.
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M79.5 29.4A36 36 0 1 0 85.6 55H54" stroke="currentColor" strokeWidth="11" strokeLinecap="square" />
    </svg>
  )
}
