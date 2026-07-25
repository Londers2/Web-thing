// app/debug/page.jsx
'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  BugAntIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ServerStackIcon,
  CircleStackIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  LanguageIcon,
  WindowIcon,
  ComputerDesktopIcon,
  NoSymbolIcon,
  SignalIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

// Компонент-обёртка для секций
function Section({ title, icon: Icon, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(true)
  
  return (
    <div className={`bg-gray-800 p-4 rounded border border-gray-700 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left mb-2"
      >
        {Icon && <Icon className="size-5 text-blue-400 flex-shrink-0" />}
        <h2 className="font-semibold text-blue-400">{title}</h2>
        {isOpen ? (
          <ChevronDownIcon className="size-4 text-gray-500 ml-auto" />
        ) : (
          <ChevronRightIcon className="size-4 text-gray-500 ml-auto" />
        )}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  )
}

// Компонент статуса
function StatusBadge({ status }) {
  const config = {
    authenticated: { label: 'Авторизован', color: 'bg-green-600', icon: CheckCircleIcon },
    loading: { label: 'Загрузка...', color: 'bg-yellow-600', icon: ClockIcon },
    unauthenticated: { label: 'Не авторизован', color: 'bg-red-600', icon: ExclamationCircleIcon },
  }
  
  const { label, color, icon: Icon } = config[status] || config.unauthenticated
  
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${color}`}>
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [cookies, setCookies] = useState({})
  const [localStorage, setLocalStorage] = useState({})
  const [sessionStorage, setSessionStorage] = useState({})
  const [networkLogs, setNetworkLogs] = useState([])
  const [systemInfo, setSystemInfo] = useState({})
  const [headers, setHeaders] = useState({})

  useEffect(() => {
    // Собираем все cookies
    const allCookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {})
    setCookies(allCookies)

    // Собираем localStorage
    const ls = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          ls[key] = localStorage.getItem(key)
        } catch (e) {
          ls[key] = 'Ошибка чтения'
        }
      }
    }
    setLocalStorage(ls)

    // Собираем sessionStorage
    const ss = {}
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        try {
          ss[key] = sessionStorage.getItem(key)
        } catch (e) {
          ss[key] = 'Ошибка чтения'
        }
      }
    }
    setSessionStorage(ss)

    // Системная информация
    setSystemInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      },
      location: {
        href: window.location.href,
        origin: window.location.origin,
        protocol: window.location.protocol,
        host: window.location.host,
        hostname: window.location.hostname,
        port: window.location.port,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
      performance: {
        navigation: performance?.navigation?.type,
        timing: performance?.timing ? {
          loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        } : 'Недоступно',
      },
      memory: performance?.memory ? {
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB',
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
      } : 'Недоступно',
    })

    // Проверяем сессию через fetch
    const checkSession = async () => {
      try {
        const startTime = Date.now()
        const res = await fetch('/api/auth/session')
        const endTime = Date.now()
        const data = await res.json()
        setNetworkLogs(prev => [...prev, {
          time: new Date().toISOString(),
          url: '/api/auth/session',
          status: res.status,
          statusText: res.statusText,
          duration: endTime - startTime,
          headers: Object.fromEntries(res.headers.entries()),
          data: data,
          ok: res.ok,
        }])
      } catch (error) {
        setNetworkLogs(prev => [...prev, {
          time: new Date().toISOString(),
          url: '/api/auth/session',
          error: error.message,
          stack: error.stack,
        }])
      }
    }
    
    checkSession()

    // Проверяем заголовки
    fetch('/api/debug/headers')
      .then(res => res.json())
      .then(data => setHeaders(data))
      .catch(err => console.error('Headers error:', err))

  }, [])

  const clearAllCookies = () => {
    document.cookie.split(';').forEach(cookie => {
      const [key] = cookie.trim().split('=')
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })
    setCookies({})
    alert('Куки очищены, обновите страницу')
  }

  const clearLocalStorage = () => {
    localStorage.clear()
    setLocalStorage({})
    alert('LocalStorage очищен')
  }

  const clearSessionStorage = () => {
    sessionStorage.clear()
    setSessionStorage({})
    alert('SessionStorage очищен')
  }

  const refreshAll = () => {
    window.location.reload()
  }

  const copyAll = () => {
    const data = {
      session,
      cookies,
      localStorage,
      sessionStorage,
      systemInfo,
      headers,
      networkLogs,
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    alert('Всё скопировано в буфер обмена')
  }

  return (
    <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-white font-mono text-xs md:text-sm">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BugAntIcon className="size-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-blue-400">Отладка</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={refreshAll}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-xs"
            >
              <ArrowPathIcon className="size-3.5" />
              Обновить
            </button>
            <button 
              onClick={copyAll}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 rounded hover:bg-green-700 text-xs"
            >
              <ClipboardDocumentIcon className="size-3.5" />
              Копировать всё
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Сессия */}
          <Section title="Сессия" icon={ServerStackIcon} className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={status} />
              {session?.user?.name && (
                <span className="text-gray-400 text-xs">
                  {session.user.email}
                </span>
              )}
            </div>
            <pre className="text-xs overflow-auto max-h-60 bg-gray-900 p-2 rounded">
              {JSON.stringify({ status, session }, (key, value) => {
                if (key === 'token' || key === 'access_token' || key === 'refresh_token') {
                  return '*** скрыто ***'
                }
                return value
              }, 2)}
            </pre>
          </Section>

          {/* Cookies */}
          <Section title="Cookies" icon={CheckBadgeIcon}>
            <div className="flex justify-end mb-2">
              <button 
                onClick={clearAllCookies}
                className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-xs hover:bg-red-700"
              >
                <XMarkIcon className="size-3.5" />
                Очистить все
              </button>
            </div>
            <pre className="text-xs overflow-auto max-h-60 bg-gray-900 p-2 rounded">
              {JSON.stringify(cookies, null, 2)}
            </pre>
          </Section>

          {/* LocalStorage */}
          <Section title="LocalStorage" icon={CircleStackIcon}>
            <div className="flex justify-end mb-2">
              <button 
                onClick={clearLocalStorage}
                className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-xs hover:bg-red-700"
              >
                <XMarkIcon className="size-3.5" />
                Очистить
              </button>
            </div>
            <pre className="text-xs overflow-auto max-h-40 bg-gray-900 p-2 rounded">
              {JSON.stringify(localStorage, null, 2)}
            </pre>
          </Section>

          {/* SessionStorage */}
          <Section title="SessionStorage" icon={CircleStackIcon}>
            <div className="flex justify-end mb-2">
              <button 
                onClick={clearSessionStorage}
                className="flex items-center gap-1 px-2 py-0.5 bg-red-600 rounded text-xs hover:bg-red-700"
              >
                <XMarkIcon className="size-3.5" />
                Очистить
              </button>
            </div>
            <pre className="text-xs overflow-auto max-h-40 bg-gray-900 p-2 rounded">
              {JSON.stringify(sessionStorage, null, 2)}
            </pre>
          </Section>

          {/* Заголовки */}
          <Section title="Заголовки" icon={InformationCircleIcon}>
            <pre className="text-xs overflow-auto max-h-40 bg-gray-900 p-2 rounded">
              {JSON.stringify(headers, null, 2)}
            </pre>
          </Section>

          {/* Network */}
          <Section title="Network" icon={GlobeAltIcon}>
            <div className="space-y-1 max-h-40 overflow-auto bg-gray-900 p-2 rounded">
              {networkLogs.length === 0 ? (
                <div className="text-gray-500">Нет записей</div>
              ) : (
                networkLogs.map((log, i) => (
                  <div key={i} className="border-b border-gray-700 py-1 text-xs">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-gray-500">{log.time.slice(11, 19)}</span>
                      <span className={log.error ? 'text-red-400' : log.ok ? 'text-green-400' : 'text-yellow-400'}>
                        {log.url}
                      </span>
                      {log.status && <span className="text-gray-400">{log.status}</span>}
                      {log.duration && <span className="text-gray-500">{log.duration}ms</span>}
                    </div>
                    {log.error && <div className="text-red-400 mt-1">{log.error}</div>}
                    {log.data && (
                      <pre className="text-gray-400 mt-1 overflow-auto max-h-20">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </Section>

          {/* Системная информация */}
          <Section title="Система" icon={CpuChipIcon} className="col-span-1 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">User Agent:</span>
                <div className="break-all">{systemInfo.userAgent}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Платформа:</span>
                <div>{systemInfo.platform}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Язык:</span>
                <div>{systemInfo.language}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">URL:</span>
                <div className="break-all">{systemInfo.location?.href}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Host:</span>
                <div>{systemInfo.location?.host}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Экран:</span>
                <div>{systemInfo.screen?.width}×{systemInfo.screen?.height}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Окно:</span>
                <div>{systemInfo.window?.innerWidth}×{systemInfo.window?.innerHeight}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Pixel Ratio:</span>
                <div>{systemInfo.screen?.pixelRatio}</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Cookie Enabled:</span>
                <div className={systemInfo.cookieEnabled ? 'text-green-400' : 'text-red-400'}>
                  {systemInfo.cookieEnabled ? 'Да' : 'Нет'}
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Online:</span>
                <div className={systemInfo.onLine ? 'text-green-400' : 'text-red-400'}>
                  {systemInfo.onLine ? 'Да' : 'Нет'}
                </div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">Время загрузки:</span>
                <div>{systemInfo.performance?.timing?.loadTime || '—'} ms</div>
              </div>
              <div className="bg-gray-900 p-2 rounded">
                <span className="text-gray-500">DOM Ready:</span>
                <div>{systemInfo.performance?.timing?.domReady || '—'} ms</div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}