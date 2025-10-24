import { Inter, Playfair_Display } from 'next/font/google'
import { FeedbackWidget } from './components/testing/FeedbackWidget'
import ConsoleManager from './components/ConsoleManager'
import BackgroundManager from './components/BackgroundManager'
import './globals.css'
import '../styles/ipad-responsive.css'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

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
      <body className={`${inter.className} min-h-screen relative`}>
        {/* Dynamic Background Manager - Body-based approach for iOS 12 compatibility */}
        <BackgroundManager />
        
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Console Management - Auto-enable quiet mode */}
        <ConsoleManager />
        
        {/* Testing Feedback Widget - Only visible with ?testing=true parameter */}
        <FeedbackWidget />
      </body>
    </html>
  )
}