// components/orders/ImageUpload.jsx
'use client'

import { useState } from 'react'

export default function ImageUpload({ 
  images = [], 
  onImagesChange, 
  targetType = 'order',
  targetId,
  multiple = true,
  maxFiles = 10
}) {
  const [uploading, setUploading] = useState(false)
  
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !targetId) return
    
    if (images.length + files.length > maxFiles) {
      alert(`Можно загрузить не более ${maxFiles} изображений`)
      return
    }
    
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
      
      if (res.ok) {
        const data = await res.json()
        onImagesChange([...images, ...data.images])
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при загрузке изображений')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Ошибка при загрузке изображений')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }
  
  const handleDeleteImage = async (image) => {
    if (!confirm('Удалить изображение?')) return
    
    try {
      const res = await fetch(`/api/images?id=${image.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        const updatedImages = images.filter(img => img.id !== image.id)
        onImagesChange(updatedImages)
      } else {
        alert('Ошибка при удалении изображения')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ошибка при удалении изображения')
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.url}
              alt={image.filename || ''}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <button
              onClick={() => handleDeleteImage(image)}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        
        {images.length < maxFiles && targetId && (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
            <span className="text-2xl text-gray-400">+</span>
            <input
              type="file"
              accept="image/*"
              multiple={multiple}
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      
      {uploading && (
        <p className="text-sm text-gray-500">Загрузка...</p>
      )}
    </div>
  )
}