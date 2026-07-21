# Notification & Achievement Modal Bugfix Design

## Overview

Исправление двух взаимосвязанных багов в Dashboard.tsx и AchievementModal.tsx:

1. **Race condition при очистке уведомлений** — `markNotificationsRead` вызывает `fetchNotifications` в конце, создавая race condition с `clearAllNotifications`. Также вызывается при закрытии панели.
2. **Повторное появление модального окна достижений** — milestone не помечается как "seen" при закрытии без шаринга, `onClose` — пустая функция, useEffect срабатывает повторно.

Стратегия: минимальные изменения, устранение race condition через отказ от лишних fetch-запросов, сохранение "seen" состояния в БД.

## Glossary

- **Bug_Condition (C)**: Условие, при котором проявляется баг — race condition при очистке уведомлений ИЛИ повторное показ модалки после закрытия
- **Property (P)**: Желаемое поведение — уведомления очищаются навсегда, модалка не появляется повторно после закрытия
- **Preservation**: Существующее поведение, которое не должно измениться — отображение уведомлений, начисление бонуса за шаринг, показ новых milestones
- **markNotificationsRead**: Функция в Dashboard.tsx (~строка 262), помечающая все непрочитанные уведомления как прочитанные в БД
- **clearAllNotifications**: Функция в Dashboard.tsx, удаляющая все уведомления пользователя из БД и очищающая state
- **fetchNotifications**: Функция в Dashboard.tsx, загружающая уведомления из БД в state
- **AchievementModal**: Компонент, показывающий модальное окно при достижении milestone (100₽, 1000₽, 5000₽)
- **seen_milestones**: Новое поле в achievements JSON для хранения просмотренных (но не расшаренных) milestones

## Bug Details

### Bug Condition

Баг проявляется в двух сценариях:

**Сценарий 1 — Race condition уведомлений:**
Когда пользователь открывает панель уведомлений (вызывается `markNotificationsRead`), а затем нажимает "Очистить все" — pending fetch из `markNotificationsRead` перезаписывает очищенный state.

**Сценарий 2 — Повторный показ модалки:**
Когда пользователь закрывает модальное окно достижений без шаринга — milestone не сохраняется как "seen", и при следующем изменении `earnedTotal` useEffect показывает модалку заново.

**Formal Specification:**
```
FUNCTION isBugCondition_Notifications(input)
  INPUT: input of type UserAction
  OUTPUT: boolean
  
  RETURN (input.action = "clearAll" 
         AND pendingFetchExists(markNotificationsRead))
         OR (input.action = "toggleBell" AND showNotifications = true)
END FUNCTION

FUNCTION isBugCondition_Achievement(input)
  INPUT: input of type ModalAction
  OUTPUT: boolean
  
  RETURN input.action IN ["closeX", "dismissButton"]
         AND milestone NOT IN shared_milestones
         AND milestone NOT IN seen_milestones
         AND earnedTotal changes on next render
END FUNCTION
```

### Examples

- Пользователь кликает колокольчик → панель открывается → `markNotificationsRead` запускает fetch → пользователь нажимает "Очистить все" → state=[] → fetch возвращает данные → state снова заполнен уведомлениями
- Пользователь кликает колокольчик для закрытия панели → `markNotificationsRead` всё равно вызывается → лишний запрос к БД
- Пользователь достигает 100₽ → модалка появляется → нажимает "Не сейчас" → модалка закрывается → `fetchMyTasks` обновляет `earnedTotal` → useEffect срабатывает → модалка появляется снова
- Пользователь достигает 100₽ → модалка появляется → делится в VK → milestone сохраняется в `shared_milestones` → модалка больше не появляется (текущее корректное поведение при шаринге)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Отображение списка уведомлений при открытии панели (обратный хронологический порядок)
- Индикатор непрочитанных уведомлений (красная точка на колокольчике)
- Начисление бонуса +50₽ при шаринге достижения через VK/Telegram
- Сохранение milestone в `shared_milestones` после шаринга
- Показ нового модального окна при достижении milestone впервые
- Toast «Уведомления очищены» при успешной очистке
- Обновление unreadCount при получении новых уведомлений

**Scope:**
Все действия, которые НЕ связаны с race condition при очистке и НЕ связаны с повторным закрытием модалки, должны работать идентично. Это включает:
- Получение и отображение уведомлений при первой загрузке
- Первый показ модалки при достижении milestone
- Шаринг достижений (VK, Telegram)
- Удаление единичного уведомления (если есть)
- Переходы между разделами Dashboard

## Hypothesized Root Cause

### Баг 1: Race condition уведомлений

