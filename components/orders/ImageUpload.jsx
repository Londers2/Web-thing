// components/orders/ImageUpload.jsx
'use client'

import { useState, useRef, useEffect } from 'react'

export default function ImageUpload({ 
  images = [], 
  onImagesChange, 
  targetId,
  targetType = 'order'
}) {
  const [uploading, setUploading] = useState(false)
  const [localImages, setLocalImages] = useState([])
  const fileInputRef = useRef(null)
  
  // 1. Синхронизация с родителем (при редактировании)
  useEffect(() => {
    if (images && images.length > 0) {
      const formatted = images.map(img => ({
        id: img.id || `temp-${Date.now()}-${Math.random()}`,
        url: img.url || img,
        filename: img.filename || 'Изображение',
        isExisting: true
      }))
      setLocalImages(formatted)
    } else {
      setLocalImages([])
    }
  }, [images])
  
  // 2. Обработка выбора файлов
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    if (!targetId) {
      alert('Сначала сохраните заказ, затем добавляйте изображения')
      e.target.value = ''
      return
    }
    
    uploadFiles(files)
    e.target.value = ''
  }
  
  // 3. Загрузка на сервер
  const uploadFiles = async (files) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('targetType', targetType)
      formData.append('targetId', targetId)
      
      const res = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Ошибка при загрузке изображений')
      }
      
      const data = await res.json()
      
      // ВАЖНО: Берём ID, который вернул сервер
      const newImages = data.images.map(img => ({
        id: img.id, // <--- СОХРАНЯЕМ ID
        url: img.url,
        filename: img.filename || 'Изображение',
        isExisting: true
      }))
      
      const updated = [...localImages, ...newImages]
      setLocalImages(updated)
      
      // Отправляем родителю объекты с ID
      onImagesChange(updated.map(img => ({
        id: img.id,
        url: img.url,
        filename: img.filename
      })))
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(error.message || 'Ошибка при загрузке изображений')
    } finally {
      setUploading(false)
    }
  }
  
  // 4. УДАЛЕНИЕ (исправлено)
  const handleDeleteImage = async (image) => {
    // Если это временное изображение (не загруженное)
    if (!image.isExisting) {
      setLocalImages(prev => prev.filter(img => img.id !== image.id))
      // Обновляем родителя
      const updated = localImages.filter(img => img.id !== image.id)
      onImagesChange(updated.map(img => ({
        id: img.id,
        url: img.url,
        filename: img.filename
      })))
      return
    }

    // Проверяем, есть ли ID для удаления
    if (!image.id) {
      alert('Не удалось определить ID изображения')
      return
    }
    
    if (!confirm(`Удалить изображение "${image.filename || 'без названия'}"?`)) return
    
    try {
      // ОТПРАВЛЯЕМ ЗАПРОС НА УДАЛЕНИЕ С ID
      const res = await fetch(`/api/images?id=${image.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        // Удаляем из локального состояния
        const updated = localImages.filter(img => img.id !== image.id)
        setLocalImages(updated)
        
        // Обновляем родителя
        onImagesChange(updated.map(img => ({
          id: img.id,
          url: img.url,
          filename: img.filename
        })))
        
        // Опционально: показываем уведомление
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при удалении изображения')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении изображения')
    }
  }
  
  // 5. Очистка памяти
  useEffect(() => {
    return () => {
      localImages.forEach(img => {
        if (img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })
    }
  }, [localImages])
  
  return (
    <div className="space-y-4">
      {/* Список изображений */}
      {localImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {localImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={image.filename || 'Изображение'}
                className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png'
                }}
              />
              
              {/* КНОПКА УДАЛЕНИЯ */}
              <button
                type="button"
                onClick={() => handleDeleteImage(image)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md hover:scale-110 transition-transform"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Кнопка добавления */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg transition-colors text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Загрузка...' : '+ Добавить изображения'}
        </button>
        
        {localImages.length > 0 && (
          <span className="text-sm text-gray-500">
            {localImages.length} файлов
          </span>
        )}
      </div>
    </div>
  )
}