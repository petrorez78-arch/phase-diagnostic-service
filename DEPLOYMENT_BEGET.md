# Развертывание Phase Diagnostic Service на Beget

Это руководство описывает пошаговый процесс развертывания приложения на хостинге Beget.

## Предварительные требования

1. **Аккаунт на Beget** — создайте или используйте существующий
2. **SSH доступ** — включите SSH в панели управления Beget
3. **Node.js 22+** — убедитесь, что на сервере установлена совместимая версия
4. **MySQL/TiDB** — база данных для приложения
5. **GitHub репозиторий** — проект должен быть загружен на GitHub

## Шаг 1: Подготовка на локальной машине

### 1.1 Убедитесь, что проект в GitHub

```bash
cd /home/ubuntu/phase-diagnostic-service
git remote -v
# Должно быть: origin https://github.com/YOUR_USERNAME/phase-diagnostic-service.git
```

### 1.2 Проверьте, что все изменения закоммичены

```bash
git status
# Должно быть: "working tree clean"
```

## Шаг 2: Подготовка сервера Beget

### 2.1 Подключитесь по SSH

```bash
ssh username@your-beget-domain.com
```

### 2.2 Перейдите в директорию для приложения

```bash
# Обычно это /home/username/public_html или /home/username/domains/your-domain.com
cd /home/username/public_html
```

### 2.3 Клонируйте репозиторий

```bash
git clone https://github.com/YOUR_USERNAME/phase-diagnostic-service.git .
# или если нужна конкретная ветка:
git clone -b main https://github.com/YOUR_USERNAME/phase-diagnostic-service.git .
```

## Шаг 3: Установка зависимостей

### 3.1 Установите pnpm (если не установлен)

```bash
npm install -g pnpm
```

### 3.2 Установите зависимости проекта

```bash
pnpm install
```

## Шаг 4: Настройка переменных окружения

### 4.1 Создайте файл `.env.local`

```bash
nano .env.local
```

### 4.2 Добавьте необходимые переменные

```env
# Database
DATABASE_URL=mysql://username:password@localhost:3306/database_name

# JWT Secret (генерируйте случайную строку)
JWT_SECRET=your-random-jwt-secret-key-min-32-chars

# OAuth (получите из Manus)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Manus APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# Analytics (опционально)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# n8n Webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/phase-diagnostic
```

**Важно:** Сохраните файл (Ctrl+O, Enter, Ctrl+X в nano)

### 4.3 Убедитесь, что `.env.local` в `.gitignore`

```bash
grep ".env.local" .gitignore
# Должно вывести: .env.local
```

## Шаг 5: Подготовка базы данных

### 5.1 Создайте базу данных в Beget

1. Перейдите в панель управления Beget
2. Найдите раздел "MySQL" или "Базы данных"
3. Создайте новую БД с именем `phase_diagnostic`
4. Запомните хост, пользователя и пароль

### 5.2 Запустите миграции

```bash
pnpm db:push
```

Это создаст все необходимые таблицы в БД.

## Шаг 6: Сборка приложения

### 6.1 Соберите фронтенд

```bash
pnpm build
```

Это создаст папку `dist` с готовым приложением.

### 6.2 Проверьте, что сборка успешна

```bash
ls -la dist/
# Должны быть файлы index.html, assets/ и т.д.
```

## Шаг 7: Запуск приложения

### 7.1 Вариант A: Использование PM2 (рекомендуется)

```bash
# Установите PM2 глобально
npm install -g pm2

# Запустите приложение
pm2 start "pnpm start" --name "phase-diagnostic"

# Сохраните конфигурацию PM2
pm2 save

# Настройте автозапуск при перезагрузке сервера
pm2 startup
```

### 7.2 Вариант B: Использование встроенного сервера Beget

Если Beget предоставляет встроенную поддержку Node.js:

