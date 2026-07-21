# Implementation Plan: Premium Redesign

## Overview

Премиум-редизайн NOXISS.WORK: трансформация из AI-шаблонного стиля в максималистичный студийный интерфейс. Реализация включает дизайн-систему (CSS-переменные + Tailwind-токены), компонентную библиотеку (Section, Card, Icon), систему анимаций (scroll + micro + queue), тёмную тему, и аудит/рефакторинг бэкенд-логики (валидация, транзакции, обработка ошибок).

## Tasks

- [x] 1. Design System Tokens и Theme Provider
  - [x] 1.1 Создать CSS-переменные и расширить tailwind.config.js
    - Добавить в `index.css` блок `:root` с токенами: surface colors, text colors, accent, shadows, radii, typography, animation easing/durations
    - Добавить блок `.dark` с переопределениями: тёмные поверхности, glow вместо теней, светлый текст
    - Расширить `tailwind.config.js`: подключить CSS-переменные как Tailwind-цвета, тени, радиусы, шрифты
    - _Requirements: 2.3, 2.4, 5.1, 5.2, 5.3, 5.5, 9.1, 9.2_

  - [x] 1.2 Реализовать Theme Provider с переключением тем
    - Расширить `App.tsx`: функция `getInitialTheme()` (localStorage → prefers-color-scheme → 'light')
    - Добавить toggle с CSS transition 400-600ms на background-color, color, border-color, box-shadow
    - Сохранять выбор в localStorage, переключать класс `.dark` на `<html>`
    - _Requirements: 9.4, 9.5_

  - [x] 1.3 Write property test for theme initialization (Property 18)
    - **Property 18: Theme initialization follows priority order**
    - **Validates: Requirements 9.5**

