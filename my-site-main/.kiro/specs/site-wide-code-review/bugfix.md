# Bugfix Requirements Document

## Introduction

Комплексный код-ревью сайта (React/TypeScript + Supabase, Vite, Tailwind CSS) выявил 25 проблем различной критичности — от вопросов качества кода и доступности до серьёзных уязвимостей безопасности и потенциальных крашей. Данный документ систематизирует все выявленные дефекты от наименее критичных к наиболее критичным для последовательного устранения.

## Bug Analysis

### Current Behavior (Defect)

**Низкая критичность — Качество кода и доступность (Issues 1–8)**

1.1 WHEN пользователь с экранным ридером взаимодействует с кнопками навигации (переключатель темы, праздничный режим, меню) в App.tsx THEN система не предоставляет aria-label для icon-only кнопок, делая их недоступными

1.2 WHEN ReferralModal открывается THEN система рендерит модальное окно как позиционированный div без focus trap и без обработки нажатия Escape для закрытия

1.3 WHEN администратор выполняет действия в Dashboard.tsx (удаление, редактирование) THEN система использует нативные `confirm()` и `prompt()`, блокируя основной поток и ухудшая UX

1.4 WHEN приложение загружается THEN система импортирует мёртвый код: ToastContext.tsx не используется (используется Toast.tsx event-based система), иконка `Leaf` импортируется всегда, `SummerGlow` загружается без условий

1.5 WHEN пользователь прокручивает контент в index.html THEN система скрывает scrollbar через `scrollbar-width: 0px`, нарушая доступность и ожидаемое поведение браузера

1.6 WHEN любой компонент выбрасывает необработанную ошибку рендеринга THEN система размонтирует всё приложение целиком из-за отсутствия React Error Boundary

1.7 WHEN на странице присутствуют несколько экземпляров Section.tsx или Card.tsx THEN система использует статические SVG-паттерн ID ("subtle-grid"), вызывая конфликты и некорректное отображение

1.8 WHEN разработчик работает с проектом THEN система содержит дублирующуюся папку `/my-site-main/my-site-main/` и мусорные файлы (`context.zip`, `d`, `dist — копия`)

**Средняя критичность — Анти-паттерны и производительность (Issues 9–16)**

1.9 WHEN приложение работает THEN система содержит две конкурирующие Toast-системы: `Toast.tsx` (CustomEvent) и `ToastContext.tsx` (Context API), причём используется только event-based система

1.10 WHEN Dashboard.tsx рендерится THEN система загружает god-компонент (~400+ строк, 30+ вызовов useState), что делает код немантежабельным и ухудшает производительность

1.11 WHEN пользователь прокручивает страницу с Hero.tsx THEN система вызывает `setScrollY(window.scrollY)` на каждый scroll event без throttle/RAF, вызывая ре-рендер на каждом кадре

1.12 WHEN пользователь переключает тему THEN система применяет `html.dark * { transition: ... }` ко ВСЕМ элементам, создавая массивный удар по производительности

1.13 WHEN Stats.tsx рендерится THEN система создаёт 4 IntersectionObserver без useMemo/useCallback оптимизаций, расходуя ресурсы

1.14 WHEN Leaderboard.tsx загружает данные THEN система запрашивает ВСЕ профили и фильтрует на стороне клиента в JS, вместо серверной фильтрации

1.15 WHEN пользователь выполняет действие в Tasks.tsx THEN система использует `window.location.href = '/cabinet'` вместо React Router, вызывая полную перезагрузку страницы

1.16 WHEN проект компилируется с path alias `@/*` THEN система не разрешает алиасы в Vite (tsconfig определяет `@/*`, но vite.config.ts не содержит resolve.alias)

**Высокая критичность — Runtime-ошибки и потенциальные крэши (Issues 17–20)**

1.17 WHEN Dashboard.tsx импортирует утилиты THEN система ссылается на `'../utils/validation'`, `'../utils/transactions'`, `'../utils/errorHandler'` — существование этих файлов не подтверждено

1.18 WHEN два toast-уведомления создаются в одну миллисекунду THEN система присваивает одинаковый ID через `Date.now()`, что приводит к конфликту ключей и непредсказуемому поведению

1.19 WHEN компоненты используют ref из useCountUp.ts и useScrollAnimation.ts до присоединения к DOM THEN система падает из-за non-null assertion `useRef<HTMLElement>(null!)` при обращении к неинициализированному ref

1.20 WHEN окно браузера изменяет размер в useAnimationQueue.ts THEN resize listener захватывает начальную версию `processQueue` из-за stale closure в useEffect

**Критическая критичность — Безопасность и целостность данных (Issues 21–25)**

1.21 WHEN несколько одновременных запросов выполняют финансовые операции (cancelMyWithdrawal, createOrder, cancelOrder) в Dashboard.tsx и BusinessDashboard.tsx THEN система допускает TOCTOU race condition, позволяя двойное зачисление средств пользователям

