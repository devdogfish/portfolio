# Minimalist Portfolio Website

Audience-aware portfolio for `girke.dev`. Three résumé links select tailored employer presentations; the artist footer selects client services. Plain visits use a balanced fallback unless a valid previous selection exists.

See [launch scope and links](docs/launch-scope.md) and [analytics integration](docs/analytics-dashboard-handoff.md). Configure the private receiver using `.env.example`; without it `/api/events` returns 503 instead of claiming events were saved.

Verification: `bun run lint`, `bunx tsc --noEmit`, `bun run build`, and `bunx playwright test` against the dev server on port 3100.

A clean, modern portfolio website built with Next.js and Tailwind CSS, featuring smooth animations and dark/light theme support.

## ✨ Features

- **Minimalist Design** - Clean typography with Geist font and strategic use of whitespace
- **Responsive Layout** - Mobile-first design verified at phone and desktop widths
- **Theme Toggle** - Seamless dark/light mode switching
- **Smooth Animations** - Subtle scroll-triggered animations and hover effects
- **Modern Stack** - Built with Next.js 16, TypeScript, and Tailwind CSS

## 🚀 Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## 📦 Getting Started

```bash
# Clone the repository
git clone https://github.com/devdogfish/v0-minimalist-portfolio.git

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.
