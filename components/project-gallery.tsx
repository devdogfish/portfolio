'use client'

import { ScrollableList } from '@atom63/ui-react'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import './project-gallery.css'

export type GalleryItem = { slug: string; title: string; year: string; note: string; image?: string }

export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  return (
    <ScrollableList className="parity-projects" contentPad="24px" controlInset="0px" mask={false} showChevrons>
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
  )
}
