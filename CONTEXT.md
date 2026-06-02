# VOID — КОНТЕКСТ ПРОЕКТА

> ЭТОТ ФАЙЛ — ПЕРВОЕ, ЧТО ЧИТАЕТ ЛЮБОЙ ИИ ПЕРЕД РАБОТОЙ НАД ПРОЕКТОМ

---

## КРИТИЧЕСКИЕ ПРАВИЛА

1. **Единый HTML-файл** (index.html) — так и должно оставаться, НИКОГДА не переписывать с нуля
2. **PixiJS v8 + Matter.js** — движок и физика, загружаются через CDN
3. **Никакого Phaser** — мы на нём больше не работаем
4. **Сохранять визуальный стиль** — тёмная палитра (0x222240), минимализм
5. **HTML/CSS для UI, Canvas для игры** — никакого смешивания
6. **Работаем напрямую в main** — без ветки dev, push после каждого изменения
7. **НЕ ПЕРЕМЕЩАТЬ ФАЙЛЫ** — index.html, vercel.json, manifest.json лежат в void-game/ и Vercel настроен на rootDirectory: "void-game"
8. **НЕ ИСПОЛЬЗОВАТЬ `vercel --prod`** — только git push, Vercel авто-деплоит с GitHub
9. **Логотип + анимация персонажа** — НЕ ТРОГАТЬ без явного разрешения
10. **Музыка**: процедурная пентатоника Am, НЕ монотонный гул

---

## ТЕКУЩИЙ СТАТУС

- **Версия**: Beta 0.11.1 (VOID_VERSION = '0.11.1-beta')
- **Стек**: PixiJS 8.9.2 + Matter.js 0.20.0 + Supabase JS 2.x
- **Файл игры**: void-game/index.html (единый файл, ~290KB)
- **Git tag**: v0.11.1-beta

---

## СТРУКТУРА РЕПОЗИТОРИЯ

```
/home/z/my-project/          ← git root (git rev-parse --show-toplevel)
├── .gitignore
├── CONTEXT.md               ← этот файл
├── README.md                ← описание для GitHub
├── bot-logo.png
├── worklog.md               ← лог изменений
├── void-game/               ← ROOT DIRECTORY для Vercel
│   ├── index.html           ← ИГРА (единственный файл)
│   ├── manifest.json        ← PWA манифест
│   └── vercel.json          ← реврайты + no-cache заголовки
└── void-game-api/           ← API сервер (отдельный Vercel проект)
    ├── api/leaderboard.js
    ├── api/webhook.js       ← Telegram бот webhook
    ├── package.json
    └── vercel.json
```

### ВАЖНО: Структура файлов

Файлы игры (`index.html`, `manifest.json`, `vercel.json`) находятся в подкаталоге `void-game/`.
Vercel проект настроен с `rootDirectory: "void-game"`.
**НЕ перемещать эти файлы** — иначе сломается деплой.

---

## ПАЙПЛАЙН РАЗВЁРТЫВАНИЯ (DEPLOYMENT)

### Как это работает
```
Правка кода → git add → git commit → git push origin main → Vercel auto-deploy → Telegram показывает обновление
```

### Пошагово
1. Редактируешь `void-game/index.html`
2. `cd /home/z/my-project && git add void-game/index.html`
3. `git commit -m "описание правки"`
4. `git push origin main`
5. Vercel подхватывает push и деплоит (обычно 30-60 секунд)
6. Проверка: `curl -s https://void-game-ruddy.vercel.app/ | head -3`

### ЧЕГО ДЕЛАТЬ НЕЛЬЗЯ
- ❌ `vercel --prod` — вызывает конфликт с GitHub интеграцией
- ❌ Перемещать файлы из void-game/ в корень или наоборот
- ❌ Менять rootDirectory в Vercel без необходимости
- ❌ Создавать новый Vercel проект — только void-game-ruddy

