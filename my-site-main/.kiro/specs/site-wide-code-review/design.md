# Site-Wide Code Review Bugfix Design

## Overview

Комплексное исправление 26 дефектов, выявленных при код-ревью React/TypeScript SPA (Vite + Supabase + Tailwind CSS). Дефекты охватывают диапазон от нарушений доступности и мёртвого кода до критических уязвимостей безопасности (race conditions, отсутствие auth guard) и runtime-крэшей (чёрный экран Dashboard). Стратегия исправления — приоритизация по критичности: сначала устраняем блокирующие крэши, затем уязвимости безопасности, потом runtime-ошибки, и в конце — качество кода и производительность.

## Glossary

- **Bug_Condition (C)**: Совокупность 26 условий, при которых проявляются дефекты — от отсутствия aria-label до race conditions в финансовых операциях
- **Property (P)**: Корректное поведение системы после исправления — доступные компоненты, стабильный рендеринг, защищённые маршруты, уникальные ID
- **Preservation**: Существующее поведение, которое ДОЛЖНО остаться неизменным — визуальное отображение, SPA-навигация, toast-уведомления, финансовые операции при отсутствии конкурентности
- **Dashboard**: God-компонент `components/Dashboard.tsx` (~400+ строк) — личный кабинет пользователя
- **BusinessDashboard**: `components/BusinessDashboard.tsx` — кабинет заказчика с Edge Functions
- **Toast (event-based)**: `components/Toast.tsx` — активная система уведомлений через CustomEvent
- **ToastContext (мёртвый)**: `context/ToastContext.tsx` — неиспользуемая Context API система уведомлений
- **TOCTOU**: Time-of-check-to-time-of-use race condition при финансовых операциях
- **Error Boundary**: React-компонент для перехвата ошибок рендеринга и отображения fallback UI

## Bug Details

### Bug Condition

Система содержит 26 дефектов различной критичности, которые проявляются в различных условиях. Наиболее критический — чёрный экран при открытии Dashboard (issue 1.26), вызванный каскадом проблем: если импорт утилит не разрешается или компонент выбрасывает runtime-ошибку, отсутствие Error Boundary приводит к полному размонтированию приложения.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type AppInteraction (navigation, scroll, click, keyboard, concurrent-request)
  OUTPUT: boolean
  
  RETURN (
    // Critical: Black screen crash
    (input.type == 'navigation' AND input.target == '/cabinet' AND runtimeErrorInDashboard())
    
    // Critical: Security - no admin guard
    OR (input.type == 'navigation' AND input.target == '/admin/users' AND input.userRole != 'admin')
    
    // Critical: Race condition
    OR (input.type == 'concurrent-financial-operation' AND operationsOverlap(input))
    
    // High: Toast ID collision
    OR (input.type == 'toast' AND toastsInSameMillisecond(input))
    
    // High: SVG pattern ID conflict
    OR (input.type == 'render' AND multipleSectionInstances(input))
    
    // Medium: Scroll performance
    OR (input.type == 'scroll' AND heroComponentMounted())
    
    // Medium: Full page reload
    OR (input.type == 'task-action' AND triggersWindowLocationHref(input))
    
    // Low: Accessibility
    OR (input.type == 'assistive-technology' AND targetIsIconOnlyButton(input))
  )
