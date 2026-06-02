# VOID — v0.14.0-beta — Полный контекст проекта

**Дата аудита:** 2026-06-03  
**Версия:** 0.14.0-beta  
**Статус:** Beta

---

## 1. Общая информация

- **Название:** VOID — во тьму
- **Тип:** Платформер, HTML5 Canvas, Telegram Mini App
- **Архитектура:** Однофайловая HTML5 игра (index.html ~7590 строк)
- **Рендерер:** PixiJS v8.9.2
- **Физика:** Matter.js v0.20.0
- **База данных:** Supabase (PostgreSQL)
- **Хостинг:** Vercel (автодеплой из GitHub `main`)
- **Платформа:** Telegram Mini App (@voide_game_bot)

---

## 2. Сервисы и учётные данные

### Telegram Bot
- **Username:** @voide_game_bot
- **Bot ID:** 8858889318
- **Bot name:** VOID - Исследуй Пустоту
- **Token:** 8858889318:AAGramLmQGRhpJAyRWcJC8lPwkyrbDBiHcw
- **Webhook URL:** https://void-game-ruddy.vercel.app/api/webhook
- **Команды бота (все реализованы):**
  - /start — Начать игру (кнопка ▶ ИГРАТЬ)
  - /play — Открыть VOID (кнопка ▶ ИГРАТЬ)
  - /help — Управление и советы + список команд
  - /stats — Личная статистика (ранг, очки, уровни, звёзды, осколки, ачивки, время)
  - /leaderboard — Топ-10 мирового рейтинга + позиция игрока если вне топ-10
  - /weekly — Топ-10 недельного рейтинга + таймер до сброса + награды
  - /news — История обновлений игры
- **Parse mode:** HTML (для надёжного форматирования)

### Supabase
- **URL:** https://jibtmyuxbeckanmkhuik.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnRteXV4YmVja2FubWtodWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjA0MTAsImV4cCI6MjA5NTg5NjQxMH0.x1oT9Lym80rZNj9dJA39nA-pBSWzKhAOJGHZisOoFok
- **Service Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnRteXV4YmVja2FubWtodWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMyMDQxMCwiZXhwIjoyMDk1ODk2NDEwfQ.BS61LXJPTKvE4KsZmKu0e7pPkR8VnMBXxRIJqUMX8VM

### Vercel
- **Production URL:** https://void-game-ruddy.vercel.app/
- **API endpoint:** https://void-game-ruddy.vercel.app/api/leaderboard
- **Webhook:** https://void-game-ruddy.vercel.app/api/webhook (ранее void-game-api.vercel.app)
- **Деплой:** git push origin main → автодеплой Vercel
- **НЕ ИСПОЛЬЗОВАТЬ:** `vercel --prod`

### GitHub
- **Репозиторий:** https://github.com/Digerr/void-game
- **Ветка:** main
- **Деплой:** git push origin main → Vercel автодеплой

---

## 3. Файловая структура

```
void-game/
├── index.html          # Основной и единственный файл игры (~7590 строк)
├── manifest.json       # PWA манифест (v0.14.0)
├── package.json        # Node зависимости (supabase-js ^2.0.0)
├── vercel.json         # Реврайты + no-cache заголовки
├── .gitignore          # node_modules/
├── api/
│   ├── leaderboard.js  # Supabase API (submit, profile, register, level_records, etc.)
│   └── webhook.js      # Telegram bot webhook (/start, /play, /help, /stats, /leaderboard, /weekly, /news)
├── releases/           # Бэкапы предыдущих версий
│   ├── CONTEXT-alpha-2.2.md
│   ├── CONTEXT-beta-0.9.6.md
│   ├── CONTEXT-beta-0.10.0.md
│   ├── index-alpha-2.2-release.html
│   ├── index-alpha-2.3-release.html
│   ├── index-beta-0.9.6-release.html
│   └── worklog.md
└── node_modules/       # @supabase/supabase-js (gitignored)
```

---

## 4. Supabase — Таблицы

### `leaderboard` (глобальный рейтинг)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | TEXT (PK) | tg_{user_id} |
| name | TEXT | Имя игрока |
| score | INTEGER | Очки по формуле |
| completed | SMALLINT | Пройдено уровней |
| total_stars | SMALLINT | Всего звёзд |
| total_time | REAL | Общее время (сек) |
| level_data | JSONB | Данные по уровням {idx: {stars, bestTime}} |
| total_shards | INTEGER | Осколки |
| achievements_count | INTEGER | Ачивки |
| perfect_levels | INTEGER | Идеальные уровни (3★) |
| challenge_wins | INTEGER | Выигранные испытания |
| updated | TIMESTAMPTZ | Последнее обновление |

