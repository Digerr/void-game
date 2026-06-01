# VOID — КОНТЕКСТ ПРОЕКТА

> ЭТОТ ФАЙЛ — ПЕРВОЕ, ЧТО ЧИТАЕТ ЛЮБОЙ ИИ ПЕРЕД РАБОТОЙ НАД ПРОЕКТОМ

---

## КРИТИЧЕСКИЕ ПРАВИЛА

1. **Единый HTML-файл** (index.html) — так и должно оставаться
2. **PixiJS v8 + Matter.js** — движок и физика, загружаются через CDN
3. **Никакого Phaser** — мы на нём больше не работаем
4. **Push на GitHub после каждого изменения** — main ветка, мгновенный деплой
5. **Сохранять визуальный стиль** — тёмная палитра (0x222240), минимализм, Courier New
6. **HTML/CSS для UI, Canvas для игры** — никакого смешивания
7. **Работаем напрямую в main** — без ветки dev
8. **Цветовая схема персонажа**: тело 0x5a5a7e, шарф 0x7a5a9a, глаза 0x1a1a3a, блик 0xccddef
9. **Цветовая схема портала/финиша**: фиолетовая (0x4a4a8a, 0x6a5aaa, 0x8a7aca), НЕ зелёная
10. **Музыка**: процедурная пентатоника Am, НЕ монотонный гул
11. **СПРАШИВАЙ РАЗРЕШЕНИЕ** перед изменением кода — пользователь просил не писать код без одобрения

---

## ТЕКУЩИЙ СТАТУС

- **Версия**: Beta 0.9.8 (leaderboard integration)
- **Стек**: PixiJS 8.9.2 + Matter.js 0.20.0 + Supabase JS 2.x
- **Файл**: index.html (единый файл, ~4477 строк)
- **Хостинг**: Vercel → https://void-game-ruddy.vercel.app
- **GitHub**: https://github.com/Digerr/void-game/
- **API GitHub**: https://github.com/Digerr/void-game-api/
- **API хостинг**: Vercel → https://void-game-api-sergo-s-projects1.vercel.app
- **Telegram бот**: @voide_game_bot (id: 8858889318)
- **Локальный путь**: /home/z/my-project/void-game/
- **API локальный путь**: /home/z/my-project/void-game-api/

---

## АРХИТЕКТУРА

```
index.html (единый файл)
├── CSS (встроенный) — тёмная тема, UI стили, анимации, тач-контролы, лидерборд
├── HTML — UI слой (меню, HUD, экраны, тач-контролы, settings, faq, level-select, leaderboard)
└── JavaScript
    ├── Audio System — Web Audio API
    │   ├── SFX (jump, land, dash, death, wall slide/jump, thread, lever, level complete, spike)
    │   └── Music — процедурная пентатоника Am (мелодия + пэды + искры + реверб + делей)
    ├── PixiJS — рендеринг (спрайты, параллакс, эффекты, частицы, свет/туман)
    ├── Matter.js — физика (тела, столкновения, constraint)
    ├── Game Loop — requestAnimationFrame, slow-mo
    ├── Player — движение, прыжок, wall jump, wall slide, дэш, нить (верёвка)
    ├── Level Loader — JSON данные → Matter тела + PixiJS спрайты
    ├── Camera — плавное следование за игроком + shake
    ├── Input — клавиатура + тач-кнопки
    ├── Screen Manager — меню/игра/пауза/смерть/победа/settings/faq/levels/leaderboard
    ├── Logo Animation — scripted sequence
    ├── Light & Fog — 2D туман с отверстиями
    ├── Telegram SDK — WebApp интеграция, haptic, CloudStorage
    └── Supabase Leaderboard — real-time таблица лидеров
```

```
void-game-api/ (Vercel Serverless)
├── api/leaderboard.js — POST endpoint (verify initData, compute score, upsert Supabase)
├── package.json — @supabase/supabase-js dependency
└── vercel.json — CORS headers, rewrites
```

---

## ЛИДЕРБОРД — АРХИТЕКТУРА

```
Клиент (index.html)
  │
  ├── ЧТЕНИЕ: Supabase anon key → REST + Realtime (postgres_changes)
  │
  └── ЗАПИСЬ: tg.initData + levelData → Vercel API (POST)
                │
                ├── 1. Проверка HMAC подписи initData (anti-cheat)
                ├── 2. Rate limit (10с на юзера, in-memory)
                ├── 3. Вычисление score сервером: completed*10000 + stars*100 - round(time)
                ├── 4. Upsert в Supabase (service_role, обходит RLS)
                └── 5. Возврат ранга клиенту
```

### Формула score
```
score = completed × 10000 + totalStars × 100 − round(totalTime)
```

### 3 вкладки лидерборда
- **Мир** (global): сортировка по score (composite)
- **Скорость** (speed): сортировка по total_time ASC (только completed>0)
- **Звёзды** (stars): сортировка по total_stars DESC

