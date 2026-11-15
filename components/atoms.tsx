'use client'

// The design system ships without "use client" banners. Re-exporting through this
// module lets server components render them as client components.
export { Button, Card, CardContent, Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@atom63/ui-react'
export { GridChrome, GridRule } from '@atom63/ui-react/layout'