### `weekly_scores` (недельный рейтинг)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | TEXT (PK) | tg_{user_id}_{weekKey} |
| name | TEXT | Имя игрока |
| score | INTEGER | Очки |
| completed | INTEGER | Пройдено |
| total_stars | INTEGER | Звёзды |
| total_shards | INTEGER | Осколки |
| achievements | INTEGER | Ачивки |
| week_key | TEXT | Ключ недели (2026-W23) |
| updated | TIMESTAMPTZ | Обновлено |

### `level_records` (рекорды по уровням)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | SERIAL (PK) | Auto-increment |
| user_id | TEXT | tg_{user_id} |
| name | TEXT | Имя |
| level_index | INTEGER | Номер уровня |
| best_time | REAL | Лучшее время (сек) |
| stars | INTEGER | Звёзды |
| updated | TIMESTAMPTZ | Обновлено |
| UNIQUE | | (user_id, level_index) |

### `players` (профили игроков)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | TEXT (PK) | tg_{user_id} |
| chat_id | BIGINT | Telegram chat ID |
| name | TEXT | Имя |
| notifications_enabled | BOOLEAN | Уведомления |
| best_rank | INTEGER | Лучший ранг |
| created | TIMESTAMPTZ | Дата регистрации |

### RLS-политики
- **Все таблицы:** SELECT для всех (anon key), ALL для всех (service key)
- Чтение: anon_key ✅ | Запись: service_key ✅ (через API)

---

## 5. API Endpoints

### POST /api/leaderboard
**Действия (action):**
- `submit` (default) — Отправить/обновить очки. Защита: обновляет только если новый score > существующего.
- `register` — Регистрация игрока + синхронизация имени во все таблицы
- `profile` — Получить профиль игрока (ранг, weekly rank, статистика)
- `level_records` — Получить топ-10 рекордов для уровня (level_index)
- `toggle_notifications` — Вкл/выкл уведомления
- `debug_init` — Отладка initData
- `setup` — Проверка статуса таблиц (без SQL)

### POST /api/webhook
- Обрабатывает команды Telegram бота:
  - `/start`, `/play` — запуск игры + кнопка ▶ ИГРАТЬ
  - `/help` — управление + список всех команд
  - `/stats` — личная статистика из Supabase (ранг, очки, прогресс, время)
  - `/leaderboard`, `/top` — топ-10 мирового рейтинга + позиция игрока вне топ-10
  - `/weekly` — топ-10 недельного рейтинга + таймер сброса + награды
  - `/news` — история обновлений игры
  - Неизвестная команда — список доступных

---

## 6. Система сохранений

### Трёхслойная система:
1. **localStorage** (`void_progress`) — мгновенное, локальное
2. **Telegram CloudStorage** (`void_data`) — облачное, привязано к TG аккаунту
3. **Supabase** — лидерборд, рекорды, профиль

### Структура progress:
```js
{
  unlocked: Number,           // Кол-во открытых уровней
  levels: {                   // Данные по уровням
    [idx]: { stars, bestTime }
  },
  skin: Number,               // Текущий скин
  shards: [],                 // Собранные осколки
  stats: {
    jumps, dashes, wallJumps,
    threadsUsed, playTime,
    perfectLevels
  },
  totalDeaths: Number,        // Смерти (в progress с v0.14.0)
  achievements: [],           // Ачивки
  challenges: {},             // Испытания
  firstLaunch: Boolean
}
```

### Cloud save (v2 формат):
```js
{ v:2, unlocked, levels, skin, shards, stats, achievements, challenges, firstLaunch, totalDeaths }
```

### Ключевые механизмы:
- **debouncedCloudSave()** — автосохранение через 2 сек после изменений
- **saveToCloudWithRetry()** — 3 попытки при ошибке, интервал 2 сек
- **updateSyncIndicator()** — ☁ ✓ / ☁ ✗ в меню
- **manualCloudSave()** — принудительное сохранение (кнопка ☁ в профиле)
- **loadFromCloud() + mergeCloudData()** — слияние: лучший результат побеждает
- **Account isolation** — проверка `void_tg_user` в localStorage, при смене аккаунта — сброс

---

## 7. Лидерборд