- [x] 2. Animation System (Hooks)
  - [x] 2.1 Создать `hooks/useReducedMotion.ts`
    - Реализовать хук, возвращающий boolean на основе `prefers-reduced-motion: reduce`
    - Подписаться на изменения media query через `addEventListener('change', ...)`
    - _Requirements: 3.8, 8.2_

  - [x] 2.2 Создать `hooks/useScrollAnimation.ts`
    - Реализовать хук с IntersectionObserver (threshold 0.2) + Framer Motion motion values
    - Анимация: opacity 0→1, translateY 20-30px→0, duration 400-600ms, easing cubic-bezier(0.16, 1, 0.3, 1)
    - Интеграция с `useReducedMotion` — при reduce: duration 0ms, мгновенное отображение
    - Поддержка stagger: delay = index * staggerDelay (50-100ms), cap at 20 элементов
    - _Requirements: 3.1, 3.3, 3.8, 3.9_

  - [x] 2.3 Write property test for scroll animation values (Property 3)
    - **Property 3: Scroll animation produces valid motion values**
    - **Validates: Requirements 3.1**

  - [x] 2.4 Write property test for stagger delay (Property 4)
    - **Property 4: Stagger delay calculation respects bounds and max elements**
    - **Validates: Requirements 3.3**

  - [x] 2.5 Создать `hooks/useAnimationQueue.ts`
    - Реализовать очередь анимаций: maxConcurrent 3 на mobile (<768px), Infinity на desktop
    - Enqueue/dequeue логика: FIFO, запуск по мере завершения текущих
    - Интеграция с `useReducedMotion`
    - _Requirements: 8.1, 8.5_

  - [x] 2.6 Write property test for animation queue (Property 16)
    - **Property 16: Mobile animation queue limits concurrent animations**
    - **Validates: Requirements 8.1, 8.5**

  - [x] 2.7 Создать `hooks/useCountUp.ts`
    - Реализовать count-up эффект: от 0 до target, duration 800-1500ms, easing ease-out
    - Запуск при появлении в viewport (threshold 0.5)
    - Монотонно неубывающая последовательность значений
    - _Requirements: 3.5_

  - [x] 2.8 Write property test for count-up monotonicity (Property 5)
    - **Property 5: Count-up animation is monotonically increasing**
    - **Validates: Requirements 3.5**

  - [x] 2.9 Write property test for reduced motion (Property 7)
    - **Property 7: Reduced motion disables all transform animations**
    - **Validates: Requirements 3.8, 8.2**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. UI Component Library
  - [x] 4.1 Создать `components/ui/Section.tsx`
    - Реализовать Section wrapper с props: variant ('light' | 'dark' | 'accent' | 'textured'), decorElements
    - 3-слойный фон: solid color + полупрозрачная текстура + абсолютно-позиционированный SVG-декор
    - Ограничение декоративных элементов: min 2, max 6
    - `pointer-events-none` и низкий z-index для декора (не перекрывает контент)
    - Lazy-загрузка SVG через `React.lazy` + `Suspense`
    - _Requirements: 1.4, 2.1, 2.2, 2.6_

  - [x] 4.2 Write property test for decorative element bounds (Property 1)
    - **Property 1: Decorative element count is bounded**
    - **Validates: Requirements 2.2**

  - [x] 4.3 Write property test for adjacent section contrast (Property 2)
    - **Property 2: Adjacent sections have sufficient color contrast**
    - **Validates: Requirements 2.3**

  - [x] 4.4 Создать `components/ui/Card.tsx`
    - Реализовать 4 варианта: flat, elevated, bordered, glass
    - CONTENT_VARIANT_MAP: pricing→elevated, benefit→bordered, step→bordered, testimonial→glass, stat→flat
    - Двойная тень для elevated (ближняя 0-4px + дальняя 8-32px blur)
    - Glass: backdrop-filter blur ≥8px, bg opacity ≤0.15
    - Hover: translateY(-4px), shadow blur +8px, transition 250ms ease-out
    - Декоративный элемент (accent line/corner/pattern) в каждой карточке
    - Responsive padding: 24px (<768px), 32px (≥768px), gap 16px/24px
    - border-radius: 20px (карточки), вложенные элементы 8-16px
    - _Requirements: 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.5 Write property test for card variant mapping (Property 10)
    - **Property 10: Content type maps to correct card variant**
    - **Validates: Requirements 6.3**

  - [x] 4.6 Создать `components/ui/IconBadge.tsx`
    - Реализовать иконку в цветной подложке (rounded-2xl, 48×48px, bg opacity 0.1-0.15)
    - Размеры: sm (32px), md (48px), lg (64px)
    - CSS-анимации: pulse, rotate, bounce
    - _Requirements: 4.3, 4.4_

  - [x] 4.7 Создать `components/ui/BrandIcon.tsx`
    - Inline SVG иконки брендов: Авито, Яндекс, 2ГИС, Google
    - Размер 24-32px, обязательный aria-label
    - Опциональная текстовая подпись
    - _Requirements: 4.1_

  - [x] 4.8 Write property test for list icon uniqueness (Property 8)
    - **Property 8: List icon uniqueness for groups larger than 3**
    - **Validates: Requirements 4.5**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Hero секция и главная страница
  - [x] 6.1 Переработать Hero-секцию
    - Добавить ≥3 декоративных элемента (геометрические фигуры, сетки точек, диагональные линии) вместо радиального градиента
    - Асимметричная сетка (2:1 или 1:2:1) вместо равномерной
    - Заменить текст с градиентным фоном на акцентный цвет / декоративное подчёркивание
    - Последовательная анимация появления: заголовок → подзаголовок → кнопки → trust-badges (≤1200ms)
    - Параллакс для фоновых декоративных элементов (10-30% от скорости скролла)
    - Тактильная анимация кнопок: click → scale(0.95) 100ms → scale(1) 200ms
    - _Requirements: 1.1, 1.2, 1.5, 3.2, 3.4, 3.6, 3.7_

  - [x] 6.2 Write property test for parallax offset (Property 6)
    - **Property 6: Parallax offset is proportional to scroll position**
    - **Validates: Requirements 3.7**

  - [x] 6.3 Переработать секции главной страницы (HowItWorks, Stats, Trust, Pricing, FAQ)
    - Обернуть каждую секцию в `<Section variant="...">` с чередованием вариантов (light/dark/accent/textured)
    - Применить карточную систему: pricing→elevated, benefits→bordered, testimonials→glass, stats→flat
    - Разные размеры карточек (≥2 различных grid-span) для визуальной иерархии
    - Иконки Lucide для списков >3 пунктов с отступом 12px
    - Навигационные иконки 20-28px, ключевые секции 32-48px
    - Count-up анимация для статистики
    - Staggered-анимация для групп элементов
    - _Requirements: 1.1, 1.3, 2.1, 3.3, 3.5, 4.2, 4.5, 6.3_