1.22 WHEN неавторизованный пользователь переходит по URL `/admin/users` THEN система рендерит компонент UsersPage без проверки авторизации и роли

1.23 WHEN BusinessDashboard.tsx вызывает Supabase Functions THEN система использует захардкоженный URL `'https://uqjavxbkcsqdfssrlplp.supabase.co/functions/v1'` вместо переменной окружения

1.24 WHEN репозиторий публикуется или клонируется THEN система потенциально содержит файл `.env` с секретами в системе контроля версий (необходимо проверить .gitignore)

1.25 WHEN разработчик допускает обращение к null/undefined THEN система не ловит ошибки на этапе компиляции, так как tsconfig не включает strict mode

**Критическая критичность — Полный крэш интерфейса (Issue 26)**

1.26 WHEN пользователь открывает Dashboard (личный кабинет) THEN система показывает чёрный экран без отображения заданий и контента, так как отсутствующие утилиты (utils/validation, utils/transactions, utils/errorHandler) вызывают import-ошибку, а отсутствие Error Boundary приводит к полному размонтированию приложения

### Expected Behavior (Correct)

**Низкая критичность — Качество кода и доступность**

2.1 WHEN пользователь с экранным ридером взаимодействует с кнопками навигации THEN система SHALL предоставлять уникальные aria-label для каждой icon-only кнопки (например, "Переключить тему", "Праздничный режим", "Открыть меню")

2.2 WHEN ReferralModal открывается THEN система SHALL реализовать focus trap внутри модального окна и закрывать его по нажатию Escape

2.3 WHEN администратор выполняет критические действия THEN система SHALL использовать кастомные модальные окна подтверждения вместо нативных confirm()/prompt()

2.4 WHEN приложение загружается THEN система SHALL не содержать неиспользуемых импортов: удалить ToastContext.tsx, условно загружать Leaf-иконку и SummerGlow (lazy/conditional import)

2.5 WHEN пользователь прокручивает контент THEN система SHALL сохранять видимый scrollbar, удалив `scrollbar-width: 0px` из index.html

2.6 WHEN компонент выбрасывает ошибку рендеринга THEN система SHALL обернуть приложение в React Error Boundary, показывая fallback UI вместо белого экрана

2.7 WHEN на странице присутствуют несколько экземпляров Section.tsx или Card.tsx THEN система SHALL генерировать уникальные SVG-паттерн ID (например, через useId() или UUID)

2.8 WHEN разработчик работает с проектом THEN система SHALL не содержать дублирующихся директорий и мусорных файлов

**Средняя критичность — Анти-паттерны и производительность**

2.9 WHEN приложение работает THEN система SHALL использовать единую Toast-систему (event-based Toast.tsx), а ToastContext.tsx SHALL быть удалён

2.10 WHEN Dashboard загружается THEN система SHALL декомпозировать god-компонент на логические подкомпоненты (AuthForm, WithdrawalForm, NotificationsPanel, TaskList и т.д.)

2.11 WHEN пользователь прокручивает страницу с Hero.tsx THEN система SHALL использовать throttle или requestAnimationFrame для scroll listener, ограничивая ре-рендеры

2.12 WHEN пользователь переключает тему THEN система SHALL ограничить transition при смене темы только элементом html или body, не применяя transition ко всем элементам через wildcard селектор

2.13 WHEN Stats.tsx рендерится THEN система SHALL оптимизировать IntersectionObserver через useMemo/useCallback для предотвращения ненужных пересозданий

2.14 WHEN Leaderboard.tsx загружает данные THEN система SHALL выполнять фильтрацию на стороне сервера (Supabase query с .limit(), .order() и условиями)

2.15 WHEN пользователю необходимо перейти на /cabinet из Tasks.tsx THEN система SHALL использовать React Router navigate() для SPA-навигации без перезагрузки страницы

2.16 WHEN проект компилируется THEN система SHALL содержать соответствующий resolve.alias в vite.config.ts, корректно разрешая `@/*` путь к корню проекта

**Высокая критичность — Runtime-ошибки и потенциальные крэши**

2.17 WHEN Dashboard.tsx импортирует утилиты THEN система SHALL содержать существующие файлы utils/validation.ts, utils/transactions.ts, utils/errorHandler.ts с корректными экспортами

2.18 WHEN два toast-уведомления создаются в одну миллисекунду THEN система SHALL генерировать гарантированно уникальные ID (через инкрементный счётчик или crypto.randomUUID())

2.19 WHEN компоненты используют ref из хуков THEN система SHALL использовать безопасную инициализацию ref (`useRef<HTMLElement | null>(null)`) с проверкой на null перед обращением

2.20 WHEN окно браузера изменяет размер в useAnimationQueue.ts THEN система SHALL корректно обновлять ссылку на processQueue через useRef или включить processQueue в зависимости useEffect

**Критическая критичность — Безопасность и целостность данных**

