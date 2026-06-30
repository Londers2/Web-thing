import Sidebar from '@/components/sidebar'
import { User } from '@/lib/db/index.js'  // Исправленный путь к вашей модели User

import ProfileContent from './profileContent'

// В App Router нет getServerSideProps
// Вместо этого — асинхронный компонент с params
export default async function ProfilePage({ params }) {
  // Получаем id из параметров маршрута
  const { pid } = await params
  
  // Загружаем пользователя из базы данных
  const { dataValues: user } = await User.findByPk(pid, {
    attributes: ['id', 'name', 'email', 'image', 'phone', 'birthday']
  })
  
  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Пользователь не найден</h1>
        <p className="mt-2">Пользователь с ID {pid} не существует</p>
      </div>
    )
  }
  
  return (
    <Sidebar>
      <ProfileContent user={user}/>
    </Sidebar>
  )
}

// Опционально: generateStaticParams для статических путей
export async function generateStaticParams() {
  const users = await User.findAll({
    limit: 10,
    attributes: ['id']
  })
  
  return users.map(user => ({
    pid: user.id
  }))
}