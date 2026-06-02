# VOID — v0.16.0-beta — Полный контекст проекта

**Дата аудита:** 2026-06-03  
**Версия игры:** 0.15.0-beta  
**Версия бота:** 0.16.0-beta  
**Статус:** Beta  
**Последнее обновление:** 2026-06-03 — меню кнопок в боте

---

## 1. Общая информация

- **Название:** VOID — во тьму
- **Тип:** Платформер, HTML5 Canvas, Telegram Mini App
- **Архитектура:** Однофайловая HTML5 игра (index.html ~8100 строк)
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
  - /start — Начать игру (кнопка ▶ ИГРАТЬ + Reply Keyboard меню)
  - /play — Открыть VOID (кнопка ▶ ИГРАТЬ)
  - /help — Управление и советы + список команд
  - /stats — Личная статистика (ранг, очки, уровни, звёзды, осколки, ачивки, время)
  - /leaderboard — Топ-10 мирового рейтинга + позиция игрока если вне топ-10
  - /weekly — Топ-10 недельного рейтинга + таймер до сброса + награды
  - /news — История обновлений игры
  - /bug — Сообщить о баге (пересылка в канал поддержки)
- **Reply Keyboard (постоянное меню кнопок):**
  - ▶ ИГРАТЬ — открывает Mini App (web_app)
  - 📊 Статистика → /stats
  - 🏆 Рейтинг → /leaderboard
  - 📅 Неделя → /weekly
  - 🐛 Баг → /bug
  - ❓ Помощь → /help
- **Bot Commands Menu (/ автокомплит):** setMyCommands на /start

### Supabase
- **URL:** https://jibtmyuxbeckanmkhuik.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnRteXV4YmVja2FubWtodWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjA0MTAsImV4cCI6MjA5NTg5NjQxMH0.x1oT9Lym80rZNj9dJA39nA-pBSWzKhAOJGHZisOoFok
- **Service Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppYnRteXV4YmVja2FubWtodWlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDMyMDQxMCwiZXhwIjoyMDk1ODk2NDEwfQ.BS61LXJPTKvE4KsZmKu0e7pPkR8VnMBXxRIJqUMX8VM
- **Таблицы:** leaderboard, weekly_scores, level_records, players (4 таблицы)
- **bug_reports:** НЕ существует (не используется в текущем коде)

### Vercel
- **Production URL:** https://void-game-ruddy.vercel.app/
- **API endpoint:** https://void-game-ruddy.vercel.app/api/leaderboard
- **Webhook:** https://void-game-ruddy.vercel.app/api/webhook
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
├── index.html          # Основной и единственный файл игры (~8100 строк)
├── manifest.json       # PWA манифест (v0.15.0-beta)
├── package.json        # Node зависимости (supabase-js ^2.0.0)
├── vercel.json         # Реврайты + no-cache заголовки
├── .gitignore          # node_modules/
├── CONTEXT.md          # Этот файл
├── api/
│   ├── leaderboard.js  # Supabase API (submit, profile, register, level_records, etc.)
│   └── webhook.js      # Telegram bot webhook (v0.15.0-beta)
├── releases/           # Бэкапы предыдущих версий
│   ├── CONTEXT-alpha-2.2.md
│   ├── CONTEXT-beta-0.9.6.md
│   ├── CONTEXT-beta-0.10.0.md
│   ├── manifest-alpha-2.2.json
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
| score | BIGINT | Очки по формуле |
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
  - `/bug` — инструкция по сообщению о багах
  - Свободный текст в приватном чате → пересылка в канал поддержки

---

## 6. Система сохранений