2.21 WHEN финансовые операции выполняются THEN система SHALL использовать серверные транзакции с блокировками (Supabase RPC/database function с SELECT FOR UPDATE) для предотвращения race conditions

2.22 WHEN пользователь переходит по URL `/admin/users` THEN система SHALL проверять сессию и роль пользователя (role === 'admin') перед рендерингом компонента, перенаправляя неавторизованных пользователей

2.23 WHEN BusinessDashboard.tsx вызывает Supabase Functions THEN система SHALL получать URL из переменной окружения `import.meta.env.VITE_SUPABASE_URL` с добавлением `/functions/v1`

2.24 WHEN репозиторий управляется через git THEN система SHALL содержать `.env` в .gitignore и НЕ содержать файл .env в трекаемых файлах репозитория

2.25 WHEN TypeScript компилирует проект THEN система SHALL включить `"strict": true` в tsconfig.json для раннего обнаружения null-access ошибок

**Критическая критичность — Полный крэш интерфейса**

2.26 WHEN пользователь открывает Dashboard (личный кабинет) THEN система SHALL корректно отображать все задания и контент: утилиты utils/validation, utils/transactions, utils/errorHandler SHALL существовать с корректными экспортами, а Error Boundary SHALL перехватывать любые ошибки рендеринга и показывать fallback UI вместо чёрного экрана

### Unchanged Behavior (Regression Prevention)

3.1 WHEN зрячий пользователь нажимает icon-only кнопки навигации THEN система SHALL CONTINUE TO переключать тему, праздничный режим и мобильное меню как прежде

3.2 WHEN ReferralModal открывается THEN система SHALL CONTINUE TO отображать информацию о реферальной программе и код пользователя

3.3 WHEN администратор подтверждает действие в новом модальном окне THEN система SHALL CONTINUE TO выполнять то же действие (удаление, обновление) что и раньше

3.4 WHEN компоненты используют toast.success/toast.error/toast.info THEN система SHALL CONTINUE TO показывать уведомления через event-based систему с тем же API

3.5 WHEN пользователь прокручивает контент THEN система SHALL CONTINUE TO плавно прокручивать страницу без визуальных артефактов

3.6 WHEN приложение работает без ошибок THEN система SHALL CONTINUE TO рендерить все страницы и компоненты идентично

3.7 WHEN Section.tsx и Card.tsx рендерят SVG-паттерны THEN система SHALL CONTINUE TO отображать декоративные элементы визуально идентично

3.8 WHEN единая Toast-система вызывается THEN система SHALL CONTINUE TO показывать уведомления success/error/info с 3-секундным auto-dismiss

3.9 WHEN Dashboard отображает данные пользователя THEN система SHALL CONTINUE TO показывать баланс, историю операций, задания и уведомления

3.10 WHEN Hero.tsx рендерит параллакс-эффекты THEN система SHALL CONTINUE TO отображать визуальные эффекты при скролле (с оптимизированной частотой)

3.11 WHEN тема переключается THEN система SHALL CONTINUE TO плавно менять цвета интерфейса

3.12 WHEN Stats.tsx анимирует числа при появлении в viewport THEN система SHALL CONTINUE TO показывать count-up анимацию

3.13 WHEN Leaderboard отображает список лидеров THEN система SHALL CONTINUE TO показывать корректно отсортированный рейтинг

3.14 WHEN пользователь переходит на /cabinet THEN система SHALL CONTINUE TO показывать личный кабинет с актуальными данными

3.15 WHEN Vite разрешает пути THEN система SHALL CONTINUE TO корректно разрешать все существующие relative imports

3.16 WHEN toast-уведомления показываются в обычных условиях (не в одну миллисекунду) THEN система SHALL CONTINUE TO корректно отображать и скрывать каждое уведомление

3.17 WHEN useCountUp и useScrollAnimation привязываются к элементам DOM THEN система SHALL CONTINUE TO анимировать числа и scroll-triggered эффекты

3.18 WHEN useAnimationQueue управляет анимациями THEN система SHALL CONTINUE TO корректно ставить в очередь и воспроизводить анимации с лимитом на мобильных

3.19 WHEN авторизованный администратор переходит на /admin/users THEN система SHALL CONTINUE TO отображать панель управления пользователями

3.20 WHEN BusinessDashboard создаёт заказы THEN система SHALL CONTINUE TO вызывать Supabase Edge Functions с корректными параметрами

3.21 WHEN финансовые операции выполняются последовательно (без конкурентности) THEN система SHALL CONTINUE TO корректно обрабатывать выводы, заказы и отмены

3.22 WHEN strict mode включается THEN система SHALL CONTINUE TO компилировать существующий код (после исправления type errors)

3.23 WHEN Dashboard отображается после исправления THEN система SHALL CONTINUE TO показывать все существующие функции кабинета (баланс, история, задания, уведомления) без визуальных регрессий
