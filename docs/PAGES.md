# Logr — Pages & Features

Документація по кожній сторінці: що є, що треба додати.

✅ = готово | 🔲 = треба зробити | 🔜 = після Supabase

---

## 1. Dashboard `/`

**Мета:** Швидкий огляд всього — перше що бачиш при вході.

### ✅ Зроблено
- Today / This Week time stats
- Unpaid / Earned invoice totals
- Quick links: Projects, Clients, Invoices (з каунтерами)
- Recent activity (останні 5 entries)
- Top projects this week (progress bars)

### 🔲 Треба додати
- [ ] Greeting з ім'ям юзера (з Settings)
- [ ] Running timer indicator (якщо таймер запущений — показати)
- [ ] Overdue invoices alert
- [ ] Quick start: кнопка "Start Timer" прямо з dashboard
- [ ] This month earnings vs last month (% change)
- [ ] Empty state з onboarding steps для нових юзерів

---

## 2. Timer `/timer`

**Мета:** Головний робочий інструмент — трекінг часу.

### ✅ Зроблено
- Start / Pause / Stop
- Вибір проекту
- Збереження entry з description, project, duration
- Today's entries list

### 🔲 Треба додати
- [ ] Edit time entry (description, duration, project)
- [ ] Delete time entry
- [ ] Manual entry (додати час без таймера)
- [ ] Entry grouping by date (Today / Yesterday / Earlier)
- [ ] Duration editing inline (click on time → edit)
- [ ] Keyboard shortcuts: Space = start/stop, Escape = discard
- [ ] Billable / non-billable toggle per entry
- [ ] Tags / labels on entries
- [ ] Week view — time entries за тиждень

### 🔜 Після Supabase
- [ ] Persistence (entries зберігаються після reload)
- [ ] Sync across devices
- [ ] Offline support + sync queue

---

## 3. Projects `/projects`

**Мета:** Організація роботи по проектах.

### ✅ Зроблено
- Create / Edit / Delete project
- Color dot (auto-assigned)
- Hourly rate per project
- Client assignment
- Project count

### 🔲 Треба додати
- [ ] Project status (active / archived / completed)
- [ ] Total hours tracked per project
- [ ] Total earned per project
- [ ] Budget (estimated hours or fixed price)
- [ ] Budget progress bar (tracked vs estimated)
- [ ] Project color picker (замість auto)
- [ ] Notes / description field
- [ ] Filter: active / archived / all
- [ ] Sort: by name / by recent activity / by hours

### 🔜 Після Supabase
- [ ] Project detail page `/projects/:id` з entries, stats, invoices
- [ ] Team members per project (multi-user)

---

## 4. Clients `/clients`

**Мета:** База клієнтів — для інвойсів та звітів.

### ✅ Зроблено
- Create / Edit / Delete client
- Name, Email, Company

### 🔲 Треба додати
- [ ] Phone number
- [ ] Address (для інвойсів)
- [ ] Notes field
- [ ] Total hours worked for client
- [ ] Total invoiced / paid / outstanding
- [ ] Associated projects list
- [ ] Client status (active / inactive)
- [ ] Avatar / initials circle
- [ ] Contact info quick copy (email, phone)

### 🔜 Після Supabase
- [ ] Client detail page `/clients/:id`
- [ ] Communication log

---

## 5. Invoices `/invoices`

**Мета:** Створення інвойсів та трекінг оплат.

### ✅ Зроблено
- Create invoice з line items (description, hours, rate)
- Summary cards: Draft / Outstanding / Paid
- Status flow: Draft → Sent → Paid
- Client selection
- Due date
- Notes field
- Delete invoice