1. **Лишний fetchNotifications в markNotificationsRead**: После `update` записей в БД вызывается `fetchNotifications(session.user.id)`, что создаёт pending promise. Если пользователь нажимает "Очистить все" до его разрешения, resolved данные перезапишут пустой state.

2. **markNotificationsRead вызывается при ЗАКРЫТИИ панели**: Обработчик колокольчика всегда вызывает `markNotificationsRead()` при клике — как при открытии, так и при закрытии. При закрытии это бессмысленно и создаёт лишний запрос.

### Баг 2: Повторный показ модалки

1. **onClose — пустая функция**: `onClose={() => { }}` не обновляет состояние родителя, поэтому AchievementModal продолжает рендериться.

2. **useEffect зависит от earnedTotal**: `[userId, earnedTotal]` — при каждом изменении `earnedTotal` (каждый `fetchMyTasks`) useEffect проверяет milestones заново.

3. **Milestone не помечается как "seen"**: Только `handleShare` → `grantReward` сохраняет milestone в `shared_milestones`. Закрытие без шаринга не сохраняет ничего, поэтому следующая проверка снова находит "новый" milestone.

## Correctness Properties

Property 1: Bug Condition - Очистка уведомлений не перезаписывается

_For any_ действие пользователя, при котором он нажимает "Очистить все" уведомления, после успешного удаления из БД состояние notifications SHALL оставаться пустым массивом и НЕ SHALL быть перезаписано pending-запросом от markNotificationsRead.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Модальное окно не появляется после закрытия

_For any_ закрытие модального окна достижений пользователем (крестик или "Не сейчас"), milestone SHALL быть сохранён как "seen" в БД, и модальное окно SHALL НЕ появляться повторно при последующих изменениях earnedTotal.

**Validates: Requirements 2.4, 2.5, 2.6**

Property 3: Preservation - Существующее поведение уведомлений и достижений

_For any_ действие, которое НЕ является "Очистить все" после race condition и НЕ является повторным закрытием модалки, система SHALL сохранять идентичное поведение: отображение уведомлений, начисление бонусов за шаринг, первичный показ milestones.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

**File**: `components/Dashboard.tsx`

**Function**: `markNotificationsRead`

**Specific Changes**:
1. **Удалить вызов fetchNotifications**: Вместо повторного запроса к БД, обновить локальное состояние напрямую — установить `is_read: true` для всех уведомлений в state и `unreadCount: 0`
2. **Условный вызов markNotificationsRead**: В обработчике клика по колокольчику вызывать `markNotificationsRead()` только при ОТКРЫТИИ панели (когда `!showNotifications`), а не при каждом клике

**Текущий код обработчика:**
```tsx
onClick={() => { setShowNotifications(!showNotifications); markNotificationsRead(); }}
```

**Исправленный код:**
```tsx
onClick={() => { 
  if (!showNotifications) markNotificationsRead(); 
  setShowNotifications(!showNotifications); 
}}
```

**Исправленная markNotificationsRead:**
```tsx
const markNotificationsRead = async () => {
    if (!session?.user || unreadCount === 0) return;
    await supabase.from('notifications').update({ is_read: true })
        .eq('user_id', session.user.id).eq('is_read', false);
    // Обновляем локальное состояние без refetch
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
};
```

---

**File**: `components/Dashboard.tsx`

**Specific Changes**:
3. **Добавить состояние showAchievementModal**: `const [showAchievementModal, setShowAchievementModal] = useState(true);`
4. **Условный рендер AchievementModal**: Рендерить только когда `showAchievementModal === true`
5. **Обновить onClose callback**: `onClose={() => setShowAchievementModal(false)}`

---

**File**: `components/AchievementModal.tsx`

**Function**: `checkMilestone` (внутри useEffect), close handlers

**Specific Changes**:
6. **Добавить проверку seen_milestones**: В `checkMilestone` проверять оба массива — `shared_milestones` и `seen_milestones`
7. **Сохранять milestone как "seen" при закрытии**: При нажатии крестика или "Не сейчас" — записать milestone в `seen_milestones` в БД

**Исправленный checkMilestone:**
```tsx
const shared = data?.achievements?.shared_milestones || [];
const seen = data?.achievements?.seen_milestones || [];
const dismissed = [...shared, ...seen];

let newMilestone = null;
if (earnedTotal >= 5000 && !dismissed.includes(5000)) newMilestone = 5000;
else if (earnedTotal >= 1000 && !dismissed.includes(1000)) newMilestone = 1000;
else if (earnedTotal >= 100 && !dismissed.includes(100)) newMilestone = 100;
```

