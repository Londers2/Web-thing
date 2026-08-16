// app/layout.jsx
import Providers from '@/components/providers'
import Sidebar from '@/components/sidebar'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Sidebar>
            {children}
          </Sidebar>
        </Providers>
      </body>
    </html>
  )
}