### 🔲 Треба додати
- [ ] Edit invoice (items, client, dates, notes)
- [ ] Invoice preview / PDF generation
- [ ] Auto-fill from time entries (select entries → generate invoice)
- [ ] Invoice number з prefix із Settings
- [ ] Tax rate (per invoice or global)
- [ ] Discount field (% or fixed)
- [ ] Subtotal / Tax / Discount / Total breakdown
- [ ] Overdue auto-detection (status → overdue коли past due date)
- [ ] Filter by status (draft / sent / paid / overdue / all)
- [ ] Sort by date / amount / status
- [ ] Duplicate invoice
- [ ] Mark as overdue button
- [ ] Payment date tracking (коли оплачено)
- [ ] Currency per invoice (з Settings default)
- [ ] Your info on invoice (name, company, address з Settings)

### 🔜 Після Supabase
- [ ] PDF export / download
- [ ] Send invoice via email
- [ ] Payment link integration (Stripe / PayPal)
- [ ] Recurring invoices
- [ ] Invoice templates

---

## 6. Reports `/reports`

**Мета:** Аналітика часу та грошей.

### ✅ Зроблено
- Summary: Today / This Week / All Time
- Bar chart: last 7 days
- Breakdown by project (progress bars, %)

### 🔲 Треба додати
- [ ] Date range picker (this week / this month / custom range)
- [ ] Filter by project
- [ ] Filter by client
- [ ] Breakdown by client
- [ ] Earnings report (hours × rate per project)
- [ ] Billable vs non-billable ratio
- [ ] Average hours per day
- [ ] Comparison: this week vs last week
- [ ] Monthly overview (calendar heatmap or bar chart)
- [ ] Export report as CSV

### 🔜 Після Supabase
- [ ] Historical data (months, years)
- [ ] Team reports (multi-user)

---

## 7. Settings `/settings`

**Мета:** Профіль і налаштування додатку.

### ✅ Зроблено
- Profile: name, email, company, address
- Billing: default hourly rate, currency (USD/EUR/GBP/UAH/PLN)
- Invoice: prefix, payment terms, default notes
- Data: export JSON, clear all

### 🔲 Треба додати
- [ ] Import data (JSON)
- [ ] Date format preference (DD/MM/YYYY vs MM/DD/YYYY)
- [ ] Time format (24h vs 12h)
- [ ] Week starts on (Monday vs Sunday)
- [ ] Default project for new entries
- [ ] Notification preferences (email reminders for overdue invoices)
- [ ] Logo upload (для інвойсів)

### 🔜 Після Supabase
- [ ] Auth: sign up / login / logout / forgot password
- [ ] Account deletion
- [ ] Subscription / plan management
- [ ] Connected accounts (Google, GitHub)

---

## Global / Cross-page

### 🔲 Треба додати
- [ ] Toast notifications (saved, deleted, error)
- [ ] Confirm dialog для destructive actions
- [ ] Search (global — across entries, projects, clients)
- [ ] Responsive mobile layout
- [ ] Loading states / skeletons
- [ ] Error boundaries
- [ ] 404 page
- [ ] Breadcrumbs або page title в header
- [ ] Command palette (Cmd+K) — quick navigation

### 🔜 Після Supabase
- [ ] Auth flow (login / signup / protected routes)
- [ ] Onboarding wizard (first time)
- [ ] Landing page (окремо на Astro)

---

## Порядок роботи

**Фаза 1 — MVP Polish (зараз, local state):**
1. Timer: edit/delete entries, manual entry
2. Invoices: edit, auto-fill from entries, tax/discount
3. Projects: status, budget, total hours
4. Clients: address, totals, notes
5. Reports: date range, filters, earnings
6. Dashboard: running timer, overdue alerts
7. Global: toasts, confirm dialogs, 404, responsive

**Фаза 2 — Supabase Integration:**
1. Auth (signup/login/logout)
2. Database schema + migration
3. Replace useStore → Supabase queries
4. Real-time sync
5. Row Level Security

**Фаза 3 — Pro Features (paid tier):**
1. Invoice PDF generation + email
2. Recurring invoices
3. Payment integrations
4. AI features (NL time entry, weekly summary, insights)
5. Team / multi-user

---

_Оновлюй цей файл коли фіча готова — змінюй 🔲 на ✅._