**Новая функция dismissMilestone:**
```tsx
const dismissMilestone = async () => {
    if (!milestone) return;
    const { data: profile } = await supabase
        .from('profiles')
        .select('achievements')
        .eq('id', userId)
        .single();
    
    const currentAchievements = profile?.achievements || {};
    const seenMilestones = currentAchievements.seen_milestones || [];
    
    if (!seenMilestones.includes(milestone)) {
        await supabase.from('profiles').update({
            achievements: {
                ...currentAchievements,
                seen_milestones: [...seenMilestones, milestone]
            }
        }).eq('id', userId);
    }
    
    setIsVisible(false);
    onClose();
};
```

## Testing Strategy

### Validation Approach

Стратегия тестирования состоит из двух фаз: сначала воспроизвести баг на текущем коде (exploratory), затем проверить, что fix корректен и не ломает существующее поведение.

### Exploratory Bug Condition Checking

**Goal**: Воспроизвести race condition и повторный показ модалки на НЕЗАФИКСИРОВАННОМ коде.

**Test Plan**: Написать тесты, моделирующие последовательность действий пользователя. Запустить на текущем коде — тесты должны FAIL (подтверждение бага).

**Test Cases**:
1. **Race condition test**: Вызвать markNotificationsRead → затем clearAllNotifications → проверить, что state остаётся пустым после resolve всех promises (FAIL на текущем коде)
2. **Close panel fires markRead**: Проверить, что клик по колокольчику при showNotifications=true вызывает markNotificationsRead (FAIL — вызывается всегда)
3. **Modal reappears test**: Закрыть модалку без шаринга → изменить earnedTotal → проверить, что модалка не появляется (FAIL на текущем коде)
4. **onClose no-op test**: Проверить, что onClose обновляет состояние родителя (FAIL — пустая функция)

**Expected Counterexamples**:
- После clearAllNotifications, state перезаписывается данными из fetchNotifications
- markNotificationsRead вызывается даже при showNotifications=true
- Модальное окно повторно появляется после dismiss + earnedTotal change

### Fix Checking

**Goal**: Убедиться, что для всех случаев bug condition, исправленный код работает корректно.

**Pseudocode:**
```
FOR ALL action WHERE isBugCondition_Notifications(action) DO
  result := clearAllNotifications_fixed(action)
  ASSERT notifications_state = [] AND no_pending_fetch_overwrites
END FOR

FOR ALL action WHERE isBugCondition_Achievement(action) DO
  result := dismissMilestone(action)
  ASSERT milestone IN seen_milestones AND modal_not_visible
END FOR
```

### Preservation Checking

**Goal**: Убедиться, что для всех не-баговых действий поведение остаётся прежним.

**Pseudocode:**
```
FOR ALL action WHERE NOT isBugCondition(action) DO
  ASSERT original_behavior(action) = fixed_behavior(action)
END FOR
```

**Testing Approach**: Property-based тестирование для preservation, так как:
- Автоматически генерирует множество тест-кейсов
- Ловит edge cases, которые ручные тесты пропускают
- Даёт сильные гарантии неизменности поведения

**Test Plan**: Наблюдать поведение на текущем коде для нормальных действий (открытие панели, отображение уведомлений, шаринг), затем написать тесты, фиксирующие это поведение.

**Test Cases**:
1. **Notification display preservation**: Проверить, что уведомления отображаются в обратном хронологическом порядке
2. **Unread indicator preservation**: Проверить, что красная точка показывается при unreadCount > 0
3. **Share reward preservation**: Проверить, что handleShare начисляет +50₽ и сохраняет в shared_milestones
4. **New milestone detection**: Проверить, что новые milestones (не shared, не seen) показывают модалку

### Unit Tests

- Тест markNotificationsRead: не вызывает fetchNotifications, обновляет state локально
- Тест bell onClick: вызывает markNotificationsRead только при !showNotifications
- Тест dismissMilestone: сохраняет milestone в seen_milestones в БД
- Тест checkMilestone: не показывает модалку если milestone в seen_milestones
- Тест onClose: обновляет showAchievementModal в родителе

### Property-Based Tests

- Генерация случайных последовательностей действий с уведомлениями — после clearAll state всегда пуст
- Генерация случайных milestone/earnedTotal комбинаций — dismissed milestone не показывается повторно
- Генерация случайных состояний панели — markNotificationsRead вызывается только при открытии

### Integration Tests

- Полный flow: открытие панели → очистка → проверка пустого списка
- Полный flow: milestone → закрытие → fetchMyTasks → модалка НЕ появляется
- Полный flow: milestone → шаринг → бонус → модалка НЕ появляется
