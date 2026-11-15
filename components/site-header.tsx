'use client'

import {
  Button,
  Command,
  CommandDialog,
  CommandDialogBackdrop,
  CommandDialogPopup,
  CommandDialogPortal,
  CommandDialogViewport,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandPanel,
  DialogTitle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@atom63/ui-react'
import { GridRule } from '@atom63/ui-react/layout'
import { AppearanceMenu } from '@atom63/ui-react/theme'
import { ExternalLink, Eye, FileText, FolderOpen, House, Mail, MessageSquare, Settings, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { elsewhere, site } from '@/content/site'
import { Logo } from './logo'
import { appearanceDefaults, usePersonalization } from './providers'
import './site-header.css'

type Entry = { group: string; label: string; href: string; icon: LucideIcon }
export type HeaderCta = { label: string; href: string; track: string; external?: boolean }
export type HeaderProps = {
  cta?: HeaderCta
  home: string
  crumb: string
  email: string
  resume: string
  projects: { slug: string; title: string }[]
}

const groups = ['Navigate', 'Projects', 'Elsewhere', 'Actions']

export function SiteHeader({ cta, home, crumb, email, resume, projects }: HeaderProps) {
  const controller = usePersonalization()
  const router = useRouter()
  const [preferences, setPreferences] = useState(false)
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  // Terminal is hidden from Preferences; move anyone who saved it back to the default.
  const { state, setTheme } = controller
  useEffect(() => {
    if (state.theme === 'terminal') setTheme(appearanceDefaults.theme)
  }, [state.theme, setTheme])

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setMenu(open => !open)
      } else if (event.key === ',') {
        event.preventDefault()
        setPreferences(open => !open)
      }
    }
    document.addEventListener('keydown', shortcut)
    return () => document.removeEventListener('keydown', shortcut)
  }, [])

  const destinations: Entry[] = [
    { group: 'Navigate', label: 'Index', href: home, icon: House },
    { group: 'Navigate', label: 'Work', href: `${home === '/' ? '' : home}#work`, icon: FolderOpen },
    { group: 'Navigate', label: 'Contact', href: '/contact', icon: MessageSquare },
    { group: 'Navigate', label: 'Résumé', href: resume, icon: FileText },
    { group: 'Elsewhere', label: 'Copy email', href: 'email', icon: Mail },
    ...elsewhere.map(({ label, href }) => ({ group: 'Elsewhere', label, href, icon: ExternalLink })),
    { group: 'Actions', label: 'Preferences', href: 'preferences', icon: Settings },
  ]
  const query = search.trim().toLowerCase()
  // Like Raycast, everything is reachable with the arrow keys before typing anything.
  const entries = [...destinations, ...projects.map(p => ({ group: 'Projects', label: p.title, href: `/project/${p.slug}`, icon: Eye }))]
  const filtered = entries.filter(entry => entry.label.toLowerCase().includes(query))

  async function select(entry: Entry) {
    if (entry.href === 'email') {
      try {
        await navigator.clipboard.writeText(email)
        setCopied(true)
      } catch {
        window.location.assign(`mailto:${email}`)
      }
      return
    }
    setMenu(false)
    if (entry.href === 'preferences') setPreferences(true)
    else if (entry.href.startsWith('http') || entry.href.endsWith('.pdf')) window.open(entry.href, '_blank', 'noopener,noreferrer')
    else if (entry.href.startsWith('#')) document.querySelector(entry.href)?.scrollIntoView({ behavior: 'smooth' })
    else router.push(entry.href)
  }

  return (
    <>
      <header className="site-header">
        <GridRule bleed />
        <div className="header-inner">
          <a className="home-link" href={home} aria-label={`${site.name}, home`}>
            <Logo />
            <span className="slash">/</span>
            <span>{crumb}</span>
          </a>
          <div className="header-actions">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button size="icon-sm" variant="secondary" className="header-control preferences-button" aria-label="Open preferences"
                    aria-expanded={preferences} aria-haspopup="dialog" data-site-config-trigger=""
                    onClick={() => setPreferences(open => !open)} />
                }
              >
                <SlidersHorizontal />
              </TooltipTrigger>
              <TooltipContent side="bottom">Preferences　⌘,</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={<Button size="sm" variant="secondary" className="header-control menu-button" aria-label="Open site menu" onClick={() => setMenu(true)} />}
              >
                Menu <kbd>⌘K</kbd>
              </TooltipTrigger>
              <TooltipContent side="bottom">Menu　⌘K</TooltipContent>
            </Tooltip>
            {cta && (
              <Button size="sm" className="header-control header-cta" data-track={`cta:${cta.track}`} data-track-target="header"
                render={<a href={cta.href} {...(cta.external ? { target: '_blank', rel: 'noreferrer' } : {})} />}>
                {cta.label}
              </Button>
            )}
          </div>
        </div>
        <GridRule bleed />
      </header>
      <AppearanceMenu
        ignoreOutsideSelector="[data-site-config-trigger]"
        controller={controller}
        open={preferences}
        onOpenChange={setPreferences}
        showTrigger={false}
        title="Preferences"
        closeLabel="Close preferences"
        description="Adjust the surface, accent, type, and feel of the site."
        resetLabel="Reset all"
      />
      <CommandDialog
        open={menu}
        onOpenChange={(open, details) => {
          // Raycast-style Escape: the first press clears the search, the next one closes.
          if (!open && details?.reason === 'escape-key' && search) {
            details.cancel()
            setSearch('')
            return
          }
          setMenu(open)
          if (!open) {
            setSearch('')
            setCopied(false)
          }
        }}
      >
        <CommandDialogPortal>
          <CommandDialogBackdrop />
          <CommandDialogViewport>
            <CommandDialogPopup className="parity-command">
              <DialogTitle className="sr-only">Site menu</DialogTitle>
              <Command items={filtered} itemToStringValue={item => (item as Entry).label} value={search} onValueChange={setSearch} filter={null}>
                <CommandInput placeholder="Search pages and projects…" aria-label="Search site"
                  onKeyDown={event => {
                    // Emacs-style Ctrl+N / Ctrl+P, as in Raycast and most launchers.
                    if (!event.ctrlKey || event.metaKey || event.altKey) return
                    const key = { n: 'ArrowDown', p: 'ArrowUp', j: 'ArrowDown', k: 'ArrowUp' }[event.key.toLowerCase()]
                    if (!key) return
                    event.preventDefault()
                    event.currentTarget.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
                  }} />
                <CommandPanel>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandList>
                    {groups.map(group => (
                      <CommandGroup key={group}>
                        <CommandGroupLabel>{group}</CommandGroupLabel>
                        {filtered.filter(entry => entry.group === group).map(entry => (
                          <CommandItem key={entry.label} value={entry} onClick={() => select(entry)}>
                            <entry.icon size={16} />
                            <span className="command-label">{entry.href === 'email' && copied ? 'Copied' : entry.label}</span>
                            {entry.href === 'preferences' ? <kbd>⌘+,</kbd>
                              : entry.href.startsWith('http') || entry.href.endsWith('.pdf') ? <ExternalLink size={14} />
                              : entry.href !== 'email' ? <Eye size={14} /> : null}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </CommandPanel>
                <CommandFooter>
                  <span><kbd>↑↓</kbd> Navigate</span>
                  <span><kbd>↵</kbd> Open</span>
                  <span><kbd>esc</kbd> {search ? 'Clear' : 'Close'}</span>
                </CommandFooter>
              </Command>
            </CommandDialogPopup>
          </CommandDialogViewport>
        </CommandDialogPortal>
      </CommandDialog>
    </>
  )
}
