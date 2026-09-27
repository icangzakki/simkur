# DESAIN.md --- Jobie Admin Dashboard

## 1. Ringkasan

Dokumen ini menerjemahkan referensi visual **Jobie Admin Dashboard UI**
menjadi spesifikasi desain yang dapat digunakan sebagai acuan
implementasi web dashboard modern.

**Karakter desain:** - Modern SaaS / Admin Dashboard - Clean, minimal,
profesional - Dominan putih dan abu-abu sangat muda - Sidebar ungu
sebagai identitas visual - Kartu statistik dengan warna cerah - Rounded
corners dan soft shadow - Tipografi sederhana dan mudah dibaca -
Desktop-first, tetapi tetap disiapkan agar responsif

------------------------------------------------------------------------

## 2. Struktur Halaman

``` text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Header / Topbar                                      │            │
│         ├────────────────────────────────────────────────────────┤            │
│         │ Statistic Cards                                       │            │
│         ├────────────────────────────────────────────────────────┤            │
│         │ Profile Card       │ Vacancy Stats / Chart            │            │
│         │                    │                                  │            │
│         ├────────────────────┴──────────────────────────────────┤            │
│         │ Recommended Jobs                                      │            │
│         ├────────────────────────────────────────────────────────┤            │
│         │ Featured Companies                                    │            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Komponen utama

1.  Sidebar navigasi
2.  Topbar/header
3.  Search bar
4.  Notification & message icon
5.  User profile mini-menu
6.  Statistic cards
7.  Profile summary card
8.  Vacancy statistics chart
9.  Recent activities
10. Recommended jobs
11. Featured companies

------------------------------------------------------------------------

## 3. Layout

### Desktop

-   Canvas referensi: sekitar **735 × 614 px**
-   Sidebar: sekitar **132 px** pada referensi
-   Konten utama menggunakan area fleksibel
-   Padding konten: sekitar `18–24 px`
-   Grid utama menggunakan gap sekitar `14–18 px`

Untuk implementasi pada desktop modern:

``` css
.dashboard {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
}

.main-content {
  padding: 24px;
}
```

Sidebar dapat dibuat lebih lebar pada implementasi aktual daripada
gambar referensi agar label navigasi tetap nyaman dibaca.

------------------------------------------------------------------------

## 4. Color Palette

### Primary

  Token             Warna       Penggunaan
  ----------------- ----------- ----------------------------
  `primary`         `#4B22B8`   Sidebar, active navigation
  `primary-dark`    `#35158F`   Hover / active accent
  `primary-light`   `#EDE7FF`   Background ringan

### Statistic Colors

  Token           Warna       Penggunaan
  --------------- ----------- ---------------------
  `stat-purple`   `#5135D8`   Interviews Schedule
  `stat-blue`     `#45A9E8`   Application Sent
  `stat-green`    `#20C985`   Profile Viewed
  `stat-lime`     `#8BCB3D`   Unread Message

### Neutral

  Token              Warna       Penggunaan
  ------------------ ----------- ---------------------
  `background`       `#F6F6F8`   Background halaman
  `surface`          `#FFFFFF`   Card
  `text-primary`     `#262626`   Heading
  `text-secondary`   `#777777`   Deskripsi
  `border`           `#EEEEEE`   Border halus
  `muted`            `#B8B8B8`   Secondary icon/text

### Chart

-   Application Sent: purple
-   Interviews: green/teal
-   Rejected: red
-   Grid: abu-abu sangat tipis

------------------------------------------------------------------------

## 5. Typography

Gunakan font sans-serif modern seperti:

``` text
Inter
Poppins
DM Sans
```

Rekomendasi:

  Elemen                   Size     Weight
  ------------------ ---------- ----------
  Page title           20--24px   600--700
  Section title        15--17px        600
  Card title           12--14px   500--600
  Statistic number     24--30px        700
  Body                 12--14px        400
  Caption              10--12px        400
  Navigation           11--13px        500

Gunakan line-height sekitar `1.4–1.6`.

------------------------------------------------------------------------

## 6. Sidebar

### Visual

Sidebar menggunakan warna ungu sebagai background utama.

