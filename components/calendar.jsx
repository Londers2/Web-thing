'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

import ruLocale from '@fullcalendar/core/locales/ru'
import multiMonthPlugin from '@fullcalendar/multimonth'

import './calendar.css';

export default function Calendar(events) {

    return (
        <FullCalendar
            locale={ruLocale}
            plugins={[multiMonthPlugin, dayGridPlugin]}
            initialView='dayGridMonth'
            // initialView='multiMonthYear'

            weekends={true}
            events={events}
            // eventContent={renderEventContent}

            weekNumberClassNames={'text-red'}
            contentHeight={750}
            dayHeaderClassNames={'bg-gray-900'}
            dayCellClassNames={'bg-gray-800'}
        />
    )
}