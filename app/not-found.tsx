import { DocPage } from '@/components/page'

export default function NotFound() {
  return (
    <DocPage crumb="Not found">
      <h1>Nothing here</h1>
      <p className="lede">That page doesn’t exist, or the link has expired.</p>
      <p><a href="/">Go to the homepage</a></p>
    </DocPage>
  )
}
