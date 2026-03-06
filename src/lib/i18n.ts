export type Lang = "en" | "uk" | "ru";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

const translations: Record<Lang, Record<string, string>> = {
  en: {
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.openApp": "Open App",
    "hero.badge": "Free & open source",
    "hero.title1": "Time tracking",
    "hero.title2": "for freelancers",
    "hero.title3": "who ship.",
    "hero.desc": "Track time, manage clients, send invoices, and close deals — all in one place. No bloat, no subscriptions, no BS. Just a clean tool that works.",
    "hero.cta": "Start Tracking",
    "hero.github": "View on GitHub",
    "hero.check1": "No signup required",
    "hero.check2": "Works offline",
    "hero.check3": "Your data, your device",
    "preview.greeting": "Good evening 👋",
    "preview.sub": "Friday, March 6 · 3 projects active",
    "preview.today": "Today",
    "preview.week": "This Week",
    "preview.unpaid": "Unpaid",
    "preview.pipeline": "Pipeline",
    "features.title": "Everything you need. Nothing you don't.",
    "features.desc": "Built by a freelancer, for freelancers. Every feature solves a real problem.",
    "feat.time.title": "Time Tracking",
    "feat.time.desc": "One-click timer with keyboard shortcuts. Billable/non-billable. Duration parser (1h 30m, 1:30, 90m). Manual entries for past days.",
    "feat.projects.title": "Projects",
    "feat.projects.desc": "Track by project with color coding, budgets, hourly rates. Active, completed, archived statuses. See total hours and earnings at a glance.",
    "feat.clients.title": "Clients",
    "feat.clients.desc": "Full contact management — email, phone, address, notes. Per-client stats: hours tracked, invoiced, projects.",
    "feat.invoices.title": "Invoices",
    "feat.invoices.desc": "Professional invoices with live preview. Auto-fill from time entries. Tax, discounts, custom payment terms. Track draft → sent → paid.",
    "feat.funnels.title": "Funnels",
    "feat.funnels.desc": "Custom Kanban pipelines for anything — sales, job search, hiring. Create your own stages. Track deal values and move cards with a click.",
    "feat.reports.title": "Reports",
    "feat.reports.desc": "Visual breakdown by project and client. Date range filters. Billable vs total hours. Earnings summary cards.",
    "extras.title": "Also included",
    "extras.keyboard": "Keyboard shortcuts — Space to start, Esc to stop, ⌘K command palette",
    "extras.speed": "Zero loading — everything instant, runs locally in your browser",
    "extras.mobile": "Mobile-ready with responsive layout and bottom navigation",
    "extras.privacy": "Your data stays yours — no cloud, no tracking, no vendor lock-in",
    "pricing.title": "Simple pricing",
    "pricing.desc": "Start free. Upgrade when you need more.",
    "pricing.free": "Free",
    "pricing.forever": "/forever",
    "pricing.freeDesc": "Core time tracking for solo freelancers.",
    "pricing.getStarted": "Get Started",
    "pricing.pro": "Pro",
    "pricing.month": "/month",
    "pricing.proDesc": "Full CRM for serious freelancers.",
    "pricing.comingSoon": "Coming soon",
    "pricing.joinWaitlist": "Join Waitlist",
    "cta.title1": "Stop paying for time trackers.",
    "cta.title2": "Start owning your workflow.",
    "cta.desc": "Logr is free, open source, and runs entirely in your browser. No signup, no credit card, no BS.",
    "cta.open": "Open Logr",
    "cta.star": "Star on GitHub",
    "footer.builtBy": "Built by",
  },
  uk: {
    "nav.features": "Функції",
    "nav.pricing": "Ціни",
    "nav.openApp": "Відкрити",
    "hero.badge": "Безкоштовно та з відкритим кодом",
    "hero.title1": "Облік часу",
    "hero.title2": "для фрілансерів,",
    "hero.title3": "які діють.",
    "hero.desc": "Відстежуйте час, керуйте клієнтами, виставляйте рахунки та закривайте угоди — все в одному місці. Без зайвого, без підписок. Просто зручний інструмент.",
    "hero.cta": "Почати роботу",
    "hero.github": "Код на GitHub",
    "hero.check1": "Без реєстрації",
    "hero.check2": "Працює офлайн",
    "hero.check3": "Ваші дані — ваш пристрій",
    "preview.greeting": "Добрий вечір 👋",
    "preview.sub": "П'ятниця, 6 березня · 3 активні проєкти",
    "preview.today": "Сьогодні",
    "preview.week": "Цей тиждень",
    "preview.unpaid": "Неоплачено",
    "preview.pipeline": "Воронка",
    "features.title": "Все що потрібно. Нічого зайвого.",
    "features.desc": "Створено фрілансером для фрілансерів. Кожна функція вирішує реальну проблему.",
    "feat.time.title": "Облік часу",
    "feat.time.desc": "Таймер в один клік з гарячими клавішами. Оплачуваний/неоплачуваний час. Ручні записи за минулі дні.",
    "feat.projects.title": "Проєкти",
    "feat.projects.desc": "Відстеження по проєктах з бюджетами та ставками. Активні, завершені, архівні статуси.",
    "feat.clients.title": "Клієнти",
    "feat.clients.desc": "Повне управління контактами — email, телефон, адреса, нотатки. Статистика по кожному клієнту.",
    "feat.invoices.title": "Рахунки",
    "feat.invoices.desc": "Професійні рахунки з попереднім переглядом. Податки, знижки, умови оплати. Чернетка → надіслано → оплачено.",
    "feat.funnels.title": "Воронки",
    "feat.funnels.desc": "Кастомні Kanban-пайплайни для продажів, пошуку роботи, найму. Створюйте свої етапи.",
    "feat.reports.title": "Звіти",
    "feat.reports.desc": "Візуальна розбивка по проєктах і клієнтах. Фільтри за датами. Оплачуваний vs загальний час.",
    "extras.title": "Також включено",
    "extras.keyboard": "Гарячі клавіші — Space для старту, Esc для зупинки, ⌘K палітра команд",
    "extras.speed": "Нульове завантаження — все миттєво, працює локально у браузері",
    "extras.mobile": "Адаптивний дизайн для мобільних пристроїв",
    "extras.privacy": "Ваші дані залишаються вашими — без хмари, без трекінгу",
    "pricing.title": "Прості ціни",
    "pricing.desc": "Починайте безкоштовно. Оновлюйте коли потрібно більше.",
    "pricing.free": "Безкоштовно",
    "pricing.forever": "/назавжди",
    "pricing.freeDesc": "Базовий облік часу для фрілансерів.",
    "pricing.getStarted": "Почати",
    "pricing.pro": "Pro",
    "pricing.month": "/місяць",
    "pricing.proDesc": "Повна CRM для серйозних фрілансерів.",
    "pricing.comingSoon": "Скоро",
    "pricing.joinWaitlist": "Приєднатися",
    "cta.title1": "Припиніть платити за тайм-трекери.",
    "cta.title2": "Почніть контролювати свій робочий процес.",
    "cta.desc": "Logr — безкоштовний, з відкритим кодом, працює прямо у вашому браузері. Без реєстрації, без кредитки.",
    "cta.open": "Відкрити Logr",
    "cta.star": "Зірка на GitHub",
    "footer.builtBy": "Створив",
  },
  ru: {
    "nav.features": "Функции",
    "nav.pricing": "Цены",
    "nav.openApp": "Открыть",
    "hero.badge": "Бесплатно и с открытым кодом",
    "hero.title1": "Учёт времени",
    "hero.title2": "для фрилансеров,",
    "hero.title3": "которые делают.",
    "hero.desc": "Отслеживайте время, управляйте клиентами, выставляйте счета и закрывайте сделки — всё в одном месте. Без лишнего, без подписок. Просто удобный инструмент.",
    "hero.cta": "Начать работу",
    "hero.github": "Код на GitHub",
    "hero.check1": "Без регистрации",
    "hero.check2": "Работает офлайн",
    "hero.check3": "Ваши данные — ваше устройство",
    "preview.greeting": "Добрый вечер 👋",
    "preview.sub": "Пятница, 6 марта · 3 активных проекта",
    "preview.today": "Сегодня",
    "preview.week": "Эта неделя",
    "preview.unpaid": "Неоплачено",
    "preview.pipeline": "Воронка",
    "features.title": "Всё что нужно. Ничего лишнего.",
    "features.desc": "Создано фрилансером для фрилансеров. Каждая функция решает реальную проблему.",
    "feat.time.title": "Учёт времени",
    "feat.time.desc": "Таймер в один клик с горячими клавишами. Оплачиваемое/неоплачиваемое время. Ручные записи за прошлые дни.",
    "feat.projects.title": "Проекты",
    "feat.projects.desc": "Отслеживание по проектам с бюджетами и ставками. Активные, завершённые, архивные статусы.",
    "feat.clients.title": "Клиенты",
    "feat.clients.desc": "Полное управление контактами — email, телефон, адрес, заметки. Статистика по каждому клиенту.",
    "feat.invoices.title": "Счета",
    "feat.invoices.desc": "Профессиональные счета с предпросмотром. Налоги, скидки, условия оплаты. Черновик → отправлено → оплачено.",
    "feat.funnels.title": "Воронки",
    "feat.funnels.desc": "Кастомные Kanban-пайплайны для продаж, поиска работы, найма. Создавайте свои этапы.",
    "feat.reports.title": "Отчёты",
    "feat.reports.desc": "Визуальная разбивка по проектам и клиентам. Фильтры по датам. Оплачиваемое vs общее время.",
    "extras.title": "Также включено",
    "extras.keyboard": "Горячие клавиши — Space для старта, Esc для остановки, ⌘K палитра команд",
    "extras.speed": "Нулевая загрузка — всё мгновенно, работает локально в браузере",
    "extras.mobile": "Адаптивный дизайн для мобильных устройств",
    "extras.privacy": "Ваши данные остаются вашими — без облака, без трекинга",
    "pricing.title": "Простые цены",
    "pricing.desc": "Начните бесплатно. Обновляйтесь когда нужно больше.",
    "pricing.free": "Бесплатно",
    "pricing.forever": "/навсегда",
    "pricing.freeDesc": "Базовый учёт времени для фрилансеров.",
    "pricing.getStarted": "Начать",
    "pricing.pro": "Pro",
    "pricing.month": "/месяц",
    "pricing.proDesc": "Полная CRM для серьёзных фрилансеров.",
    "pricing.comingSoon": "Скоро",
    "pricing.joinWaitlist": "Присоединиться",
    "cta.title1": "Перестаньте платить за тайм-трекеры.",
    "cta.title2": "Начните контролировать свой рабочий процесс.",
    "cta.desc": "Logr — бесплатный, с открытым кодом, работает прямо в вашем браузере. Без регистрации, без кредитки.",
    "cta.open": "Открыть Logr",
    "cta.star": "Звезда на GitHub",
    "footer.builtBy": "Создал",
  },
};

