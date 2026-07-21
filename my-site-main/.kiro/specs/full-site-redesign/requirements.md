# Requirements Document

## Introduction

Применение существующей дизайн-системы (Section, Card, IconBadge, BrandIcon, анимационные хуки, CSS-переменные, тёмная тема) ко всем оставшимся страницам NOXISS.WORK, не затронутым предыдущим premium-redesign. Цель — визуальное единообразие всего сайта на уровне студийного качества при полном сохранении существующей функциональности. Работа сводится к замене хардкодированных стилей на токены дизайн-системы, обёртке контента в Section/Card компоненты, добавлению scroll-анимаций и обеспечению корректной работы тёмной темы на каждой странице.

## Glossary

- **Design_System**: Набор готовых компонентов (Section, Card, IconBadge, BrandIcon) и CSS-переменных (--surface-primary, --text-primary, --accent-primary и др.), реализованных в рамках premium-redesign
- **Section_Component**: Компонент-обёртка секции с 4 вариантами (light, dark, accent, textured), 3-слойным фоном и декоративными SVG-элементами
- **Card_Component**: Компонент карточки с 4 вариантами (flat, elevated, bordered, glass), hover-анимацией и декоративными акцентами
- **CSS_Token**: CSS-переменная из дизайн-системы (например, --surface-primary, --text-secondary, --accent-primary), заменяющая хардкодированные hex-значения
- **Scroll_Animation**: Анимация появления элементов при скролле через хук useScrollAnimation (IntersectionObserver + Framer Motion)
- **Stagger_Animation**: Последовательная анимация группы элементов с задержкой 50-100ms через useAnimationQueue
- **Dark_Theme**: Тёмная тема, реализованная через CSS-переменные в классе .dark и переключаемая через localStorage + prefers-color-scheme
- **BusinessLanding_Page**: Страница /business — лендинг для бизнес-клиентов, заказывающих отзывы
- **Dashboard_Page**: Страница /dashboard — личный кабинет пользователя с балансом, формой вывода, историей задач и отчётами
- **Admin_Panel**: Раздел администрирования внутри Dashboard — редактор статистики, управление пользователями, одобрение выводов
- **Tasks_Page**: Страница /tasks — лента заданий для исполнителей
- **Blog_Page**: Страницы /blog и /blog/:slug — база знаний и статьи
- **BusinessDashboard_Page**: Страница /business-cabinet — кабинет бизнес-клиента для заказа отзывов
- **Leaderboard_Page**: Страница рейтинга исполнителей за неделю
- **BusinessPromo_Page**: Промо-страница для бизнеса
- **Legal_Pages**: Страницы Terms, Privacy, Offer — юридические документы
- **CityLanding_Page**: Страницы /otzyvy/:platform/:city — SEO-лендинги по городам и площадкам
- **Anti_AI_Pattern**: Дизайн-подход, исключающий шаблонные паттерны AI: градиентный текст (bg-clip-text), однообразные равные карточки, симметричные сетки без визуального ритма
- **Typography_Scale**: Система размеров шрифтов: desktop (h1: 56px, h2: 45px, h3: 36px, h4: 28px, body: 18px) и mobile (h1: 36px, h2: 28px, h3: 22px, h4: 18px, body: 16px)

## Requirements

### Requirement 1: Применение Section-обёрток ко всем страницам

**User Story:** Как владелец сайта, я хочу чтобы каждая секция на каждой странице использовала компонент Section с 3-слойным фоном и декором, чтобы обеспечить визуальное единообразие со стилем главной страницы.

#### Acceptance Criteria

1. THE Design_System SHALL оборачивать каждую визуальную секцию на страницах BusinessLanding_Page, Tasks_Page, Blog_Page, Leaderboard_Page, BusinessPromo_Page, CityLanding_Page и Legal_Pages в компонент Section_Component с указанием одного из 4 вариантов (light, dark, accent, textured)
2. WHEN страница содержит 3 и более секций, THE Design_System SHALL чередовать варианты Section_Component таким образом, чтобы смежные секции имели разные варианты, обеспечивая контраст фонов по светлоте (L в HSL) минимум на 10 единиц
3. THE Design_System SHALL передавать в каждый Section_Component массив decorElements с количеством элементов от 2 до 6, соответствующих тематике секции (dots для статистик, geometric для шагов, blob для CTA-блоков, lines для FAQ)
4. THE Design_System SHALL сохранять существующую структуру контента (заголовки, списки, карточки) внутри Section_Component без изменения порядка элементов и функциональности

### Requirement 2: Применение Card-компонентов

