// components/PhoneInput.jsx
'use client'

import { useState, useEffect, useRef } from 'react'

export default function PhoneInput({
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

  // Форматирование телефона из сырых цифр
  const formatPhone = (digits) => {
    if (!digits) return ''
    
    // Ограничиваем 11 цифрами
    const limited = digits.slice(0, 11)
    if (limited.length === 0) return ''
    
    let result = '+7'
    
    // Добавляем цифры постепенно
    if (limited.length > 1) {
      // Открывающая скобка
      result += ' ('
      // Добавляем до 3 цифр после кода страны
      const afterCode = limited.slice(1)
      const firstThree = afterCode.slice(0, 3)
      result += firstThree
      
      // Закрывающая скобка появляется только если есть хотя бы 3 цифры после кода
      if (afterCode.length >= 3) {
        result += ')'
        
        // Добавляем следующие 3 цифры
        const nextThree = afterCode.slice(3, 6)
        if (nextThree.length > 0) {
          result += ' ' + nextThree
        }
        
        // Добавляем дефис, если есть ещё цифры
        const afterSix = afterCode.slice(6)
        if (afterSix.length > 0) {
          // Первый дефис
          result += '-'
          const firstTwo = afterSix.slice(0, 2)
          result += firstTwo
          
          // Второй дефис, если есть ещё цифры
          if (afterSix.length > 2) {
            result += '-'
            const lastTwo = afterSix.slice(2, 4)
            result += lastTwo
          }
        }
      }
    }
    
    return result
  }

  // Извлечение цифр из строки
  const getDigits = (str) => {
    return str.replace(/\D/g, '')
  }

  // Обновление при изменении value извне
  useEffect(() => {
    if (value !== undefined && value !== null) {
      const digits = String(value || '')
      const formatted = formatPhone(digits)
      setDisplayValue(formatted)
    }
  }, [value])

  const handleChange = (e) => {
    const input = inputRef.current
    if (!input) return
    
    const oldCursor = input.selectionStart || 0
    const rawValue = e.target.value
    
    // Извлекаем все цифры из ввода
    const allDigits = getDigits(rawValue)
    
    // Ограничиваем до 11 цифр
    const limitedDigits = allDigits.slice(0, 11)
    
    // Форматируем
    const formatted = formatPhone(limitedDigits)
    
    // Вычисляем новую позицию курсора
    let newCursor = oldCursor
    
    // Если длина изменилась, корректируем позицию
    if (formatted.length !== displayValue.length) {
      // Находим позицию курсора на основе количества цифр до курсора
      const textBeforeCursor = rawValue.slice(0, oldCursor)
      const digitsBeforeCursor = getDigits(textBeforeCursor)
      
      // Ищем позицию в форматированной строке
      let digitCount = 0
      let cursorPos = 0
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] >= '0' && formatted[i] <= '9') {
          digitCount++
        }
        if (digitCount === digitsBeforeCursor.length) {
          cursorPos = i + 1
          break
        }
      }
      if (cursorPos === 0 && digitCount < digitsBeforeCursor.length) {
        cursorPos = formatted.length
      }
      newCursor = cursorPos || formatted.length
    }
    
    cursorPositionRef.current = newCursor
    setDisplayValue(formatted)
    onChange(limitedDigits)
  }

  // Установка позиции курсора после рендера
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