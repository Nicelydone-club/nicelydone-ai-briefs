import './globals.css'
import {Analytics} from '@vercel/analytics/next'

export const metadata = {
  title: 'Nicelydone Ops Console',
  description: 'Operations console for Nicelydone services.',
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