END FUNCTION
```

### Examples

- **Issue 1.26 (Critical)**: Пользователь переходит на `/cabinet` → Dashboard.tsx выбрасывает runtime-ошибку → отсутствие Error Boundary → чёрный экран вместо fallback UI
- **Issue 1.22 (Critical)**: Неавторизованный пользователь вводит `/admin/users` в адресную строку → компонент UsersPage рендерится без проверки роли → доступ к панели администратора
- **Issue 1.21 (Critical)**: Два одновременных запроса `cancelMyWithdrawal` → оба читают `balance=1000` → оба записывают `balance=1000+500=1500` → двойное зачисление (+1000 вместо +500)
- **Issue 1.18 (High)**: Два toast-уведомления в одну миллисекунду → `Date.now()` возвращает одинаковое значение → конфликт React-ключей → непредсказуемый рендеринг
- **Issue 1.7 (Low/Medium)**: Две `<Section>` на странице → обе используют `id="subtle-grid"` → второй SVG-паттерн ссылается на `fill="url(#subtle-grid)"` первого экземпляра
- **Issue 1.11 (Medium)**: Пользователь прокручивает Hero → `setScrollY()` вызывается 60+ раз/сек → 60+ ре-рендеров в секунду → лаги на слабых устройствах
- **Issue 1.15 (Medium)**: Пользователь берёт задание → `window.location.href = '/cabinet'` → полная перезагрузка SPA → потеря стейта, медленная навигация

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Визуальное отображение всех компонентов (Dashboard, Tasks, Hero, Section, Toast) ДОЛЖНО остаться идентичным
- SPA-навигация между страницами через React Router ДОЛЖНА продолжать работать
- Event-based Toast API (`toast.success/error/info`) ДОЛЖЕН сохранить тот же интерфейс вызова
- Финансовые операции (вывод, заказ, отмена) при последовательном выполнении ДОЛЖНЫ работать идентично
- Тема (light/dark) ДОЛЖНА переключаться плавно
- Scroll-анимации, count-up эффекты, parallax ДОЛЖНЫ продолжать работать
- Авторизованный админ ДОЛЖЕН видеть `/admin/users` как прежде
- `IntersectionObserver` в хуках ДОЛЖЕН продолжать запускать анимации при скролле

**Scope:**
Все взаимодействия, которые НЕ затрагивают исправленные дефекты, должны быть полностью неизменны:
- Обычные навигации между страницами
- Работа форм авторизации и регистрации
- Supabase-запросы к другим таблицам
- Мобильное меню, кнопки CTA
- SEO-метатеги и structured data в index.html

## Hypothesized Root Cause

Based on the code analysis, the root causes are confirmed:

1. **Issue 1.26 — Чёрный экран**: Utils-файлы (`validation.ts`, `transactions.ts`, `errorHandler.ts`) СУЩЕСТВУЮТ и корректно экспортируют функции. Чёрный экран вызван ДРУГОЙ runtime-ошибкой в Dashboard.tsx (возможно, обращение к `null` property при загрузке данных) в комбинации с отсутствием Error Boundary в `index.tsx`.

2. **Issue 1.22 — Отсутствие admin guard**: `Users.tsx` не содержит проверки `session` или `role === 'admin'` — компонент сразу вызывает `fetchUsers()` в `useEffect`. В `App.tsx` маршрут `<Route path="/admin/users" element={<UsersPage />} />` рендерится безусловно.

3. **Issue 1.21 — TOCTOU race condition**: `cancelMyWithdrawal` читает баланс (`freshProfile.balance`), затем записывает `balance + wd.amount`. Между чтением и записью другой запрос может изменить баланс. Аналогично в `createOrder` и `cancelOrder` в BusinessDashboard.

4. **Issue 1.18 — Toast ID collision**: `Toast.tsx` строка `const id = Date.now();` — при быстрых последовательных вызовах (< 1ms) ID совпадают.

5. **Issue 1.7 — SVG pattern ID**: `Section.tsx` строка `<pattern id="subtle-grid"...>` и `<pattern id="texture-pattern"...>` — статические ID, конфликт при множественных экземплярах.

6. **Issue 1.11 — Scroll thrashing**: `Hero.tsx` — `setScrollY(window.scrollY)` в scroll listener без throttle. Каждый вызов `setScrollY` вызывает ре-рендер компонента.

7. **Issue 1.12 — Theme transition wildcard**: `index.css` содержит `html.dark *, html:not(.dark) *` с transition на все элементы — при переключении темы браузер пересчитывает transition для КАЖДОГО DOM-элемента.

8. **Issue 1.23 — Hardcoded URL**: `BusinessDashboard.tsx` строка `const SUPABASE_FUNCTIONS_URL = 'https://uqjavxbkcsqdfssrlplp.supabase.co/functions/v1';` — URL должен формироваться из env-переменной.

## Correctness Properties

Property 1: Bug Condition - Critical Issues Resolved

_For any_ input where the bug condition holds (isBugCondition returns true — runtime error in Dashboard, unauthorized admin access, concurrent financial operations, Toast ID collision, SVG ID conflict, unthrottled scroll, full page reload, missing aria-labels), the fixed application SHALL handle the condition gracefully: Error Boundary catches crashes and shows fallback UI, admin routes reject unauthorized users, financial operations use atomic updates, Toast IDs are unique, SVG pattern IDs are instance-unique, scroll is throttled via RAF, navigation uses React Router, and buttons have accessible labels.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24, 2.25, 2.26**

Property 2: Preservation - Existing Functionality Unchanged

_For any_ input where the bug condition does NOT hold (standard user interactions — sequential financial operations, normal navigation, toast calls with natural spacing, single Section instances, mouse clicks, authorized admin access), the fixed code SHALL produce exactly the same observable behavior as the original code, preserving visual rendering, SPA navigation, toast API, financial correctness, theme switching, and animation effects.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.20, 3.21, 3.22, 3.23**

## Fix Implementation

### Changes Required

Fixes organized by priority (critical first):

---

**PRIORITY 1: CRITICAL — Полный крэш и безопасность**

**File**: `index.tsx`
**Issue 1.6/1.26**: Add React Error Boundary

**Specific Changes**:
1. Create `components/ErrorBoundary.tsx` — class component with `componentDidCatch`, renders fallback UI with retry button
2. Wrap `<App />` in Error Boundary in `index.tsx`

---

**File**: `components/Users.tsx`
**Issue 1.22**: Add admin auth guard

**Specific Changes**:
1. Add session and role check at component mount
2. If no session or `role !== 'admin'` → redirect to `/` using `useNavigate()`
3. Show loading state while checking auth

---

**File**: `components/BusinessDashboard.tsx`
**Issue 1.23**: Remove hardcoded Supabase URL

**Specific Changes**:
1. Replace `const SUPABASE_FUNCTIONS_URL = 'https://uqjavxbkcsqdfssrlplp.supabase.co/functions/v1'`
2. With `const SUPABASE_FUNCTIONS_URL = \`\${import.meta.env.VITE_SUPABASE_URL}/functions/v1\``

