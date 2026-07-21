import React from 'react';
import { Section } from './ui/Section';
import { Card } from './ui/Card';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Privacy() {
    const contentAnim = useScrollAnimation();

    return (
        <Section variant="light" className="pt-32 pb-20 min-h-screen" decorElements={[
            { type: 'dots', position: { top: '5%', right: '3%' }, opacity: 0.04, size: '100px' },
            { type: 'lines', position: { bottom: '10%', left: '2%' }, opacity: 0.03, size: '80px' },
        ]}>
            <div ref={contentAnim.ref as any} style={contentAnim.style}>
            <Card variant="elevated" className="max-w-[800px] mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-[-0.02em] leading-[1.1] mb-8 text-text-primary dark:text-text-primary">Политика конфиденциальности и Anti-Fraud</h1>

                <div className="space-y-6 text-text-secondary dark:text-text-secondary text-sm md:text-base lg:text-lg leading-[1.6] tracking-[0.01em]">
                    <p className="text-sm text-text-muted font-medium">Вступает в силу с момента публикации: {new Date().toLocaleDateString('ru-RU')}</p>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold tracking-[-0.02em] leading-[1.1] text-text-primary dark:text-text-primary mb-3">1. Согласие на сбор и обработку данных</h2>
                        <p>1.1. Настоящая Политика описывает, как платформа <strong>NOXISS.WORK</strong> (далее «Сервис») собирает, обрабатывает, хранит и защищает данные Пользователей.</p>
                        <p>1.2. Регистрация на Сервисе, использование Telegram-бота или сайта является безусловным согласием Пользователя на сбор и обработку его данных в соответствии с настоящим документом, включая использование автоматизированных систем профилирования (Anti-Fraud).</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold tracking-[-0.02em] leading-[1.1] text-text-primary dark:text-text-primary mb-3">2. Сбор расширенной технической информации</h2>
                        <p>В целях обеспечения безопасности и предотвращения злоупотреблений, автоматического создания аккаунтов (ферм) и накруток, Сервис собирает следующие данные:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li><strong>Идентификационные:</strong> Email, Telegram ID, хэши паролей.</li>
                            <li><strong>Финансовые:</strong> Реквизиты для выплат (СБП, номер карты/кошелька), история транзакций и пополнений. Данные банковских карт для оплаты обрабатываются безопасными шлюзами партнеров-эквайеров, Сервис не хранит полных номеров карт.</li>
                            <li><strong>Аналитические (Отпечаток устройства / Browser Fingerprinting):</strong> IP-адреса (включая проверку по черным спискам VPN/Proxy/Tor), данные User-Agent браузера, разрешение экрана, Canvas-отпечаток, установленные шрифты и часовой пояс устройства.</li>
                            <li><strong>Поведенческие:</strong> Логи действий на сайте, история кликов, время нахождения на страницах (для анализа "человечности" поведения).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold tracking-[-0.02em] leading-[1.1] text-red-600 dark:text-red-400 mb-3">3. Хранение данных мошенников (Политика Anti-Fraud)</h2>
                        <p>3.1. В соответствии с нашими обязательствами по защите Заказчиков от некачественных услуг, Сервис реализует политику нулевой терпимости к накрутчикам и мошенникам.</p>
                        <p>3.2. Бессрочный "Черный список": Если аккаунт Пользователя (Исполнителя) был заблокирован за нарушение правил (создание фермы аккаунтов, ботоводство, преднамеренное удаление отзывов после оплаты, мошенничество с платежами), его технические характеристики (IP-сеть, Fingerprint, Telegram ID, реквизиты, указанные для выплат) заносятся в зашифрованный Черный список.</p>
                        <p>3.3. Данная информация <strong>хранится бессрочно</strong>, даже в случае требования Пользователя удалить базовый аккаунт. Это является правомерным исключением (защита законных интересов Сервиса) и используется исключительно для автоматической блокировки попыток повторной регистрации мошенника под вымышленными именами.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold tracking-[-0.02em] leading-[1.1] text-text-primary dark:text-text-primary mb-3">4. Передача данных и запросы органов власти</h2>
                        <p>4.1. Сервис гарантирует, что данные (email, реквизиты, история заказов) <strong>строго конфиденциальны</strong>. Мы не продаем и не передаем базы пользователей третьим лицам или маркетологам.</p>
                        <p>4.2. Исключения: Сервис обязан и будет передавать любую запрашиваемую информацию о Пользователе (включая IP-логи, суммы транзакций, реквизиты) по официальному легитимному запросу правоохранительных органов, налоговых служб или по решению суда РФ.</p>
                    </section>

                    <section>
                        <h2 className="text-xl md:text-2xl font-bold tracking-[-0.02em] leading-[1.1] text-text-primary dark:text-text-primary mb-3">5. Cookies и защита сессий</h2>
                        <p>Мы используем технические файлы Cookies для поддержания авторизации, работы системы защиты от CSRF/XSS-атак и идентификации сессии. Отключение Cookies в браузере приведет к невозможности авторизации в личном кабинете.</p>
                    </section>
                </div>
            </Card>
            </div>
        </Section>
    );
}
