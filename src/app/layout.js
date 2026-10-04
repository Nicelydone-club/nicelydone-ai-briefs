import './globals.css'
import {Analytics} from '@vercel/analytics/next'

export const metadata = {
  title: 'Nicelydone AI Briefs',
  description: 'Generate AI briefs from any prompt, streamed via the Vercel AI Gateway.',
}

export default function RootLayout({children}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