---

**File**: `components/Dashboard.tsx` + `components/BusinessDashboard.tsx`
**Issue 1.21**: Fix TOCTOU race conditions

**Specific Changes**:
1. Replace client-side read-then-write pattern with Supabase RPC call that uses `UPDATE ... SET balance = balance + $amount WHERE id = $userId AND balance >= $required RETURNING balance`
2. If no rows returned → insufficient funds (atomic check)
3. Alternative: use `.update({ balance: supabase.raw('balance + ?', [amount]) })` if RPC not available

---

**File**: `tsconfig.json`
**Issue 1.25**: Enable strict mode

**Specific Changes**:
1. Add `"strict": true` to compilerOptions
2. Fix resulting type errors (primarily null checks on refs and optional chaining)

---

**PRIORITY 2: HIGH — Runtime ошибки**

**File**: `components/Toast.tsx`
**Issue 1.18**: Fix Toast ID collision

**Specific Changes**:
1. Replace `const id = Date.now();` with incremental counter: `let toastCounter = 0;` at module level, then `const id = ++toastCounter;`

---

**File**: `components/ui/Section.tsx`
**Issue 1.7**: Fix SVG pattern ID collision

**Specific Changes**:
1. Import `useId` from React (React 18+)
2. Generate unique IDs: `const patternId = useId();`
3. Replace `id="subtle-grid"` with `id={\`subtle-grid-\${patternId}\`}`
4. Replace `id="texture-pattern"` with `id={\`texture-pattern-\${patternId}\`}`
5. Update corresponding `fill="url(#...)"` references

---

**File**: `hooks/useCountUp.ts` + `hooks/useScrollAnimation.ts`
**Issue 1.19**: Fix unsafe ref initialization

**Specific Changes**:
1. Replace `useRef<HTMLElement>(null!)` with `useRef<HTMLElement | null>(null)`
2. Add null checks before accessing `ref.current` (e.g., `if (!element) return;` already present in IntersectionObserver setup)
3. Update return type to `React.RefObject<HTMLElement | null>`

---

**File**: `hooks/useAnimationQueue.ts`
**Issue 1.20**: Fix stale closure in resize handler

