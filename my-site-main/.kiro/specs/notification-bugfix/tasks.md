# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Race condition при очистке уведомлений и повторный показ модалки
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases:
    - Case A: markNotificationsRead вызывается → clearAllNotifications вызывается → state notifications должен быть [] после resolve всех promises (но будет перезаписан fetchNotifications)
    - Case B: dismissMilestone вызывается → earnedTotal меняется → модалка НЕ должна появляться (но milestone не в seen_milestones, поэтому появится)
  - Test assertions:
    - After clearAll + resolved promises: notifications state === []
    - After dismiss + earnedTotal change: isVisible === false AND milestone in seen_milestones
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples:
    - "clearAllNotifications sets state=[], but fetchNotifications resolves and overwrites with stale data"
    - "AchievementModal.checkMilestone finds milestone not in shared_milestones, shows modal again"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Существующее поведение уведомлений и достижений
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code:
    - fetchNotifications корректно загружает уведомления и устанавливает unreadCount
    - Открытие панели уведомлений показывает список в обратном хронологическом порядке
    - handleShare вызывает grantReward, начисляет +50₽, сохраняет milestone в shared_milestones
    - checkMilestone не показывает модалку если milestone уже в shared_milestones
    - Красная точка отображается при unreadCount > 0
  - Write property-based tests capturing observed behavior:
    - For any notification list: displayed in descending created_at order
    - For any unreadCount > 0: red badge is visible
    - For any milestone in shared_milestones: modal does not show
    - For any handleShare call: balance += 50 and milestone added to shared_milestones
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix for race condition уведомлений и повторный показ модалки достижений

  - [x] 3.1 Fix markNotificationsRead — убрать fetchNotifications, обновить state локально
    - Удалить строку `fetchNotifications(session.user.id)` из markNotificationsRead
    - Заменить на `setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))` 
    - Оставить `setUnreadCount(0)` как есть
    - _Bug_Condition: isBugCondition_Notifications — pending fetch перезаписывает cleared state_
    - _Expected_Behavior: state обновляется локально без refetch_
    - _Preservation: fetchNotifications всё ещё работает при первой загрузке и при получении новых уведомлений_
    - _Requirements: 2.1, 2.3, 3.1, 3.2_

  - [x] 3.2 Fix bell onClick — вызывать markNotificationsRead только при открытии
    - Изменить обработчик обоих bell buttons (mobile и desktop) с:
      `onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); }}`
    - На:
      `onClick={() => { if (!showNotifications) markNotificationsRead(); setShowNotifications(!showNotifications); }}`
    - _Bug_Condition: markNotificationsRead вызывается при закрытии панели_
    - _Expected_Behavior: markNotificationsRead вызывается только при !showNotifications_
    - _Preservation: панель продолжает toggle'ить корректно_
    - _Requirements: 2.2, 3.6_

  - [x] 3.3 Fix AchievementModal — добавить dismissMilestone и seen_milestones
    - Добавить функцию `dismissMilestone` — сохраняет milestone в seen_milestones в БД
    - Изменить обработчики close (крестик и "Не сейчас") на вызов `dismissMilestone()` вместо `setIsVisible(false); onClose()`
    - В checkMilestone: добавить загрузку `seen_milestones` и проверку `dismissed = [...shared, ...seen]`
    - _Bug_Condition: milestone не сохраняется при dismiss, useEffect показывает модалку повторно_
    - _Expected_Behavior: milestone в seen_milestones, модалка не появляется при re-render_
    - _Preservation: shared_milestones продолжает работать, бонус начисляется при шаринге_
    - _Requirements: 2.4, 2.6, 3.3, 3.4_

  - [x] 3.4 Fix Dashboard — добавить showAchievementModal state и обновить onClose
    - Добавить `const [showAchievementModal, setShowAchievementModal] = useState(true)`
    - Заменить `<AchievementModal ... onClose={() => { }} />` на:
      `{showAchievementModal && <AchievementModal ... onClose={() => setShowAchievementModal(false)} />}`
    - _Bug_Condition: onClose — no-op, компонент продолжает рендериться_
    - _Expected_Behavior: onClose скрывает компонент, предотвращает re-render_
    - _Preservation: при следующем логине или перезагрузке showAchievementModal сбрасывается в true (можно показать новые milestones)_
    - _Requirements: 2.5, 3.4_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Очистка уведомлений работает, модалка не повторяется
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Существующее поведение сохранено
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify manually: открыть панель → очистить → уведомления не появляются
  - Verify manually: закрыть модалку → обновить страницу → модалка не появляется (если milestone тот же)
  - Verify manually: достичь нового milestone → модалка появляется корректно
