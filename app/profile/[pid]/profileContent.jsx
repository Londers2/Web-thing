'use client'

import { useSession, signOut } from 'next-auth/react'

export default function ProfileContent({ user }) {
    const { data: session, status } = useSession()

    if (!session) return <></>

    return (
        <>
            <h1 className="max-w-4xl mx-auto text-2xl font-bold mb-4">Профиль пользователя</h1>
            <div className="flex flex-wrap gap-6 sm:gap-0 max-w-4xl mx-auto">
                <div className="flex w-full md:w-1/2 xl:w-1/3 p-4 xl:p-6">
                    <img
                        src={user.image}
                        alt={user.name}
                        className="w-64 h-64 m-auto rounded-full object-cover border-3 border-gray-300"
                    />
                </div>
                <div className="flex flex-col w-full md:w-1/2 xl:w-2/3 p-6 gap-4 bg-gray-800 border border-gray-700 rounded-xl shadow">
                    {/* <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">ID:</label>
                        <p className="text-gray-900 dark:text-white">{user.id}</p>
                    </div> */}

                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">Имя:</label>
                        <p className="text-gray-900 dark:text-white">{user.name || 'Не указано'}</p>
                    </div>

                    <div>
                        <label className="font-semibold text-gray-600 dark:text-gray-400">Email:</label>
                        <p className="text-gray-900 dark:text-white">{user.email || 'Не указан'}</p>
                    </div>

                    {user.phone && (
                        <div>
                            <label className="font-semibold text-gray-600 dark:text-gray-400">Телефон:</label>
                            <p className="text-gray-900 dark:text-white">{user.phone}</p>
                        </div>
                    )}

                    {user.birthday && (
                        <div>
                            <label className="font-semibold text-gray-600 dark:text-gray-400">Дата рождения:</label>
                            <p className="text-gray-900 dark:text-white">{user.birthday}</p>
                        </div>
                    )}

                    {user.id == session.user.id && (
                        <button className="button" onClick={() => signOut()}>
                            Выйти
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}