# TELEMORE — Design Repository

Репозиторий дизайн-макетов Telegram Mini App «ТЕЛЕМОРЕ».
Основной файл — `telemore.op` (формат OpenPencil, JSON, диффится в Git).

## Содержимое

### Мобильные экраны (7)

| Страница | Файл-источник |
|----------|---------------|
| 1. Регистрация | `screen-1-registration.json` |
| 2. Главный экран | `screen-2-home.json` |
| 3. Мой QR | `screen-3-qr.json` |
| 4. Ачивки | `screen-4-achievements.json` |
| 5. Рейтинг | `screen-5-rating.json` |
| 6. План дня | `screen-6-plan.json` |
| 7. Сканер продюсера | `screen-7-scanner.json` |

### Wireframes админки (10)

| Страница | Файл-источник |
|----------|---------------|
| A1. Dashboard (Producer) | `A1.json` |
| A2. Сканер QR | `A2.json` |
| A3. Участники | `A3.json` |
| A4. Карточка участника | `A4.json` |
| A5. События | `A5.json` |
| A6. Редактор события | `A6.json` |
| A7. Уведомления | `A7.json` |
| A8. План дня | `A8.json` |
| A9. Superadmin: Смены | `A9.json` |
| A10. Superadmin: Роли и Ачивки | `A10.json` |

## Установка (локально)

### 1. Установи OpenPencil Desktop

**Windows:**
- Скачай `.exe` с https://github.com/ZSeven-W/openpencil/releases
- Или положи в `D:\Apps\OpenPencil\OpenPencil.exe`

**macOS:**
```bash
brew tap zseven-w/openpencil
brew install --cask openpencil
```

**Linux:** AppImage или `.deb` со страницы релизов.

### 2. Установи CLI `op` (для скриптов и автоматизации)

```bash
npm install -g @zseven-w/openpencil
```

### 3. Установи шрифты

- **Pricedown RUS** (с кириллицей) — для заголовков
- **Roboto** — для основного текста (Google Fonts)

Ставить «для всех пользователей».

## Workflow совместной работы (через Git)

OpenPencil имеет **встроенную Git-панель** — clone, branch, push/pull, three-way merge.

### Первый клон

```bash
git clone <repo-url> telemore-design
cd telemore-design
```

Затем открой `telemore.op` в OpenPencil → меню **Git → Connect** → выбери папку.

### Ежедневная работа

1. **Получить свежие изменения:** `Git → Pull`
2. **Создать ветку:** `Git → New Branch → feat/screen-qr-tweaks`
3. **Работать** в ветке (редактируй `.op` через OpenPencil UI)
4. **Сохранить:** `Cmd+S` / `Ctrl+S`
5. **Коммитнуть:** `Git → Commit` (сообщение по стандарту ниже)
6. **Запушить:** `Git → Push`
7. **Merge в main** через PR или прямо в приложении

### Стандарт коммитов

```
<scope>: <что сделано>

Примеры:
screen-qr: увеличить размер QR-кода до 240px
admin-A3: добавить фильтр по статусу участника
fix: поправить кириллицу на кнопке ЧЕК-ИН
```

### Разрешение конфликтов

Если при pull/merge возникает конфликт — OpenPencil откроет **визуальный three-way merge**: слева твоя версия, справа remote, по центру результат. Кликаешь по нодам, выбираешь нужную версию.

## Онлайн-доступ через браузер

🌐 **URL: https://design.telemore.org** — работает, открывай в любом браузере.

### Архитектура

```
Browser → Cloudflare (SSL) → Cloudflare Tunnel → VPS (2.27.4.90)
                                                      ↓
                                           Docker: openpencil:latest
                                           Port 127.0.0.1:3000
                                           Workspace: /opt/telemore/designs
```

### Что развёрнуто на VPS (ubuntu 24.04)

| Компонент | Где | Команда проверки |
|-----------|-----|------------------|
| Docker Engine 29.4 | systemd | `systemctl status docker` |
| Container `openpencil` | 127.0.0.1:3000 | `docker ps` |
| cloudflared tunnel | systemd | `systemctl status cloudflared` |
| Workspace | `/opt/telemore/designs` | (с git репозиторием) |

### Управление с VPS

```bash
ssh root@2.27.4.90

# Перезапустить OpenPencil
docker restart openpencil

# Логи
docker logs --tail 50 openpencil
journalctl -u cloudflared -n 50

# Обновить образ OpenPencil
docker pull ghcr.io/zseven-w/openpencil:latest
docker stop openpencil && docker rm openpencil
docker run -d --name openpencil --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  -v /opt/telemore/designs:/workspace \
  ghcr.io/zseven-w/openpencil:latest
```

### Cloudflare Tunnel

- Name: `telemore-design`
- ID: `b342cf7b-b3eb-47e3-bed0-e4f32dde305a`
- Ingress: `design.telemore.org → http://localhost:3000`
- DNS: CNAME `design.telemore.org → <tunnel-id>.cfargotunnel.com` (proxied)

⚠️ **Веб-версия — single-user в моменте.** Два человека одновременно = последний сохранивший перезатирает. Для параллельной работы используйте Git-ветки (desktop-версия OpenPencil + git pull/push).

## Регенерация wireframes (если меняется шаблон)

Файл `gen-wireframes.js` — генератор всех A1–A10 JSON-ов.
После правки шаблона:

```bash
node gen-wireframes.js     # перезапишет A*.json
# затем вставить обновлённые экраны в telemore.op через:
op insert @A1.json --page <page-id> --post-process
```

## Цветовая палитра (мобильные экраны)

| Назначение | HEX |
|-----------|-----|
| Фон (gradient top) | `#1A0033` |
| Фон (gradient bottom) | `#2D004D` |
| Неон-пинк (primary) | `#FF00AA` |
| Неон-циан (secondary) | `#00F0FF` |
| Жёлтый (balance/accent) | `#FFD700` |
| Штрафы/danger | `#FF0033` |
| Текст | `#FFFFFF` |
| Текст (secondary) | `rgba(255,255,255,0.6–0.7)` |

## Шрифты

- **Pricedown** — заголовки (TELEMORE, баланс, крупные цифры), текст на кнопках (Regular 25px, center)
- **Roboto** — основной текст

## Размеры экранов

- **Мобильные:** 375 × 812 (iPhone)
- **Админка (wireframes):** 1280 × 800 (desktop-first)

## Контакты

- Владелец: см. свойства Git-репозитория
- Разработка: тех.лид (см. оценку проекта)