### Как обойти кэш Telegram WebView
Если Telegram показывает старую версию:
1. Обновить `VOID_VERSION` в index.html (например 0.11.1-beta → 0.11.2-beta)
2. Push на GitHub
3. Обновить URL бота: `https://void-game-ruddy.vercel.app/v{VERSION}`
4. Vercel rewrite `/v:ver` → `/index.html` обеспечивает доступ по версионному URL

---

## ХОСТИНГ И СЕРВИСЫ

### Vercel — Игра
- **URL**: https://void-game-ruddy.vercel.app
- **Версионный URL**: https://void-game-ruddy.vercel.app/v0.11.1-beta
- **Project ID**: prj_sns11zIAoxZ74i5w3dzqRQbAGMk5
- **Team ID**: team_WnSETytVcJMHnNfLZdIOqcSQ
- **rootDirectory**: void-game
- **GitHub**: Digerr/void-game, ветка main
- **SSO Protection**: ОТКЛЮЧЕНА

### Vercel — API
- **URL**: https://void-api-deploy.vercel.app
- **Project ID**: prj_oGXmNFTdkiJjEOC9wrhUAdxowwlx
- **GitHub**: Digerr/void-game-api
- **SSO Protection**: ОТКЛЮЧЕНА

### Supabase
- **URL**: https://jibtmyuxbeckanmkhuik.supabase.co
- **Таблицы**: leaderboard, players
- **Realtime**: ВКЛЮЧЁН

### Telegram
- **Бот**: @voide_game_bot (id: 8858889318)
- **Web App URL**: https://void-game-ruddy.vercel.app/v0.11.1-beta
- **has_main_web_app**: true

---

## АРХИТЕКТУРА ИГРЫ

```
index.html (единый файл)
├── CSS (встроенный) — тёмная тема, glassmorphism UI, тач-контролы, кнопки ↑↓ для нити
├── HTML — UI слой (меню, HUD, экраны, тач-контролы, settings, faq, level-select, leaderboard)
└── JavaScript
    ├── Audio System — Web Audio API (SFX + процедурная мелодия Am)
    ├── PixiJS — рендеринг (спрайты, параллакс, эффекты, частицы, свет/туман)
    ├── Matter.js — физика (тела, столкновения, constraint)
    ├── Game Loop — requestAnimationFrame, dt-сглаживание (EMA), slow-mo
    ├── Player — движение, прыжок, wall jump, wall slide, дэш, нить
    ├── Level Loader — JSON данные → Matter тела + PixiJS спрайты
    ├── Camera — плавное следование за игроком + shake, dt-independent lerp
    ├── Input — клавиатура + тач-контролы + кнопки подъёма по нити
    ├── Checkpoints — вертикальный луч света, кристалл, пульсация, радиус 26
    ├── Thread/Rope — damping 0.92, angular cap 2, swing force 0.08, кнопки ↑↓
    ├── Screen Manager — меню/игра/пауза/смерть/победа/settings/faq/levels/leaderboard
    ├── Logo Animation — scripted sequence (НЕ ТРОГАТЬ)
    ├── Light & Fog — 2D туман с отверстиями
    ├── Telegram SDK — WebApp интеграция, haptic, CloudStorage, dt-сглаживание
    └── Supabase Leaderboard — real-time таблица лидеров (заглушка)
```

---

## МЕХАНИКИ

Движение, прыжок (переменная высота), wall slide/jump, coyote time, jump buffer, дэш (скорость 18, 0.12с, кд 0.55с), нить (swing 0.08, damping 0.92, angular cap 2, кнопки ↑↓ для подъёма), шипы, пилы, маятники, враги, рычаги+двери (linkId), движущиеся/падающие платформы, чекпоинты (луч света + кристалл), портал финиша, параллакс (3 слоя), туман+свет, slow-mo, squash/stretch, ветер, гравитационные зоны, порталы, пружины, лёд, тьма (преследование), осколки памяти

