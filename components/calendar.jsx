// components/calendar.jsx
'use client'

import { useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ruLocale from '@fullcalendar/core/locales/ru'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import '@/styles/calendar.css'
import EventTooltipContent from './EventTooltipContent'

export default function Calendar({ 
  events = [], 
  onEventClick,
  height = '600px',
  initialView = 'dayGridMonth'
}) {
  const calendarRef = useRef(null)

  // Обработчик монтирования события (добавляем тултипы)
  const handleEventDidMount = useCallback((info) => {
    const el = info.el
    
    // Создаём контейнер для React-компонента
    const container = document.createElement('div')
    
    // Рендерим React-компонент в контейнер
    const root = createRoot(container)
    root.render(<EventTooltipContent event={info.event} />)
    
    // Добавляем тултип с React-контентом
    tippy(el, {
      content: container,
      allowHTML: true,
      theme: 'dark',
      placement: 'top',
      interactive: true,
      animation: 'fade',
      duration: 200,
      delay: [300, 0],
      arrow: true,
      appendTo: document.body,
      onShow(instance) {
        // Стилизуем тултип
        const contentEl = instance.popper.querySelector('.tippy-content')
        if (contentEl) {
          contentEl.style.cssText = `
            background: #1f2937 !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            border-radius: 10px !important;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5) !important;
            padding: 0 !important;
            max-width: 360px !important;
          `
        }
        const arrowEl = instance.popper.querySelector('.tippy-arrow')
        if (arrowEl) {
          arrowEl.style.cssText = `
            color: #1f2937 !important;
          `
        }
      },
      onHide(instance) {
        // Очищаем React-корень при скрытии
        if (container._reactRoot) {
          container._reactRoot.unmount()
        }
      }
    })
  }, [])

  return (
    <div className="fc-custom-theme">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        locale={ruLocale}
        initialView={initialView}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        eventClick={onEventClick}
        eventDidMount={handleEventDidMount}
        height={height}
        editable={false}
        selectable={false}
        dayMaxEvents={3}
        weekends={true}
        eventClassNames={(arg) => {
          const type = arg.event.extendedProps?.type
          const classes = ['fc-daygrid-event']
          
          switch (type) {
            case 'assembly':
              classes.push('fc-event-type-assembly')
              break
            case 'delivery':
              classes.push('fc-event-type-delivery')
              break
            default:
              classes.push('fc-event-type-date')
          }
          
          return classes
        }}
        eventContent={(arg) => {
          const type = arg.event.extendedProps?.type
          let icon = '📅'
          
          switch (type) {
            case 'assembly':
              icon = '🔧'
              break
            case 'delivery':
              icon = '🚚'
              break
            default:
              icon = '📋'
          }
          
          return {
            html: `
              <div class="flex items-center gap-1 text-white truncate">
                <span>${icon}</span>
                <span class="truncate">${arg.event.title}</span>
              </div>
            `
          }
        }}
        views={{
          dayGridMonth: {
            dayMaxEventRows: 3,
            moreLinkText: 'ещё',
          }
        }}
      />
    </div>
  )
}