- [x] 7. Типографика и responsive
  - [x] 7.1 Применить типографическую систему ко всем компонентам
    - Desktop: h1 56px/800, h2 45px/800, h3 36px/600, h4 28px/600, body 18px/400, small 16px, caption 14px
    - Mobile (<1024px): h1 36px, h2 28px, h3 22px, h4 18px, body 16px, small 14px, caption 12px
    - line-height: 1.1 для заголовков, 1.6 для body/caption
    - letter-spacing: -0.02em заголовки, 0.01em body
    - Обеспечить WCAG AA контраст (4.5:1 мелкий текст, 3:1 крупный)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 7.2 Write property test for light theme WCAG contrast (Property 9)
    - **Property 9: Light theme color pairs meet WCAG AA contrast**
    - **Validates: Requirements 5.6**

  - [x] 7.3 Write property test for dark theme WCAG AAA contrast (Property 17)
    - **Property 17: Dark theme color pairs meet WCAG AAA contrast**
    - **Validates: Requirements 9.3**

  - [x] 7.4 Мобильная адаптация анимаций
    - Заменить hover-анимации на tap (active state) для touch-устройств (100ms отклик)
    - Подключить `useAnimationQueue` для ограничения одновременных анимаций на мобильных
    - will-change + transform only (без width/height/margin) для ≥55fps
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Backend Logic: Валидация и обработка ошибок
  - [x] 9.1 Создать `utils/validation.ts`
    - validateEmail: RFC 5322 simplified pattern
    - validateAmount: 0.01–999999.99
    - validateTextLength: ≤1000 символов
    - validateRequisites: ≥5 символов
    - validateWithdrawalInput: комплексная валидация
    - _Requirements: 7.3_

  - [x] 9.2 Write property test for input validation (Property 13)
    - **Property 13: Input validation correctness**
    - **Validates: Requirements 7.3**

  - [x] 9.3 Создать `utils/errorHandler.ts`
    - handleSupabaseError: принимает ошибку + контекст (operation, userId)
    - Возвращает SafeError: userMessage (без технических деталей) + logPayload (operation, userId, timestamp, originalError)
    - Маппинг типов операций на понятные русскоязычные сообщения
    - _Requirements: 7.4_

  - [x] 9.4 Write property test for error handler (Property 14)
    - **Property 14: Error handler produces safe user messages**
    - **Validates: Requirements 7.4**

- [x] 10. Backend Logic: Транзакции и безопасность
  - [x] 10.1 Создать `utils/transactions.ts`
    - executeWithdrawal: проверка сессии → проверка баланса → insert withdrawal → update balance
    - Rollback: если update balance fails → delete withdrawal record
    - Race condition prevention: повторная проверка баланса перед списанием
    - Гарантия: баланс никогда не уходит в минус
    - _Requirements: 7.1, 7.2, 7.5, 7.6, 7.7_

  - [x] 10.2 Write property test for withdrawal atomicity (Property 11)
    - **Property 11: Withdrawal operation is atomic with rollback**
    - **Validates: Requirements 7.1, 7.7**

  - [x] 10.3 Write property test for concurrent withdrawals (Property 12)
    - **Property 12: Concurrent withdrawals cannot exceed initial balance**
    - **Validates: Requirements 7.2**

  - [x] 10.4 Write property test for balance invariant (Property 15)
    - **Property 15: Balance invariant — never negative**
    - **Validates: Requirements 7.5**

  - [x] 10.5 Интегрировать валидацию и транзакции в Dashboard
    - Подключить `validateWithdrawalInput` перед отправкой вывода
    - Заменить прямые Supabase-вызовы на `executeWithdrawal`
    - Подключить `handleSupabaseError` для всех мутаций (вывод, отчёт, отмена)
    - Проверка сессии через Supabase Auth перед мутациями
    - _Requirements: 7.3, 7.4, 7.6_

- [x] 11. Тёмная тема: интеграция
  - [x] 11.1 Применить тёмную тему ко всем компонентам
    - Все Section, Card, IconBadge — реагируют на `.dark` класс через CSS-переменные
    - Glow эффекты (box-shadow с цветным blur 20-60px) вместо теней в тёмной теме
    - Световые акценты (border opacity 0.2-0.4)
    - Декоративные элементы адаптированы для тёмного фона
    - Контраст: основной текст ≥7:1, вспомогательный ≥4.5:1
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The project uses React 18 + TypeScript + Tailwind CSS 3.4 + Framer Motion 12
- Backend layer uses Supabase client for auth, CRUD, and financial operations
- All animation hooks must respect `prefers-reduced-motion`
- All UI components must support both light and dark themes via CSS variables

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "9.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "9.2", "9.3"] },
    { "id": 2, "tasks": ["1.3", "2.3", "2.4", "2.5", "2.7", "9.4"] },
    { "id": 3, "tasks": ["2.6", "2.8", "2.9", "4.1", "4.4", "4.6", "4.7"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.5", "4.8", "10.1"] },
    { "id": 5, "tasks": ["6.1", "6.3", "10.2", "10.3", "10.4"] },
    { "id": 6, "tasks": ["6.2", "7.1", "10.5"] },
    { "id": 7, "tasks": ["7.2", "7.3", "7.4"] },
    { "id": 8, "tasks": ["11.1"] }
  ]
}
```
