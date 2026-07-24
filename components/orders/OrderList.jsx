// components/orders/OrderList.jsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import debounce from 'lodash/debounce'
import Pagination from '@/components/Pagination'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

const ITEMS_PER_PAGE = 5

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

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
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
      fetchOrders()
      return
    }
    
    fetchOrders()
  }, [filter, search, currentPage])
  
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (search.trim()) params.append('search', search.trim())
      params.append('page', currentPage)
      params.append('limit', ITEMS_PER_PAGE)
      
      const res = await fetch(`/api/orders?${params}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Ошибка загрузки заказов')
      }
      
      const data = await res.json()
      setOrders(data.data || [])
      setPagination(data.pagination || {
        total: 0,
        page: 1,
        limit: ITEMS_PER_PAGE,
        totalPages: 0
      })
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error.message || 'Ошибка загрузки заказов')
      setOrders([])
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
  
  const handleFilterChange = (e) => {
    setFilter(e.target.value)
    setCurrentPage(1)
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
          onClick={fetchOrders}
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
      <div className="flex flex-wrap items-center gap-4 mb-8 sticky top-0 bg-gray-950 py-4 z-10">
        <div className="flex-1 min-w-[200px] relative">
          <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-white/10 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-500">
            <MagnifyingGlassIcon className="size-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Поиск заказов..."
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
      {!loading && orders.length === 0 && (
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
      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group relative rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-wrap items-start gap-4">
                {/* Аватар/иконка заказа */}
                <div className="flex-shrink-0">
                  <div className="size-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    {order.images && order.images.length > 0 ? (
                      <img
                        src={order.images[0].url}
                        alt=""
                        className="size-12 rounded-lg object-cover"
                      />
                    ) : (
                      <PhotoIcon className="size-6 text-indigo-400" />
                    )}
                  </div>
                </div>
                
                {/* Основная информация */}
                <div className="flex-1 min-w-0">
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
                  
                  {order.description && (
                    <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                      {order.description}
                    </p>
                  )}
                  
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                    {order.address && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="size-4" />
                        {order.address}
                      </span>
                    )}
                    {order.totalAmount && (
                      <span className="flex items-center gap-1">
                        <CurrencyDollarIcon className="size-4" />
                        {Number(order.totalAmount).toLocaleString()} ₽
                      </span>
                    )}
                    {order.date && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="size-4" />
                        {new Date(order.date).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                    {order.client && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="size-4" />
                        <Link href={`/clients/${order.client.id}`} className="hover:text-indigo-400 transition-colors">
                          {order.client.name}
                        </Link>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Кнопка редактирования */}
                <Link
                  href={`/order/${order.id}/edit`}
                  className="flex-shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                >
                  Редактировать
                </Link>
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