const FREE_FEATURES: Record<Lang, string[]> = {
  en: ["Time tracking with timer", "Unlimited projects & clients", "Manual time entries", "Billable / non-billable", "Basic reports", "Keyboard shortcuts", "⌘K command palette", "Mobile responsive", "JSON export / import", "Open source (AGPL)"],
  uk: ["Облік часу з таймером", "Необмежені проєкти та клієнти", "Ручні записи часу", "Оплачуваний / неоплачуваний", "Базові звіти", "Гарячі клавіші", "⌘K палітра команд", "Мобільна адаптивність", "JSON експорт / імпорт", "Відкритий код (AGPL)"],
  ru: ["Учёт времени с таймером", "Неограниченные проекты и клиенты", "Ручные записи времени", "Оплачиваемое / неоплачиваемое", "Базовые отчёты", "Горячие клавиши", "⌘K палитра команд", "Мобильная адаптивность", "JSON экспорт / импорт", "Открытый код (AGPL)"],
};

const PRO_FEATURES: Record<Lang, string[]> = {
  en: ["Everything in Free", "Custom funnels (Kanban)", "Professional invoices", "Invoice live preview", "Tax & discount support", "Advanced reports", "PDF invoice export", "Payment integrations", "AI time entry (NL input)", "Weekly AI summary", "Multi-user / teams", "Priority support"],
  uk: ["Все з безкоштовного", "Кастомні воронки (Kanban)", "Професійні рахунки", "Попередній перегляд рахунків", "Податки та знижки", "Розширені звіти", "PDF експорт рахунків", "Інтеграція з оплатою", "AI введення часу", "Тижневий AI підсумок", "Мульти-юзер / команди", "Пріоритетна підтримка"],
  ru: ["Всё из бесплатного", "Кастомные воронки (Kanban)", "Профессиональные счета", "Предпросмотр счетов", "Налоги и скидки", "Расширенные отчёты", "PDF экспорт счетов", "Интеграция с оплатой", "AI ввод времени", "Еженедельный AI итог", "Мульти-юзер / команды", "Приоритетная поддержка"],
};

function detectLang(): Lang {
  const stored = localStorage.getItem("logr-lang") as Lang | null;
  if (stored && translations[stored]) return stored;
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith("uk")) return "uk";
  if (nav.startsWith("ru")) return "ru";
  return "en";
}

let currentLang: Lang = typeof window !== "undefined" ? detectLang() : "en";
let listeners: (() => void)[] = [];

export function getLang(): Lang { return currentLang; }

export function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem("logr-lang", lang);
  listeners.forEach((fn) => fn());
}

export function onLangChange(fn: () => void) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}

export function t(key: string): string {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

export function getFreeFeatures(): string[] { return FREE_FEATURES[currentLang]; }
export function getProFeatures(): string[] { return PRO_FEATURES[currentLang]; }
