// components/clients/ClientList.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    fetchClients()
  }, [search])
  
  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const res = await fetch(`/api/clients?${params}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Ошибка загрузки клиентов')
      }
      
      const data = await res.json()
      setClients(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError(error.message || 'Ошибка загрузки клиентов')
      setClients([])
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить клиента "${name}"?`)) return
    
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setClients(clients.filter(client => client.id !== id))
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при удалении клиента')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении клиента')
    }
  }
  
  if (loading) {
    return <div className="text-center py-8">Загрузка клиентов...</div>
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Ошибка: {error}</p>
        <button 
          onClick={fetchClients}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Повторить попытку
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск клиентов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        
        <Link
          href="/clients/new"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Добавить клиента
        </Link>
      </div>
      
      {clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">Клиентов пока нет</p>
          <Link href="/clients/new" className="mt-4 inline-block text-blue-600 hover:underline">
            Добавить первого клиента
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <Link href={`/clients/${client.id}`}>
                    <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                      {client.name}
                    </h3>
                  </Link>
                  
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {client.phone && (
                      <span>📞 {client.phone}</span>
                    )}
                    {client.address && (
                      <span>📍 {client.address}</span>
                    )}
                    {client.notes && (
                      <span className="line-clamp-1">{client.notes}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/clients/${client.id}/edit`}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}