**User Story:** Как пользователь, я хочу видеть карточки с единообразным стилем (тени, радиусы, hover-эффекты) на всех страницах, чтобы интерфейс ощущался как цельный продукт.

#### Acceptance Criteria

1. THE Design_System SHALL заменить все `<div>` элементы с ручным оформлением карточек (inline shadow, border-radius, background) на компонент Card_Component с соответствующим вариантом на страницах Dashboard_Page, Tasks_Page, Blog_Page, Leaderboard_Page, BusinessDashboard_Page и Admin_Panel
2. THE Design_System SHALL назначать варианты Card_Component по типу контента: elevated — для карточек заданий и заказов, bordered — для шагов и преимуществ, glass — для отзывов и цитат, flat — для статистических блоков и баланса
3. THE Design_System SHALL применять акцент (accent prop) к карточкам: line — для карточек задач (Tasks_Page), corner — для кейсов (BusinessLanding_Page), pattern — для элементов блога (Blog_Page)
4. WHEN устройство поддерживает hover (pointer: fine), THE Card_Component SHALL применять hover-анимацию translateY(-4px) с усилением тени за 250ms; WHEN устройство поддерживает только touch, Card_Component SHALL применять active:scale(0.98) за 100ms

### Requirement 3: Замена хардкодированных цветов на CSS-токены

**User Story:** Как разработчик, я хочу чтобы все страницы использовали CSS-переменные дизайн-системы вместо захардкодированных значений, чтобы тёмная тема работала автоматически.

#### Acceptance Criteria

