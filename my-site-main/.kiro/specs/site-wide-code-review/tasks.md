# Implementation Plan

## Overview

Comprehensive bugfix implementation for 26 defects identified during site-wide code review of a React/TypeScript SPA (Vite + Supabase + Tailwind CSS). Tasks are organized by priority: Critical → High → Medium → Low. Each priority group follows the exploration → preservation → fix → verify pattern using the bug condition methodology.

## Tasks

- [ ] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Site-Wide Critical Defects Exploration
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the 26 bugs exist across all priority levels
  - **Scoped PBT Approach**: Scope properties to concrete failing cases for each bug category
  - Test 1a: Render a component that throws a runtime error → verify app crashes without Error Boundary (no fallback UI shown)
  - Test 1b: Navigate to `/admin/users` without admin session → verify UsersPage renders without auth check (unauthorized access)
  - Test 1c: Mock `Date.now()` to return same value twice → call toast.success() twice → verify duplicate IDs generated
  - Test 1d: Render two `<Section>` components → verify both SVG patterns use same `id="subtle-grid"` (ID collision)
  - Test 1e: Simulate rapid scroll events on Hero → verify `setScrollY` called on every event (no throttle)
  - Test 1f: Verify `window.location.href` used in Tasks.tsx for navigation (full page reload instead of SPA navigation)
  - Test 1g: Verify icon-only buttons in App.tsx lack aria-label attributes
  - Test 1h: Verify hardcoded Supabase URL in BusinessDashboard.tsx (not from env variable)
  - Test 1i: Verify `useRef<HTMLElement>(null!)` pattern in useCountUp.ts and useScrollAnimation.ts (unsafe non-null assertion)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root causes
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.1, 2.6, 2.7, 2.11, 2.15, 2.18, 2.19, 2.22, 2.23, 2.26_

- [ ] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Existing Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - **GOAL**: Capture existing correct behavior that MUST remain unchanged after all fixes
  - Observe: Toast.success/error/info API continues to show notifications with auto-dismiss
  - Observe: Section.tsx renders decorative SVG patterns with correct visual appearance
  - Observe: Hero.tsx parallax effects display correctly during scroll
  - Observe: Theme toggle switches dark/light mode classes on html element
  - Observe: React Router navigates between pages without full reload
  - Observe: Dashboard displays user data (balance, tasks, notifications) when no errors occur
  - Observe: Authorized admin can access `/admin/users` and see user management panel
  - Observe: Sequential financial operations (withdraw, order, cancel) process correctly
  - Observe: useCountUp animates numbers when element enters viewport
  - Observe: useScrollAnimation triggers animations at correct intersection threshold
  - Observe: useAnimationQueue processes queue with mobile-aware concurrency limits
  - Write property-based test: for all valid toast calls with natural timing (>1ms spacing), notifications display correctly with unique IDs
  - Write property-based test: for all Section variant props, decorative SVG elements render with correct classes
  - Write property-based test: for all scroll positions, Hero parallax offset is within valid range
  - Write property-based test: for all random viewport widths, getMaxConcurrent returns 3 for <768, Infinity for >=768
  - Write property-based test: for all easeOutValue inputs in [0,1], output is in [0,1] and monotonically non-decreasing
  - Verify all tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.4, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.16, 3.17, 3.18, 3.19, 3.20, 3.21, 3.23_

