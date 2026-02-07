import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'WeDate - Find Your Match',
  description: 'A modern dating app to find your perfect match',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