``` text
┌──────────────────┐
│ ◉ Jobie          │
│                  │
│ 🏠 Dashboard     │  ← active
│ 🔍 Search Job    │
│ ✚ Applications   │
│ ✉ Message        │
│ ◉ Statistics     │
│ ▤ News           │
│                  │
│                  │
│ Jobie Job Portal │
│ Admin Dashboard  │
└──────────────────┘
```

### Logo

-   Logo Jobie berada di bagian atas.
-   Warna logo putih.
-   Ukuran sekitar `28–34px`.
-   Jarak dari sisi kiri sekitar `20px`.

### Navigation Item

Default:

``` css
.nav-item {
  height: 42px;
  padding: 0 16px;
  border-radius: 22px;
}
```

Active:

-   Background putih
-   Icon ungu
-   Text gelap
-   Bentuk pill
-   Sedikit shadow bila diperlukan

Hover:

-   Background ungu lebih terang
-   Text tetap putih

------------------------------------------------------------------------

## 7. Topbar

Topbar berada di bagian atas konten.

### Struktur

``` text
☰    Dashboard             [ Search something here... ]     🔔  💬  👤 User
```

### Search

-   Lebar sekitar `190–230px`
-   Height `34–38px`
-   Border-radius `20px`
-   Background `#EEEEF1`
-   Placeholder abu-abu
-   Icon search di sisi kanan

### User

Tampilkan:

-   Avatar
-   Nama
-   Role kecil, misalnya `Super Admin`

Pada referensi terdapat nama:

``` text
Oda Dink
Super Admin
```

------------------------------------------------------------------------

## 8. Statistic Cards

Gunakan grid 4 kolom pada desktop.

``` text
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Calendar     │ │ Briefcase    │ │ Profile      │ │ Mail         │
│ Interviews   │ │ Application  │ │ Profile      │ │ Unread       │
│ 86           │ │ 75           │ │ 45,673       │ │ 93           │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Spesifikasi

-   Border-radius: `10–14px`
-   Padding: `16px`
-   Height: sekitar `70–85px`
-   Icon dalam rounded square/circle
-   Angka besar di kanan/bawah
-   Label kecil
-   Warna berbeda untuk setiap card

### Data referensi

``` json
[
  {
    "title": "Interviews Schedule",
    "value": "86",
    "color": "#5135D8"
  },
  {
    "title": "Application Sent",
    "value": "75",
    "color": "#45A9E8"
  },
  {
    "title": "Profile Viewed",
    "value": "45,673",
    "color": "#20C985"
  },
  {
    "title": "Unread Message",
    "value": "93",
    "color": "#8BCB3D"
  }
]
```

------------------------------------------------------------------------

## 9. Profile Card

Card berada di sisi kiri area statistik utama.

### Isi

-   Circular profile image
-   Nama user
-   Jabatan
-   Skill progress
-   Recent activities

Referensi:

``` text
       ( Profile )
        Oda Dink
        Programer

    PHP      Vue     Laravel
    66%      31%       7%

Recent Activities
• Your application has accepted in 3 Vacancy
• Your application has accepted in 3 Vacancy
• Your application has accepted in 3 Vacancy
• Your application has accepted in 3 Vacancy
```

### Progress

Gunakan donut chart kecil:

-   PHP: 66%
-   Vue: 31%
-   Laravel: 7%

Untuk implementasi, persentase dapat disesuaikan dengan data sebenarnya.

------------------------------------------------------------------------

## 10. Vacancy Stats

Area chart menjadi komponen visual utama.

### Header

``` text
Vacancy Stats

Application Sent ●
Interviews ●
Rejected ▰

                         [ This Month ▼ ]
```

### Chart

Gunakan line chart:

-   X-axis: Week 01 sampai Week 10
-   Y-axis: jumlah aplikasi
-   Application Sent: purple
-   Interviews: green
-   Rejected: red/gray
-   Grid sangat tipis
-   Background putih

### Tooltip

Saat hover:

``` text
July 23, 2020

