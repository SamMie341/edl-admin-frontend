# EDL Public Web Portal (`edl-web`) Specification & Implementation Guide
> **ເອກະສານກຳນົດໂຄງສ້າງ ແລະ ແນວທາງການພັດທະນາເວັບໄຊຫຼັກລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL Public Website)**  
> ສຳລັບນຳຂໍ້ມູນຈາກລະບົບ **`edl-admin`** ແລະ Backend API ມາສະແດງຜົນສູ່ສາທາລະນະ.

---

## 1. ພາບລວມໂຄງການ (Project Overview)

ໂຄງການ **`edl-web`** ແມ່ນເວັບໄຊຫຼັກ (Public Portal) ຂອງລັດວິສາຫະກິດໄຟຟ້າລາວ (Electricite du Laos - EDL) ເພື່ອບໍລິການຂໍ້ມູນຂ່າວສານ, ໂຄງຮ່າງການຈັດຕັ້ງ, ວິໄສທັດ-ພາລະກິດ, ອັດຕາຄ່າກະແສໄຟຟ້າ, ວາລະສານ, ຄວາມຮູ້ເລື່ອງໄຟຟ້າ, ການຈັດຊື້-ຈັດຈ້າງ, ຮັບສະໝັກພະນັກງານ, ແລະ ຈຸດບໍລິການແກ່ປະຊາຊົນທົ່ວໄປ.

### ເປົ້າໝາຍຫຼັກ:
1. **Direct Data Integration:** ເຊື່ອມຕໍ່ດຶງຂໍ້ມູນຈາກ Backend API ທີ່ຈັດການໂດຍ **`edl-admin`** ມາສະແດງຜົນອັດຕະໂນມັດ.
2. **SEO & Performance First:** ຮອງຮັບ Search Engine Optimization (SEO), OpenGraph Meta Tags ສຳລັບແຊລົງ Facebook/Social Media, ແລະ ໂຫຼດໄວດ້ວຍ Next.js Server-Side Rendering (SSR) / Incremental Static Regeneration (ISR).
3. **Multi-device & Responsive:** ອອກແບບສະອາດ, ທັນສະໄໝ, ເຂົ້າກັບເອກະລັກຂອງ ຟຟລ (ສີຟ້າ-ເຫຼືອງຄຳ-ຂາວ) ແລະ ຮອງຮັບມືຖື/ແທັບເລັດ 100%.
4. **Bilingual:** ຮອງຮັບພາສາລາວ (Lao - ຫຼັກ) ແລະ ພາສາອັງກິດ (English).

---

## 2. ສະຖາປັດຕະຍະກຳ ແລະ ເທັກໂນໂລຢີ (Tech Stack Recommended)

| ສ່ວນປະກອບ | ເທັກໂນໂລຢີທີ່ແນະນຳ | ເຫດຜົນ |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15+ (App Router)** | ເໝາະສຳລັບ Public Web ທີ່ຕ້ອງການ SEO, Fast First Contentful Paint, ແລະ ISR |
| **Language** | **TypeScript** | Type-safety ກົງກັບ DTO ແລະ Entity ຂອງ Backend |
| **Styling** | **Tailwind CSS + Tailwind Typography** | ຈັດການ Styling ງ່າຍ, ຮອງຮັບ Rich Text HTML (`prose`) ຂອງ TipTap |
| **Icons** | **Lucide React** | ນ້ຳໜັກເບົາ, ຮອງຮັບ icon ທີ່ກົງກັບຝັ່ງ admin |
| **HTTP Client** | **Native Fetch with `next.revalidate`** ຫຼື **Axios** | ໃຊ້ Next.js Caching/ISR ເພື່ອຫຼຸດພາລະ Backend |
| **Typography** | **Noto Sans Lao, Noto Serif Lao** | ຟອນມາດຕະຖານອ່ານງ່າຍສຳລັບພາສາລາວ |
| **Image & PDF** | **Next/Image & PDF Embedder** | ຈັດການຮູບພາບ Responsive ແລະ ເປີດອ່ານເອກະສານ PDF |

---

## 3. ການເຊື່ອມຕໍ່ລະບົບ ແລະ Environment Variables (`.env.local`)

ໄຟລ໌ `.env.local` ສຳລັບໂຄງການ `edl-web`:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=https://uat-web-admin.edl.com.la/api/v1

# Storage Media Base URL (ສຳລັບໂຫຼດຮູບພາບ ແລະ ເອກະສານ /uploads/...)
NEXT_PUBLIC_STORAGE_URL=https://uat-web-admin.edl.com.la