- [ ] 3. PRIORITY 1 (CRITICAL): Error Boundary and Black Screen Fix

  - [ ] 3.1 Create ErrorBoundary component and wrap App
    - Create `components/ErrorBoundary.tsx` as a class component with `componentDidCatch`
    - Render fallback UI with error message and retry button
    - Wrap `<App />` in `<ErrorBoundary>` in `index.tsx`
    - _Bug_Condition: isBugCondition(input) where input.type == 'navigation' AND runtimeErrorInDashboard()_
    - _Expected_Behavior: Error Boundary catches crashes and shows fallback UI instead of black screen_
    - _Preservation: App renders identically when no errors occur (Requirements 3.6, 3.9, 3.23)_
    - _Requirements: 2.6, 2.26_

  - [ ] 3.2 Add admin auth guard to Users.tsx
    - Add session check and role verification (`role === 'admin'`) at component mount
    - If no session or role is not admin → redirect to `/` using `useNavigate()`
    - Show loading state while checking authentication
    - _Bug_Condition: isBugCondition(input) where input.type == 'navigation' AND input.target == '/admin/users' AND input.userRole != 'admin'_
    - _Expected_Behavior: Unauthorized users are redirected, admin route rejects non-admins_
    - _Preservation: Authorized admin continues to see UsersPage as before (Requirement 3.19)_
    - _Requirements: 2.22_

  - [ ] 3.3 Replace hardcoded Supabase URL in BusinessDashboard.tsx
    - Replace `const SUPABASE_FUNCTIONS_URL = 'https://uqjavxbkcsqdfssrlplp.supabase.co/functions/v1'`
    - With `const SUPABASE_FUNCTIONS_URL = \`${import.meta.env.VITE_SUPABASE_URL}/functions/v1\``
    - _Bug_Condition: Hardcoded URL exposes infrastructure details and breaks across environments_
    - _Expected_Behavior: URL derived from environment variable VITE_SUPABASE_URL_
    - _Preservation: Edge Function calls continue to work identically (Requirement 3.20)_
    - _Requirements: 2.23_

  - [ ] 3.4 Fix TOCTOU race conditions in financial operations
    - In Dashboard.tsx: Replace client-side read-then-write in `cancelMyWithdrawal` with atomic Supabase RPC
    - In BusinessDashboard.tsx: Replace read-then-write in `createOrder` and `cancelOrder` with atomic updates
    - Use `UPDATE ... SET balance = balance + $amount WHERE id = $userId RETURNING balance` pattern
    - If no rows returned → insufficient funds (atomic check-and-update)
    - _Bug_Condition: isBugCondition(input) where input.type == 'concurrent-financial-operation' AND operationsOverlap(input)_
    - _Expected_Behavior: Atomic updates prevent double-credit; concurrent operations are serialized_
    - _Preservation: Sequential financial operations produce identical results (Requirement 3.21)_
    - _Requirements: 2.21_

  - [ ] 3.5 Enable TypeScript strict mode
    - Add `"strict": true` to `compilerOptions` in `tsconfig.json`
    - Fix resulting type errors (null checks on refs, optional chaining, parameter typing)
    - _Bug_Condition: Null/undefined access not caught at compile time_
    - _Expected_Behavior: Compiler catches null-access errors early_
    - _Preservation: Existing code continues to compile after type error fixes (Requirement 3.22)_
    - _Requirements: 2.25_

  - [ ] 3.6 Verify bug condition exploration tests pass for Priority 1
    - **Property 1: Expected Behavior** - Critical Issues Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 (tests 1a, 1b, 1h) - do NOT write new tests
    - Error Boundary test: component throws → fallback UI shown (not black screen)
    - Admin guard test: unauthorized user → redirected (not rendered)
    - Hardcoded URL test: URL now derived from env variable
    - **EXPECTED OUTCOME**: Tests PASS (confirms critical bugs are fixed)
    - _Requirements: 2.6, 2.22, 2.23, 2.26_

  - [ ] 3.7 Verify preservation tests still pass for Priority 1
    - **Property 2: Preservation** - No Regressions from Critical Fixes
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 - do NOT write new tests
    - Verify app renders correctly when no errors occur
    - Verify authorized admin still accesses `/admin/users`
    - Verify BusinessDashboard Edge Functions still called correctly
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.6, 3.19, 3.20, 3.21_

