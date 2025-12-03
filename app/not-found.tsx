import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="max-w-md text-center space-y-6 px-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-light">404</h1>
          <p className="text-xl text-muted-foreground">Project not found</p>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          The project you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/#work"
          className="group inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors duration-300"
        >
          <span>Back to portfolio</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
