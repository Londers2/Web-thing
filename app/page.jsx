// 'use client'

// import Image from 'next/image'
// import Modal from '@/components/modal'
// import Login from '@/components/login'
// import Sidebar from '@/components/sidebar'
// import Calendar from '@/components/calendar'

// import { useSession } from 'next-auth/react'

// export default function Home() {
//   const { data: session, status } = useSession()

//   if (status === 'loading') {
//     return <div>Загрузка...</div>
//   }
  
//   if (!session) {
//     return (
//       <div>
//         <Login></Login>
//       </div>
//     );
//   } else {
//     const events = [
//       { title: 'Сборка', date: new Date() },
//       { title: 'Сборка', date: new Date() }
//     ]

//     return (
//       <Sidebar>
        
//       </Sidebar>
//     )
//   }

// }
'use client'

import Sidebar from '@/components/sidebar'
import Calendar from '@/components/calendar'

import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session, status } = useSession()

  const dates = [ { title: 'Сборка', start: new Date(), endStr: '2026-05-16', allDay: true } ]

  if (status === 'loading') return <div>Загрузка...</div>

  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto">
        <Calendar events={dates}/>
      </div>
    </Sidebar>
  )
}