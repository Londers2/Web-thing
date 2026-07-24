// components/CurrencyInput.jsx
'use client'

import { useState, useEffect, useRef } from 'react'

export default function CurrencyInput({
  value,
  onChange,
  className = '',
  placeholder = '',
  name = '',
  id = '',
  required = false,
  disabled = false,
}) {
  const [displayValue, setDisplayValue] = useState('')
  const inputRef = useRef(null)
  const cursorPositionRef = useRef(null)

  // Форматирование суммы
  const formatCurrency = (raw) => {
    if (!raw) return ''
    
    // Убираем всё, кроме цифр и точки
    const cleaned = raw.replace(/[^\d.]/g, '')
    
    // Разделяем на целую и дробную части
    const parts = cleaned.split('.')
    let integerPart = parts[0] || '0'
    const decimalPart = parts.length > 1 ? parts[1].slice(0, 2) : ''
    
    // Убираем ведущие нули (кроме случая когда число 0)
    if (integerPart.length > 1) {
      integerPart = integerPart.replace(/^0+/, '')
    }
    
    // Форматируем целую часть с пробелами (разделение тысяч)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    
    // Собираем обратно
    let result = formattedInteger
    if (decimalPart) {
      result += `.${decimalPart}`
    }
    
    return result
  }

  // Извлечение сырого значения из форматированного
  const getRawValue = (formatted) => {
    // Убираем пробелы, оставляем цифры и точку
    return formatted.replace(/\s/g, '')
  }

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const raw = String(value || '')
      const formatted = formatCurrency(raw)
      setDisplayValue(formatted)
    }
  }, [value])

  const handleChange = (e) => {
    const input = inputRef.current
    if (!input) return
    
    const oldCursor = input.selectionStart || 0
    const inputValue = e.target.value
    
    // Извлекаем сырое значение
    const raw = getRawValue(inputValue)
    
    // Форматируем
    const formatted = formatCurrency(raw)
    
    // Сохраняем позицию курсора
    let newCursor = oldCursor
    if (formatted.length !== displayValue.length) {
      // Простая корректировка позиции
      newCursor = Math.min(oldCursor, formatted.length)
    }
    
    cursorPositionRef.current = newCursor
    setDisplayValue(formatted)
    onChange(raw)
  }

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    
    if (cursorPositionRef.current !== null) {
      const pos = Math.min(cursorPositionRef.current, displayValue.length)
      input.setSelectionRange(pos, pos)
      cursorPositionRef.current = null
    }
  }, [displayValue])

  return (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="text"
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
    />
  )
}