### Формула очков:
```
score = completed × 5000
      + totalStars × 200
      + totalShards × 150
      + achievementsCount × 300
      + perfectLevels × 500
      + challengeWins × 250
      − round(totalTime × 0.5)
```

### Три вкладки:
1. **Мир (Global)** — всеобщий рейтинг из `leaderboard`, top-100, real-time подписка
2. **Неделя (Weekly)** — из `weekly_scores`, текущая неделя, таймер обратного отсчёта до понедельника 00:00 UTC
3. **Уровни (Level)** — из `level_records`, топ-10 лучшего времени на выбранном уровне

### Защита после сброса:
- Leaderboard: обновляется только если новый score > существующего
- Weekly: аналогично
- Level records: обновляется только если лучшее время или больше звёзд

### Weekly механика:
- Сброс каждый понедельник 00:00 UTC
- Top-3: эксклюзивный скин
- Top-10: бейдж
- Крон для сброса: ещё не настроен (вручную или pg_cron)

---

## 8. Профиль игрока

Показывает:
- Аватарка (48px) + ник (0.75rem) + ☁ индикатор (0.8rem)
- Ранг в лидерборде + лучший ранг
- Дней в пустоте
- Статистика: уровни, звёзды, осколки, идеальные, ачивки, смерти, время, score, weekly rank
- Сетка достижений
- Уведомления (вкл/выкл)
- Принудительное сохранение в облако (☁ → ✓/✗)

---

## 9. Игровые механики

### Движение:
- Бег (влево/вправо)
- Прыжок + coyote jump
- Wall slide + wall jump
- Dash (рывок, перезарядка ~0.6 сек)
- Нить (раскачивание на якоре, маятник)

### Ловушки и объекты:
- Шипы (мгновенная смерть)
- Пилы (вращающиеся лезвия)
- Маятники (качающиеся шары с шипами)
- Враги (патрулирующие)
- Пружины (подбрасывание)
- Порталы (телепортация)
- Рычаги и двери
- Лёд (скольжение)
- Ветер (смещение)
- Тьма (фонарик)
- Нити-якоря (раскачивание)

### 30 уровней, 6 актов:
1. Пробуждение (0-4)
2. Глубины (5-9)
3. Нити (10-14)
4. Пустота (15-19)
5. Возрождение (20-24)
6. Исход (25-29)

### Звёзды:
- 3★ = 0 смертей + время < 20 сек (или 0-1 смерть + < 45 сек)
- 2★ = до 2 смертей + < 60 сек (или до 4 смертей)
- 1★ = любое прохождение

### Доп. системы:
- Lore/Хроники — лор игры
- Катсцены — между актами
- Испытания (Challenges)
- Осколки (Shards) — коллекционные
- Скины — визуальные
- Достижения (Achievements)
- Фонарик — на тёмных уровнях

---

## 10. Физика нити (thread)

Настроена в v0.13.0-beta после фикса:
- Swing force: 0.035
- Constraint stiffness: 0.85
- Damping: 0.05
- Max horizontal speed: 5.5
- Max vertical speed: 8
- Max angular velocity: 1.2
- Angle-based damping (сила уменьшается при отклонении от вертикали)

---

## 11. Оптимизации

- EMA dt-smoothing для Telegram WebView (0.75/0.25 blend, dt cap 0.033)
- Service Worker: принудительная очистка старых SW и кешей
- Версионный чек: автоматическая перезагрузка при новой версии
- Cache-Control: no-cache, no-store, must-revalidate (через vercel.json)
- CSS will-change на canvas

---

## 12. Зарегистрированные игроки

| ID | Имя | Дата |
|----|-----|------|
| tg_721037003 | SKUFI4 | 2026-06-01 |
| tg_8316629424 | ДЕПУТАТ ГРИХОРИЙ | 2026-06-01 |
| tg_8294101422 | KLNX | 2026-06-01 |
| tg_7913080778 | INAGENT YAMAL | 2026-06-01 |
| tg_5047132087 | Артём | 2026-06-02 |

**В leaderboard:** 1 запись (SKUFI4, score: 20262, 2 уровня)
**В weekly_scores:** 0 записей
**В level_records:** 0 записей

---

## 13. Известные проблемы / TODO

1. **Weekly cron** — не настроен автоматический сброс (нужен pg_cron или Vercel cron)
2. **Weekly rewards** — логика начисления скинов (топ-3) и бейджей (топ-10) не реализована

---

## 14. История изменений сессии (2026-06-03)

