'use client'

import { TooltipProvider } from '@atom63/ui-react'
import { createPersonalizationController } from '@atom63/ui-react/theme'
import type { ReactNode } from 'react'

export const appearanceDefaults = {
  mode: 'dark',
  theme: 'retro',
  brand: 'b1',
  surface: 'n1',
  surfaceTint: 35,
  typeScale: 'normal',
  radius: 'default',
  font: 'sans',
  os: 'macos',
  iconTheme: 'neutral',
  wallpaper: null,
} as const

export const { PersonalizationProvider, usePersonalization } = createPersonalizationController({
  storageKey: 'portfolio-appearance',
  defaultState: appearanceDefaults,
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PersonalizationProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </PersonalizationProvider>
  )
}
