import { PreviewCard, PreviewCardPopup, PreviewCardTrigger } from '@atom63/ui-react'
import { Globe } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import './inline-preview.css'

interface InlinePreviewProps {
  label: ReactNode
  href: string
  image?: string
  description?: string
  author?: string
  avatar?: string
  favicon?: string
  icon?: ReactNode
  siteLabel?: string
  title?: string
  meta?: string
}

export function InlinePreview({ label, href, image, description, author, avatar, favicon, icon, siteLabel, title, meta }: InlinePreviewProps) {
  const [failedImage, setFailedImage] = useState<string>()
  let host = href
  let address = href
  try {
    const url = new URL(href, document.baseURI)
    host = url.hostname.replace(/^www\./, '')
    address = host + url.pathname.replace(/\/$/, '')
  } catch {
    // Malformed or unavailable origins fall back to the supplied destination.
  }

  const displayAuthor = author || siteLabel || host
  const displayTitle = title || (typeof label === 'string' ? label : host)
  const leading = icon || (favicon ? <img src={favicon} alt="" /> : <Globe />)

  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={<a className="inline-preview-trigger" href={href} target="_blank" rel="noopener noreferrer" />}
      >
        <span className="inline-preview-icon" aria-hidden="true">{leading}</span>
        <span>{label}</span>
      </PreviewCardTrigger>
      <PreviewCardPopup className="inline-preview-popup" align="center" side="top" sideOffset={8}>
        <a className="inline-preview-link" href={href} target="_blank" rel="noopener noreferrer">
          {image && image !== failedImage && (
            <div className="inline-preview-media">
              <img src={image} alt="" fetchPriority="low" onError={() => setFailedImage(image)} />
            </div>
          )}
          <div className="inline-preview-body">
            <div className="inline-preview-author">
              <span className="inline-preview-avatar" aria-label={siteLabel || host} role="img">
                {avatar ? <img src={avatar} alt="" /> : icon || (favicon ? <img src={favicon} alt="" /> : displayAuthor.slice(0, 1))}
              </span>
              <div>
                <p>{displayAuthor}</p>
                <p title={address}>{address}</p>
              </div>
            </div>
            <div className="inline-preview-summary">
              <p className="inline-preview-title">{displayTitle}</p>
              <p className="inline-preview-description">{description || `Open ${displayTitle} in a new tab.`}</p>
              {meta && <p className="inline-preview-meta">{meta}</p>}
            </div>
          </div>
        </a>
      </PreviewCardPopup>
    </PreviewCard>
  )
}