● 37 Application Sent
● 2 Interviews
```

Tooltip menggunakan white surface, rounded corners, dan soft shadow.

------------------------------------------------------------------------

## 11. Recommended Jobs

Gunakan horizontal card carousel/grid.

``` text
Recommended Jobs

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Company Logo   │ │ Company Logo   │ │ Company Logo   │
│                │ │                │ │                │
│ Database       │ │ Senior         │ │ Intern UX      │
│ Programmer     │ │ Programmer     │ │ Designer       │
│                │ │                │ │                │
│ $14,000-$25,000│ │ $14,000-$25,000│ │ $14,000-$25,000│
│                │ │                │ │                │
│ REMOTE         │ │ PART TIME      │ │ FULLTIME       │
└────────────────┘ └────────────────┘ └────────────────┘
```

### Job Card

-   Background putih
-   Border-radius: `10–14px`
-   Shadow ringan
-   Padding: `14–18px`
-   Company logo di kanan atas
-   Job title bold
-   Salary
-   Description 2--3 baris
-   Location
-   Employment type sebagai pill

### Job Types

-   `REMOTE`
-   `PART TIME`
-   `FULLTIME`

Pill menggunakan background pastel.

------------------------------------------------------------------------

## 12. Featured Companies

Section paling bawah menggunakan horizontal cards.

``` text
Featured Companies

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Logo         │ │ Logo         │ │ Logo         │ │ Logo         │
│ Herman-Carter│ │ Funk Inc.    │ │ Williamson   │ │ Donnelly Ltd.│
│ 21 Vacancy   │ │ 21 Vacancy   │ │ 21 Vacancy   │ │ 21 Vacancy   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

Card:

-   White background
-   Rounded corners
-   Logo square dengan radius `8–10px`
-   Company name
-   Jumlah vacancy
-   Horizontal scroll pada layar kecil

------------------------------------------------------------------------

## 13. Border Radius

Gunakan sistem radius konsisten:

``` css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-pill: 999px;
```

Rekomendasi:

-   Cards: `10–14px`
-   Search: `999px`
-   Navigation active: `999px`
-   Badge: `999px`
-   Avatar: `50%`

------------------------------------------------------------------------

## 14. Shadow

Desain menggunakan shadow yang sangat lembut.

``` css
box-shadow:
  0 4px 16px rgba(0, 0, 0, 0.06);
```

Untuk card yang lebih menonjol:

``` css
box-shadow:
  0 8px 24px rgba(0, 0, 0, 0.08);
```

Hindari shadow terlalu gelap.

------------------------------------------------------------------------

## 15. Iconography

Gunakan icon style outline/rounded.

Rekomendasi library:

-   Lucide Icons
-   Phosphor Icons
-   Heroicons

Icon yang diperlukan:

-   Menu
-   Home
-   Search
-   Briefcase
-   Mail
-   Bar Chart
-   Newspaper
-   Calendar
-   Bell
-   User
-   Chevron Down
-   Arrow Right
-   Check / Activity

Ukuran:

``` text
Navigation: 16–18px
Card: 20–24px
Topbar: 18–20px
```

------------------------------------------------------------------------

## 16. Responsive Design

### Desktop ≥ 1200px

``` text
Sidebar fixed
4 statistic cards
2-column main content
3 recommended job cards
4 featured company cards
```

### Tablet 768--1199px

``` text
Sidebar dapat diperkecil
4 statistic cards → 2 × 2
Profile + chart tetap 1–2 kolom sesuai lebar
Recommended jobs → 2 kolom
```

### Mobile \< 768px

``` text
Sidebar → drawer/off-canvas
Statistic cards → 1 kolom atau 2 kolom kecil
Profile card → full width
Chart → full width dengan horizontal scroll jika diperlukan
Recommended jobs → horizontal scroll
Featured companies → horizontal scroll
```

------------------------------------------------------------------------

## 17. Component Tree

Contoh struktur React:

``` text
<App>
 ├── <DashboardLayout>
 │    ├── <Sidebar>
 │    │    ├── <Logo>
 │    │    └── <Navigation>
 │    │
 │    ├── <MainContent>
 │    │    ├── <Topbar>
 │    │    │    ├── <SearchBar>
 │    │    │    ├── <Notifications>
 │    │    │    └── <UserMenu>
 │    │    │
 │    │    ├── <StatsGrid>
 │    │    │    └── <StatCard />
 │    │    │
 │    │    ├── <DashboardGrid>
 │    │    │    ├── <ProfileCard>
 │    │    │    └── <VacancyStats>
 │    │    │
 │    │    ├── <RecommendedJobs>
 │    │    │    └── <JobCard />
 │    │    │
 │    │    └── <FeaturedCompanies>
 │    │         └── <CompanyCard />
```

