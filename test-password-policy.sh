#!/bin/bash

# Скрипт для тестування підвищеної політики паролів

echo "🔐 Тестування політики паролів Tetris Game"
echo "=========================================="

# Перехід в папку backend
cd "$(dirname "$0")/backend" || exit 1

echo "📦 Встановлення залежностей..."
npm install --silent

echo "🔧 Генерація Prisma клієнта..."
npx prisma generate --silent

echo "🧪 Запуск тестів валідації паролів..."
npm test -- password-validator.test.ts --verbose

echo ""
echo "🔒 Запуск тестів безпеки..."
npm test -- security.test.ts --verbose

echo ""
echo "✅ Тестування завершено!"
echo ""
echo "🌐 Для тестування frontend:"
echo "cd frontend && npm install && ng serve"
echo ""
echo "🚀 Для запуску backend сервера:"
echo "cd backend && npm run dev"
echo ""
echo "📖 Перегляньте PASSWORD_POLICY.md для детальної документації"