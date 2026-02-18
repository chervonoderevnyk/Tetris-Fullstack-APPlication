#!/usr/bin/env node

/**
 * Демо скрипт для тестування політики паролів Tetris Game
 * Запуск: node demo-password-policy.js
 */

// Імпорт валідатора
const { PasswordValidator } = require('./src/utils/password-validator');

console.log('🔐 Демонстрація нової політики паролів Tetris Game');
console.log('='.repeat(60));

// Тестові паролі
const testPasswords = [
  // Слабкі паролі
  { password: 'password', description: 'Поширений пароль' },
  { password: '123456', description: 'Дуже слабкий' },
  { password: 'Password', description: 'Без цифр і спецсимволів' },
  { password: 'Pass123', description: 'Занадто короткий' },
  { password: 'Passsss1!', description: 'Повторювані символи' },
  { password: 'Pass123!', description: 'Послідовні символи' },
  
  // Середні паролі
  { password: 'Password123!', description: 'Нормальний пароль' },
  { password: 'MySecr3t!', description: 'Коротковатий але сильний' },
  
  // Сильні паролі
  { password: 'MyStr0ng!Password2024', description: 'Дуже сильний пароль' },
  { password: 'C0mpl3x#Secure&P@ss', description: 'Комплексний пароль' },
  { password: 'Ungu3ss@bl3!2024', description: 'Непередбачуваний пароль' }
];

// Функція для відображення результату
function displayResult(password, description, result) {
  console.log(`\n📝 ${description}: "${password}"`);
  
  const strengthEmoji = {
    'weak': '❌',
    'medium': '⚠️', 
    'strong': '✅'
  }[result.strength];
  
  console.log(`   Міцність: ${strengthEmoji} ${result.strength} (${result.score}/100)`);
  
  if (result.errors.length > 0) {
    console.log('   Помилки:');
    result.errors.forEach(error => {
      console.log(`     • ${error}`);
    });
  } else {
    console.log('   ✨ Пароль відповідає всім вимогам безпеки!');
  }
}

// Тестування паролів
console.log('\n🧪 Тестування різних типів паролів:\n');

testPasswords.forEach(({ password, description }) => {
  const result = PasswordValidator.validate(password);
  displayResult(password, description, result);
});

// Тестування схожості з іменем користувача
console.log('\n👤 Тестування схожості з іменем користувача:\n');

const username = 'johndoe';
const userPasswords = [
  { password: 'johndoe123!', description: 'Містить ім\'я користувача' },
  { password: 'JohnDoe1!', description: 'Схожий на ім\'я' },
  { password: 'MySecure987!', description: 'Унікальний пароль' }
];

userPasswords.forEach(({ password, description }) => {
  const result = PasswordValidator.validate(password);
  const isSimilar = PasswordValidator.isPasswordSimilarToUsername(password, username);
  
  console.log(`\n📝 ${description}: "${password}"`);
  console.log(`   Схожий на "${username}": ${isSimilar ? '❌ Так' : '✅ Ні'}`);
  displayResult(password, 'Результат валідації', result);
});

// Генерація безпечного пароля
console.log('\n🎲 Генерація безпечних паролів:\n');

for (let i = 1; i <= 3; i++) {
  // Замість використання методу validate, створюємо простий генератор
  const generateSecurePassword = (length = 12) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    const allChars = uppercase + lowercase + digits + special;
    
    // Забезпечуємо наявність хоча б одного символу з кожної категорії
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Додаємо решту символів випадково
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Перемішуємо символи
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };
  
  const generatedPassword = generateSecurePassword();
  const result = PasswordValidator.validate(generatedPassword);
  console.log(`Згенерований пароль #${i}: "${generatedPassword}"`);
  console.log(`Міцність: ${result.strength} (${result.score}/100) ${result.isValid ? '✅' : '❌'}`);
}

// Поради для користувачів
console.log('\n💡 Поради для створення безпечних паролів:\n');

const tips = PasswordValidator.generatePasswordTips();
tips.forEach((tip, index) => {
  console.log(`${index + 1}. ${tip}`);
});

console.log('\n✨ Демонстрація завершена!');
console.log('\n📚 Для детальної документації перегляньте PASSWORD_POLICY.md');
console.log('🚀 Для запуску сервера: cd backend && npm run dev');
console.log('🌐 Для запуску frontend: cd frontend && ng serve');