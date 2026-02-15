# Phase Diagnostic Service - Deployment Guide

Это руководство описывает три способа развертывания Phase Diagnostic Service на вашем собственном сервере.

---

## Содержание

1. [Способ 1: Через GitHub (Рекомендуется)](#способ-1-через-github-рекомендуется)
2. [Способ 2: Прямая загрузка файлов](#способ-2-прямая-загрузка-файлов)
3. [Способ 3: Docker (Самый простой)](#способ-3-docker-самый-простой)
4. [Настройка переменных окружения](#настройка-переменных-окружения)
5. [Настройка базы данных](#настройка-базы-данных)
6. [Настройка n8n webhook](#настройка-n8n-webhook)
7. [Troubleshooting](#troubleshooting)

---

## Способ 1: Через GitHub (Рекомендуется)

### Шаг 1: Экспорт кода в GitHub

1. Откройте **Management UI** → **Settings** → **GitHub**
2. Выберите владельца репозитория (ваш GitHub аккаунт или организация)
3. Введите название репозитория (например, `phase-diagnostic-service`)
4. Нажмите **Export to GitHub**
5. Дождитесь завершения экспорта

### Шаг 2: Клонирование на сервер

```bash
# Клонируйте репозиторий
git clone https://github.com/your-username/phase-diagnostic-service.git
cd phase-diagnostic-service

# Установите зависимости
pnpm install
# Если pnpm не установлен:
npm install -g pnpm
```

### Шаг 3: Настройка окружения

```bash
# Создайте файл .env
cp .env.example .env

# Отредактируйте .env (см. раздел "Настройка переменных окружения")
nano .env
```

### Шаг 4: Настройка базы данных

```bash
# Примените миграции
pnpm db:push

# Проверьте подключение к базе данных
pnpm test
```

### Шаг 5: Запуск

```bash
# Разработка (с hot reload)
pnpm dev

# Продакшн
pnpm build
pnpm start
```

### Шаг 6: Настройка процесс-менеджера (PM2)

```bash
# Установите PM2
npm install -g pm2

# Запустите приложение
pm2 start npm --name "phase-diagnostic" -- start

# Настройте автозапуск
pm2 startup
pm2 save
```

---

## Способ 2: Прямая загрузка файлов

### Шаг 1: Скачать файлы

1. Откройте **Management UI** → **Code**
2. Нажмите **Download all files**
3. Распакуйте архив на вашем сервере

### Шаг 2-6: Те же, что в Способе 1

---

## Способ 3: Docker (Самый простой)

### Шаг 1: Создайте Dockerfile

Создайте файл `Dockerfile` в корне проекта:

```dockerfile
FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
```

### Шаг 2: Создайте docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://user:password@db:3306/phase_diagnostic
      - JWT_SECRET=your-secret-key-here
      - N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=phase_diagnostic
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  db_data:
```

### Шаг 3: Запуск

```bash
# Запустите контейнеры
docker-compose up -d

# Проверьте логи
docker-compose logs -f app

# Остановите контейнеры
docker-compose down
```

---

## Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/phase_diagnostic

# JWT Secret (для сессий)
JWT_SECRET=your-random-secret-key-here

# n8n Webhook
N8N_WEBHOOK_URL=https://n8ntestplace.ru/webhook-test/064742d3-f4c6-47d1-9d5f-9287ada12460

# OAuth (если используете Manus OAuth, иначе удалите)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your-app-id

# Owner Info (опционально)
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# Node Environment
NODE_ENV=production
```

### Генерация JWT_SECRET

```bash
# Сгенерируйте случайный секрет
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Настройка базы данных

### MySQL/MariaDB

```bash
# Войдите в MySQL
mysql -u root -p

# Создайте базу данных
CREATE DATABASE phase_diagnostic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Создайте пользователя
CREATE USER 'phase_user'@'localhost' IDENTIFIED BY 'strong_password';

# Дайте права
GRANT ALL PRIVILEGES ON phase_diagnostic.* TO 'phase_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Применение миграций

```bash
# Из корня проекта
pnpm db:push
```

---

## Настройка n8n webhook

### В n8n workflow

1. Откройте ваш n8n workflow
2. Найдите узел **Webhook** (или **HTTP Request Trigger**)
3. Скопируйте URL webhook'а (например: `https://n8ntestplace.ru/webhook-test/064742d3-f4c6-47d1-9d5f-9287ada12460`)
4. Убедитесь, что workflow **активирован**

### В Phase Diagnostic Service

Обновите файл `server/n8nProxy.ts`:

```typescript
const N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/your-webhook-id";
```

Или используйте переменную окружения:

```typescript
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://n8ntestplace.ru/webhook-test/064742d3-f4c6-47d1-9d5f-9287ada12460";
```

---

## Настройка Nginx (обратный прокси)

Если вы хотите использовать домен и HTTPS:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Для HTTPS используйте **Certbot**:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Troubleshooting

### Проблема: "Cannot connect to database"

**Решение:**
1. Проверьте, что MySQL запущен: `sudo systemctl status mysql`
2. Проверьте `DATABASE_URL` в `.env`
3. Проверьте права пользователя базы данных

### Проблема: "n8n returned status 404"

**Решение:**
1. Проверьте, что n8n workflow активирован
2. Проверьте правильность URL webhook'а
3. Проверьте, что n8n сервис доступен

### Проблема: "Port 3000 already in use"

**Решение:**
```bash
# Найдите процесс
lsof -i :3000

# Убейте процесс
kill -9 <PID>

# Или измените порт в server/_core/index.ts
```

### Проблема: "Module not found"

**Решение:**
```bash
# Переустановите зависимости
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Обновление приложения

### Через Git

```bash
cd /path/to/phase-diagnostic-service
git pull origin main
pnpm install
pnpm db:push
pnpm build
pm2 restart phase-diagnostic
```

### Через Docker

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Мониторинг

### PM2

```bash
# Просмотр логов
pm2 logs phase-diagnostic

# Просмотр статуса
pm2 status

# Перезапуск
pm2 restart phase-diagnostic
```

### Docker

```bash
# Просмотр логов
docker-compose logs -f app

# Просмотр статуса
docker-compose ps

# Перезапуск
docker-compose restart app
```

---

## Безопасность

1. **Измените JWT_SECRET** на случайное значение
2. **Используйте сильные пароли** для базы данных
3. **Настройте firewall** (ufw, iptables)
4. **Используйте HTTPS** (Certbot + Nginx)
5. **Регулярно обновляйте** зависимости: `pnpm update`

---

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `pm2 logs` или `docker-compose logs`
2. Проверьте статус сервисов: `pm2 status` или `docker-compose ps`
3. Проверьте переменные окружения: `cat .env`
4. Проверьте подключение к базе данных: `pnpm test`

---

## Дополнительные ресурсы

- [Node.js Documentation](https://nodejs.org/docs/)
- [pnpm Documentation](https://pnpm.io/)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