- [ ] 4. PRIORITY 2 (HIGH): Runtime Errors Fix

  - [ ] 4.1 Fix Toast ID collision in Toast.tsx
    - Replace `const id = Date.now();` with incremental counter
    - Add module-level `let toastCounter = 0;` then use `const id = ++toastCounter;`
    - _Bug_Condition: isBugCondition(input) where input.type == 'toast' AND toastsInSameMillisecond(input)_
    - _Expected_Behavior: All toast IDs are guaranteed unique regardless of timing_
    - _Preservation: Toast API (success/error/info) continues to work with same interface (Requirement 3.4, 3.8, 3.16)_
    - _Requirements: 2.18_

  - [ ] 4.2 Fix SVG pattern ID collision in Section.tsx
    - Import `useId` from React
    - Generate unique IDs: `const patternId = useId();`
    - Replace `id="subtle-grid"` with `id={\`subtle-grid-${patternId}\`}`
    - Replace `id="texture-pattern"` with `id={\`texture-pattern-${patternId}\`}`
    - Update corresponding `fill="url(#...)"` references
    - _Bug_Condition: isBugCondition(input) where input.type == 'render' AND multipleSectionInstances(input)_
    - _Expected_Behavior: Each Section instance has unique SVG pattern IDs, no conflicts_
    - _Preservation: Section visual appearance unchanged for single and multiple instances (Requirement 3.7)_
    - _Requirements: 2.7_

  - [ ] 4.3 Fix unsafe ref initialization in hooks
    - In `hooks/useCountUp.ts`: Replace `useRef<HTMLElement>(null!)` with `useRef<HTMLElement | null>(null)`
    - In `hooks/useScrollAnimation.ts`: Replace `useRef<HTMLElement>(null!)` with `useRef<HTMLElement | null>(null)`
    - Add null checks before accessing `ref.current`
    - _Bug_Condition: isBugCondition(input) where ref accessed before DOM attachment_
    - _Expected_Behavior: Refs safely initialized as null with proper null checks_
    - _Preservation: Animations continue to trigger correctly when elements are in DOM (Requirements 3.12, 3.17)_
    - _Requirements: 2.19_

  - [ ] 4.4 Fix stale closure in useAnimationQueue.ts resize handler
    - Store `processQueue` in a ref: `const processQueueRef = useRef(processQueue)`
    - Update ref on each render: `processQueueRef.current = processQueue`
    - In resize handler, call `processQueueRef.current()` instead of `processQueue` directly
    - _Bug_Condition: isBugCondition(input) where window resizes and processQueue closure is stale_
    - _Expected_Behavior: Resize handler always calls latest version of processQueue_
    - _Preservation: Animation queue continues to process with correct concurrency limits (Requirement 3.18)_
    - _Requirements: 2.20_

  - [ ] 4.5 Verify bug condition exploration tests pass for Priority 2
    - **Property 1: Expected Behavior** - Runtime Errors Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 (tests 1c, 1d, 1i) - do NOT write new tests
    - Toast ID test: rapid successive calls produce unique IDs
    - SVG pattern test: multiple Section instances have unique pattern IDs
    - Ref initialization test: hooks use safe null initialization
    - **EXPECTED OUTCOME**: Tests PASS (confirms runtime bugs are fixed)
    - _Requirements: 2.7, 2.18, 2.19, 2.20_

  - [ ] 4.6 Verify preservation tests still pass for Priority 2
    - **Property 2: Preservation** - No Regressions from Runtime Fixes
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 - do NOT write new tests
    - Verify toast notifications still display correctly with normal timing
    - Verify Section decorative elements render identically
    - Verify useCountUp and useScrollAnimation still animate correctly
    - Verify useAnimationQueue still processes with correct limits
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.4, 3.7, 3.8, 3.12, 3.16, 3.17, 3.18_