------------------------------------------------------------------------

## 18. Suggested Tailwind Structure

Jika menggunakan React + Tailwind:

``` text
src/
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── StatCard.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── VacancyStats.jsx
│   │   ├── JobCard.jsx
│   │   └── CompanyCard.jsx
│   │
│   └── ui/
│       ├── Badge.jsx
│       ├── Avatar.jsx
│       └── IconButton.jsx
│
├── pages/
│   └── Dashboard.jsx
│
└── data/
    └── dashboardData.js
```

------------------------------------------------------------------------

## 19. UX Interaction

### Navigation

-   Active menu terlihat jelas.
-   Hover memberikan feedback visual.
-   Mobile menggunakan drawer.

### Cards

-   Hover sedikit naik:

``` css
transform: translateY(-2px);
transition: all 180ms ease;
```

-   Jangan menggunakan animasi berlebihan.

### Chart

-   Tooltip muncul ketika pointer diarahkan ke titik data.
-   Legend dapat digunakan untuk toggle series.

### Carousel

-   Tombol next/previous pada desktop.
-   Swipe horizontal pada mobile.

------------------------------------------------------------------------

## 20. Accessibility

Wajib diperhatikan:

-   Contrast text yang cukup
-   Semua icon button memiliki `aria-label`
-   Navigation menggunakan semantic `<nav>`
-   Card bukan hanya mengandalkan warna
-   Focus state terlihat jelas
-   Chart memiliki alternatif data/table untuk screen reader

Contoh:

``` html
<button aria-label="Open notifications">
  ...
</button>
```

------------------------------------------------------------------------

## 21. Data Model Dashboard

Contoh data:

``` js
const dashboardStats = [
  {
    id: "interviews",
    label: "Interviews Schedule",
    value: 86
  },
  {
    id: "applications",
    label: "Application Sent",
    value: 75
  },
  {
    id: "profile",
    label: "Profile Viewed",
    value: 45673
  },
  {
    id: "messages",
    label: "Unread Message",
    value: 93
  }
];
```

Job:

``` js
const recommendedJobs = [
  {
    company: "Maximor Team",
    title: "Database Programmer",
    salary: "$14,000 - $25,000",
    type: "REMOTE",
    location: "London, England"
  },
  {
    company: "Klean n Clin Studios",
    title: "Senior Programmer",
    salary: "$14,000 - $25,000",
    type: "PART TIME",
    location: "Manchester, England"
  },
  {
    company: "Maximor Team",
    title: "Intern UX Designer",
    salary: "$14,000 - $25,000",
    type: "FULLTIME",
    location: "London, England"
  }
];
```

------------------------------------------------------------------------

## 22. Design Principles

1.  **Information hierarchy harus jelas.**
2.  Statistik penting berada di bagian atas.
3.  Gunakan whitespace yang cukup.
4.  Jangan memenuhi card dengan terlalu banyak teks.
5.  Purple menjadi primary brand color.
6.  Warna cerah hanya digunakan untuk membedakan kategori/data.
7.  Gunakan shadow lembut.
8.  Semua card memiliki radius konsisten.
9.  Chart menjadi visual utama, tetapi tidak mengalahkan informasi
    penting.
10. Dashboard harus terasa ringan dan cepat dipahami dalam sekali lihat.

------------------------------------------------------------------------

## 23. Implementasi yang Disarankan

Stack yang cocok untuk mereplikasi desain:

``` text
React
Tailwind CSS
Lucide React
Recharts
Vite
```

Jika membutuhkan backend:

``` text
Supabase
 ├── Authentication
 ├── PostgreSQL
 ├── Storage
 └── Row Level Security
```

Struktur desain ini dapat dikembangkan menjadi dashboard admin lengkap
dengan data dinamis tanpa mengubah visual utama dari referensi.
