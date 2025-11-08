import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StatusTray from '../components/StatusTray'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '1v1me',
  description: 'Challenge and compete in 1v1 matches',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-900 dark:bg-slate-950 dark:text-white`}>
        {children}
        <StatusTray />
      </body>
    </html>
  )
}

