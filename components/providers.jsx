// components/providers.jsx
'use client'

import { SessionProvider } from 'next-auth/react'

export default function Providers({ children }) {
  return (
    <SessionProvider 
      refetchOnWindowFocus={true}
      refetchInterval={60}
    >
      {children}
    </SessionProvider>
  )
}