# ເວັບໄຊ URL ຫຼັກ (ສຳລັບ SEO Canonical & OpenGraph URL)
NEXT_PUBLIC_SITE_URL=https://www.edl.com.la

# ເວລາ Cache Revalidation (ວິນາທີ) ສຳລັບ ISR
REVALIDATE_TIME=60
```

---

## 4. ໂຄງສ້າງ Route ຂອງເວັບໄຊ (`edl-web` Sitemap)

```
edl-web/
├── app/
│   ├── layout.tsx                     # Global Header, Navigation Bar, Footer, Lao Font
│   ├── page.tsx                       # ໜ້າຫຼັກ (Home Page)
│   │
│   ├── about/                         # ກ່ຽວກັບພວກເຮົາ (About EDL)
│   │   ├── history/page.tsx           # ປະຫວັດຄວາມເປັນມາ
│   │   ├── vision-mission/page.tsx    # ວິໄສທັດ, ພາລະກິດ, ຄ່ານິຍົມ (ຈາກ /vision-missions)
│   │   └── organization/page.tsx      # ໂຄງຮ່າງການຈັດຕັ້ງ (ຈາກ /org-structures)
│   │
│   ├── news/                          # ຂ່າວສານ ແລະ ກິດຈະກຳ (News & Media)
│   │   ├── page.tsx                   # ລາຍການຂ່າວທັງໝົດ (Filter ຕາມ Category, Search, Pagination)
│   │   └── [id]/page.tsx              # ລາຍລະອຽດຂ່າວ (Rich Text Content, Gallery, Share)
│   │
│   ├── media/                         # ສື່ສິ່ງພິມ ແລະ ວາລະສານ (Publications)
│   │   ├── magazines/page.tsx         # ວາລະສານ ຟຟລ (PDF Viewer / Download)
│   │   └── electrical-knowledge/      # ຄວາມຮູ້ເລື່ອງໄຟຟ້າ (Safety, Saving Tips)
│   │       ├── page.tsx               # ລາຍການບົດຄວາມ
│   │       └── [id]/page.tsx          # ອ່ານບົດຄວາມຄວາມຮູ້
│   │
│   ├── services/                      # ບໍລິການ ແລະ ອັດຕາໄຟຟ້າ (Customer Services)
│   │   ├── tariffs/page.tsx           # ອັດຕາຄ່າກະແສໄຟຟ້າ (ຕາຕະລາງ, ເອກະສານ PDF ດາວໂຫຼດ)
│   │   ├── tariff-calculator/page.tsx # ໂປຣແກຣມຄຳນວນຄ່າໄຟຟ້າເບື້ອງຕົ້ນ
│   │   └── branches/page.tsx          # ສາຂາ ແລະ ສູນບໍລິການ (ຄົ້ນຫາຕາມ ແຂວງ/ເມືອງ, ເບີໂທ, ແຜນທີ່)
│   │
│   ├── procurements/                  # ການຈັດຊື້-ຈັດຈ້າງ (Procurements & Bidding)
│   │   ├── page.tsx                   # ລາຍການປະກາດປະມູນ / ຈັດຊື້
│   │   └── [id]/page.tsx              # ລາຍລະອຽດ ແລະ ດາວໂຫຼດຟອມ TOR
│   │
│   ├── careers/                       # ຮັບສະໝັກພະນັກງານ (Job Opportunities)
│   │   ├── page.tsx                   # ລາຍການຕຳແໜ່ງງານທີ່ເປີດຮັບ
│   │   └── [id]/page.tsx              # ລາຍລະອຽດເງື່ອນໄຂ ແລະ ວິທີສະໝັກ
│   │
│   ├── legislations/page.tsx          # ນິຕິກຳ ແລະ ດຳລັດ (Laws, Decrees, Policies)
│   └── contact/page.tsx               # ຕິດຕໍ່ພວກເຮົາ, ສາຍດ່ວນ 1199, ຟອມຮ້ອງຮຽນ/ຄຳເຫັນ
```

---

## 5. ການຈັບຄູ່ API ຈາກ `edl-admin` ສູ່ໜ້າສະແດງຜົນ `edl-web`

| ໜ້າເວັບໄຊ (`edl-web`) | Backend Endpoint (`GET`) | ຂໍ້ມູນທີ່ນຳມາສະແດງຜົນ | ຮູບແບບການສະແດງຜົນ |
| :--- | :--- | :--- | :--- |
| **1. ໜ້າຫຼັກ (Home Page)** | `GET /news?limit=6`<br>`GET /vision-missions`<br>`GET /magazines?limit=3` | Hero News, ວິໄສທັດສັ້ນ, ວາລະສານຫຼ້າສຸດ, ຂ່າວເດັ່ນ | Slider Banner, Quick Action Cards, News Grid |
| **2. ວິໄສທັດ-ພາລະກິດ** | `GET /vision-missions` | ວິໄສທັດ (Vision), ພາລະກິດ (Mission), ຄ່ານິຍົມ | Icon Cards, Quote Box, ຮູບພາບປະກອບ |
| **3. ໂຄງຮ່າງການຈັດຕັ້ງ** | `GET /org-structures` | - `BOARD_OF_DIRECTORS`<br>- `EXECUTIVE_BOARD`<br>- `ORG_STRUCTURE` | **ສະແດງຮູບແຜນຜັງຄຸນນະພາບສູງທີ່ Export ຈາກ Canvas** ຫຼື Interactive Hierarchy Tree |
| **4. ຂ່າວສານທັງໝົດ** | `GET /news`<br>`GET /news-categories`<br>`GET /news-tags` | ລາຍການຂ່າວ, ໝວດໝູ່, ປ້າຍກຳກັບ, ຍອດວິວ, ວັນທີ | Grid Layout, Category Filter Tabs, Search Bar, Pagination |
| **5. ລາຍລະອຽດຂ່າວ** | `GET /news/:id`<br>`POST /news/:id/view` (ນັບຍອດວິວ) | ຫົວຂໍ້, ຮູບໜ້າປົກ, ເນື້ອໃນ Rich Text, Gallery ຮູບ, ວັນທີ | Header ຮູບໃຫຍ່, TipTap Content (`prose`), Image Lightbox, ປຸ່ມ Share Social |
| **6. ວາລະສານ ຟຟລ** | `GET /magazines`<br>`GET /magazines/:id/download` | ຊື່ວາລະສານ, ເຫຼັ້ມທີ, ຮູບໜ້າປົກ, ໄຟລ໌ PDF, ຍອດດາວໂຫຼດ | Book Cover 3D Card, ປຸ່ມ "ອ່ານອອນລາຍ", ປຸ່ມ "ດາວໂຫຼດ PDF" |
| **7. ຄວາມຮູ້ເລື່ອງໄຟຟ້າ** | `GET /electrical-knowledge` | ບົດຄວາມການປະຢັດໄຟ, ຄວາມປອດໄພ, ລະບຽບການໃຊ້ໄຟ | Article Cards, Step-by-step Guides, Infographics |
| **8. ອັດຕາຄ່າໄຟຟ້າ** | `GET /electricity-tariffs` | ປະເພດຜູ້ຊົມໃຊ້ (ທີ່ຢູ່ອາໄສ, ທຸລະກິດ, ອຸດສາຫະກຳ), ອັດຕາລາຄາ, ໄຟລ໌ PDF ປະກາດທາງການ | ຕາຕະລາງປຽບທຽບອັດຕາລາຄາ, ປຸ່ມດາວໂຫຼດດຳລັດ/ແຈ້ງການ PDF |
| **9. ສາຂາ ແລະ ສູນບໍລິການ** | `GET /branches`<br>`GET /service-centers`<br>`GET /provinces`<br>`GET /districts` | ຊື່ສາຂາ, ທີ່ຕັ້ງ, ເບີໂທຕິດຕໍ່, ສາຍດ່ວນ, ພິກັດແຜນທີ່ Google Maps | Dropdown ເລືອກແຂວງ/ເມືອງ, ລາຍການບັດຕິດຕໍ່, ປຸ່ມກົດໂທອອກ, ແຜນທີ່ |
| **10. ການຈັດຊື້-ຈັດຈ້າງ** | `GET /procurements` | ຫົວຂໍ້ປະມູນ, ເລກທີສັນຍາ, ວັນໝົດກຳນົດ, ສະຖານະ, ໄຟລ໌ TOR | ຕາຕະລາງປະກາດ, Badge ສະຖານະ (ເປີດຮັບ/ປິດຮັບ), ປຸ່ມດາວໂຫຼດເອກະສານ |
| **11. ຮັບສະໝັກພະນັກງານ** | `GET /job-postings`<br>`GET /positions` | ຕຳແໜ່ງ, ພະແນກ, ຈຳນວນທີ່ຮັບ, ເງື່ອນໄຂ, ວັນປິດຮັບ | Job Card, Countdown ວັນປິດຮັບ, ປຸ່ມດາວໂຫຼດຟອມສະໝັກ |
| **12. ນິຕິກຳ ແລະ ດຳລັດ** | `GET /legislations` | ຊື່ກົດໝາຍ/ດຳລັດ, ວັນທີປະກາດ, ເລກທີ, ໄຟລ໌ PDF | Filter ຕາມປະເພດນິຕິກຳ, ຕາຕະລາງຄົ້ນຫາ, ດາວໂຫຼດ PDF |

---

## 6. ຕົວຢ່າງ Code ສຳຄັນສຳລັບ `edl-web`

### 6.1. File URL Resolver (`src/lib/api.ts`)
ສຳລັບແປງ path ຮູບເຊັ່ນ `/uploads/news/...` ໃຫ້ເປັນ Full URL:

```typescript
// src/lib/api.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://uat-web-admin.edl.com.la/api/v1';
export const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://uat-web-admin.edl.com.la';

