// components/clients/ClientList.jsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

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
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchClients}
          className="mt-4 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Повторить попытку
        </button>
      </div>
    )
  }
  
  return (
    <div>
      {/* Поиск и кнопка добавления */}
      <div className="flex flex-wrap items-center gap-4 mb-8 sticky top-0 bg-gray-950 py-4 z-10">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
            <MagnifyingGlassIcon className="size-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Поиск клиентов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
            />
          </div>
        </div>
        
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 whitespace-nowrap"
        >
          <PlusIcon className="size-4" />
          Добавить клиента
        </Link>
      </div>
      
      {/* Статус загрузки */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Загрузка клиентов...</p>
        </div>
      )}
      
      {/* Результаты */}
      {!loading && clients.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto size-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <UserIcon className="size-6 text-gray-400" />
          </div>
          <p className="text-gray-400">
            {search ? 'Клиентов по вашему запросу не найдено' : 'Клиентов пока нет'}
          </p>
          {!search && (
            <Link href="/clients/new" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
              Добавить первого клиента →
            </Link>
          )}
        </div>
      )}
      
      {/* Список клиентов - на всю ширину, как в OrderList */}
      {!loading && clients.length > 0 && (
        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="group relative rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-wrap items-start gap-4">
                {/* Аватар/иконка клиента */}
                <div className="flex-shrink-0">
                  <div className="size-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <UserIcon className="size-6 text-indigo-400" />
                  </div>
                </div>
                
                {/* Основная информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/clients/${client.id}`}>
                      <h3 className="text-base font-semibold text-white hover:text-indigo-400 transition-colors">
                        {client.name}
                      </h3>
                    </Link>
                    {client.phone && (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <PhoneIcon className="size-4" />
                        {client.phone}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                    {client.address && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="size-4" />
                        {client.address}
                      </span>
                    )}
                    {client.notes && (
                      <span className="flex items-center gap-1">
                        <DocumentTextIcon className="size-4" />
                        {client.notes}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Кнопки действий */}
                <div className="flex-shrink-0 flex gap-2">
                  <Link
                    href={`/clients/${client.id}/edit`}
                    className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    className="rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
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