**Specific Changes**:
1. Store `processQueue` in a ref: `const processQueueRef = useRef(processQueue); processQueueRef.current = processQueue;`
2. In resize handler, call `processQueueRef.current()` instead of `processQueue` directly
3. This ensures the resize handler always has the latest closure

---

**PRIORITY 3: MEDIUM — Производительность и анти-паттерны**

**File**: `components/Hero.tsx`
**Issue 1.11**: Throttle scroll handler

**Specific Changes**:
1. Replace direct `setScrollY(window.scrollY)` with `requestAnimationFrame`-based throttle:
   ```
   const rafRef = useRef<number | null>(null);
   const handleScroll = () => {
     if (rafRef.current !== null) return;
     rafRef.current = requestAnimationFrame(() => {
       setScrollY(window.scrollY);
       rafRef.current = null;
     });
   };
   ```
2. Cancel RAF in cleanup: `cancelAnimationFrame(rafRef.current)`

---

**File**: `index.css`
**Issue 1.12**: Remove wildcard theme transition

**Specific Changes**:
1. Remove the `html.dark *, html:not(.dark) *` rule with transition on all elements
2. The theme transition is already correctly applied in `App.tsx` useEffect on `document.documentElement` — this is sufficient

---

**File**: `components/Tasks.tsx`
**Issue 1.15**: Replace window.location.href with React Router

**Specific Changes**:
1. Import `useNavigate` from `react-router-dom`
2. Add `const navigate = useNavigate();` in component
3. Replace `window.location.href = '/cabinet';` with `navigate('/cabinet');`

---