### Supabase таблица leaderboard
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | text PK | tg_{userId} или local_{deviceId} |
| name | text | Имя из Telegram |
| score | bigint | Вычисленный сервером |
| completed | integer | Кол-во пройденных уровней |
| total_stars | integer | Сумма всех звёзд |
| total_time | float8 | Суммарное время (сек) |
| level_data | jsonb | Детали по уровням {stars, bestTime} |
| updated | timestamptz | Время последнего обновления |

### RLS политика
- **anon**: SELECT только (чтение)
- **service_role**: полный доступ (запись через Vercel API)

### Ключевые функции в index.html
- `initSupabase()` — создаёт Supabase клиент
- `computeLBScore()` — считает score на клиенте (для отображения)
- `submitLB()` — отправляет результат на Vercel API
- `showLeaderboard(tab)` — открывает экран лидерборда
- `loadLB()` — загружает данные + подписка на Realtime
- `renderLB()` — рендерит список, учитывает вкладку
- `getMyLBId()` — возвращает ID текущего игрока

### Вызов submitLB()
Срабатывает автоматически при завершении уровня (в функции win-level).

---

## ПЕРСОНАЖ

Рисуется процедурно в `drawPlayerParts()`:
- **Тело**: эллипс 0x5a5a7e с хайлайтом
- **Голова**: круг 0x5a5a80 с хайлайтом
- **Уши**: треугольники с внутренней частью 0x8a6aa0
- **Глаза**: большие эллипсы 0x1a1a3a с бликами 0xccddef, моргание каждые 4с
- **Рот**: smile, O (удивление), neutral, scared
- **Шарф**: 2 линии 0x7a5a9a/0x6a4a8a, развевается
- **Руки/ноги**: линии 0x5a5a7e, разные позы по состояниям
- **Аура**: мягкий круг 0x6a6aaa, ярче при дэше

---

## МЕХАНИКИ

Движение, прыжок (переменная высота), wall slide/jump, coyote time, jump buffer, дэш, нить/верёвка (grappling hook), шипы, пилы, маятники, враги, рычаги+двери (linkId), движущиеся/падающие платформы, чекпоинты, портал финиша, параллакс (3 слоя), туман+свет, slow-mo, squash/stretch

---

## ЭКРАНЫ

Меню (3 зоны), Story, HUD, Тач-контролы, Пауза, Смерть, Победа, Настройки, FAQ, Выбор уровня (карточки актов), Рекорды, Испытание дня, Awakening заставка, Act intro, Лидерборд (3 вкладки)

---

## УРОВНИ

20 уровней, 4 акта:
- **Акт 1 "Пробуждение"** (1-5), **Акт 2 "Глубины"** (6-10), **Акт 3 "Нити"** (11-15), **Акт 4 "Пустота"** (16-20)

---

## РЕЙТИНГ И ПРОГРЕСС

★★★/★★/★ на основе смертей + времени. localStorage + TG CloudStorage. Ранги S/A/B/C/D.

---

## СЕРВИСЫ И КЛЮЧИ

> Подробности в CREDENTIALS.md (не коммитить в публичный доступ)

### Vercel
- **Игра**: https://void-game-ruddy.vercel.app (Project ID: prj_sns11zIAoxZ74i5w3dzqRQbAGMk5)
- **API**: https://void-game-api-sergo-s-projects1.vercel.app (Project ID: prj_7APxhhiAwpyY8rIN5ajOFPr5YzfZ)
- **Team ID**: team_WnSETytVcJMHnNfLZdIOqcSQ
- **SSO Protection**: ОТКЛЮЧЕНА на обоих проектах

### Supabase
- **URL**: https://jibtmyuxbeckanmkhuik.supabase.co
- **Таблица**: leaderboard
- **Realtime**: ВКЛЮЧЁН

### Telegram
- **Бот**: @voide_game_bot (id: 8858889318)

---

## ПЛАН РАЗРАБОТКИ

| Фаза | Статус |
|------|--------|
| 0-12. Фундамент → PWA | ✅ |
| 13. Лидерборд (Supabase + Vercel) | ✅ |
| 14. 30+ уровней | ⬜ |
| 15. Социальное | ⬜ |
| 16. Полировка | ⬜ |

---

## ИСТОРИЯ ИЗМЕНЕНИЙ

| Версия | Изменение |
|--------|-----------|
| alpha 1.0 | Проект создан на PixiJS + Matter.js |
| alpha 1.5 | Все механики, 20 уровней, SFX, Telegram |
| alpha 2.0 | Персонаж с эмоциями, логотип, портал, мелодия |
| alpha 2.1 | Скины (6), достижения (10), актовые заставки, туториал |
| alpha 2.2 | Levels redesign, ранги, awakening, profile stats, daily challenge, perf |
| alpha 2.3 | Фикс: персонаж не залезает на текст, существо на заставке = меню, меню на весь экран |
| beta 0.9.7 | Pre-release полировка |
| beta 0.9.8 | Лидерборд: Supabase + Vercel API, 3 вкладки, real-time, anti-cheat (HMAC initData) |