### Трёхслойная система:
1. **localStorage** (`void_progress_{tg_user_id}`) — мгновенное, локальное, изолировано по пользователю
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
  totalDeaths: Number,        // Смерти
  achievements: [],           // Ачивки
  challenges: {},             // Испытания
  firstLaunch: Boolean,
  _tgUserId: String,          // ID пользователя для защиты от смешивания
  _v29_migrated: Boolean      // Флаг миграции
}
```

### Cloud save (v2 формат):
```js
{ v:2, _tgUserId, unlocked, levels, skin, shards, stats, achievements, challenges, firstLaunch, totalDeaths }
```

### Ключевые механизмы:
- **debouncedCloudSave()** — автосохранение через 2 сек после изменений
- **saveToCloudWithRetry()** — 3 попытки при ошибке, интервал 2 сек
- **updateSyncIndicator()** — ☁ ✓ / ☁ ✗ в меню
- **manualCloudSave()** — принудительное сохранение (кнопка ☁ в профиле)
- **loadFromCloud() + mergeCloudData()** — слияние: лучший результат побеждает
- **Account isolation** — _tgUserId в progress + cloud data, проверка при загрузке
- **User change detection** — проверка каждые 3 сек в gameLoop, авто-перезагрузка при смене аккаунта
- **localStorage keys** — `void_progress_{tg_id}`, `void_settings_{tg_id}`, `void_device_id_{tg_id}`

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
- Аватарка + ник + ☁ индикатор
- Ранг в лидерборде + лучший ранг
- Дней в пустоте
- Статистика: уровни, звёзды, осколки, идеальные, ачивки, смерти, время, score, weekly rank
- Сетка достижений
- Кнопки: рекорды, лидерборд
- Уведомления (вкл/выкл)
- Принудительное сохранение в облако (☁ → ✓/✗)

---

## 9. Игровые механики

### Движение:
- Бег (влево/вправо)
- Прыжок + coyote jump + jump buffer
- Wall slide + wall jump
- Dash (рывок, перезарядка ~0.6 сек)
- Нить (раскачивание на якоре, маятник)

### Сенсорная система (v0.15.0):
- **Set-based tracking** — вместо инкремент/декремент счётчика, используется Set с ID тел
- **Ground grace period** — 60мс после потери контакта с землёй, onGround остаётся true
- **Ground sensor** — 6px высотой, смещён на 1px ниже игрока
- **Boundary exclusion** — невидимые стены уровня не определяются как твёрдые поверхности

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

**В leaderboard:** 1 запись (SKUFI4, score: 44269, 7 уровней)
**В weekly_scores:** 1 запись (SKUFI4)
**В level_records:** 7 записей (SKUFI4, уровни 0-6)

---

## 13. Известные проблемы / TODO

1. **Weekly cron** — не настроен автоматический сброс (нужен pg_cron или Vercel cron)
2. **Weekly rewards** — логика начисления скинов (топ-3) и бейджей (топ-10) не реализована
3. **План переработки уровней** (одобрен пользователем, 5 этапов):
   - Stage 1: Новые механики (исчезающие платформы ✓, timed spike platforms ✓, расширение рычагов)
   - Stage 2: Переработка всех 6 актов (30 уровней) — больше стен, разнообразие ловушек
   - Stage 3: Чекпоинты и осколки (ручная расстановка)
   - Stage 4: Вертикальные стены для wall jump
   - Stage 5: Проверка проходимости всех уровней
4. **players.chat_id** —暴露ан анонимным читателям (privacy concern)
5. **initData validation** — сервер не проверяет HMAC подпись Telegram initData

---

## 14. Правила разработки

- **НЕ переписывать с нуля** — только фиксить на месте
- **Деплой:** git push origin main → Vercel автодеплой
- **НЕ ИСПОЛЬЗОВАТЬ** `vercel --prod`
- **Единственный файл игры:** index.html
- **Версия:** обновлять VOID_VERSION + manifest.json + webhook.js + CONTEXT.md

---

## 15. История фиксов (2026-06-03)

### Фикс прилипания к платформам (v0.14.0)
- Все платформы friction: 0.8→0.05, frictionStatic: 0.001
- Игрок friction: 0.05→0.001, frictionStatic: 0.3→0.001

### Фикс звука (v0.14.0)
- DynamicsCompressor (threshold -18dB, ratio 8:1)
- Все gain уровни снижены на 20-35%

### Фикс платформ — прыжок не работает (v0.15.0)
- Set-based сенсоры вместо counter-based (устойчивость к рассинхрону)
- Ground grace period 60мс
- Ground sensor увеличен до 6px, смещён на 1px ниже
- frictionStatic:0.001 для всех типов платформ

### Фикс эксплойта — невидимая стенка (v0.15.0)
- 'boundary' добавлен в список исключений сенсоров
- Невозможно wall-jump от граничных стен уровня

### Фикс кешей разных аккаунтов (v0.15.0)
- _tgUserId в progress и cloud data
- Верификация при загрузке localStorage и CloudStorage
- Периодическая проверка каждые 3 сек в gameLoop
- Сброс state.totalDeaths при смене пользователя

### Фикс rankEl ReferenceError (v0.15.0)
- Добавлена var rankEl в loadLB()

### Фикс state.totalDeaths (v0.15.0)
- Синхронизация state.totalDeaths = progress.totalDeaths при загрузке
- Сброс при сбросе прогресса
- Сброс при смене пользователя

### Синхронизация версий (v0.15.0)
- webhook.js: 0.14.0-beta → 0.15.0-beta
- manifest.json: 0.15.0 → 0.15.0-beta