**File**: `vite.config.ts`
**Issue 1.16**: Add resolve.alias for @/*

**Specific Changes**:
1. Add `resolve: { alias: { '@': path.resolve(__dirname, '.') } }` to vite config
2. Import `path` from `node:path`

---

**File**: `components/Leaderboard.tsx`
**Issue 1.14**: Server-side filtering

**Specific Changes**:
1. Add `.limit()`, `.order()`, and filter conditions to the Supabase query
2. Remove client-side filtering logic

---

**File**: `context/ToastContext.tsx`
**Issue 1.4/1.9**: Remove dead code

**Specific Changes**:
1. Delete `context/ToastContext.tsx`
2. Remove any imports of ToastContext (verify none exist in codebase)
3. Make SummerGlow import lazy: `const SummerGlow = React.lazy(() => import('./components/SummerGlow'))`
4. Wrap SummerGlow usage in Suspense with null fallback

---

**File**: `App.tsx`
**Issue 1.12**: Simplify theme transition in useEffect

**Specific Changes**:
1. The existing transition on `html` element via `useEffect` is correct approach
2. Ensure no wildcard `*` transition exists in CSS (handled by index.css fix)

---

**PRIORITY 4: LOW — Качество кода и доступность**

**File**: `App.tsx`
**Issue 1.1**: Add aria-labels to icon-only buttons

**Specific Changes**:
1. Leaf button: add `aria-label="Праздничный режим"`
2. Theme button: add `aria-label={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}`
3. Menu button: add `aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}`

---

**File**: `components/ReferralModal.tsx`
**Issue 1.2**: Add focus trap and Escape handling

**Specific Changes**:
1. Add `onKeyDown` handler: if `e.key === 'Escape'` call `onClose()`
2. Add `useEffect` to trap focus within modal when open (focus first focusable element, trap Tab/Shift+Tab)
3. Add `role="dialog"` and `aria-modal="true"`

---

**File**: `components/Dashboard.tsx`
**Issue 1.3**: Replace native confirm/prompt

**Specific Changes**:
1. Create a reusable `ConfirmModal` component
2. Replace `confirm()` calls with state-driven modal
3. Replace `prompt()` calls with input modal (especially in `adminReviewTask`)

---

**File**: `index.html`
**Issue 1.5**: Remove hidden scrollbar

**Specific Changes**:
1. Remove the `<style>` block containing `::-webkit-scrollbar { width: 0px; background: transparent; }`

---

**File**: Project root
**Issue 1.8**: Remove duplicate/garbage files

**Specific Changes**:
1. Delete `my-site-main/my-site-main/` duplicate directory
2. Delete `context.zip`, `d`, `dist — копия/`

---

**File**: `components/Dashboard.tsx`
**Issue 1.10**: Decompose god-component

**Specific Changes**:
1. Extract `AuthForm` component
2. Extract `WithdrawalForm` component
3. Extract `NotificationsPanel` component
4. Extract `AdminPanel` component (admin-only sections)
5. Keep Dashboard as orchestrator with shared state

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write unit and integration tests targeting each bug condition. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Error Boundary Test**: Render a component that throws → verify entire app crashes without Error Boundary (will fail on unfixed code — app unmounts)
2. **Admin Guard Test**: Navigate to `/admin/users` without admin session → verify component renders (will fail — should be blocked)
3. **Toast ID Collision Test**: Call `toast.success()` twice in rapid succession with mocked `Date.now()` returning same value → verify duplicate keys (will fail on unfixed code)
4. **SVG Pattern ID Test**: Render two `<Section>` components → verify both have same `id="subtle-grid"` (will fail — IDs conflict)
5. **Scroll Throttle Test**: Simulate multiple scroll events in quick succession on Hero → count `setScrollY` calls (will show 1:1 ratio with scroll events on unfixed code)
6. **Admin Route Open Test**: Verify `/admin/users` route renders without auth check (will succeed incorrectly on unfixed code)

**Expected Counterexamples**:
- Error Boundary: component tree unmounts on throw
- Admin guard: UsersPage renders for unauthenticated users
- Toast IDs: duplicate keys in React render
- SVG: `document.querySelectorAll('[id="subtle-grid"]').length > 1`

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedApp(input)
  ASSERT expectedBehavior(result)
  // Error Boundary catches errors → fallback UI shown
  // Admin route rejects unauthorized → redirect
  // Toast IDs always unique → no key conflicts
  // SVG IDs instance-scoped → no collisions
  // Scroll throttled → max 60 updates/sec
  // Navigation via React Router → no full reload
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalApp(input) = fixedApp(input)
  // Standard navigation still works
  // Toast with normal timing still displays correctly
  // Single Section renders identically
  // Sequential financial operations produce same result
  // Admin with valid session sees UsersPage
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-bug inputs, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Toast Uniqueness Preservation**: Generate N random toast calls (with natural spacing) → verify all IDs unique and messages display correctly
2. **Section Rendering Preservation**: Render Section with various props → verify visual output unchanged (decorative elements, variant classes)
3. **Scroll Animation Preservation**: Verify useScrollAnimation continues to trigger at correct threshold
4. **Theme Toggle Preservation**: Toggle theme → verify classes applied correctly without wildcard transition overhead
5. **Navigation Preservation**: Verify all existing routes continue to render correct components

### Unit Tests

- Test Error Boundary catches render errors and shows fallback
- Test admin auth guard redirects unauthorized users
- Test Toast ID uniqueness under rapid-fire conditions (mock timing)
- Test Section SVG pattern ID uniqueness with `useId()`
- Test Hero scroll handler respects RAF throttle
- Test `validateWithdrawalInput` continues to validate correctly
- Test `executeWithdrawal` handles concurrent scenario
- Test `handleSupabaseError` returns safe messages
- Test vite alias resolves `@/*` paths

### Property-Based Tests

- Generate random toast call sequences (0-100 calls, random timing 0-5ms gaps) → assert all IDs unique
- Generate random viewport widths → assert `getMaxConcurrent` returns 3 for <768, Infinity for >=768
- Generate random scroll positions → assert `computeParallaxOffset` returns value in valid range
- Generate random `WithdrawalInput` objects → assert `validateWithdrawalInput` returns consistent valid/invalid results
- Generate random `easeOutValue` inputs [0,1] → assert output in [0,1] and monotonically non-decreasing
- Generate random `calculateStaggerDelay` inputs → assert correct delay or 0 for overflow

### Integration Tests

- Test full Dashboard flow: login → see cabinet → navigate away → no crash
- Test Error Boundary integration: trigger error in child → see fallback → click retry → app recovers
- Test admin route flow: unauthenticated → redirect to home; authenticated admin → see users panel
- Test Tasks flow: take task → navigate to cabinet via React Router (no full reload)
- Test BusinessDashboard: create order → verify balance updated atomically
- Test theme toggle: switch theme → verify no layout shift, smooth transition on limited elements
