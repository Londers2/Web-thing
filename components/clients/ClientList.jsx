// components/clients/ClientList.jsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import debounce from 'lodash/debounce'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import Pagination from '@/components/Pagination'

const ITEMS_PER_PAGE = 10

// Компонент для форматирования телефона
function FormattedPhone({ phone }) {
  if (!phone) return null
  
  const formatPhone = (raw) => {
    const cleaned = raw.replace(/\D/g, '')
    const limited = cleaned.slice(0, 11)
    if (limited.length === 0) return ''
    
    let result = '+7'
    if (limited.length > 1) {
      result += ' ('
      const afterCode = limited.slice(1)
      const firstThree = afterCode.slice(0, 3)
      result += firstThree
      if (afterCode.length >= 3) {
        result += ') '
        const nextThree = afterCode.slice(3, 6)
        if (nextThree.length > 0) {
          result += nextThree
        }
        const afterSix = afterCode.slice(6)
        if (afterSix.length > 0) {
          result += '-'
          const firstTwo = afterSix.slice(0, 2)
          result += firstTwo
          if (afterSix.length > 2) {
            result += '-'
            const lastTwo = afterSix.slice(2, 4)
            result += lastTwo
          }
        }
      }
    }
    return result
  }
  
  const formatted = formatPhone(phone)
  if (!formatted) return null
  
  return (
    <a 
      href={`tel:${phone}`}
      className="text-sm text-gray-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <PhoneIcon className="size-4" />
      {formatted}
    </a>
  )
}

export default function ClientList() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 0
  })
  const isFirstRender = useRef(true)
  
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      fetchClients()
      return
    }
    
    fetchClients()
  }, [search, currentPage])
  
  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (search.trim()) params.append('search', search.trim())
      params.append('page', currentPage)
      params.append('limit', ITEMS_PER_PAGE)
      
      const res = await fetch(`/api/clients?${params}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Ошибка загрузки клиентов')
      }
      
      const data = await res.json()
      
      if (data.data && Array.isArray(data.data)) {
        setClients(data.data)
        setPagination(data.pagination || {
          total: 0,
          page: 1,
          limit: ITEMS_PER_PAGE,
          totalPages: 0
        })
      } else if (Array.isArray(data)) {
        setClients(data)
        setPagination({
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1
        })
      } else {
        setClients([])
        setPagination({
          total: 0,
          page: 1,
          limit: ITEMS_PER_PAGE,
          totalPages: 0
        })
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      setError(error.message || 'Ошибка загрузки клиентов')
      setClients([])
    } finally {
      setLoading(false)
    }
  }
  
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value)
      setCurrentPage(1)
    }, 500),
    []
  )
  
  const handleSearchChange = (e) => {
    const value = e.target.value
    setLocalSearch(value)
    debouncedSearch(value)
  }
  
  const handleClearSearch = () => {
    setLocalSearch('')
    setSearch('')
    setCurrentPage(1)
    debouncedSearch.cancel()
  }
  
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleDelete = async (id, name) => {
    if (!confirm(`Удалить клиента "${name}"?`)) return
    
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        await fetchClients()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при удалении клиента')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении клиента')
    }
  }
  
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])
  
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
        <div className="flex-1 min-w-[200px] relative">
          <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
            <MagnifyingGlassIcon className="size-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Поиск клиентов..."
              value={localSearch}
              onChange={handleSearchChange}
              className="block min-w-0 grow bg-transparent py-1.5 pr-3 pl-2 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm/6"
            />
            {localSearch && (
              <button
                onClick={handleClearSearch}
                className="pr-3 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          {search && localSearch && search !== localSearch && (
            <span className="absolute right-10 top-1/2 -translate-y-1/2">
              <span className="inline-block w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            </span>
          )}
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
          {search && (
            <button
              onClick={handleClearSearch}
              className="mt-4 text-indigo-400 hover:text-indigo-300"
            >
              Очистить поиск
            </button>
          )}
          {!search && (
            <Link href="/clients/new" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
              Добавить первого клиента →
            </Link>
          )}
        </div>
      )}
      
      {/* Список клиентов */}
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
                  </div>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                    {client.phone && (
                      <FormattedPhone phone={client.phone} />
                    )}
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
                    <PencilIcon className="size-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(client.id, client.name)}
                    className="rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Пагинация */}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}