export function getStorageUrl(path?: string | null): string {
  if (!path) return '/images/placeholder.png';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanBase = STORAGE_BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    next: { revalidate: Number(process.env.REVALIDATE_TIME) || 60 },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch API from ${endpoint}: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}
```

---

### 6.2. Rich Text HTML Renderer (`src/components/rich-text-renderer.tsx`)
ສຳລັບສະແດງຜົນເນື້ອໃນຂ່າວ ແລະ ຄວາມຮູ້ທີ່ບັນທຶກຈາກ TipTap Editor ໃຫ້ສວຍງາມ ແລະ ບໍ່ມີບັນຫາ Bullet / ຍະຫວ່າງ:

```tsx
// src/components/rich-text-renderer.tsx
import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) return null;

  return (
    <div
      className={`prose prose-slate max-w-none 
        prose-headings:text-slate-900 prose-headings:font-bold
        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
        prose-img:rounded-2xl prose-img:shadow-md prose-img:my-6
        prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-li:my-1
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
        prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:pl-4 prose-blockquote:italic
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
```

---

### 6.3. ໜ້າສະແດງໂຄງຮ່າງການຈັດຕັ້ງ (`src/app/about/organization/page.tsx`)
ດຶງຮູບແຜນຜັງທີ່ມີຄວາມລະອຽດສູງທີ່ຜູ້ດູແລລະບົບອອກແບບໄວ້ມາສະແດງຜົນ:

```tsx
// src/app/about/organization/page.tsx
import Image from 'next/image';
import { fetchFromApi, getStorageUrl } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrgStructure {
  id: number;
  structureType: 'BOARD_OF_DIRECTORS' | 'EXECUTIVE_BOARD' | 'ORG_STRUCTURE';
  structureName: string;
  imageUrl: string;
  orderIndex: number;
}

export const metadata = {
  title: 'ໂຄງຮ່າງການຈັດຕັ້ງ | ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)',
  description: 'ໂຄງຮ່າງການຈັດຕັ້ງ ສະພາຜູ້ອຳນວຍການ, ຄະນະຜູ້ບໍລິຫານ ແລະ ແຜນຜັງລວມ ຟຟລ',
};

export default async function OrganizationPage() {
  const structures = await fetchFromApi<OrgStructure[]>('/org-structures');

  const board = structures.find((s) => s.structureType === 'BOARD_OF_DIRECTORS');
  const exec = structures.find((s) => s.structureType === 'EXECUTIVE_BOARD');
  const general = structures.find((s) => s.structureType === 'ORG_STRUCTURE');

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          ໂຄງຮ່າງການຈັດຕັ້ງ ລັດວິສາຫະກິດໄຟຟ້າລາວ
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          ຂໍ້ມູນໂຄງສ້າງການບໍລິຫານງານ, ສະພາຜູ້ອຳນວຍການ ແລະ ຄະນະຜູ້ບໍລິຫານ ຟຟລ
        </p>
      </div>

      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto mb-8">
          <TabsTrigger value="board">ສະພາຜູ້ອຳນວຍການ</TabsTrigger>
          <TabsTrigger value="exec">ຄະນະຜູ້ບໍລິຫານ</TabsTrigger>
          <TabsTrigger value="general">ໂຄງຮ່າງການຈັດຕັ້ງລວມ</TabsTrigger>
        </TabsList>

        {/* 1. ສະພາຜູ້ອຳນວຍການ */}
        <TabsContent value="board" className="bg-white p-6 rounded-3xl border shadow-sm">
          {board?.imageUrl ? (
            <div className="relative w-full overflow-hidden rounded-2xl flex justify-center">
              <img
                src={getStorageUrl(board.imageUrl)}
                alt={board.structureName}
                className="w-full h-auto object-contain max-h-[850px]"
              />
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400">ກຳລັງອັບເດດຂໍ້ມູນ...</p>
          )}
        </TabsContent>

        {/* 2. ຄະນະຜູ້ບໍລິຫານ */}
        <TabsContent value="exec" className="bg-white p-6 rounded-3xl border shadow-sm">
          {exec?.imageUrl ? (
            <div className="relative w-full overflow-hidden rounded-2xl flex justify-center">
              <img
                src={getStorageUrl(exec.imageUrl)}
                alt={exec.structureName}
                className="w-full h-auto object-contain max-h-[850px]"
              />
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400">ກຳລັງອັບເດດຂໍ້ມູນ...</p>
          )}
        </TabsContent>

        {/* 3. ໂຄງຮ່າງການຈັດຕັ້ງລວມ */}
        <TabsContent value="general" className="bg-white p-6 rounded-3xl border shadow-sm">
          {general?.imageUrl ? (
            <div className="relative w-full overflow-hidden rounded-2xl flex justify-center">
              <img
                src={getStorageUrl(general.imageUrl)}
                alt={general.structureName}
                className="w-full h-auto object-contain max-h-[850px]"
              />
            </div>
          ) : (
            <p className="text-center py-12 text-slate-400">ກຳລັງອັບເດດຂໍ້ມູນ...</p>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
```

---

### 6.4. Dynamic SEO Metadata ສຳລັບລາຍລະອຽດຂ່າວ (`src/app/news/[id]/page.tsx`)

```tsx
// src/app/news/[id]/page.tsx
import { Metadata } from 'next';
import { fetchFromApi, getStorageUrl } from '@/lib/api';
import { RichTextRenderer } from '@/components/rich-text-renderer';
import { Calendar, Eye } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  coverImage?: string;
  category?: { name: string };
  viewsCount: number;
  createdAt: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const news = await fetchFromApi<NewsItem>(`/news/${params.id}`);
  const coverUrl = getStorageUrl(news.coverImage);

  return {
    title: `${news.title} | ຂ່າວສານ ຟຟລ`,
    description: news.title,
    openGraph: {
      title: news.title,
      description: news.title,
      images: [
        {
          url: coverUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const news = await fetchFromApi<NewsItem>(`/news/${params.id}`);

  return (
    <article className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Category & Date */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        {news.category && (
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            {news.category.name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(news.createdAt).toLocaleDateString('lo-LA')}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {news.viewsCount || 0} ຄັ້ງ
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight mb-6">
        {news.title}
      </h1>

      {/* Cover Image */}
      {news.coverImage && (
        <div className="w-full h-[400px] md:h-[480px] relative rounded-3xl overflow-hidden mb-8 shadow-sm">
          <img
            src={getStorageUrl(news.coverImage)}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Rendered Safely */}
      <RichTextRenderer content={news.content} />
    </article>
  );
}
```

---

### 6.5. ແນວທາງການປັບປຸງ Mobile Responsive & Touch Gestures
ເພື່ອໃຫ້ເວັບໄຊ `edl-web` ສະແດງຜົນ ແລະ ໃຊ້ງານໄດ້ດີທີ່ສຸດເທິງມືຖື:
1. **Org Chart Zoom & Pan ເທິງມືຖື:**
   - ຮູບແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງຄວນຮອງຮັບການແຕະສອງເທື່ອ (Double Tap) ຫຼື Pinch-to-zoom (ສາມາດໃຊ້ library ເຊັ່ນ `react-zoom-pan-pinch`).
   - ໃສ່ປຸ່ມ "ກົດເບິ່ງຮູບເຕັມ" (`Open Fullscreen Modal`) ເພື່ອໃຫ້ຜູ້ໃຊ້ມືຖືສາມາດຊູມອ່ານຊື່ ແລະ ຕຳແໜ່ງໄດ້ສະດວກ.
2. **ຕາຕະລາງອັດຕາໄຟຟ້າ ແລະ ປະກາດປະມູນ:**
   - ຫຸ້ມ `<table>` ດ້ວຍ `<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">` ເພື່ອໃຫ້ເລື່ອນຊ້າຍ-ຂວາໄດ້ສະດວກເທິງໜ້າຈໍແຄບ.
3. **ຂະໜາດປຸ່ມກົດ (Touch Targets):**
   - ປຸ່ມກົດທຸກປຸ່ມຄວນມີຄວາມສູງຢ່າງໜ້ອຍ `min-h-[40px]` ເພື່ອໃຫ້ສາມາດກົດດ້ວຍນິ້ວມືໄດ້ງ່າຍ.
4. **Header Navigation ເທິງມືຖື:**
   - ໃຊ້ Mobile Drawer ຫຼື Sheet ເມນູ (`lucide-react Menu / X`) ເມື່ອໜ້າຈໍນ້ອຍກວ່າ `1024px` (`lg`).

---

## 7. ສິ່ງສຳຄັນທີ່ຕ້ອງປັບປຸງໃນ Backend ສຳລັບ `edl-web` (Action Items for Backend)

ເນື່ອງຈາກປັດຈຸບັນ Controllers ໃນ NestJS ຖືກລັອກດ້ວຍ `@UseGuards(JwtAuthGuard)` ໃນລະດັບ Class ເຮັດໃຫ້ທຸກໆຄຳຮ້ອງຂໍ (`GET`, `POST`, `PUT`, `DELETE`) ຕ້ອງມີ JWT Token.

**ວິທີແກ້ໄຂເພື່ອໃຫ້ `edl-web` ສາມາດດຶງຂໍ້ມູນສາທາລະນະໄດ້:**

1. **ສ້າງ `@Public()` Decorator:**
   ```typescript
   // src/core/decorators/public.decorator.ts
   import { SetMetadata } from '@nestjs/common';
   export const IS_PUBLIC_KEY = 'isPublic';
   export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
   ```
2. **ແກ້ໄຂ `JwtAuthGuard` ໃຫ້ຂ້າມການກວດ Token ຖ້າມີ `@Public()`:**
   ```typescript
   @Injectable()
   export class JwtAuthGuard extends AuthGuard('jwt') {
       constructor(private reflector: Reflector) { super(); }

       canActivate(context: ExecutionContext) {
           const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
               context.getHandler(),
               context.getClass(),
           ]);
           if (isPublic) return true;
           return super.canActivate(context);
       }
   }
   ```
3. **ໃສ່ `@Public()` ໃສ່ `GET` endpoints ທີ່ເປັນຂໍ້ມູນສາທາລະນະ:**
   - `GET /org-structures` & `GET /org-structures/dropdown`
   - `GET /vision-missions`
   - `GET /news` & `GET /news/:id` & `POST /news/:id/view`
   - `GET /news-categories` & `GET /news-tags`
   - `GET /magazines` & `GET /magazines/:id/download`
   - `GET /electrical-knowledge` & `GET /electrical-knowledge/:id`
   - `GET /electricity-tariffs`
   - `GET /branches` & `GET /service-centers` & `GET /provinces` & `GET /districts` & `GET /villages`
   - `GET /procurements` & `GET /procurements/:id`
   - `GET /job-postings` & `GET /job-postings/:id` & `GET /positions`
   - `GET /legislations`

---

## 8. ຂັ້ນຕອນການເລີ່ມສ້າງໂຄງການ (Getting Started Commands)

ເມື່ອທ່ານພ້ອມທີ່ຈະສ້າງໂຄງການໃໝ່ ສາມາດໃຊ້ຄຳສັ່ງດັ່ງນີ້:

```bash
# 1. ສ້າງໂຄງການ Next.js ໃໝ່
npx create-next-app@latest edl-web --typescript --tailwind --eslint --app --src-dir

# 2. ເຂົ້າໄປທີ່ໂຟນເດີ
cd edl-web

# 3. ຕິດຕັ້ງ Libraries ທີ່ຈຳເປັນ
npm install lucide-react clsx tailwind-merge @tailwindcss/typography
npm install -D @types/node @types/react @types/react-dom

# 4. ສ້າງໄຟລ໌ .env.local ຕາມຂໍ້ 3
# 5. ເລີ່ມ Run Development Server
npm run dev
```

---
*(ເອກະສານນີ້ຖືກສ້າງຂຶ້ນໂດຍອີງຕາມໂຄງສ້າງຖານຂໍ້ມູນ ແລະ API ຕົວຈິງຂອງລະບົບ EDL Admin)*
