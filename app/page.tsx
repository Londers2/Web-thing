'use client'

import Image from 'next/image'
import Modal from '@/components/modal'
import Login from '@/components/login'
import Sidebar from '@/components/sidebar'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

export default function Home() {
  var logedin = true
  
  if (!logedin) {
    return (
      <div>
        <Login></Login>
      </div>
    );
  } else {
    const events = [
      { title: 'Сборка', date: new Date() },
      { title: 'Сборка', date: new Date() }
    ]

    return (
      <Sidebar>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView='dayGridMonth'
          weekends={false}
          events={events}
          // eventContent={renderEventContent}
        />
      </Sidebar>
    )
  }

}
