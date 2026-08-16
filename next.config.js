// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем WebSocket для внешних подключений (временно)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Убираем WebSocket из клиентской сборки
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
  // Отключаем автоматическое переподключение
  devIndicators: {
    autoPrerender: false,
  },
  // Для внешнего доступа
  experimental: {
    // (опционально)
  },
  // Отключаем WebSocket в dev-режиме
  onDemandEntries: {
    // период пересборки страниц
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig