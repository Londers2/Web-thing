// components/MapButtons.jsx
'use client'

import Image from 'next/image'

export default function MapButtons({ city = '', street = '', house = '' }) {
  // Собираем полный адрес только из города, улицы и дома
  const buildFullAddress = () => {
    const parts = []
    
    if (city) parts.push(city)
    if (street) parts.push(street)
    if (house) parts.push(`д. ${house}`)
    
    return parts.join(', ')
  }

  const fullAddress = buildFullAddress()
  
  if (!fullAddress) return null
  
  const encodedAddress = encodeURIComponent(fullAddress)
  
  const maps = [
    {
      id: 'yandex',
      name: 'Яндекс Карты',
      url: `https://yandex.ru/maps/?text=${encodedAddress}`,
      icon: '/images/maps/yandex.svg',
      color: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'
    },
    {
      id: 'dgis',
      name: '2ГИС',
      url: `https://2gis.ru/search/${encodedAddress}`,
      icon: '/images/maps/dgis.svg',
      color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20'
    },
    {
      id: 'google',
      name: 'Google Maps',
      url: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      icon: '/images/maps/google.svg',
      color: 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
    }
  ]
  
  return (
    <div className="flex flex-wrap gap-2">
      {maps.map((map) => (
        <a
          key={map.id}
          href={map.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${map.color}`}
        >
          <div className="relative size-4 flex-shrink-0">
            <Image
              src={map.icon}
              alt={map.name}
              fill
              className="object-contain"
            />
          </div>
          {map.name}
        </a>
      ))}
    </div>
  )
}