---

## УРОВНИ

30 уровней, 6 актов:
- **Акт 1 "Пробуждение"** (1-5)
- **Акт 2 "Глубины"** (6-10)
- **Акт 3 "Нити"** (11-15)
- **Акт 4 "Пустота"** (16-20)
- **Акт 5 "Возрождение"** (21-25)
- **Акт 6 "Исход"** (26-30)

Чекпоинты размещены логически — после сложных участков, видны издалека.

---

## ПЕРСОНАЖ

Рисуется процедурно в `drawPlayerParts()`:
- Тело: эллипс 0x5a5a7e, голова: круг 0x5a5a80
- Уши: треугольники 0x8a6aa0, глаза: 0x1a1a3a с бликами 0xccddef
- Шарф: 2 линии 0x7a5a9a/0x6a4a8a
- Аура: мягкий круг 0x6a6aaa

---

## ПЛАН РАЗРАБОТКИ

| Фаза | Статус |
|------|--------|
| Фундамент, механики, PWA | ✅ |
| Лидерборд (Supabase + Vercel) | ✅ |
| Профиль + уведомления | ✅ |
| Phase 1: Чекпоинты + уровни | ✅ |
| Phase 2: Нити (фикс вращения, кнопки ↑↓, якоря) | ✅ |
| Phase 3: UI/UX (glassmorphism, шрифты, современный вид) | ✅ |
| 30 уровней, 6 актов | ✅ Beta 0.10.0 |
| TG оптимизация (dt-сглаживание) | ✅ Beta 0.11.0 |
| Звук (полный cleanup stopMusic) | ✅ Beta 0.11.1 |
| Полировка | ⬜ |
| Таблица лидеров (реальная) | ⬜ |

---

## ИСТОРИЯ ИЗМЕНЕНИЙ

| Версия | Изменение |
|--------|-----------|
| alpha 1.0 | Проект создан на PixiJS + Matter.js |
| alpha 1.5 | Все механики, 20 уровней, SFX, Telegram |
| alpha 2.0 | Персонаж с эмоциями, логотип, портал, мелодия |
| alpha 2.1 | Скины (6), достижения (10), актовые заставки, туториал |
| alpha 2.2 | Levels redesign, ранги, awakening, profile stats, daily challenge, perf |
| alpha 2.3 | Фикс: персонаж не залезает на текст, меню на весь экран |
| beta 0.9.6 | Phaser → PixiJS v8, атмосфера, живые фоны |
| beta 0.9.7 | Pre-release полировка |
| beta 0.9.8 | Лидерборд: Supabase + Vercel API, 3 вкладки, real-time, anti-cheat |
| beta 0.9.9 | Профиль игрока, уведомления при обгоне, players таблица |
| alpha 2.4 | Чекпоинты (луч+кристалл), 20 уровней, нить (damping+кнопки ↑↓), glassmorphism UI |
| beta 0.10.0 | Переход в бету, 30 уровней, 6 актов, полный аудит |
| beta 0.11.0 | Фикс смерти при падении, TG dt-сглаживание, заглушка лидерборда |
| beta 0.11.1 | Полный cleanup stopMusic — фикс зависания звука при выходе в меню |

---

## ПРОЦЕДУРА ПРИ КАЖДОЙ ПРАВКЕ

1. Читать этот CONTEXT.md перед началом
2. Править `void-game/index.html` на месте (НЕ переписывать с нуля)
3. Обновить `VOID_VERSION` в index.html если это значимая правка
4. `cd /home/z/my-project && git add -A && git commit -m "описание" && git push origin main`
5. Дождаться деплоя Vercel (~30-60с)
6. Проверить: `curl -s https://void-game-ruddy.vercel.app/ | grep VOID_VERSION`
7. Записать правку в worklog.md
8. Если менялась версия — обновить URL бота и тег в git