1. THE Design_System SHALL заменить все хардкодированные цвета фона (bg-[#F5F5F7], bg-white, bg-[#1c1c1e], bg-black) на соответствующие токены (bg-surface-primary, bg-surface-secondary, bg-surface-dark) на всех страницах: BusinessLanding_Page, Dashboard_Page, Admin_Panel, Tasks_Page, Blog_Page, BusinessDashboard_Page, Leaderboard_Page, BusinessPromo_Page, Legal_Pages, CityLanding_Page
2. THE Design_System SHALL заменить все хардкодированные цвета текста (text-[#1d1d1f], text-slate-500, text-slate-700) на токены (text-text-primary, text-text-secondary, text-text-muted) на всех перечисленных страницах
3. THE Design_System SHALL заменить все хардкодированные border-цвета (border-slate-100, border-white/10, border-white/5) на токены (border-border-primary, border-border-secondary) на всех перечисленных страницах
4. THE Design_System SHALL заменить все хардкодированные акцентные цвета (bg-[#0071e3], text-blue-600) на токены (bg-accent-primary, text-accent-primary) для кнопок и ссылок на всех перечисленных страницах
5. IF после замены цветов на токены контраст текста на фоне опускается ниже WCAG AA (4.5:1 для обычного текста, 3:1 для крупного), THEN THE Design_System SHALL скорректировать токен или применить альтернативный токен с достаточным контрастом

### Requirement 4: Устранение Anti-AI паттернов

**User Story:** Как владелец сайта, я хочу убрать все шаблонные паттерны ИИ-генерации с оставшихся страниц, чтобы весь сайт выглядел как ручная работа дизайн-студии.

#### Acceptance Criteria

1. THE Design_System SHALL заменить все экземпляры градиентного текста (text-transparent bg-clip-text bg-gradient-to-r) на акцентный цвет (text-accent-primary) или декоративное подчёркивание (border-bottom с accent-primary, 3px) на страницах BusinessLanding_Page, BusinessPromo_Page и CityLanding_Page
2. THE Design_System SHALL заменить однородные grid-сетки (grid-cols-3 или grid-cols-4 с одинаковыми карточками) на асимметричные макеты (grid с col-span-2/1 или bento-grid) минимум в одной секции каждой страницы, содержащей более 4 однотипных элементов
3. THE Design_System SHALL устранить радиальные градиенты в качестве единственного декора hero-секций (radial-gradient как фон) и заменить на композицию из 3+ декоративных SVG-элементов через Section_Component decorElements prop на страницах BusinessLanding_Page, BusinessPromo_Page и CityLanding_Page
4. THE Design_System SHALL применять разные размеры карточек (минимум 2 различных grid-span или height) внутри секций с 4+ однотипными элементами на страницах BusinessLanding_Page (кейсы) и Blog_Page (статьи)

### Requirement 5: Добавление scroll-анимаций

**User Story:** Как пользователь, я хочу видеть плавные анимации появления контента при скролле на всех страницах, чтобы сайт ощущался живым.

#### Acceptance Criteria

1. THE Design_System SHALL применять хук useScrollAnimation к каждой секции и карточке на страницах BusinessLanding_Page, Tasks_Page, Blog_Page, Leaderboard_Page, BusinessPromo_Page и CityLanding_Page с параметрами: threshold 0.2, duration 500ms, translateY 24px, easing cubic-bezier(0.16, 1, 0.3, 1)
2. WHEN группа из 3 и более однотипных элементов (карточки задач, статьи блога, строки лидерборда, преимущества) появляется в viewport, THE Design_System SHALL применять Stagger_Animation с задержкой 75ms между элементами
3. WHEN числовое значение статистики (баланс на Dashboard_Page, количество задач, рейтинг на Leaderboard_Page) появляется в viewport, THE Design_System SHALL применять хук useCountUp с duration 1000ms и easing easeOut
4. IF у пользователя активирована настройка prefers-reduced-motion: reduce, THEN THE Design_System SHALL отключить все анимации движения (transform, translate) и отображать элементы мгновенно, сохраняя только fade-переходы длительностью не более 200ms
5. WHILE устройство имеет ширину экрана менее 768px, THE Design_System SHALL ограничивать одновременно воспроизводимые анимации до 3 через useAnimationQueue, помещая остальные в очередь

### Requirement 6: Обеспечение тёмной темы на всех страницах

**User Story:** Как пользователь тёмной темы, я хочу чтобы все страницы корректно отображались в тёмном режиме без сломанных цветов или нечитаемого текста.

#### Acceptance Criteria

1. THE Design_System SHALL обеспечить корректное отображение всех страниц (BusinessLanding_Page, Dashboard_Page, Admin_Panel, Tasks_Page, Blog_Page, BusinessDashboard_Page, Leaderboard_Page, BusinessPromo_Page, Legal_Pages, CityLanding_Page) в тёмной теме через переключение CSS-переменных в классе .dark
2. THE Design_System SHALL заменить тени (box-shadow) на свечения (glow: box-shadow с цветным значением, blur 20-60px) для карточек и контейнеров в тёмной теме на всех страницах
3. THE Design_System SHALL обеспечить контраст основного текста на тёмном фоне не ниже 7:1 (WCAG AAA) и контраст вспомогательного текста не ниже 4.5:1 (WCAG AA) на всех страницах в тёмной теме
4. THE Design_System SHALL заменить белые/светлые фоны (bg-white, bg-[#F5F5F7]) в тёмной теме на тёмные поверхности (--surface-primary: #0A0A0F, --surface-secondary: #12121A) без потери видимости контента
5. IF элемент использует inline-стили или Tailwind-классы с хардкодированными цветами, не учитывающими тёмную тему (отсутствие dark: префикса), THEN THE Design_System SHALL заменить такие стили на CSS-токены, автоматически переключающиеся в тёмной теме

### Requirement 7: Применение типографической шкалы

**User Story:** Как пользователь, я хочу чтобы заголовки и текст на всех страницах имели единообразные размеры и вес, чтобы иерархия информации была очевидной.

#### Acceptance Criteria

1. THE Design_System SHALL применять Typography_Scale к заголовкам всех страниц: h1 — font-weight 800, 56px desktop / 36px mobile; h2 — font-weight 800, 45px desktop / 28px mobile; h3 — font-weight 600, 36px desktop / 22px mobile; h4 — font-weight 600, 28px desktop / 18px mobile
2. THE Design_System SHALL применять line-height 1.1 и letter-spacing -0.02em ко всем заголовкам (h1-h4) на всех страницах
3. THE Design_System SHALL применять body text с font-weight 400, размером 18px desktop / 16px mobile, line-height 1.6 и letter-spacing 0.01em на всех страницах
4. WHILE viewport < 1024px, THE Design_System SHALL автоматически масштабировать все размеры шрифтов до мобильных значений Typography_Scale через responsive Tailwind-классы (text-base md:text-lg и аналогичные)

### Requirement 8: Редизайн Dashboard и Admin Panel

**User Story:** Как пользователь Dashboard, я хочу видеть тот же премиальный стиль (карточки, анимации, тёмная тема) что и на главной странице, чтобы интерфейс ощущался единым продуктом.

#### Acceptance Criteria

1. THE Design_System SHALL обернуть основные разделы Dashboard_Page (баланс, история задач, форма вывода, отчёты) в Section_Component с чередованием вариантов light и accent
2. THE Design_System SHALL оформить карточку баланса как Card_Component variant="elevated" с accentLine и анимацией useCountUp для числового значения баланса
3. THE Design_System SHALL оформить список истории задач и выводов как набор Card_Component variant="flat" с Stagger_Animation при появлении в viewport
4. THE Design_System SHALL оформить форму вывода средств как Card_Component variant="bordered" с inline-валидацией полей и micro-анимацией кнопки (scale 0.95→1) при клике
5. THE Design_System SHALL оформить Admin_Panel (редактор статистики, список пользователей, одобрение выводов) с использованием Card_Component variant="elevated" для таблиц и variant="bordered" для форм
6. THE Design_System SHALL сохранить всю существующую функциональность Dashboard_Page (вывод средств, просмотр истории, отправка отчётов, промо-система, реферальная система) без изменения бизнес-логики

### Requirement 9: Редизайн Tasks Page

**User Story:** Как исполнитель, я хочу видеть ленту задач в премиальном оформлении с анимациями и удобной навигацией по категориям.

#### Acceptance Criteria

1. THE Design_System SHALL оформить каждое задание в ленте как Card_Component variant="elevated" с accent="line", где цвет линии соответствует категории задания (синий — отзывы, оранжевый — Авито, голубой — соцсети, зелёный — приложения)
2. THE Design_System SHALL оформить фильтр категорий как горизонтальный scroll с карточками-кнопками, используя IconBadge с иконкой категории и micro-анимацией при выборе (scale 1.05, border-accent-primary)
3. WHEN новые задания загружаются, THE Design_System SHALL применять Stagger_Animation с задержкой 75ms к каждому элементу ленты
4. THE Design_System SHALL оформить пустое состояние (нет заданий) как Section_Component variant="accent" с декоративной иллюстрацией и текстом
5. THE Design_System SHALL сохранить всю существующую функциональность Tasks_Page (взятие задания, фильтрация по категориям, отображение статусов) без изменения бизнес-логики

### Requirement 10: Редизайн Blog

**User Story:** Как читатель блога, я хочу видеть статьи в привлекательном оформлении с чёткой иерархией и приятной типографикой.

#### Acceptance Criteria

1. THE Design_System SHALL оформить список статей на Blog_Page как bento-grid с первой статьёй (featured) занимающей col-span-2 и остальными — col-span-1, используя Card_Component variant="elevated" с accent="pattern"
2. THE Design_System SHALL оформить страницу отдельной статьи (BlogPost) с Section_Component variant="light", Typography_Scale для заголовков и body text, и максимальной шириной контента 720px для комфортного чтения
3. THE Design_System SHALL применять scroll-анимацию к заголовку и содержимому статьи с fade+translateY при появлении, и Stagger_Animation к списку статей на Blog_Page
4. THE Design_System SHALL сохранить существующую структуру блога (BLOG_POSTS массив, роутинг /blog/:slug, отображение даты/времени чтения/категории) без изменения функциональности

### Requirement 11: Редизайн Leaderboard

**User Story:** Как исполнитель, я хочу видеть таблицу лидеров в современном оформлении с анимированными числами и выделением топ-позиций.

#### Acceptance Criteria

1. THE Design_System SHALL обернуть Leaderboard_Page в Section_Component variant="dark" с декоративными элементами типа geometric и dots
2. THE Design_System SHALL оформить топ-3 позиции как Card_Component variant="glass" с увеличенным размером и IconBadge для медалей (золото, серебро, бронза)
3. THE Design_System SHALL оформить остальные позиции рейтинга как Card_Component variant="flat" с Stagger_Animation при появлении
4. WHEN данные лидерборда загружены, THE Design_System SHALL применять useCountUp к числовым значениям (количество выполненных заданий) с duration 1000ms
5. THE Design_System SHALL сохранить существующую функциональность Leaderboard_Page (загрузка данных из Supabase, отображение email/количества, дата старта недели) без изменения бизнес-логики

### Requirement 12: Редизайн Legal Pages (Terms, Privacy, Offer)

**User Story:** Как пользователь, я хочу чтобы юридические страницы были оформлены в стиле дизайн-системы с хорошей типографикой и тёмной темой.

#### Acceptance Criteria

1. THE Design_System SHALL обернуть каждую Legal_Pages в Section_Component variant="light" с минимумом декоративных элементов (2 — dots + lines) для неотвлекающего фона
2. THE Design_System SHALL оформить контейнер контента как Card_Component variant="elevated" с максимальной шириной 800px и padding 32px desktop / 24px mobile
3. THE Design_System SHALL применять Typography_Scale к заголовкам юридического текста: h1 — заголовок документа, h2 — разделы, body — текст пунктов, с корректным line-height 1.6 для длинных текстов
4. THE Design_System SHALL обеспечить корректное отображение Legal_Pages в тёмной теме с контрастом текста не ниже 7:1 для основного содержания

### Requirement 13: Редизайн CityLanding Pages

**User Story:** Как посетитель SEO-страницы, я хочу видеть красиво оформленный лендинг города с информацией о площадке, чтобы воспринимать сервис как профессиональный.

#### Acceptance Criteria

1. THE Design_System SHALL обернуть hero-секцию CityLanding_Page в Section_Component variant="dark" с декоративными элементами blob и geometric, содержащую название города, платформы и BrandIcon соответствующей площадки
2. THE Design_System SHALL оформить секцию преимуществ CityLanding_Page с помощью Card_Component variant="bordered" и IconBadge для каждого преимущества
3. THE Design_System SHALL оформить CTA-блок CityLanding_Page как Section_Component variant="accent" с Card_Component variant="glass" внутри, содержащим призыв к действию и кнопку
4. THE Design_System SHALL применять scroll-анимацию useScrollAnimation к каждой секции CityLanding_Page и Stagger_Animation к списку преимуществ
5. THE Design_System SHALL заменить градиентный текст (bg-clip-text) в заголовках CityLanding_Page на text-accent-primary или декоративное подчёркивание

### Requirement 14: Редизайн BusinessDashboard и BusinessPromo

**User Story:** Как бизнес-клиент, я хочу видеть кабинет и промо-страницу в том же премиальном стиле, что и основной сайт.

#### Acceptance Criteria

1. THE Design_System SHALL оформить BusinessDashboard_Page (форма заказа, история заказов, баланс) с использованием Section_Component и Card_Component аналогично Dashboard_Page: elevated для карточки баланса, bordered для формы заказа, flat для истории
2. THE Design_System SHALL оформить BusinessPromo_Page с чередованием Section_Component вариантов (light → dark → accent → textured), Card_Component для преимуществ (variant="bordered"), scroll-анимациями и устранением градиентного текста
3. THE Design_System SHALL применять Stagger_Animation к группам карточек и useCountUp к числовым метрикам (количество клиентов, средний рост рейтинга) на BusinessPromo_Page
4. THE Design_System SHALL сохранить всю существующую функциональность BusinessDashboard_Page (создание заказа, пополнение баланса, просмотр статусов) без изменения бизнес-логики

### Requirement 15: Сохранение функциональности

**User Story:** Как владелец сайта, я хочу быть уверен что редизайн не сломает ни одну существующую функцию, чтобы пользователи могли продолжить работу без перебоев.

#### Acceptance Criteria

1. THE Design_System SHALL сохранить работоспособность всех интерактивных элементов (кнопки, формы, ссылки, модальные окна) на всех перечисленных страницах после применения новых стилей
2. THE Design_System SHALL сохранить все обработчики событий (onClick, onSubmit, onChange) без модификации на всех перечисленных страницах
3. THE Design_System SHALL сохранить все вызовы Supabase (CRUD-операции, авторизация, real-time подписки) без изменений на страницах Dashboard_Page, Tasks_Page, BusinessDashboard_Page, Leaderboard_Page и Admin_Panel
4. THE Design_System SHALL сохранить роутинг (react-router-dom), параметры URL и навигацию между страницами без изменений
5. IF после визуального обновления компонент перестаёт рендериться или выбрасывает ошибку, THEN THE Design_System SHALL откатить изменения данного компонента до рабочего состояния и применить минимальные стилевые изменения (только замена цветов на токены)

### Requirement 16: Адаптивность и мобильная оптимизация

**User Story:** Как мобильный пользователь, я хочу чтобы все страницы корректно отображались на устройствах любой ширины с плавными анимациями.

#### Acceptance Criteria

1. THE Design_System SHALL обеспечить корректное отображение всех страниц на ключевых breakpoints: 320px, 768px, 1024px и 1440px без горизонтального скролла и обрезания контента
2. WHILE viewport < 768px, THE Design_System SHALL применять однополосные макеты (grid-cols-1) для карточек на страницах Tasks_Page, Blog_Page, Leaderboard_Page; двуполосные макеты (grid-cols-2) допускаются для компактных элементов (badges, иконки площадок)
3. WHILE viewport < 768px, THE Design_System SHALL уменьшать padding секций до 16px horizontal и 48px vertical (py-12) и padding карточек до 20px
4. WHILE viewport < 768px, THE Design_System SHALL заменять hover-эффекты карточек на tap-feedback (active:scale-0.98, duration 100ms) через CSS media query @media (pointer: coarse)
5. THE Design_System SHALL обеспечить частоту кадров анимаций не ниже 55fps на мобильных устройствах, используя только свойства transform и opacity, без анимации width/height/margin
