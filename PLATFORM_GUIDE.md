# Phase Diagnostic Service - Полное руководство

## Описание платформы

**Phase Diagnostic Service** — это веб-сервис для анализа акций MOEX с использованием методологии фазовой диагностики. Платформа интегрирует данные MOEX, финансовые показатели Smart-lab, расчеты фазовой диагностики и AI-интерпретацию результатов на русском языке.

## Архитектура

### Компоненты системы

**Бэкенд:**
- **MOEX API Client** (`server/moex.ts`) — поиск компаний, получение рыночных данных и исторических цен
- **Smart-lab Scraper** (`server/smartlab.ts`) — сбор финансовых данных и новостей
- **Phase Diagnostics Engine** (`server/phaseDiagnostics.ts`) — расчет S-индекса, динамики (vS), ускорения (aS) и четырех индексов (IFund, IMarketGap, IStruct, IVola)
- **LLM Integration** — AI-агент на базе OpenAI для интерпретации результатов
- **Database Layer** (`server/db.ts`) — хранение результатов диагностики и истории чатов
- **n8n Webhook** (`server/n8nWebhook.ts`) — интеграция с n8n workflow

**Фронтенд:**
- **Diagnostics Page** (`client/src/pages/Diagnostics.tsx`) — интерфейс поиска и анализа
- **Results Dashboard** (`client/src/components/ResultsDashboard.tsx`) — визуализация результатов
- **Chat Interface** (`client/src/components/ChatInterface.tsx`) — взаимодействие с AI-агентом
- **Home Page** (`client/src/pages/Home.tsx`) — главная страница с описанием возможностей

### Технологический стек

- **Frontend:** React 19, Tailwind CSS 4, Recharts (графики), shadcn/ui компоненты
- **Backend:** Express.js, tRPC, Drizzle ORM
- **Database:** MySQL/TiDB
- **AI:** OpenAI API
- **Testing:** Vitest

## Функциональность

### 1. Поиск компаний

Пользователь может искать компании по названию или тикеру MOEX. Поиск интегрирован с MOEX API и возвращает список найденных компаний.

**Endpoint:** `POST /api/trpc/diagnostics.search`

```typescript
{
  query: "GAZP" // или "Газпром"
}
```

### 2. Фазовая диагностика

Система анализирует исторические данные цен и вычисляет:

- **S-индекс** — основной показатель фазы (от -100 до 100)
- **vS (скорость)** — первая производная S-индекса
- **aS (ускорение)** — вторая производная S-индекса
- **IFund** — индекс фундаментальных показателей
- **IMarketGap** — индекс разницы между рыночной ценой и справедливой стоимостью
- **IStruct** — индекс структурных изменений
- **IVola** — индекс волатильности

**Фазы развития компании:**
- **Накопление** — умные деньги входят в позицию
- **Рост** — восходящий тренд с положительной динамикой
- **Разметка** — цена достигает пиков, готовится к коррекции
- **Снижение** — нисходящий тренд с отрицательной динамикой
- **Распределение** — умные деньги выходят из позиции

**Endpoint:** `POST /api/trpc/diagnostics.analyze`

```typescript
{
  ticker: "GAZP",
  company: "Газпром",
  chatId: "chat-unique-id"
}
```

### 3. Слабые сигналы

Система автоматически выявляет потенциальные риски и возможности на основе:
- Экстремальных значений индексов
- Резких изменений фазы
- Высокой волатильности
- Несоответствия между техническими и фундаментальными показателями

### 4. Анализ новостного фона

Интеграция с Smart-lab позволяет:
- Получить последние новости о компании
- Вычислить риторическое давление (sentiment analysis)
- Коррелировать новостной фон с фазовой диагностикой

### 5. AI-интерпретация

AI-агент на базе OpenAI анализирует результаты диагностики и предоставляет:
- Объяснение текущей фазы развития
- Анализ индексов и их значений
- Корреляцию с новостным фоном
- Инвестиционные рекомендации

Все ответы предоставляются на русском языке.

**Endpoint:** `POST /api/trpc/diagnostics.chat`

```typescript
{
  message: "Что означает высокое значение IVola?",
  ticker: "GAZP",
  chatId: "chat-unique-id"
}
```

## API Endpoints

### tRPC Endpoints

#### Поиск компаний
```
POST /api/trpc/diagnostics.search
Input: { query: string }
Output: Array<{ secid: string; name: string }>
```

#### Анализ компании
```
POST /api/trpc/diagnostics.analyze
Input: { ticker: string; company: string; chatId: string }
Output: {
  ticker: string;
  company: string;
  marketData: { lastPrice, volToday, numTrades, capitalization };
  diagnostics: { phase, s, vS, aS, iFund, iMarketGap, iStruct, iVola, signals };
  newsData: { news[], rhetoricalPressure }
}
```

#### AI Чат
```
POST /api/trpc/diagnostics.chat
Input: { message: string; ticker: string; chatId: string }
Output: { message: string }
```

### n8n Webhook Endpoints

#### Поиск через n8n
```
POST /api/n8n/webhook
Body: { action: "search", query: string }
Response: { success: boolean; results: Array }
```

#### Анализ через n8n
```
POST /api/n8n/webhook
Body: { action: "analyze", ticker: string, company?: string }
Response: { success: boolean; diagnostics, marketData, newsData }
```

