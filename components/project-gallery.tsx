'use client'

import { ScrollableList } from '@atom63/ui-react'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import './project-gallery.css'

export type GalleryItem = { slug: string; title: string; year: string; note: string; image?: string }

const PAD = 24

// ScrollableList's chevrons scroll a fixed 80% of the width, which leaves cards
// cut off at odd points. Take over those clicks and move exactly one card instead.
function stepToCard(event: MouseEvent<HTMLDivElement>) {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[aria-label^="Scroll "]')
  if (!button) return
  const viewport = event.currentTarget.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]')
  if (!viewport) return
  event.preventDefault()
  event.stopPropagation()
  const origin = viewport.getBoundingClientRect().left + PAD
  const offsets = [...viewport.querySelectorAll<HTMLElement>('.parity-project')].map(card => card.getBoundingClientRect().left - origin)
  const delta = button.getAttribute('aria-label') === 'Scroll right'
    ? offsets.find(offset => offset > 1)
    : offsets.findLast(offset => offset < -1)
  if (delta === undefined) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  viewport.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' })
}

export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  return (
    <div onClickCapture={stepToCard}>
      <ScrollableList className="parity-projects" contentPad={`${PAD}px`} controlInset="0px" mask={false} showChevrons>
        {items.map(item => (
          <Link key={item.slug} href={`/project/${item.slug}`} className="parity-project project-card" data-track="cta:project" data-track-target={item.slug}>
            <div className="parity-project-origin">
              <div className="parity-project-images">
                {item.image
                  ? <img loading="lazy" src={item.image} alt="" />
                  : <span className="project-card-blank" aria-hidden="true">{item.title}</span>}
              </div>
            </div>
            <div className="project-card-caption">
              <p className="project-card-title">{item.title} <span>{item.year}</span></p>
              <p className="project-card-note">{item.note}</p>
            </div>
            <span className="parity-project-destination" aria-hidden="true"><span><ArrowUpRight size={16} /></span></span>
          </Link>
        ))}
      </ScrollableList>
    </div>
  )
}
