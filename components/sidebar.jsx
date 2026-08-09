// components/Sidebar.jsx
'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navigation = [
  { name: 'Главная', href: '/', icon: HomeIcon },
  { name: 'Клиенты', href: '/clients', icon: UsersIcon },
  { name: 'Заказы', href: '/order', icon: DocumentDuplicateIcon },
  // { name: 'Календарь', href: '/calendar', icon: CalendarIcon },
  // { name: 'Reports', href: '#', icon: ChartPieIcon },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  // Не показываем сайдбар на странице входа и ошибок
  if (pathname?.startsWith('/api/auth') || pathname === '/auth/error') {
    return children
  }

  const handleLogout = async () => {
    // Очищаем куки
    document.cookie.split(';').forEach(cookie => {
      const [key] = cookie.trim().split('=')
      if (key.startsWith('next-auth.')) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
    await signOut({ redirect: false })
    router.push('/api/auth/signin')
  }

  // Обновляем current для навигации
  const navigationWithCurrent = navigation.map((item) => ({
    ...item,
    current: pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
  }))

  return (
    <>
      <div>
        {/* Мобильный сайдбар */}
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <span className="text-xl font-bold text-white">Web Thing</span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigationWithCurrent.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={classNames(
                                item.current
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <item.icon aria-hidden="true" className="size-6 shrink-0" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="-mx-6 mt-auto">
                      <div className="flex flex-col gap-2">
                        {session?.user && (
                          <Link
                            href={'/profile/' + session?.user?.id}
                            className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white hover:bg-gray-800"
                          >
                            <img
                              alt=""
                              src={session?.user?.image || '/default-avatar.png'}
                              className="size-8 rounded-full bg-gray-800 object-cover"
                              onError={(e) => {
                                e.target.src = '/default-avatar.png'
                              }}
                            />
                            <span aria-hidden="true">{session?.user?.name || 'Пользователь'}</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-red-400 hover:bg-gray-800 hover:text-red-300"
                        >
                          <ArrowRightOnRectangleIcon className="size-5" />
                          Выйти
                        </button>
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Десктопный сайдбар */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <span className="text-xl font-bold text-white">Web Thing</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigationWithCurrent.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                          )}
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <div className="flex flex-col gap-2">
                    {session?.user && (
                      <Link
                        href={'/profile/' + session?.user?.id}
                        className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-white hover:bg-gray-800"
                      >
                        <img
                          alt=""
                          src={session?.user?.image || '/default-avatar.png'}
                          className="size-8 rounded-full bg-gray-800 object-cover"
                          onError={(e) => {
                            e.target.src = '/default-avatar.png'
                          }}
                        />
                        <span aria-hidden="true">{session?.user?.name || 'Пользователь'}</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-red-400 hover:bg-gray-800 hover:text-red-300"
                    >
                      <ArrowRightOnRectangleIcon className="size-5" />
                      Выйти
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Мобильный хедер */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-xs sm:px-6 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="flex-1 text-sm/6 font-semibold text-white">Web Thing</div>
          {session?.user && (
            <Link href={'/profile/' + session?.user?.id}>
              <span className="sr-only">Your profile</span>
              <img
                alt=""
                src={session?.user?.image || '/default-avatar.png'}
                className="size-8 rounded-full bg-gray-800 object-cover"
                onError={(e) => {
                  e.target.src = '/default-avatar.png'
                }}
              />
            </Link>
          )}
        </div>

        {/* Основной контент */}
        <main className="py-10 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  )
}