### Бот команды (реализовано)
- /start, /play — запуск игры + кнопка ▶ ИГРАТЬ
- /help — управление + список всех команд
- /stats — личная статистика из Supabase
- /leaderboard, /top — топ-10 мирового + позиция игрока
- /weekly — топ-10 недельного + таймер + награды
- /news — история обновлений
- Неизвестная команда → список доступных
- Parse mode: HTML (переключено с MarkdownV2 для надёжности)
- Webhook: перенесён с void-game-api.vercel.app → void-game-ruddy.vercel.app

### Логотип (реализовано)
- Отцентрирован: каждый символ V/O/I/D имеет свою ширину (22%/24%/12%/22%)
- Зазор I-D сокращён до 75% от нормального
- Центрирование через startX = (W - totalW) / 2

### Анимация логотипа — паркур (заменила верёвку)
- **Прямой путь (V→O→I→D):** idle V → prep_jump → jump V→O → land O → idle → jump O→I → land I → idle → jump I→D → land D
- **Скольжение и подъём:** slide_down D → idle_bottom → climb_up D → idle
- **Обратный путь (D→I→O→V):** jump D→I → land I → wall_slide I → idle_bottom → jump I→O → land O → idle → **dash O→V** → land V
- **Победа:** wave на V
- Новые типы шагов: climb_up, wall_slide, dash, idle_bottom, slide_down
- Веревка убрана из кода отрисовки
- Анимации замедлены на ~25-35% для плавности
- Squash recovery: 5→3.5 для мягких приземлений

### Персонаж логотипа (котик)
- Тело: ellipse 6.5×8.5, rgba(85,85,125,0.9)
- Голова: arc r=8.5, rgba(90,90,135,0.95)
- Ушки: треугольники с внутренней частью rgba(130,100,160,0.45)
- Шарф: двухслойный, rgba(120,80,160,0.8) + rgba(100,65,140,0.5)
- Глаза: с бликами, эмоции (neutral, happy, surprised, focused, curious)
- Рот: улыбка/удивление/любопытство/нейтральный
- Аура: rgba(120,140,210) пульсирующая
- Позы: idle, jumping, climbing (чередование рук), dash (горизонтальный), wall-slide, wave

### Катсцены — персонаж + фиксы (реализовано)
- **drawSilhouette переписана** — теперь рисует того же котика что на логотипе:
  - Сигнатура: `drawSilhouette(ctx, sx, sy, sc, alpha, legPhase, armPhase, emotion, facing)`
  - Вместо пропорциональных размеров (w*0.36) — фиксированные размеры как у logo-кота (6.5×8.5, r=8.5)
  - Цвета: body rgba(85,85,125), head rgba(90,90,135), scarf rgba(120,80,160)
- **Исправлено двоение:**
  - Условие пропуска `>` → `>=` (frame-perfect переход между шагами)
  - Катсцена 2 (Fading): зазор 0.1с между stand (duration:1.9) и dissolve (startAt:2.1)
- **Позиции персонажей:** сдвинуты выше (y: 0.42-0.56 вместо 0.5-0.66)
- **Текст не перекрывается:**
  - Катсцены: текст на bottom:15%, z-index:5, усиленный text-shadow
  - Awakening: абсолютная раскладка — персонаж top:28%, текст top:52%

### Awakening (интро) сцена (реализовано)
- Персонаж полностью перерисован в стиле логотип-кота (закрытые + открытые глаза)
- Canvas: 100×80 (было 100×90)
- Убрана зависимость от getCurrentSkin() — единый стиль
- Раскладка: `display:block` с абсолютным позиционированием
  - Персонаж: top:28%, left:50%, transform:translate(-50%,-50%)
  - Glow: top:28%, left:50%, увеличен до 140px
  - Текст: top:52%, left:50%, transform:translateX(-50%)
- **Текст обновлён под лор:**
  - Было: «ты очнулся во тьме / не помнишь кто ты / но нужно двигаться»
  - Стало: **«пустота / ты не помнишь кто ты / но шарф ещё тёплый»**
  — отсылка к ключевому элементу лора (шарф — единственное тёплое в Пустоте)

---

## 15. Правила разработки

- **НЕ переписывать с нуля** — только фиксить на месте
- **Деплой:** git push origin main → Vercel автодеплой
- **НЕ ИСПОЛЬЗОВАТЬ** `vercel --prod`
- **Единственный файл игры:** index.html
- **Версия:** обновлять VOID_VERSION + manifest.json + комментарии
