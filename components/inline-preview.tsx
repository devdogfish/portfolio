'use client'

import { PreviewCard, PreviewCardPopup, PreviewCardTrigger } from '@atom63/ui-react'
import { ArrowUpRight, Globe } from 'lucide-react'
import { useState } from 'react'
import { site } from '@/content/site'
import { Logo } from './logo'
import './inline-preview.css'

type Props = { label: string; href: string; description: string; image?: string }

export function InlinePreview({ label, href, description, image }: Props) {
  const [failed, setFailed] = useState(false)
  const url = new URL(href, site.origin)
  const internal = url.origin === site.origin
  const address = url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/$/, '')
  const external = internal ? {} : { target: '_blank', rel: 'noopener noreferrer' }
  const icon = internal ? <Logo size={28} /> : <Globe />

  return (
    <PreviewCard>
      <PreviewCardTrigger render={<a className="inline-preview-trigger" href={href} {...external} />}>
        <span className="inline-preview-icon" aria-hidden="true">{internal ? <ArrowUpRight /> : <Globe />}</span>
        <span>{label}</span>
      </PreviewCardTrigger>
      <PreviewCardPopup className="inline-preview-popup" align="center" side="top" sideOffset={8}>
        <a className="inline-preview-link" href={href} {...external}>
          {image && !failed && (
            <div className="inline-preview-media">
              <img src={image} alt="" fetchPriority="low" onError={() => setFailed(true)} />
            </div>
          )}
          <div className="inline-preview-body">
            <div className="inline-preview-author">
              <span className="inline-preview-avatar" role="img" aria-label={internal ? site.name : url.hostname}>{icon}</span>
              <div>
                <p>{internal ? site.name : url.hostname.replace(/^www\./, '')}</p>
                <p title={address}>{address}</p>
              </div>
            </div>
            <div className="inline-preview-summary">
              <p className="inline-preview-title">{label}</p>
              <p className="inline-preview-description">{description}</p>
            </div>
          </div>
        </a>
      </PreviewCardPopup>
    </PreviewCard>
  )
}
