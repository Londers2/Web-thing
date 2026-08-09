// components/LogoutButton.jsx
'use client'

import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  const handleLogout = async () => {
    // Очищаем куки вручную
    document.cookie.split(';').forEach(cookie => {
      const [key] = cookie.trim().split('=')
      if (key.startsWith('next-auth.')) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
    
    await signOut({ redirect: true, callbackUrl: '/' })
  }
  
  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      Выйти
    </button>
  )
}