1. Перейдите в панель управления Beget
2. Найдите раздел "Node.js" или "Приложения"
3. Создайте новое приложение, указав:
   - **Точка входа:** `server/index.ts` или `dist/server/index.js`
   - **Порт:** 3000 (или другой свободный порт)
   - **Команда запуска:** `pnpm start`

### 7.3 Проверьте, что приложение запустилось

```bash
# Если используется PM2
pm2 status

# Если используется встроенный сервер
curl http://localhost:3000/
```

## Шаг 8: Настройка веб-сервера (Nginx/Apache)

### 8.1 Если используется Nginx

Создайте конфигурацию в `/etc/nginx/sites-available/phase-diagnostic`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Включите конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/phase-diagnostic /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8.2 Если используется Apache

Создайте конфигурацию в `/etc/apache2/sites-available/phase-diagnostic.conf`:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # Статические файлы
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</VirtualHost>
```

Включите конфигурацию:

```bash
sudo a2ensite phase-diagnostic
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Шаг 9: Настройка SSL (HTTPS)

### 9.1 Используйте Let's Encrypt

```bash
# Установите Certbot
sudo apt-get install certbot python3-certbot-nginx
# или для Apache:
sudo apt-get install certbot python3-certbot-apache

# Получите сертификат
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
# или для Apache:
sudo certbot certonly --apache -d your-domain.com -d www.your-domain.com

# Обновите конфигурацию Nginx/Apache для использования HTTPS
sudo certbot --nginx
# или для Apache:
sudo certbot --apache
```

## Шаг 10: Обновление приложения

Когда вы хотите развернуть новую версию:

```bash
cd /home/username/public_html

# Получите последние изменения
git pull origin main

# Переустановите зависимости (если нужно)
pnpm install

# Запустите миграции (если изменилась схема БД)
pnpm db:push

# Соберите приложение
pnpm build

# Перезагрузите приложение
pm2 restart phase-diagnostic
# или перезагрузите веб-сервер:
sudo systemctl reload nginx
```

## Шаг 11: Мониторинг и логи

### 11.1 Просмотр логов PM2

```bash
pm2 logs phase-diagnostic
```

### 11.2 Просмотр статуса приложения

```bash
pm2 status
pm2 monit
```

### 11.3 Просмотр логов Nginx/Apache

```bash
# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log
```

## Решение проблем

### Проблема: "Cannot find module"

**Решение:**
```bash
rm -rf node_modules
pnpm install
```

### Проблема: "Database connection failed"

**Решение:**
1. Проверьте переменные в `.env.local`
2. Убедитесь, что БД доступна: `mysql -h host -u user -p`
3. Проверьте, что миграции запустились: `pnpm db:push`

### Проблема: "Port 3000 is already in use"

**Решение:**
```bash
# Найдите процесс на порту 3000
lsof -i :3000

# Убейте процесс
kill -9 <PID>

# Или используйте другой порт в .env.local
PORT=3001
```

### Проблема: "n8n webhook не работает"

**Решение:**
1. Проверьте переменную `N8N_WEBHOOK_URL` в `.env.local`
2. Убедитесь, что n8n доступен с сервера: `curl https://your-n8n-instance.com/webhook/phase-diagnostic`
3. Проверьте логи n8n

## Полезные команды

```bash
# Проверить версию Node.js
node --version

# Проверить версию pnpm
pnpm --version

# Запустить тесты
pnpm test

# Запустить в режиме разработки
pnpm dev

# Очистить кэш
pnpm store prune

# Проверить статус БД
mysql -h $DATABASE_HOST -u $DATABASE_USER -p$DATABASE_PASSWORD -e "SHOW DATABASES;"
```

## Дополнительная информация

- **GitHub репозиторий:** https://github.com/YOUR_USERNAME/phase-diagnostic-service
- **Документация Beget:** https://beget.com/ru/support
- **Документация Node.js:** https://nodejs.org/
- **Документация PM2:** https://pm2.keymetrics.io/

---

**Если у вас возникли проблемы при развертывании, свяжитесь с поддержкой Beget или создайте issue на GitHub.**
