import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Hospitality Compliance System',
  description: 'Complete OCR-enhanced document compliance for hospitality industry',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}