- [ ] 5. PRIORITY 3 (MEDIUM): Performance and Anti-patterns Fix

  - [ ] 5.1 Throttle scroll handler in Hero.tsx
    - Replace direct `setScrollY(window.scrollY)` with RAF-based throttle
    - Add `const rafRef = useRef<number | null>(null)` for tracking animation frame
    - In scroll handler: if `rafRef.current !== null` return early; else request animation frame
    - Cancel RAF in cleanup: `cancelAnimationFrame(rafRef.current)`
    - _Bug_Condition: isBugCondition(input) where input.type == 'scroll' AND heroComponentMounted()_
    - _Expected_Behavior: Scroll updates throttled to ~60fps via requestAnimationFrame_
    - _Preservation: Parallax effects continue to display correctly (Requirement 3.10)_
    - _Requirements: 2.11_

  - [ ] 5.2 Remove wildcard theme transition in index.css
    - Remove `html.dark *, html:not(.dark) *` rule with transition on all elements
    - Theme transition is already correctly applied via `App.tsx` useEffect on `document.documentElement`
    - _Bug_Condition: Wildcard transition selector causes massive performance hit on theme toggle_
    - _Expected_Behavior: Only html/body element transitions, not all DOM elements_
    - _Preservation: Theme still toggles smoothly with visible color transition (Requirement 3.11)_
    - _Requirements: 2.12_

  - [ ] 5.3 Replace window.location.href with React Router in Tasks.tsx
    - Import `useNavigate` from `react-router-dom`
    - Add `const navigate = useNavigate();` in component
    - Replace `window.location.href = '/cabinet';` with `navigate('/cabinet');`
    - _Bug_Condition: isBugCondition(input) where input.type == 'task-action' AND triggersWindowLocationHref(input)_
    - _Expected_Behavior: SPA navigation without full page reload_
    - _Preservation: User still arrives at /cabinet with correct content (Requirement 3.14)_
    - _Requirements: 2.15_

  - [ ] 5.4 Add resolve.alias in vite.config.ts
    - Import `path` from `node:path`
    - Add `resolve: { alias: { '@': path.resolve(__dirname, '.') } }` to vite config
    - _Bug_Condition: tsconfig defines @/* but Vite cannot resolve it_
    - _Expected_Behavior: Vite resolves @/* paths matching tsconfig paths_
    - _Preservation: All existing relative imports continue to resolve correctly (Requirement 3.15)_
    - _Requirements: 2.16_

  - [ ] 5.5 Add server-side filtering in Leaderboard.tsx
    - Add `.limit()`, `.order()`, and filter conditions to the Supabase query
    - Remove client-side filtering logic
    - _Bug_Condition: All profiles fetched and filtered client-side_
    - _Expected_Behavior: Supabase query returns only needed data with server-side filtering_
    - _Preservation: Leaderboard displays same sorted ranking (Requirement 3.13)_
    - _Requirements: 2.14_

  - [ ] 5.6 Remove dead code (ToastContext and unnecessary imports)
    - Delete `context/ToastContext.tsx`
    - Remove any imports of ToastContext from codebase
    - Make SummerGlow import lazy: `const SummerGlow = React.lazy(() => import('./components/SummerGlow'))`
    - Wrap SummerGlow usage in `<Suspense fallback={null}>`
    - _Bug_Condition: Dead code loaded on every app start_
    - _Expected_Behavior: No dead code, conditional/lazy imports for optional features_
    - _Preservation: Active Toast system (event-based) continues to work (Requirement 3.4, 3.8)_
    - _Requirements: 2.4, 2.9_

  - [ ] 5.7 Verify bug condition exploration tests pass for Priority 3
    - **Property 1: Expected Behavior** - Performance Issues Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 (tests 1e, 1f) - do NOT write new tests
    - Scroll throttle test: Hero setScrollY no longer called on every scroll event
    - Navigation test: Tasks.tsx uses React Router navigate instead of window.location.href
    - **EXPECTED OUTCOME**: Tests PASS (confirms performance bugs are fixed)
    - _Requirements: 2.11, 2.15_

  - [ ] 5.8 Verify preservation tests still pass for Priority 3
    - **Property 2: Preservation** - No Regressions from Performance Fixes
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 - do NOT write new tests
    - Verify Hero parallax effects still render correctly
    - Verify theme toggle still works smoothly
    - Verify navigation to /cabinet still works
    - Verify Leaderboard still displays correct data
    - Verify toast notifications unchanged
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.4, 3.8, 3.10, 3.11, 3.13, 3.14, 3.15_

- [ ] 6. PRIORITY 4 (LOW): Code Quality and Accessibility Fix

  - [ ] 6.1 Add aria-labels to icon-only buttons in App.tsx
    - Leaf button: add `aria-label="Праздничный режим"`
    - Theme button: add `aria-label={isDarkMode ? 'Светлая тема' : 'Тёмная тема'}`
    - Menu button: add `aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}`
    - _Bug_Condition: isBugCondition(input) where input.type == 'assistive-technology' AND targetIsIconOnlyButton(input)_
    - _Expected_Behavior: All icon-only buttons have descriptive aria-labels_
    - _Preservation: Buttons continue to toggle theme, holiday mode, and menu visually (Requirement 3.1)_
    - _Requirements: 2.1_

  - [ ] 6.2 Add focus trap and Escape handling in ReferralModal.tsx
    - Add `onKeyDown` handler: if `e.key === 'Escape'` call `onClose()`
    - Add `useEffect` to trap focus within modal (focus first focusable element, trap Tab/Shift+Tab)
    - Add `role="dialog"` and `aria-modal="true"` attributes
    - _Bug_Condition: Modal renders without focus trap or keyboard dismiss_
    - _Expected_Behavior: Focus trapped in modal, Escape closes it, proper ARIA attributes_
    - _Preservation: Modal continues to display referral info and user code (Requirement 3.2)_
    - _Requirements: 2.2_

  - [ ] 6.3 Replace native confirm/prompt in Dashboard.tsx
    - Create a reusable `components/ConfirmModal.tsx` component
    - Replace `confirm()` calls with state-driven modal (show/hide via useState)
    - Replace `prompt()` calls with input modal (especially in `adminReviewTask`)
    - _Bug_Condition: Native dialogs block main thread and break UX consistency_
    - _Expected_Behavior: Custom modals for confirmation/input, non-blocking_
    - _Preservation: Same actions execute on confirmation (delete, update) (Requirement 3.3)_
    - _Requirements: 2.3_

  - [ ] 6.4 Remove hidden scrollbar from index.html
    - Remove the `<style>` block containing `::-webkit-scrollbar { width: 0px; background: transparent; }`
    - _Bug_Condition: Scrollbar hidden via CSS, breaking accessibility_
    - _Expected_Behavior: Native scrollbar visible for all users_
    - _Preservation: Page continues to scroll smoothly (Requirement 3.5)_
    - _Requirements: 2.5_

  - [ ] 6.5 Remove duplicate and garbage files
    - Delete `my-site-main/my-site-main/` duplicate directory
    - Delete `context.zip`
    - Delete `d` (garbage file)
    - Delete `dist — копия/` (duplicate dist directory)
    - _Bug_Condition: Duplicate directories and garbage files pollute project_
    - _Expected_Behavior: Clean project structure without duplicates_
    - _Preservation: No functional behavior affected - only cleanup_
    - _Requirements: 2.8_

  - [ ] 6.6 Decompose Dashboard god-component
    - Extract `AuthForm` component (login/registration)
    - Extract `WithdrawalForm` component (withdrawal logic)
    - Extract `NotificationsPanel` component (notification list)
    - Extract `AdminPanel` component (admin-only sections)
    - Keep Dashboard as orchestrator with shared state passed via props
    - _Bug_Condition: God-component (~400+ lines, 30+ useState) is unmaintainable_
    - _Expected_Behavior: Logical sub-components with clear responsibilities_
    - _Preservation: Dashboard displays same UI and functionality (Requirements 3.9, 3.23)_
    - _Requirements: 2.10_

  - [ ] 6.7 Verify bug condition exploration tests pass for Priority 4
    - **Property 1: Expected Behavior** - Accessibility and Quality Issues Resolved
    - **IMPORTANT**: Re-run the SAME tests from task 1 (test 1g) - do NOT write new tests
    - Aria-label test: icon-only buttons now have descriptive labels
    - **EXPECTED OUTCOME**: Tests PASS (confirms accessibility bugs are fixed)
    - _Requirements: 2.1_

  - [ ] 6.8 Verify preservation tests still pass for Priority 4
    - **Property 2: Preservation** - No Regressions from Quality Fixes
    - **IMPORTANT**: Re-run the SAME preservation tests from task 2 - do NOT write new tests
    - Verify buttons still toggle theme, holiday mode, menu
    - Verify ReferralModal still displays referral info
    - Verify Dashboard still shows all user data
    - Verify scrolling still works smoothly
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.9, 3.23_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Run full test suite covering all 26 fixes
  - Verify all bug condition exploration tests PASS (bugs are fixed)
  - Verify all preservation property tests PASS (no regressions)
  - Run TypeScript compiler with strict mode to verify no type errors
  - Run Vite build to verify no build errors
  - Ensure all tests pass, ask the user if questions arise

## Task Dependency Graph

```json
{
  "waves": [
    ["1", "2"],
    ["3"],
    ["4"],
    ["5"],
    ["6"],
    ["7"]
  ]
}
```

## Notes

- All exploration tests (task 1) MUST be written and run BEFORE any fixes are applied
- All preservation tests (task 2) MUST pass on UNFIXED code before proceeding
- Priority groups must be completed in order: Critical → High → Medium → Low
- Each priority group includes verification sub-tasks that re-run tests from tasks 1 and 2
- The TOCTOU fix (3.4) requires Supabase RPC or atomic update support on the backend
- Dashboard decomposition (6.6) is the largest single task and should be done last
- TypeScript strict mode (3.5) may reveal additional type errors that need fixing across the codebase
