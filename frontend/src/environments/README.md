# Environment Configuration

## 📁 Файли конфігурації:

### ✅ Committed to Git:
- **`environment.ts`** - Development конфігурація (публічна)
- **`environment.prod.ts`** - Production конфігурація (публічна)  
- **`environment.local.example.ts`** - Приклад локальної конфігурації

### ❌ NOT Committed to Git:
- **`environment.local.ts`** - Локальна конфігурація з чутливими даними
- **`environment.*.local.ts`** - Інші локальні конфігурації

## 🔐 Безпека:

### Що МОЖНА комітити:
- Публічні URL (localhost, staging domains)
- Налаштування feature flags  
- Версії API
- Налаштування UI

### Що НЕ МОЖНА комітити:
- API ключі
- Паролі та токени
- Приватні домени/IP
- Конфіденційні налаштування

## 🚀 Використання:

```typescript
// В сервісах
import { environment } from '../../environments/environment';

private apiUrl = environment.apiUrl;
```

## 💡 Для локальної розробки з чутливими даними:

1. Скопіюйте `environment.local.example.ts` в `environment.local.ts`
2. Додайте свої API ключі та чутливі дані
3. Імпортуйте `environment.local` замість `environment`

Файл `environment.local.ts` автоматично ігнорується git!