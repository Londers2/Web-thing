// components/orders/OrderList.jsx
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import debounce from 'lodash/debounce'
import Pagination from '@/components/Pagination'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  PhotoIcon,
  TrashIcon,
  PencilIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  TagIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  PhoneIcon,
  ClockIcon,
  CubeIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import { EVENT_TYPES } from '@/lib/constants/eventTypes'

const ITEMS_PER_PAGE = 10

const statusConfig = {
  new: { label: 'Новый', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  in_progress: { label: 'В работе', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  completed: { label: 'Выполнен', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  cancelled: { label: 'Отменён', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

const priorityConfig = {
  low: { label: 'Низкий', color: 'text-gray-400' },
  medium: { label: 'Средний', color: 'text-yellow-400' },
  high: { label: 'Высокий', color: 'text-red-400' },
}

function EventBadge({ type }) {
  const config = EVENT_TYPES[type]
  if (!config) return null
  
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${config.color}`}>
      {config.icon} {config.label}
    </span>
  )
}

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
      className="hover:text-indigo-400 transition-colors flex items-center gap-1"
    >
      <PhoneIcon className="size-3.5" />
      {formatted}
    </a>
  )
}

function SearchInfo() {
  return (
    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
      <InformationCircleIcon className="size-3.5" />
      <span>Поиск по: названию, описанию, адресу, клиенту, телефону, участникам</span>
    </div>
  )
}

export default function OrderList() {
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [localSearch, setLocalSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  useEffect(() => {
    fetchAllOrders()
  }, [filter])
  
  const fetchAllOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      
      const res = await fetch(`/api/orders?${params}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Ошибка загрузки заказов')
      }
      
      const data = await res.json()
      setAllOrders(data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error.message || 'Ошибка загрузки заказов')
      setAllOrders([])
    } finally {
      setLoading(false)
    }
  }
  
  const filteredOrders = useMemo(() => {
    if (!search.trim()) return allOrders
    
    const searchLower = search.trim().toLowerCase()
    
    return allOrders.filter(order => {
      if (order.title?.toLowerCase().includes(searchLower)) return true
      if (order.description?.toLowerCase().includes(searchLower)) return true
      
      if (order.client) {
        if (order.client.name?.toLowerCase().includes(searchLower)) return true
        if (order.client.phone?.includes(search.trim())) return true
      }
      
      if (order.order_participants) {
        for (const p of order.order_participants) {
          if (p.user?.name?.toLowerCase().includes(searchLower)) return true
        }
      }
      
      return false
    })
  }, [allOrders, search])
  
  const totalCount = filteredOrders.length
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  
  useEffect(() => {
    setCurrentPage(1)
  }, [search])
  
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value)
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
    debouncedSearch.cancel()
  }
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1)
  }
  
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleDelete = async (id, title) => {
    if (!confirm(`Удалить заказ "${title}"?`)) return
    
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        await fetchAllOrders()
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при удалении заказа')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении заказа')
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
          onClick={fetchAllOrders}
          className="mt-4 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Повторить попытку
        </button>
      </div>
    )
  }
  
  return (
    <div>
      {/* Поиск и фильтры */}
      <div className="flex flex-wrap items-start gap-4 mb-8 sticky top-0 bg-gray-950 py-4 z-10">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
            <MagnifyingGlassIcon className="size-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Поиск по названию, клиенту..."
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
          <SearchInfo />
        </div>
        
        <div className="relative">
          <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
            <FunnelIcon className="size-5 text-gray-400 shrink-0 ml-1" />
            <select
              value={filter}
              onChange={handleFilterChange}
              className="w-full appearance-none bg-transparent py-1.5 pr-8 pl-2 text-base text-white focus:outline-none sm:text-sm/6"
            >
              <option value="all" className="bg-gray-800">Все заказы</option>
              <option value="new" className="bg-gray-800">Новые</option>
              <option value="in_progress" className="bg-gray-800">В работе</option>
              <option value="completed" className="bg-gray-800">Выполненные</option>
              <option value="cancelled" className="bg-gray-800">Отменённые</option>
            </select>
          </div>
        </div>
        
        <Link
          href="/order/new"
          className="inline-flex items-center gap-2 rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 whitespace-nowrap"
        >
          <PlusIcon className="size-4" />
          Создать заказ
        </Link>
      </div>
      
      {/* Статус загрузки */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Загрузка заказов...</p>
        </div>
      )}
      
      {/* Результаты */}
      {!loading && filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto size-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <PhotoIcon className="size-6 text-gray-400" />
          </div>
          <p className="text-gray-400">
            {search ? 'Заказов по вашему запросу не найдено' : 'Заказов пока нет'}
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
            <Link href="/order/new" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
              Создать первый заказ →
            </Link>
          )}
        </div>
      )}
      
      {/* Список заказов */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              className="group relative rounded-xl bg-white/5 p-5 hover:bg-white/10 transition-colors"
            >
              {/* Заголовок и статусы */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/order/${order.id}`}>
                    <h3 className="text-base font-semibold text-white hover:text-indigo-400 transition-colors">
                      {order.title}
                    </h3>
                  </Link>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusConfig[order.status]?.color || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {statusConfig[order.status]?.label || order.status}
                  </span>
                  <span className={`text-xs ${priorityConfig[order.priority]?.color || 'text-gray-400'}`}>
                    {priorityConfig[order.priority]?.label || order.priority}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Link
                    href={`/order/${order.id}/edit`}
                    className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    <PencilIcon className="size-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(order.id, order.title)}
                    className="rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </div>
              
              {/* Описание */}
              {order.description && (
                <div className="mb-3 text-sm text-gray-400 line-clamp-2">
                  <DocumentTextIcon className="size-3.5 inline mr-1" />
                  {order.description}
                </div>
              )}
              
              {/* Разделитель */}
              <div className="border-t border-white/5 my-3" />
              
              {/* Блок с датами и событиями */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {order.events && order.events.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ClipboardDocumentCheckIcon className="size-4 text-gray-400" />
                    {order.events.slice(0, 3).map((event, idx) => (
                      <EventBadge key={idx} type={event.type} />
                    ))}
                    {order.events.length > 3 && (
                      <span className="text-xs text-gray-500">+{order.events.length - 3}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Нет событий</span>
                )}
                
                {order.totalAmount && (
                  <span className="flex items-center gap-1 text-sm text-gray-300">
                    <CurrencyDollarIcon className="size-4" />
                    {Number(order.totalAmount).toLocaleString()} ₽
                  </span>
                )}
              </div>
              
              {/* Разделитель */}
              <div className="border-t border-white/5 my-3" />
              
              {/* Адреса */}
              {order.addresses && order.addresses.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-start gap-1.5 text-sm text-gray-400">
                    <MapPinIcon className="size-4 flex-shrink-0 mt-0.5" />
                    <div>
                      {order.addresses.map((addr, idx) => (
                        <div key={idx} className={idx > 0 ? 'mt-1' : ''}>
                          {addr.address}
                          {addr.title && (
                            <span className="text-gray-500 text-xs ml-2">
                              ({addr.title})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Клиент */}
              {order.client && (
                <div className="flex items-center gap-1.5 text-sm">
                  <UserIcon className="size-4 text-gray-400" />
                  <Link 
                    href={`/clients/${order.client.id}`}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {order.client.name}
                  </Link>
                  {order.client.phone && (
                    <FormattedPhone phone={order.client.phone} />
                  )}
                </div>
              )}
              
              {/* Участники заказа */}
              {order.order_participants && order.order_participants.length > 0 && (
                <>
                  <div className="border-t border-white/5 my-3" />
                  <div className="flex items-start gap-2">
                    <UserGroupIcon className="size-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {order.order_participants.map((p, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 text-xs rounded-full border bg-gray-500/10 text-gray-400 border-gray-500/20"
                        >
                          {p.user?.name || 'Пользователь'}
                          <span className="text-gray-500 ml-1">
                            ({p.role === 'manager' ? 'Менеджер' : p.role === 'measurer' ? 'Замерщик' : 'Сборщик'})
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* Дата создания */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-gray-500">
                <ClockIcon className="size-3.5" />
                <span>Создан: {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          ))}
          
          {/* Пагинация */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}