#### Проверка здоровья
```
GET /api/n8n/health
Response: { status: "ok"; service: string; timestamp: string }
```

## Интеграция с n8n

Платформа предоставляет webhook для интеграции с n8n workflow. Вы можете использовать n8n для:

1. **Автоматического запуска анализа** по расписанию
2. **Интеграции с другими системами** (Telegram, Slack, Email)
3. **Обработки результатов** в других приложениях

### Пример n8n workflow

```json
{
  "nodes": [
    {
      "type": "webhook",
      "operation": "POST /api/n8n/webhook",
      "body": {
        "action": "analyze",
        "ticker": "GAZP"
      }
    },
    {
      "type": "telegram",
      "operation": "send_message",
      "message": "{{ $json.diagnostics.phase }}"
    }
  ]
}
```

## База данных

### Таблицы

#### phase_context
Хранит текущий контекст диагностики для каждого пользователя и чата.

```sql
CREATE TABLE phase_context (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  chatId VARCHAR(255) NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  company TEXT,
  phase VARCHAR(50),
  s DECIMAL(10, 2),
  vS DECIMAL(10, 2),
  aS DECIMAL(10, 2),
  iFund DECIMAL(10, 2),
  iMarketGap DECIMAL(10, 2),
  iStruct DECIMAL(10, 2),
  iVola DECIMAL(10, 2),
  signals JSON,
  lastPrice DECIMAL(15, 2),
  volToday BIGINT,
  numTrades INT,
  capitalization BIGINT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### chat_history
Хранит историю чатов между пользователем и AI-агентом.

```sql
CREATE TABLE chat_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  chatId VARCHAR(255) NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content LONGTEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### diagnostic_snapshots
Архив всех выполненных диагностик для анализа трендов.

```sql
CREATE TABLE diagnostic_snapshots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  company TEXT,
  phase VARCHAR(50),
  s DECIMAL(10, 2),
  vS DECIMAL(10, 2),
  aS DECIMAL(10, 2),
  iFund DECIMAL(10, 2),
  iMarketGap DECIMAL(10, 2),
  iStruct DECIMAL(10, 2),
  iVola DECIMAL(10, 2),
  signals JSON,
  lastPrice DECIMAL(15, 2),
  volToday BIGINT,
  numTrades INT,
  capitalization BIGINT,
  newsContext JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Тестирование

### Запуск тестов

```bash
pnpm test
```

### Тестовое покрытие

- **Phase Diagnostics** — 8 тестов (расчет индексов, выявление фаз, слабые сигналы)
- **n8n Webhook** — 5 тестов (структура маршрутов, обработка запросов)
- **Authentication** — 1 тест (logout функциональность)

## Развертывание

### Локальное развертывание

```bash
# Установка зависимостей
pnpm install

# Миграция базы данных
pnpm db:push

# Запуск в режиме разработки
pnpm dev

# Сборка для production
pnpm build

# Запуск в production
pnpm start
```

### Переменные окружения

Все необходимые переменные окружения автоматически инжектируются платформой Manus:

- `DATABASE_URL` — строка подключения к MySQL/TiDB
- `JWT_SECRET` — секрет для подписания сессий
- `VITE_APP_ID` — OAuth приложение ID
- `OAUTH_SERVER_URL` — URL OAuth сервера
- `BUILT_IN_FORGE_API_KEY` — API ключ для встроенных сервисов
- `VITE_FRONTEND_FORGE_API_KEY` — API ключ для фронтенда

## Примеры использования

### Пример 1: Поиск и анализ компании

```typescript
// Поиск компании
const searchResults = await trpc.diagnostics.search.query({ query: "GAZP" });

// Анализ выбранной компании
const analysis = await trpc.diagnostics.analyze.mutate({
  ticker: searchResults[0].secid,
  company: searchResults[0].name,
  chatId: "chat-123"
});

console.log(`Фаза: ${analysis.diagnostics.phase}`);
console.log(`S-индекс: ${analysis.diagnostics.s}`);
```

### Пример 2: AI-интерпретация

```typescript
// Запрос к AI-агенту
const response = await trpc.diagnostics.chat.mutate({
  message: "Почему компания находится в фазе накопления?",
  ticker: "GAZP",
  chatId: "chat-123"
});

console.log(response.message); // Ответ на русском языке
```

### Пример 3: n8n интеграция

```bash
# Поиск компании через webhook
curl -X POST http://localhost:3000/api/n8n/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "search",
    "query": "GAZP"
  }'

# Анализ компании через webhook
curl -X POST http://localhost:3000/api/n8n/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze",
    "ticker": "GAZP",
    "company": "Газпром"
  }'
```

## Ограничения и особенности

1. **Минимальная история** — для расчета диагностики требуется минимум 20 торговых дней
2. **Обновление данных** — данные MOEX обновляются в конце торговой сессии
3. **Новости** — новостной фон собирается с Smart-lab и может быть ограничен доступностью источника
4. **AI ответы** — зависят от качества исходных данных и контекста диагностики
5. **Язык** — все AI ответы предоставляются на русском языке

## Поддержка и обновления

Платформа разработана с использованием современного технологического стека и регулярно обновляется. Для получения поддержки или предложения улучшений обратитесь к команде разработки.

## Лицензия

2026 Phase Diagnostic Service. Все права защищены.
