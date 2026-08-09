// app/auth/error/page.jsx
'use client'

import Link from 'next/link'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-500/10 p-3 rounded-full">
            <ExclamationTriangleIcon className="size-10 text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Ошибка авторизации
        </h1>
        
        <p className="text-gray-400 text-center mb-6">
          Произошла ошибка при входе. Попробуйте ещё раз.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/api/auth/signin"
            className="block w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Попробовать снова
          </Link>
          
          <Link
            href="/"
            className="block w-full text-center py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  )
}