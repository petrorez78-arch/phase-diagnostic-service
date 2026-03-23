# Автодеплой через GitHub Actions

Добавлен workflow: `.github/workflows/deploy.yml`.

## Что нужно добавить в GitHub Secrets

- `DEPLOY_HOST` — IP/домен сервера
- `DEPLOY_USER` — SSH пользователь (например, `root`)
- `DEPLOY_PASSWORD` — SSH пароль
- `DEPLOY_PORT` — SSH порт (обычно `22`)
- `DEPLOY_PATH` — путь до проекта на сервере (например, `/opt/phase-diagnostic-service`)
- `DEPLOY_SERVICE_NAME` — systemd service (например, `phase-diagnostic`)

## Что делает workflow

При пуше в `main`:
1. Подключается к серверу по SSH.
2. Переходит в папку проекта.
3. Делает `git fetch` + `git reset --hard origin/main`.
4. Ставит зависимости через `pnpm install --frozen-lockfile`.
5. Собирает проект (`pnpm build`).
6. Рестартует systemd-сервис, если указан `DEPLOY_SERVICE_NAME`.

## Обязательные env для автономной работы

Минимально:

- `OPENAI_API_KEY`
- `JWT_SECRET`
- `DATABASE_URL`

Опционально:

- `OPENAI_BASE_URL` (по умолчанию `https://api.openai.com`)
- `OPENAI_MODEL` (по умолчанию `gpt-4o-mini`)
- `GOOGLE_MAPS_API_KEY`
- `NOTIFICATION_WEBHOOK_URL`
- `PUBLIC_BASE_URL` (чтобы выдавать абсолютные URL для файлов)
- `STORAGE_DIR` (по умолчанию `uploads`)
