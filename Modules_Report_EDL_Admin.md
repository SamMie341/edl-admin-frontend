# ບົດລາຍງານໂມດູນ ແລະ ສະຖາປັດຕະຍະກຳລະບົບ EDL Admin Backend
> **ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL Admin Management System)**  
> **ພາສາ/ເທັກໂນໂລຢີ:** NestJS (TypeScript), Prisma ORM, PostgreSQL  
> **ສະຖາປັດຕະຍະກຳ:** Clean Architecture / Domain-Driven Design (DDD)  
> **ສະຖານະ:** ພວມພັດທະນາ (Active Development) - 22 ໂມດູນຫຼັກ / 27 Clean Architecture Units (153 Endpoints)  
> **ອັບເດດຫຼ້າສຸດ:** 2026-11-16

---

## ສາລະບານ (Table of Contents)
1. [ພາບລວມສະຖາປັດຕະຍະກຳລະບົບ (System Architecture Overview)](#1-ພາບລວມສະຖາປັດຕະຍະກຳລະບົບ-system-architecture-overview)
2. [ຕາຕະລາງສັງລວມໂມດູນທັງໝົດ (Modules Summary Matrix)](#2-ຕາຕະລາງສັງລວມໂມດູນທັງໝົດ-modules-summary-matrix)
   - [2.1 ລຳດັບຂັ້ນຕອນການເພີ່ມຂໍ້ມູນເຂົ້າສູ່ລະບົບ (Data Seeding & Insertion Dependency Workflow)](#21-ລຳດັບຂັ້ນຕອນການເພີ່ມຂໍ້ມູນເຂົ້າສູ່ລະບົບ-data-seeding--insertion-dependency-workflow)
3. [ລາຍລະອຽດແຕ່ລະໂມດູນ ແລະ ຄູ່ມືການເພີ່ມຂໍ້ມູນ (Active Modules & Data Insertion Guide)](#3-ລາຍລະອຽດແຕ່ລະໂມດູນ-ແລະ-ຄູ່ມືການເພີ່ມຂໍ້ມູນ-active-modules--data-insertion-guide)
   - [3.1 Auth Module (ລະບົບຢັ້ງຢືນຕົວຕົນ)](#31-auth-module-ລະບົບຢັ້ງຢືນຕົວຕົນ-authentication)
   - [3.2 Users Module (ລະບົບຈັດການຜູ້ໃຊ້ງານ & IAM)](#32-users-module-ລະບົບຈັດການຜູ້ໃຊ້ງານ--iam)
   - [3.3 Departments Module (ລະບົບຈັດການຂໍ້ມູນຝ່າຍ)](#33-departments-module-ລະບົບຈັດການຂໍ້ມູນຝ່າຍ)
   - [3.4 Branches Module (ລະບົບຈັດການຂໍ້ມູນສາຂາ)](#34-branches-module-ລະບົບຈັດການຂໍ້ມູນສາຂາ)
   - [3.5 Service Centers Module (ລະບົບຈັດການສູນບໍລິການລູກຄ້າ)](#35-service-centers-module-ລະບົບຈັດການສູນບໍລິການລູກຄ້າ)
   - [3.6 Provinces Module (ລະບົບຂໍ້ມູນແຂວງ)](#36-provinces-module-ລະບົບຂໍ້ມູນແຂວງ)
   - [3.7 Districts Module (ລະບົບຂໍ້ມູນເມືອງ)](#37-districts-module-ລະບົບຂໍ້ມູນເມືອງ)
   - [3.8 Villages Module (ລະບົບຂໍ້ມູນບ້ານ)](#38-villages-module-ລະບົບຂໍ້ມູນບ້ານ)
   - [3.9 Organization Structures Module (ລະບົບໂຄງຮ່າງການຈັດຕັ້ງ)](#39-organization-structures-module-ລະບົບໂຄງຮ່າງການຈັດຕັ້ງ)
   - [3.10 Vision & Missions Module (ລະບົບວິໄສທັດ ແລະ ພາລະກິດ)](#310-vision--missions-module-ລະບົບວິໄສທັດ-ແລະ-ພາລະກິດ)
   - [3.11 Electrical Knowledge Module (ລະບົບບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ)](#311-electrical-knowledge-module-ລະບົບບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ)
   - [3.12 Magazines Module (ລະບົບວາລະສານດິຈິຕອນ E-Magazine)](#312-magazines-module-ລະບົບວາລະສານດິຈິຕອນ-e-magazine)
   - [3.13 News Categories Module (ລະບົບໝວດໝູ່ຂ່າວສານ)](#313-news-categories-module-ລະບົບໝວດໝູ່ຂ່າວສານ)
   - [3.14 News Module (ລະບົບຂ່າວສານປະຊາສຳພັນ 2 ພາສາ)](#314-news-module-ລະບົບຂ່າວສານປະຊາສຳພັນ-2-ພາສາ)
   - [3.15 News Tags Module (ລະບົບແທັກຂ່າວສານ)](#315-news-tags-module-ລະບົບແທັກຂ່າວສານ)
   - [3.16 Legislations Module (ລະບົບເອກະສານນິຕິກຳ)](#316-legislations-module-ລະບົບເອກະສານນິຕິກຳ)
   - [3.17 Electricity Tariffs Module (ລະບົບໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ)](#317-electricity-tariffs-module-ລະບົບໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ)
   - [3.18 Procurements Module (ລະບົບປະກາດຈັດຊື້-ຈັດຈ້າງ)](#318-procurements-module-ລະບົບປະກາດຈັດຊື້-ຈັດຈ້າງ)
   - [3.19 Positions Module (ລະບົບຈັດການຕຳແໜ່ງງານ)](#319-positions-module-ລະບົບຈັດການຕຳແໜ່ງງານ)
   - [3.20 Job Postings Module (ລະບົບປະກາດຮັບສະໝັກພະນັກງານ)](#320-job-postings-module-ລະບົບປະກາດຮັບສະໝັກພະນັກງານ)
   - [3.21 Roles Module (ລະບົບຈັດການສິດທິບົດບາດ)](#321-roles-module-ລະບົບຈັດການສິດທິບົດບາດ)
   - [3.22 Electricity Calculator System (ລະບົບຄິດໄລ່ຄ່າໄຟຟ້າ ແລະ ແຜນປະຢັດໄຟ - ແຍກ 6 ໂມດູນຍ່ອຍ)](#322-electricity-calculator-system-ລະບົບຄິດໄລ່ຄ່າໄຟຟ້າ-ແລະ-ແຜນປະຢັດໄຟ)
     - [3.22.1 Tariff Categories Submodule (ລະບົບປະເພດອັດຕາຄ່າໄຟຟ້າ)](#3221-tariff-categories-submodule-ລະບົບປະເພດອັດຕາຄ່າໄຟຟ້າ)
     - [3.22.2 Tariff Schedules & Notices Submodule (ລະບົບປະກາດອັດຕາຄ່າໄຟ & ຕາຕະລາງ 8 ຂັ້ນບັນໄດ)](#3222-tariff-schedules--notices-submodule-ລະບົບປະກາດອັດຕາຄ່າໄຟ--ຕາຕະລາງ-8-ຂັ້ນບັນໄດ)
     - [3.22.3 Appliance Categories Submodule (ລະບົບໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ)](#3223-appliance-categories-submodule-ລະບົບໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ)
     - [3.22.4 Appliance Presets Submodule (ລະບົບເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ)](#3224-appliance-presets-submodule-ລະບົບເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ)
     - [3.22.5 Saving Templates Submodule (ລະບົບແມ່ແບບວິທີປະຢັດໄຟຟ້າ)](#3225-saving-templates-submodule-ລະບົບແມ່ແບບວິທີປະຢັດໄຟຟ້າ)
     - [3.22.6 Electricity Calculation Engine Submodule (ລະບົບຄຳນວນຄ່າໄຟ & Public APIs)](#3226-electricity-calculation-engine-submodule-ລະບົບຄຳນວນຄ່າໄຟ--public-apis)
4. [ແຜນພັດທະນາໂມດູນໃນອະນາຄົດ (Roadmap / Future Enhancements)](#4-ແຜນພັດທະນາໂມດູນໃນອະນາຄົດ-roadmap--future-enhancements)
5. [ຄູ່ມືການອັບເດດເອກະສານ (Documentation Update Guide)](#5-ຄູ່ມືການອັບເດດເອກະສານ-documentation-update-guide)

---

## 1. ພາບລວມສະຖາປັດຕະຍະກຳລະບົບ (System Architecture Overview)

ລະບົບ EDL Admin Backend ໄດ້ຖືກອອກແບບໂດຍອີງໃສ່ຫຼັກການ **Clean Architecture** ເພື່ອໃຫ້ແຕ່ລະສ່ວນແຍກອອກຈາກກັນຢ່າງເປັນອິດສະຫຼະ (Decoupled), ງ່າຍຕໍ່ການຮັກສາ (Maintainability), ແລະ ສະດວກໃນການທົດສອບ (Testability).

```
   ┌────────────────────────────────────────────────────────┐
   │               Presentation Layer (Controllers)         │
   │               - ຮັບ HTTP Request / ສົ່ງ HTTP Response   │
   │               - ກວດສອບຂໍ້ມູນຜ່ານ DTOs (ValidationPipe)   │
   │               - ປ້ອງກັນ API ດ້ວຍ JwtAuthGuard & PermissionsGuard (PBAC) │
   └───────────────────────────┬────────────────────────────┘
                               │ calls
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │               Application Layer (Use Cases)            │
   │               - ບັນຈຸ Business Logic ຫຼັກຂອງລະບົບ       │
   │               - ປະສານງານລະຫວ່າງ Repositories & Services│
   └───────────────────────────┬────────────────────────────┘
                               │ depends on
                               ▼
   ┌────────────────────────────────────────────────────────┐
   │               Domain Layer (Core Logic & Interfaces)   │
   │               - Entities / Models                      │
   │               - Repository Interfaces                  │
   └───────────────────────────▲────────────────────────────┘
                               │ implements
   ┌───────────────────────────┴────────────────────────────┐
   │               Infrastructure Layer                     │
   │               - Prisma ORM / PostgreSQL Database       │
   │               - External Services (EDL HRM & Inside)   │
   │               - Local File System Storage (/uploads)   │
   └────────────────────────────────────────────────────────┘
```

---

## 2. ຕາຕະລາງສັງລວມໂມດູນທັງໝົດ (Modules Summary Matrix)

| ໂມດູນ (Module) | ເສັ້ນທາງ API (Base Path) | ຈຳນວນ Endpoints | ການເຊື່ອມຕໍ່ລະບົບພາຍນອກ / File Storage | ສະຖານະ |
| :--- | :--- | :---: | :--- | :---: |
| **1. Auth** | `/api/v1/auth` | 2 | ລະບົບ Hash ລະຫັດຜ່ານ (Bcrypt), JWT Auth | ພ້ອມໃຊ້ງານ |
| **2. Users** | `/api/v1/users` | 8 | EDL HRM API (Sync ພະນັກງານ) & Permissions (ALLOW / DENY) | ພ້ອມໃຊ້ງານ |
| **3. Departments** | `/api/v1/departments` | 5 | - | ພ້ອມໃຊ້ງານ |
| **4. Branches** | `/api/v1/branches` | 9 | EDL Inside API (Sync ສາຂາ & ຮູບພາບ) | ພ້ອມໃຊ້ງານ |
| **5. Service Centers** | `/api/v1/service-centers` | 8 | EDL Inside API (Sync ສູນບໍລິການ & ຮູບພາບ) | ພ້ອມໃຊ້ງານ |
| **6. Provinces** | `/api/v1/provinces` | 2 | EDL HRM Address API | ພ້ອມໃຊ້ງານ |
| **7. Districts** | `/api/v1/districts` | 3 | EDL HRM District API | ພ້ອມໃຊ້ງານ |
| **8. Villages** | `/api/v1/villages` | 3 | EDL HRM Village API | ພ້ອມໃຊ້ງານ |
| **9. Organization Structures** | `/api/v1/org-structures` | 7 | File System (/uploads/org-structures) | ພ້ອມໃຊ້ງານ |
| **10. Vision & Missions** | `/api/v1/vision-missions` | 6 | File System (/uploads/vision-missions) | ພ້ອມໃຊ້ງານ |
| **11. Electrical Knowledge** | `/api/v1/electrical-knowledge` | 7 | File System (/uploads/electrical-knowledge) | ພ້ອມໃຊ້ງານ |
| **12. Magazines** | `/api/v1/magazines` | 8 | File System (/uploads/magazines) | ພ້ອມໃຊ້ງານ |
| **13. News Categories** | `/api/v1/news-categories` | 5 | - | ພ້ອມໃຊ້ງານ |
| **14. News** | `/api/v1/news` | 8 | File System (/uploads/news) | ພ້ອມໃຊ້ງານ |
| **15. News Tags** | `/api/v1/news-tags` | 5 | - | ພ້ອມໃຊ້ງານ |
| **16. Legislations** | `/api/v1/legislations` | 6 | File System (/uploads/legislations) | ພ້ອມໃຊ້ງານ |
| **17. Electricity Tariffs** | `/api/v1/electricity-tariffs` | 7 | File System (/uploads/electricity-tariffs) | ພ້ອມໃຊ້ງານ |
| **18. Procurements** | `/api/v1/procurements` | 7 | File System (/uploads/procurements) | ພ້ອມໃຊ້ງານ |
| **19. Positions** | `/api/v1/positions` | 5 | Master Data ຕຳແໜ່ງງານ | ພ້ອມໃຊ້ງານ |
| **20. Job Postings** | `/api/v1/job-postings` | 6 | File System (/uploads/job-postings) | ພ້ອມໃຊ້ງານ |
| **21. Roles** | `/api/v1/roles` | 6 | ລະບົບ Role-Based Access Control (RBAC) & Fine-Grained Permissions | ພ້ອມໃຊ້ງານ |
| **22. Electricity Calculator System** | `/api/v1/electricity-calculator` | 30 | ລະບົບຄິດໄລ່ຄ່າໄຟຟ້າຂັ້ນບັນໄດ, ແຜນປະຢັດໄຟອັດຕະໂນມັດ (ແຍກ 6 ໂມດູນຍ່ອຍ) | ພ້ອມໃຊ້ງານ |
| - *22.1 Tariff Categories* | `/api/v1/electricity-calculator/tariff-categories` | 5 | ຈັດການປະເພດ/ໝວດໝູ່ອັດຕາຄ່າໄຟຟ້າ | ພ້ອມໃຊ້ງານ |
| - *22.2 Tariff Notices & Schedules* | `/api/v1/electricity-calculator` | 7 | ປະກາດອັດຕາຄ່າໄຟ & ຕາຕະລາງ 8 ຂັ້ນບັນໄດລາຍເດືອນ | ພ້ອມໃຊ້ງານ |
| - *22.3 Appliance Categories* | `/api/v1/electricity-calculator/categories` | 5 | ຈັດການໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ພ້ອມໃຊ້ງານ |
| - *22.4 Appliance Presets* | `/api/v1/electricity-calculator/presets` | 5 | ຈັດການເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ | ພ້ອມໃຊ້ງານ |
| - *22.5 Saving Templates* | `/api/v1/electricity-calculator/saving-templates` | 5 | ຈັດການແມ່ແບບວິທີປະຢັດໄຟຟ້າ | ພ້ອມໃຊ້ງານ |
| - *22.6 Calculation Engine & Config* | `/api/v1/electricity-calculator` | 3 | Public API ຄິດໄລ່ຄ່າໄຟ & Config | ພ້ອມໃຊ້ງານ |
| **ລວມທັງໝົດ (Total)** | **22 Modules (27 Clean Architecture Units)** | **153 Endpoints** | | |

---

### 2.1 ລຳດັບຂັ້ນຕອນການເພີ່ມຂໍ້ມູນເຂົ້າສູ່ລະບົບ (Data Seeding & Insertion Dependency Workflow)

ເພື່ອປ້ອງກັນຂໍ້ຜິດພາດດ້ານ Foreign Key Constraints ແລະ ຮັບປະກັນຄວາມສົມບູນຂອງຂໍ້ມູນ, ການເພີ່ມຂໍ້ມູນເຂົ້າສູ່ລະບົບໃໝ່ຄວນປະຕິບັດຕາມລຳດັບຂັ້ນຕອນ (Dependency Order) ດັ່ງລຸ່ມນີ້:

```
   [ຂັ້ນຕອນທີ 1: ຂໍ້ມູນພື້ນຖານ (Master Data & Geography)]
   Provinces (Sync) ──> Districts (Sync) ──> Villages (Sync)
   Departments (POST) ──> Positions (POST)

   [ຂັ້ນຕອນທີ 2: ໂຄງສ້າງອົງກອນ & ສູນບໍລິການ (Organization & Centers)]
   Departments + Provinces + Districts + Villages ──> Branches (POST/Sync)
   Branches + Departments + Address ──> Service Centers (POST/Sync)
   Organization Structures (POST + Upload) & Vision Missions (POST + Upload)

   [ຂັ້ນຕອນທີ 3: ຜູ້ໃຊ້ງານ & ສິດທິ (Users & Access Control)]
   Roles (POST) ──> Users (Sync ຈາກ HRM ດ້ວຍ empCode) ──> Change Role & Permissions (PUT)

   [ຂັ້ນຕອນທີ 4: ຂ່າວສານ & ສື່ປະຊາສຳພັນ (News & Media)]
   News Categories (POST) + News Tags (POST) ──> News (POST + Upload Cover/Gallery)
   Electrical Knowledge (POST + Upload Cover)
   Magazines (POST + Upload Cover/PDF)

   [ຂັ້ນຕອນທີ 5: ຂໍ້ມູນສາທາລະນະ & ຮັບສະໝັກງານ (Public Services & Recruitment)]
   Legislations (POST + Upload PDF)
   Electricity Tariffs (POST + Upload Image/Doc)
   Procurements (POST + Upload Image/Doc)
   Positions + Departments ──> Job Postings (POST + Upload Image)

   [ຂັ້ນຕອນທີ 6: ລະບົບຄິດໄລ່ຄ່າໄຟຟ້າ (Electricity Calculator Master Data)]
   Appliance Categories (POST) ──> Appliance Presets (POST) + Saving Templates (POST)
   Tariff Notices (POST) ──> Monthly Schedules & 8 Tiers (PUT Upsert)
```

---

## 3. ລາຍລະອຽດແຕ່ລະໂມດູນ ແລະ ຄູ່ມືການເພີ່ມຂໍ້ມູນ (Active Modules & Data Insertion Guide)

---

### 3.1 Auth Module (ລະບົບຢັ້ງຢືນຕົວຕົນ - Authentication)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/auth/`
* **ຄວາມຮັບຜິດຊອບ:** 
  - ຢັ້ງຢືນຕົວຕົນຂອງພະນັກງານ ແລະ ຜູ້ບໍລິຫານ ເພື່ອເຂົ້າໃຊ້ງານລະບົບ.
  - ກວດສອບລະຫັດຜ່ານດ້ວຍ `bcrypt.compare` ກັບ Password Hash ໃນຖານຂໍ້ມູນ.
  - ກວດສອບສະຖານະບັນຊີ (`status === 'ACTIVE'`).
  - ສ້າງ ແລະ ລົງລາຍເຊັນ JWT Access Token ພ້ອມຂໍ້ມູນ Payload (`id`, `empCode`, `role`, `permissions`) ໂດຍຄຳນວນສິດທິສຸດທິແບບ `(rolePermissions ∪ ALLOW) \ DENY`.
  - ບັນທຶກເວລາເຂົ້າສູ່ລະບົບຫຼ້າສຸດ (`lastLoginAt`).
  - ໃຫ້ບໍລິການ `JwtAuthGuard`, `JwtStrategy`, ແລະ `PermissionsGuard` (ກວດສອບ `deniedPermissions` ກ່ອນເງື່ອນໄຂ `SUPERADMIN` ເພື່ອໃຫ້ການປິດສິດສະເພາະບຸກຄົນມີຜົນທຸກ Role).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | No | ເຂົ້າສູ່ລະບົບ (Payload: `empCode`, `password`) |
| `GET` | `/api/v1/auth/profile` | JWT | ດຶງຂໍ້ມູນໂປຣໄຟລ໌ຜູ້ໃຊ້ປັດຈຸບັນ (Current Authenticated User Profile) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ລະບົບ Auth ບໍ່ມີການສ້າງ User ໂດຍກົງຜ່ານ Register API ເພື່ອຄວາມປອດໄພຂອງອົງກອນ; ບັນຊີຈະຖືກສ້າງຂຶ້ນຜ່ານການ Sync ຈາກລະບົບ HRM ໃນ Users Module.
- ຜູ້ໃຊ້ເຂົ້າສູ່ລະບົບຜ່ານ `POST /api/v1/auth/login` ເພື່ອຮັບ JWT Access Token ແລ້ວນຳໄປຕັ້ງຄ່າ `Authorization: Bearer <accessToken>` ສຳລັບ Endpoint ອື່ນໆ.

#### ໂຄງສ້າງ DTO:
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `empCode` | `string` | Yes | ລະຫັດພະນັກງານ ຟຟລ (ເຊັ່ນ: `"00001"`) |
| `password` | `string` | Yes | ລະຫັດຜ່ານຜູ້ໃຊ້ງານ |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "empCode": "00001",
  "password": "password123"
}
```

---

### 3.2 Users Module (ລະບົບຈັດການຜູ້ໃຊ້ງານ & IAM)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/users/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຈັດການຂໍ້ມູນບັນຊີຜູ້ໃຊ້ງານ ແລະ ສິດທິການເຂົ້າເຖິງລະບົບ (`SUPERADMIN`, `ADMIN`, `EDITOR`, `STAFF`).
  - ເຊື່ອມຕໍ່ກັບລະບົບ **HRM ຂອງ ຟຟລ** ເພື່ອດຶງຂໍ້ມູນພະນັກງານຕົວຈິງມາສ້າງບັນຊີໃໝ່ ຫຼື ອັບເດດຂໍ້ມູນສັງກັດ.

#### Use Cases ໃນລະບົບ:
1. **`SyncUserUseCase`**:
   - ດຶງຂໍ້ມູນພະນັກງານຜ່ານລະຫັດພະນັກງານ (`empCode`) ຈາກ HRM Service.
   - ຖ້າຍັງບໍ່ມີໃນລະບົບ: ສ້າງບັນຊີໃໝ່, ຕັ້ງລະຫັດຜ່ານເລີ່ມຕົ້ນເປັນ `edl<empCode>`, Hash ລະຫັດຜ່ານ, ແລະ ກຳນົດສິດເລີ່ມຕົ້ນເປັນ `ADMIN`.
   - ຖ້າມີແລ້ວ: ອັບເດດຂໍ້ມູນສັງກັດ (ຊື່, ນາມສະກຸນ, ຝ່າຍ, ພະແນກ, ໜ່ວຍງານ, ເບີໂທ).
2. **`GetUsersUseCase`**: ດຶງຂໍ້ມູນລາຍຊື່ຜູ້ໃຊ້ທັງໝົດໃນລະບົບ.
3. **`UpdateUserUseCase`**: ອັບເດດສິດທິ (Role) ແລະ ສະຖານະ (Status) ຂອງຜູ້ໃຊ້.
4. **`DeleteUserUseCase`**: ລຶບບັນຊີຜູ້ໃຊ້ອອກຈາກລະບົບ.
5. **`ChangePasswordUseCase`**: ປ່ຽນລະຫັດຜ່ານຜູ້ໃຊ້ງານ.
6. **`AssignPermissionsUseCase`**: ກຳນົດສິດລະອຽດສະເພາະບຸກຄົນ ທັງການເພີ່ມສິດ (`ALLOW`) ແລະ ການປິດ/ຫັກສິດອອກຈາກ Role (`DENY`), ປ້ອງກັນ ID ຊ້ຳກັນລະຫວ່າງສອງກຸ່ມ, ແລະ ສົ່ງຄືນ `allowedPermissions`, `deniedPermissions`, `effectivePermissions`.
7. **`GetPermissionsUseCase`**: ດຶງລາຍການສິດທິທັງໝົດໃນລະບົບ.
8. **`GetUserPermissionsUseCase`**: ດຶງລາຍການສິດຈາກ Role, ສິດທີ່ເພີ່ມເຕີມ (`ALLOW`), ສິດທີ່ຖືກປິດ (`DENY`), ແລະ ສິດທິສຸດທິ (`effectivePermissions`) ຂອງຜູ້ໃຊ້ຕາມ ID.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/users` | JWT | ດຶງລາຍຊື່ຜູ້ໃຊ້ທັງໝົດ (ພ້ອມ `effect` ໃນ `userPermissions`) |
| `POST` | `/api/v1/users/sync/:empCode` | JWT | ຊິ້ງຂໍ້ມູນພະນັກງານຈາກ HRM ເຂົ້າລະບົບ |
| `PUT` | `/api/v1/users/change-role/:id` | JWT | ປ່ຽນສິດທິຜູ້ໃຊ້ (Role) ແລະ ສະຖານະ |
| `GET` | `/api/v1/users/permissions/list` | JWT | ດຶງລາຍການສິດທັງໝົດໃນລະບົບ |
| `GET` | `/api/v1/users/:id/permissions` | JWT | ດຶງສິດຈາກ Role, ALLOW, DENY ແລະ ສິດທິສຸດທິຂອງຜູ້ໃຊ້ (ສິດ `USERS:READ`) |
| `PUT` | `/api/v1/users/:id/permissions` | JWT | ກຳນົດສິດເພີ່ມ (`ALLOW`) ແລະ ປິດ/ຫັກສິດຈາກ Role (`DENY`) ໃຫ້ຜູ້ໃຊ້ |
| `PUT` | `/api/v1/users/change-password/:id` | JWT | ປ່ຽນລະຫັດຜ່ານຜູ້ໃຊ້ງານ |
| `DELETE` | `/api/v1/users/:id` | JWT | ລຶບບັນຊີຜູ້ໃຊ້ |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. **ການສ້າງຜູ້ໃຊ້ໃໝ່:** ບໍ່ໄດ້ສົ່ງ JSON Body ສ້າງເອງ, ແຕ່ໃຫ້ Admin ຍິງໄປທີ່ `POST /api/v1/users/sync/:empCode` ໂດຍສົ່ງລະຫັດພະນັກງານຜ່ານ Path Param.
2. **ການປ່ຽນບົດບາດ & ສະຖານະ:** ຍິງໄປທີ່ `PUT /api/v1/users/change-role/:id` (ສິດ `USERS:UPDATE`).
3. **ການກຳນົດສິດ (Permissions):**
   - ກວດສອບສິດປັດຈຸບັນຂອງຜູ້ໃຊ້ໄດ້ທີ່ `GET /api/v1/users/:id/permissions`.
   - ຍິງໄປທີ່ `PUT /api/v1/users/:id/permissions` ໂດຍສົ່ງ `permissionIds` (ສິດທີ່ຕ້ອງການເພີ່ມແບບ `ALLOW`) ແລະ/ຫຼື `deniedPermissionIds` (ສິດທີ່ຕ້ອງການປິດ/ຫັກອອກຈາກ Role ແບບ `DENY`). ຫາກຕ້ອງການລ້າງການປັບແຕ່ງສະເພາະບຸກຄົນໃຫ້ກັບໄປໃຊ້ສິດຕາມ Role ເດີມ ໃຫ້ສົ່ງ `{"permissionIds": [], "deniedPermissionIds": []}`.

#### ໂຄງສ້າງ DTO:
- **`UpdateUserDto` (ປ່ຽນ Role & Status):**
  | Field | Type | Required | ຄຳອະທິບາຍ |
  | :--- | :--- | :---: | :--- |
  | `role` | `string` | Yes | ບົດບາດ: `SUPERADMIN`, `ADMIN`, `EDITOR`, `STAFF` |
  | `status` | `string` | Yes | ສະຖານະ: `ACTIVE`, `INACTIVE`, `SUSPENDED` |

- **`AssignPermissionsDto` (ກຳນົດສິດ ALLOW / DENY):**
  | Field | Type | Required | ຄຳອະທິບາຍ |
  | :--- | :--- | :---: | :--- |
  | `permissionIds` | `number[]` | No | ລາຍການ ID ຂອງສິດທິທີ່ຕ້ອງການເພີ່ມເຕີມນອກເໜືອຈາກ Role (`ALLOW`) |
  | `deniedPermissionIds` | `number[]` | No | ລາຍການ ID ຂອງສິດທິທີ່ຕ້ອງການປິດ/ຫັກອອກຈາກ Role ສະເພາະບຸກຄົນ (`DENY`) — ຫ້າມຊ້ຳກັບ `permissionIds` |

- **`ChangePasswordDto` (ປ່ຽນລະຫັດຜ່ານ):**
  | Field | Type | Required | ຄຳອະທິບາຍ |
  | :--- | :--- | :---: | :--- |
  | `oldPassword` | `string` | No | ລະຫັດຜ່ານເກົ່າ (ບໍ່ບັງຄັບຖ້າ Superadmin Reset ໃຫ້) |
  | `newPassword` | `string` | Yes | ລະຫັດຜ່ານໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ) |
  | `confirmPassword` | `string` | Yes | ຢືນຢັນລະຫັດຜ່ານໃໝ່ |

#### ຕົວຢ່າງ Request Payloads:
```json
// 1. PUT /api/v1/users/change-role/1
{
  "role": "ADMIN",
  "status": "ACTIVE"
}

// 2. PUT /api/v1/users/1/permissions
{
  "permissionIds": [1, 2, 3],
  "deniedPermissionIds": [10]
}

// 3. PUT /api/v1/users/change-password/1
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

---

### 3.3 Departments Module (ລະບົບຈັດການຂໍ້ມູນຝ່າຍ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/departments/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນຝ່າຍຕ່າງໆ ພາຍໃນໂຄງສ້າງການບໍລິຫານຂອງ ຟຟລ.

#### Use Cases ໃນລະບົບ:
1. **`CreateDepartmentUseCase`**: ເພີ່ມຂໍ້ມູນຝ່າຍໃໝ່.
2. **`GetDepartmentsUseCase`**: ດຶງລາຍຊື່ຝ່າຍທັງໝົດ ພ້ອມລຽງຕາມລຳດັບ.
3. **`GetDepartmentByIdUseCase`**: ດຶງຂໍ້ມູນຝ່າຍຕາມ ID.
4. **`UpdateDepartmentUseCase`**: ແກ້ໄຂຊື່ຝ່າຍ.
5. **`DeleteDepartmentUseCase`**: ລຶບຂໍ້ມູນຝ່າຍ (ມີ Business Logic ປ້ອງກັນບໍ່ໃຫ້ລຶບຖ້າຍັງມີສາຂາ ຫຼື ຜູ້ໃຊ້ສັງກັດຢູ່).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/departments` | JWT | ດຶງລາຍຊື່ຝ່າຍທັງໝົດ |
| `GET` | `/api/v1/departments/:id` | JWT | ດຶງຂໍ້ມູນຝ່າຍຕາມ ID |
| `POST` | `/api/v1/departments` | JWT | ເພີ່ມຝ່າຍໃໝ່ |
| `PUT` | `/api/v1/departments/:id` | JWT | ແກ້ໄຂຂໍ້ມູນຝ່າຍ |
| `DELETE` | `/api/v1/departments/:id` | JWT | ລຶບຂໍ້ມູນຝ່າຍ |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ HTTP POST ໄປທີ່ `POST /api/v1/departments` ພ້ອມ JSON Body.
- **ເງື່ອນໄຂ:** ຊື່ຝ່າຍຕ້ອງບໍ່ຫວ່າງເປົ່າ. ຝ່າຍເປັນ Master Data ທີ່ໃຊ້ເຊື່ອມໂຍງກັບ ສາຂາ (Branches) ແລະ ຕຳແໜ່ງ (Positions).

#### ໂຄງສ້າງ DTO (`CreateDepartmentDto` & `UpdateDepartmentDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Yes | ຊື່ຝ່າຍ ເຊັ່ນ: `"ຝ່າຍເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ"` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "name": "ຝ່າຍເຕັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ"
}
```

---

### 3.4 Branches Module (ລະບົບຈັດການຂໍ້ມູນສາຂາ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/branches/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງສາຂາຂອງ ຟຟລ ປະຈຳແຂວງ/ເຂດທົ່ວປະເທດ.
  - ເກັບກຳຂໍ້ມູນ: ຊື່ສາຂາ, ທີ່ຢູ່, ພິກັດແຜນທີ່, ອີເມວ, ເບີໂທ, ພາລະບົດບາດ, ແລະ ຮູບພາບຕ່າງໆ.
  - ເຊື່ອມຕໍ່ກັບ **Legacy Inside API** ເພື່ອດຶງຂໍ້ມູນ ແລະ ດາວໂຫຼດຮູບພາບສາຂາ, ຮູບໜ້າປົກ, ແລະ ແຜນຜັງໂຄງຮ່າງ.

#### Use Cases ໃນລະບົບ:
1. **`SyncBranchesUseCase`**: ດຶງຂໍ້ມູນຈາກ Legacy API, ດາວໂຫຼດຮູບພາບອັດຕະໂນມັດ ແລະ Upsert ລົງຖານຂໍ້ມູນ.
2. **`GetBranchesUseCase`**: ດຶງລາຍຊື່ສາຂາທັງໝົດ (ຮອງຮັບ Filter ຕາມ `departmentId`).
3. **`GetBranchesDropdownUseCase`**: ດຶງລາຍຊື່ສາຂາສຳລັບສະແດງໃນ Dropdown (ສະເພາະ ACTIVE, ຮອງຮັບ Filter ຕາມ `departmentId`).
4. **`GetBranchByIdUseCase`**: ດຶງລາຍລະອຽດສາຂາຕາມ ID ພ້ອມຂໍ້ມູນຝ່າຍສັງກັດ.
5. **`CreateBranchUseCase`**: ສ້າງຂໍ້ມູນສາຂາໃໝ່.
6. **`UpdateBranchUseCase`**: ແກ້ໄຂຂໍ້ມູນສາຂາ ແລະ ສະຖານະ (`ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE`).
7. **`DeleteBranchUseCase`**: ລຶບສາຂາອອກຈາກລະບົບ.
8. **`UploadBranchImageUseCase`**: ອັບໂຫຼດຮູບພາບສາຂາ (`BRANCH`, `COVER`, `STRUCTURE`).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/branches` | JWT | ດຶງລາຍຊື່ສາຂາທັງໝົດ (ຮອງຮັບ `?departmentId=`) |
| `GET` | `/api/v1/branches/dropdown` | JWT | ດຶງລາຍການສາຂາສຳລັບ Dropdown (ຮອງຮັບ `?departmentId=`) |
| `GET` | `/api/v1/branches/department/:departmentId` | JWT | ດຶງສາຂາທີ່ຂຶ້ນກັບຝ່າຍຕາມ ID |
| `GET` | `/api/v1/branches/:id` | JWT | ດຶງຂໍ້ມູນສາຂາຕາມ ID |
| `POST` | `/api/v1/branches` | JWT | ສ້າງສາຂາໃໝ່ |
| `PUT` | `/api/v1/branches/:id` | JWT | ແກ້ໄຂຂໍ້ມູນສາຂາ |
| `DELETE` | `/api/v1/branches/:id` | JWT | ລຶບຂໍ້ມູນສາຂາ |
| `POST` | `/api/v1/branches/sync` | JWT | ຊິ້ງຂໍ້ມູນສາຂາ ແລະ ດາວໂຫຼດຮູບພາບຈາກ Inside API |
| `POST` | `/api/v1/branches/:id/upload/:imageType` | JWT | ອັບໂຫຼດຮູບພາບສາຂາ (`imageType`: branch, cover, structure) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. **ເພີ່ມສາຂາໃໝ່ດ້ວຍຕົນເອງ:** ສົ່ງ `POST /api/v1/branches` ພ້ອມ JSON Body (ຕ້ອງມີ `departmentId` ທີ່ຖືກຕ້ອງ).
2. **ຊິ້ງອັດຕະໂນມັດ:** ສົ່ງ `POST /api/v1/branches/sync` (ລະບົບຈະດຶງຂໍ້ມູນພ້ອມຮູບພາບຈາກ Inside API).
3. **ອັບໂຫຼດຮູບພາບ:** ສົ່ງ Multipart Form-Data ໄປທີ່ `POST /api/v1/branches/:id/upload/:imageType` (`file`: ໄຟລ໌ຮູບພາບ JPG/PNG/WEBP, `imageType`: `branch`, `cover`, `structure`).

#### ໂຄງສ້າງ DTO (`CreateBranchDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `departmentId` | `number` | Yes | ລະຫັດຝ່າຍຕົ້ນສັງກັດ (Foreign Key) |
| `branchName` | `string` | Yes | ຊື່ສາຂາ ເຊັ່ນ: `"ສາຂາ ນະຄອນຫຼວງ 1"` |
| `address` | `string` | No | ທີ່ຢູ່ຕັ້ງຂອງສຳນັກງານສາຂາ |
| `email` | `string` | No | ອີເມວຕິດຕໍ່ທາງການຂອງສາຂາ |
| `phoneNumber` | `string` | No | ເບີໂທລະສັບຕິດຕໍ່ |
| `roleResponsibilities` | `string` | No | ພາລະບົດບາດ ແລະ ໜ້າທີ່ (HTML/Rich Text) |
| `orderIndex` | `number` | No | ລຳດັບການສະແດງຜົນ (Default: 0) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE`, `UNDER_MAINTENANCE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "departmentId": 1,
  "branchName": "ສາຂາ ນະຄອນຫຼວງ 1",
  "address": "ບ້ານ ໂພນສີນວນ, ເມືອງ ສີສັດຕະນາກ, ນະຄອນຫຼວງວຽງຈັນ",
  "email": "branch1@edl.com.la",
  "phoneNumber": "021-412345",
  "roleResponsibilities": "<p>ຄຸ້ມຄອງ ແລະ ບໍລິຫານລະບົບໄຟຟ້າເຂດນະຄອນຫຼວງ</p>",
  "status": "ACTIVE",
  "orderIndex": 1
}
```

---

### 3.5 Service Centers Module (ລະບົບຈັດການສູນບໍລິການລູກຄ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/service-centers/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງຂໍ້ມູນສູນບໍລິການລູກຄ້າໄຟຟ້າຂັ້ນເມືອງ/ບ້ານ.
  - ເກັບພິກັດ GPS (Latitude, Longitude) ສຳລັບສະແດງຜົນເທິງແຜນທີ່, ເບີໂທຕິດຕໍ່, ແລະ ຮູບພາບ.
  - ເຊື່ອມຕໍ່ກັບ **Inside API** ພ້ອມລະບົບ Mapping ທີ່ຕັ້ງ (ແຂວງ, ເມືອງ, ບ້ານ) ແລະ ສາຂາຕົ້ນສັງກັດ.

#### Use Cases ໃນລະບົບ:
1. **`SyncServiceCenterUseCase`**: ຊິ້ງຂໍ້ມູນຈາກ Inside API, Map ທີ່ຕັ້ງ, ດາວໂຫຼດຮູບພາບ.
2. **`GetServiceUseCase`**: ດຶງລາຍຊື່ສູນບໍລິການທັງໝົດ ພ້ອມຂໍ້ມູນ Relation ສາຂາ ແລະ ທີ່ຕັ້ງ (ຮອງຮັບ Filter ຕາມ `provinceId`).
3. **`GetServiceByIdUseCase`**: ດຶງຂໍ້ມູນສູນບໍລິການຕາມ ID.
4. **`CreateServiceCenterUseCase`**: ສ້າງສູນບໍລິການໃໝ່.
5. **`UpdateServiceCenterUseCase`**: ແກ້ໄຂຂໍ້ມູນສູນບໍລິການ.
6. **`DeleteServiceCenterUseCase`**: ລຶບສູນບໍລິການ.
7. **`UploadServiceCenterImageUseCase`**: ອັບໂຫຼດຮູບພາບສູນບໍລິການ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/service-centers` | Public | ດຶງລາຍຊື່ສູນບໍລິການທັງໝົດ (ຮອງຮັບ `?provinceId=&page=&limit=`) |
| `GET` | `/api/v1/service-centers/province/:provinceId` | Public | ດຶງລາຍຊື່ສູນບໍລິການທີ່ຂຶ້ນກັບແຂວງຕາມ ID (ຮອງຮັບ `?page=&limit=`) |
| `GET` | `/api/v1/service-centers/:id` | Public | ດຶງຂໍ້ມູນສູນບໍລິການຕາມ ID |
| `POST` | `/api/v1/service-centers` | JWT | ສ້າງສູນບໍລິການໃໝ່ |
| `PUT` | `/api/v1/service-centers/:id` | JWT | ແກ້ໄຂຂໍ້ມູນສູນບໍລິການ |
| `DELETE` | `/api/v1/service-centers/:id` | JWT | ລຶບສູນບໍລິການ |
| `POST` | `/api/v1/service-centers/sync` | JWT | ຊິ້ງຂໍ້ມູນສູນບໍລິການຈາກ Inside API |
| `POST` | `/api/v1/service-centers/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບສູນບໍລິການ (form-data: `file`) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. **ສ້າງສູນບໍລິການໃໝ່:** `POST /api/v1/service-centers` ພ້ອມ JSON Body.  
   *ເງື່ອນໄຂ:* ຕ້ອງລະບຸ `provinceId`, `districtId`, `villageId` (ເຊິ່ງຕ້ອງ Sync ມາຈາກ HRM ກ່ອນ).
2. **ຊິ້ງອັດຕະໂນມັດ:** `POST /api/v1/service-centers/sync`.
3. **ອັບໂຫຼດຮູບພາບ:** `POST /api/v1/service-centers/:id/upload/image` (form-data: `file`).

#### ໂຄງສ້າງ DTO (`CreateServiceCenterDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `centerName` | `string` | Yes | ຊື່ສູນບໍລິການ |
| `departmentId` | `number` | No | ລະຫັດຝ່າຍຕົ້ນສັງກັດ (Foreign Key) |
| `branchId` | `number` | No | ລະຫັດສາຂາຕົ້ນສັງກັດ (Foreign Key) |
| `provinceId` | `number` | Yes | ລະຫັດແຂວງທີ່ຕັ້ງ (Foreign Key) |
| `districtId` | `number` | Yes | ລະຫັດເມືອງທີ່ຕັ້ງ (Foreign Key) |
| `villageId` | `number` | Yes | ລະຫັດບ້ານທີ່ຕັ້ງ (Foreign Key) |
| `phoneNumber` | `string` | No | ເບີໂທລະສັບຕິດຕໍ່ສູນບໍລິການ |
| `longitude` | `number` | No | ພິກັດເສັ້ນແວງ (ເຊັ່ນ: `102.6321`) |
| `latitude` | `number` | No | ພິກັດເສັ້ນຂະໜານ (ເຊັ່ນ: `17.9757`) |
| `imageUrl` | `string` | No | URL ຮູບພາບສູນບໍລິການ |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE`, `TEMPORARILY_CLOSED` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "centerName": "ສູນບໍລິການລູກຄ້າ ໜອງບອນ",
  "departmentId": 1,
  "branchId": 1,
  "provinceId": 1,
  "districtId": 1,
  "villageId": 1,
  "phoneNumber": "020-55555555",
  "longitude": 102.6321,
  "latitude": 17.9757,
  "imageUrl": "/uploads/centers/sample.jpg",
  "status": "ACTIVE"
}
```

---

### 3.6 Provinces Module (ລະບົບຂໍ້ມູນແຂວງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/provinces/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນແຂວງທົ່ວປະເທດລາວ (18 ແຂວງ), ລະຫັດແຂວງ, ຕົວຫຍໍ້, ແລະ ລະຫັດສາຂາ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/provinces` | Public | ດຶງລາຍຊື່ແຂວງທັງໝົດ (ຮອງຮັບ `?includeDistricts=true`) |
| `POST` | `/api/v1/provinces/sync` | JWT | ຊິ້ງຂໍ້ມູນແຂວງທັງໝົດ 18 ແຂວງຈາກຖານຂໍ້ມູນ EDL HRM |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ຂໍ້ມູນແຂວງເປັນ Master Geography Data ທີ່ດຶງມາຈາກ **EDL HRM API**.
- ຜູ້ດູແລລະບົບຍິງ `POST /api/v1/provinces/sync` (ບໍ່ຕ້ອງສົ່ງ Body). ລະບົບຈະ Upsert ຂໍ້ມູນ 18 ແຂວງລົງຕາຕະລາງ `provinces` ໂດຍອັດຕະໂນມັດ.
- **ຂັ້ນຕອນຖັດໄປ:** ຫຼັງຈາກ Sync Provinces ສຳເລັດແລ້ວ ຈຶ່ງສາມາດ Sync Districts ໄດ້.

---

### 3.7 Districts Module (ລະບົບຂໍ້ມູນເມືອງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/districts/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນເມືອງທົ່ວປະເທດ, ລະຫັດເມືອງ, ແລະ ການຜູກມັດກັບແຂວງ (`provinceId`).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/districts` | Public | ດຶງລາຍຊື່ເມືອງທັງໝົດ (ຮອງຮັບ `?provinceId=`) |
| `GET` | `/api/v1/districts/province/:provinceId` | Public | ດຶງລາຍຊື່ເມືອງຕາມ ID ແຂວງ |
| `POST` | `/api/v1/districts/sync` | JWT | ຊິ້ງຂໍ້ມູນເມືອງທົ່ວປະເທດຈາກ EDL HRM API |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ເພີ່ມຂໍ້ມູນຜ່ານການຊິ້ງຈາກ HRM ໂດຍຍິງ `POST /api/v1/districts/sync` (ບໍ່ມີ Request Body).
- **ເງື່ອນໄຂສຳຄັນ:** ຕ້ອງດຳເນີນການ Sync ແຂວງ (Provinces) ມາກ່ອນ ເພື່ອໃຫ້ມີ Foreign Key `provinceId` ຮອງຮັບ.

---

### 3.8 Villages Module (ລະບົບຂໍ້ມູນບ້ານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/villages/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນບ້ານທົ່ວປະເທດລາວ, ລະຫັດບ້ານ, ແລະ ການຜູກມັດກັບເມືອງ (`districtId`).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/villages` | Public | ດຶງລາຍຊື່ບ້ານທັງໝົດ (ຮອງຮັບ `?districtId=`) |
| `GET` | `/api/v1/villages/district/:districtId` | Public | ດຶງລາຍຊື່ບ້ານຕາມ ID ເມືອງ |
| `POST` | `/api/v1/villages/sync` | JWT | ຊິ້ງຂໍ້ມູນບ້ານທົ່ວປະເທດຈາກ EDL HRM API |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ເພີ່ມຂໍ້ມູນຜ່ານການຊິ້ງຈາກ HRM ໂດຍຍິງ `POST /api/v1/villages/sync` (ບໍ່ມີ Request Body).
- **ເງື່ອນໄຂສຳຄັນ:** ຕ້ອງ Sync ແຂວງ (Provinces) ແລະ ເມືອງ (Districts) ມາກ່ອນ ເພື່ອໃຫ້ມີ Foreign Key `districtId`.

---

### 3.9 Organization Structures Module (ລະບົບໂຄງຮ່າງການຈັດຕັ້ງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/organization-structures/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງ (Board of Directors, Executive Board, Org Structure) ພ້ອມຮອງຮັບການອັບໂຫຼດຮູບພາບ ແລະ ຮູບປະຈຳຕົວ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/org-structures` | Public | ດຶງຂໍ້ມູນໂຄງຮ່າງການຈັດຕັ້ງທັງໝົດ |
| `GET` | `/api/v1/org-structures/dropdown` | Public | ດຶງລາຍການໂຄງຮ່າງສຳລັບ Dropdown |
| `POST` | `/api/v1/org-structures` | JWT | ສ້າງໂຄງຮ່າງໃໝ່ |
| `PUT` | `/api/v1/org-structures/:id` | JWT | ແກ້ໄຂຂໍ້ມູນໂຄງຮ່າງ |
| `DELETE` | `/api/v1/org-structures/:id` | JWT | ລຶບຂໍ້ມູນໂຄງຮ່າງ |
| `POST` | `/api/v1/org-structures/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບໂຄງຮ່າງ (form-data: `file`) |
| `POST` | `/api/v1/org-structures/upload-avatar` | JWT | ອັບໂຫຼດຮູບປະຈຳຕົວບຸກຄະລາກອນ (form-data: `file`) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. **ສ້າງໂຄງຮ່າງ:** ສົ່ງ `POST /api/v1/org-structures` ພ້ອມ JSON Body (ກຳນົດປະເພດ `structureType` ເປັນ `BOARD_OF_DIRECTORS`, `EXECUTIVE_BOARD`, ຫຼື `ORG_STRUCTURE`).
2. **ອັບໂຫຼດຮູບພາບຜັງໂຄງຮ່າງ:** ສົ່ງ Multipart Form-Data ໄປທີ່ `POST /api/v1/org-structures/:id/upload/image` (`file`: ໄຟລ໌ຮູບພາບ, ລະບົບຈະບັນທຶກລົງ `/uploads/org-structures/`).
3. **ອັບໂຫຼດຮູບປະຈຳຕົວ:** ສົ່ງ Multipart Form-Data ໄປທີ່ `POST /api/v1/org-structures/upload-avatar` (`file`: ໄຟລ໌ຮູບພາບ, ລະບົບຈະບັນທຶກລົງ `/uploads/org-structures/avatars/`).

#### ໂຄງສ້າງ DTO (`CreateOrgStructureDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `structureType` | `string` | Yes | ປະເພດໂຄງຮ່າງ: `BOARD_OF_DIRECTORS`, `EXECUTIVE_BOARD`, `ORG_STRUCTURE` |
| `structureName` | `string` | Yes | ຊື່ໂຄງສ້າງ ເຊັ່ນ: `"ສະພາບໍລິຫານ ລັດວິສາຫະກິດໄຟຟ້າລາວ"` |
| `imageUrl` | `string` | No | URL ຮູບພາບໂຄງຮ່າງ |
| `orderIndex` | `number` | No | ລຳດັບການສະແດງຜົນ (Default: 0) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "structureType": "BOARD_OF_DIRECTORS",
  "structureName": "ສະພາບໍລິຫານ ລັດວິສາຫະກິດໄຟຟ້າລາວ",
  "imageUrl": "/uploads/org-structures/sample.jpg",
  "orderIndex": 1,
  "status": "ACTIVE"
}
```

---

### 3.10 Vision & Missions Module (ລະບົບວິໄສທັດ ແລະ ພາລະກິດ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/vision-missions/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນວິໄສທັດ (Vision), ພາລະກິດ (Mission), ຄ່ານິຍົມຫຼັກ (Core Values), ແລະ ສະໂລແກນ (Slogan).

#### Use Cases ໃນລະບົບ:
1. **`GetVisionMissionUseCase`**: ດຶງຂໍ້ມູນວິໄສທັດ, ພາລະກິດ, ຄ່ານິຍົມຫຼັກ ແລະ ສະໂລແກນທັງໝົດ.
2. **`GetVisionMissionByIdUseCase`**: ດຶງຂໍ້ມູນວິໄສທັດ ແລະ ພາລະກິດ ຕາມ ID.
3. **`CreateVisionMissionUseCase`**: ສ້າງຂໍ້ມູນວິໄສທັດ ແລະ ພາລະກິດໃໝ່.
4. **`UpdateVisionMissionUseCase`**: ແກ້ໄຂຂໍ້ມູນວິໄສທັດ ແລະ ພາລະກິດ.
5. **`DeleteVisionMissionUseCase`**: ລຶບຂໍ້ມູນວິໄສທັດ ແລະ ພາລະກິດ.
6. **`UploadVisionMissionImageUseCase`**: ອັບໂຫຼດຮູບພາບປະກອບວິໄສທັດ ແລະ ພາລະກິດ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/vision-missions` | Public | ດຶງຂໍ້ມູນວິໄສທັດ ແລະ ພາລະກິດທັງໝົດ |
| `GET` | `/api/v1/vision-missions/:id` | Public | ດຶງຂໍ້ມູນວິໄສທັດ ແລະ ພາລະກິດ ຕາມ ID |
| `POST` | `/api/v1/vision-missions` | JWT | ສ້າງຂໍ້ມູນໃໝ່ |
| `PUT` | `/api/v1/vision-missions/:id` | JWT | ແກ້ໄຂຂໍ້ມູນ |
| `DELETE` | `/api/v1/vision-missions/:id` | JWT | ລຶບຂໍ້ມູນ |
| `POST` | `/api/v1/vision-missions/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບປະກອບ (form-data: `file`) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. ສ້າງຂໍ້ມູນໂດຍສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/vision-missions`.
2. ອັບໂຫຼດຮູບພາບປະກອບໂດຍສົ່ງ Multipart Form-Data ໄປທີ່ `POST /api/v1/vision-missions/:id/upload/image` (`file`: ໄຟລ໌ຮູບ, ບັນທຶກໄວ້ທີ່ `/uploads/vision-missions/`).

#### ໂຄງສ້າງ DTO (`CreateVisionMissionDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `entryType` | `string` | Yes | ປະເພດ: `VISION`, `MISSION`, `CORE_VALUES`, `SLOGAN` |
| `title` | `string` | Yes | ຫົວຂໍ້ ເຊັ່ນ: `"ວິໄສທັດຂອງ ຟຟລ"` |
| `slogan` | `string` | No | ສະໂລແກນ / ຄຳຂວັນ |
| `description` | `string` | No | ລາຍລະອຽດເນື້ອໃນ (HTML/Text) |
| `imageUrl` | `string` | No | URL ຮູບພາບປະກອບ |
| `orderIndex` | `number` | No | ລຳດັບການສະແດງຜົນ (Default: 0) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "entryType": "VISION",
  "title": "ວິໄສທັດຂອງ ຟຟລ",
  "slogan": "ພັດທະນາພະລັງງານໄຟຟ້າ ເພື່ອຄວາມໝັ້ນຄົງ ແລະ ຍືນຍົງ",
  "description": "<p>ເປັນລັດວິສາຫະກິດຊັ້ນນຳດ້ານພະລັງງານສະອາດໃນພາກພື້ນ</p>",
  "imageUrl": "/uploads/vision-missions/sample.jpg",
  "orderIndex": 1,
  "status": "ACTIVE"
}
```

---

### 3.11 Electrical Knowledge Module (ລະບົບບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/electrical-knowledge/`
* **ຄວາມຮັບຜິດຊອບ:** ຈັດການບົດຄວາມຄວາມຮູ້, ຄລິບວິດິໂອສຶກສາ ແລະ ຂ່າວສານຄວາມປອດໄພໃນການນຳໃຊ້ໄຟຟ້າ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electrical-knowledge` | Public | ດຶງບົດຄວາມຄວາມຮູ້ທັງໝົດ |
| `GET` | `/api/v1/electrical-knowledge/:id` | Public | ດຶງຂໍ້ມູນບົດຄວາມຕາມ ID |
| `POST` | `/api/v1/electrical-knowledge` | JWT | ເພີ່ມບົດຄວາມໃໝ່ |
| `PUT` | `/api/v1/electrical-knowledge/:id` | JWT | ແກ້ໄຂບົດຄວາມ |
| `DELETE` | `/api/v1/electrical-knowledge/:id` | JWT | ລຶບບົດຄວາມ |
| `POST` | `/api/v1/electrical-knowledge/:id/upload/cover` | JWT | ອັບໂຫຼດຮູບໜ້າປົກບົດຄວາມ (form-data: `file`) |
| `PUT` | `/api/v1/electrical-knowledge/:id/view` | Public | ເພີ່ມຈຳນວນຍອດວິວ (Increment View Count) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. ເພີ່ມບົດຄວາມ: ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/electrical-knowledge` (ສິດ `ELECTRICAL_KNOWLEDGE:CREATE`).
2. ອັບໂຫຼດຮູບໜ້າປົກ: ສົ່ງ Multipart Form-Data ໄປທີ່ `POST /api/v1/electrical-knowledge/:id/upload/cover` (`file`: ໄຟລ໌ຮູບພາບ, ບັນທຶກລົງ `/uploads/electrical-knowledge/`).

#### ໂຄງສ້າງ DTO (`CreateElectricalKnowledgeDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `title` | `string` | Yes | ຫົວຂໍ້ບົດຄວາມ |
| `videoUrl` | `string` | No | ລິ້ງວິດິໂອ (YouTube / MP4) |
| `content` | `string` | No | ເນື້ອໃນບົດຄວາມ (HTML/Rich Text) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `DRAFT` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "title": "ວິທີການນຳໃຊ້ໄຟຟ້າຢ່າງປອດໄພໃນລະດູຝົນ",
  "videoUrl": "https://www.youtube.com/watch?v=sample",
  "content": "<p>ເນື້ອໃນຄຳແນະນຳການນຳໃຊ້ໄຟຟ້າໃຫ້ປອດໄພ ແລະ ປະຢັດ...</p>",
  "status": "ACTIVE"
}
```

---

### 3.12 Magazines Module (ລະບົບວາລະສານດິຈິຕອນ E-Magazine)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/magazines/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງວາລະສານເອເລັກໂຕຣນິກ (E-Magazine) ປະຈຳງວດ/ປີ ຂອງ ຟຟລ, ພ້ອມລະບົບອັບໂຫຼດໄຟລ໌ PDF ແລະ ຮູບໜ້າປົກ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/magazines` | Public | ດຶງລາຍການວາລະສານທັງໝົດ |
| `GET` | `/api/v1/magazines/:id` | Public | ດຶງຂໍ້ມູນວາລະສານຕາມ ID |
| `POST` | `/api/v1/magazines` | JWT | ສ້າງລາຍການວາລະສານໃໝ່ |
| `PUT` | `/api/v1/magazines/:id` | JWT | ແກ້ໄຂຂໍ້ມູນວາລະສານ |
| `DELETE` | `/api/v1/magazines/:id` | JWT | ລຶບວາລະສານ |
| `POST` | `/api/v1/magazines/:id/upload/cover` | JWT | ອັບໂຫຼດຮູບໜ້າປົກ (form-data: `file`) |
| `POST` | `/api/v1/magazines/:id/upload/pdf` | JWT | ອັບໂຫຼດໄຟລ໌ PDF (form-data: `file`) |
| `GET` | `/api/v1/magazines/:id/download` | Public | ນັບຍອດດາວໂຫຼດ (Increment Download Count) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. **ສ້າງ Master Record:** ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/magazines`.
2. **ອັບໂຫຼດໜ້າປົກ:** `POST /api/v1/magazines/:id/upload/cover` (form-data: `file` -> `/uploads/magazines/covers/`).
3. **ອັບໂຫຼດໄຟລ໌ PDF:** `POST /api/v1/magazines/:id/upload/pdf` (form-data: `file` -> `/uploads/magazines/documents/`).

#### ໂຄງສ້າງ DTO (`CreateMagazineDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `title` | `string` | Yes | ຊື່ວາລະສານ / ສະບັບ |
| `issueNumber` | `string` | No | ເລກທີສະບັບ ເຊັ່ນ: `"ສະບັບທີ 1/2026"` |
| `publishedYear` | `string` | No | ປີພິມ ເຊັ່ນ: `"2026"` |
| `description` | `string` | No | ຄຳອະທິບາຍເນື້ອໃນວາລະສານ |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `DRAFT`, `ARCHIVED` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "title": "ວາລະສານ ໄຟຟ້າລາວ ປະຈຳໄຕຣມາດ 1 ປີ 2026",
  "issueNumber": "ສະບັບທີ 1/2026",
  "publishedYear": "2026",
  "description": "ລວບລວມຂ່າວສານ ແລະ ຜົນງານການດຳເນີນງານຂອງ ຟຟລ",
  "status": "ACTIVE"
}
```

---

### 3.13 News Categories Module (ລະບົບໝວດໝູ່ຂ່າວສານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/news-categories/`
* **ຄວາມຮັບຜິດຊອບ:** ຈັດການໝວດໝູ່ຂອງຂ່າວສານ (Master Category) ເພື່ອໃຊ້ຈັດກຸ່ມຂ່າວສານປະຊາສຳພັນ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/news-categories` | Public | ດຶງລາຍຊື່ໝວດໝູ່ຂ່າວທັງໝົດ |
| `GET` | `/api/v1/news-categories/:id` | Public | ດຶງໝວດໝູ່ຕາມ ID |
| `POST` | `/api/v1/news-categories` | JWT | ສ້າງໝວດໝູ່ຂ່າວໃໝ່ |
| `PUT` | `/api/v1/news-categories/:id` | JWT | ແກ້ໄຂໝວດໝູ່ຂ່າວ |
| `DELETE` | `/api/v1/news-categories/:id` | JWT | ລຶບໝວດໝູ່ຂ່າວ |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ `POST /api/v1/news-categories` ພ້ອມ JSON Body.
- **ໝາຍເຫດ:** ຕ້ອງມີໝວດໝູ່ຂ່າວກ່ອນ ຈຶ່ງຈະສາມາດສ້າງຂ່າວໃນ News Module ໄດ້ (Foreign Key: `categoryId`).

#### ໂຄງສ້າງ DTO (`CreateNewsCategoryDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Yes | ຊື່ໝວດໝູ່ຂ່າວ |
| `orderIndex` | `number` | No | ລຳດັບການສະແດງຜົນ (Default: 0) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "name": "ຂ່າວກິດຈະກຳ ແລະ ພິທີການ",
  "orderIndex": 1,
  "status": "ACTIVE"
}
```

---

### 3.14 News Module (ລະບົບຂ່າວສານປະຊາສຳພັນ 2 ພາສາ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/news/`
* **ຄວາມຮັບຜິດຊອບ:** ລະບົບບໍລິຫານຂ່າວສານປະຊາສຳພັນ 2 ພາສາ (ລາວ/ອັງກິດ), ປັກໝຸດຂ່າວເດັ່ນ, ອັບໂຫຼດຮູບໜ້າປົກ ແລະ ຮູບພາບ Gallery.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/news` | Public | ດຶງຂ່າວສານທັງໝົດ (ຮອງຮັບ `?categoryId=&search=&isPinned=&page=&limit=`) |
| `GET` | `/api/v1/news/:id` | Public | ດຶງລາຍລະອຽດຂ່າວຕາມ ID |
| `POST` | `/api/v1/news` | JWT | ສ້າງຂ່າວສານໃໝ່ |
| `PUT` | `/api/v1/news/:id` | JWT | ແກ້ໄຂຂ່າວສານ |
| `DELETE` | `/api/v1/news/:id` | JWT | ລຶບຂ່າວສານ |
| `POST` | `/api/v1/news/:id/upload/cover` | JWT | ອັບໂຫຼດຮູບໜ້າປົກຂ່າວ (form-data: `file`) |
| `POST` | `/api/v1/news/:id/upload/gallery` | JWT | ອັບໂຫຼດຮູບ Gallery ຫຼາຍຮູບ (form-data: `files`) |
| `PUT` | `/api/v1/news/:id/view` | Public | ເພີ່ມຍອດວິວຂ່າວ (Increment View Count) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. **ສ້າງຂ່າວ:** ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/news` (ຕ້ອງມີ `categoryId` ທີ່ຖືກຕ້ອງ; `tagIds` ເປັນ Array ຂອງ ID ແທັກທີ່ຕ້ອງການຜູກ).
2. **ອັບໂຫຼດຮູບໜ້າປົກ:** ສົ່ງ `POST /api/v1/news/:id/upload/cover` (form-data: `file` -> `/uploads/news/covers/`).
3. **ອັບໂຫຼດຮູບ Gallery:** ສົ່ງ `POST /api/v1/news/:id/upload/gallery` (form-data: `files` ຫຼາຍໄຟລ໌ພ້ອມກັນ -> `/uploads/news/galleries/`).

#### ໂຄງສ້າງ DTO (`CreateNewsDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `categoryId` | `number` | Yes | ລະຫັດໝວດໝູ່ຂ່າວ (Foreign Key) |
| `tagIds` | `number[]` | No | ລາຍການ ID ແທັກຂ່າວ (ເຊັ່ນ: `[1, 2]`) |
| `titleLa` | `string` | Yes | ຫົວຂໍ້ຂ່າວພາສາລາວ |
| `titleEn` | `string` | No | ຫົວຂໍ້ຂ່າວພາສາອັງກິດ |
| `contentLa` | `string` | Yes | ເນື້ອໃນຂ່າວພາສາລາວ (HTML/Rich Text) |
| `contentEn` | `string` | No | ເນື້ອໃນຂ່າວພາສາອັງກິດ (HTML/Rich Text) |
| `isPinned` | `boolean` | No | ປັກໝຸດຂ່າວເດັ່ນ (Default: `false`) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `DRAFT` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "categoryId": 1,
  "tagIds": [1, 2],
  "titleLa": "ຟຟລ ເປີດສະຖານີສາກລົດໄຟຟ້າແຫ່ງໃໝ່ ຢູ່ນະຄອນຫຼວງວຽງຈັນ",
  "titleEn": "EDL Launches New EV Charging Station in Vientiane",
  "contentLa": "<p>ລັດວິສາຫະກິດໄຟຟ້າລາວ ໄດ້ຈັດພິທີເປີດສະຖານີສາກລົດໄຟຟ້າ...</p>",
  "contentEn": "<p>Electricite du Laos has officially launched a new EV charging station...</p>",
  "isPinned": true,
  "status": "ACTIVE"
}
```

---

### 3.15 News Tags Module (ລະບົບແທັກຂ່າວສານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/news-tags/`
* **ຄວາມຮັບຜິດຊອບ:** ຈັດການແທັກຄຳຄົ້ນຫາ (Tags) ສຳລັບຕິດໃຫ້ກັບຂ່າວສານ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/news-tags` | Public | ດຶງແທັກທັງໝົດ |
| `GET` | `/api/v1/news-tags/:id` | Public | ດຶງແທັກຕາມ ID |
| `POST` | `/api/v1/news-tags` | JWT | ສ້າງແທັກໃໝ່ |
| `PUT` | `/api/v1/news-tags/:id` | JWT | ແກ້ໄຂຊື່ແທັກ |
| `DELETE` | `/api/v1/news-tags/:id` | JWT | ລຶບແທັກ |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/news-tags`. ຊື່ແທັກຕ້ອງບໍ່ຊ້ຳກັນ (Unique).

#### ໂຄງສ້າງ DTO (`CreateNewsTagDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Yes | ຊື່ແທັກ ເຊັ່ນ: `"ພະລັງງານສະອາດ"` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "name": "ພະລັງງານສະອາດ"
}
```

---

### 3.16 Legislations Module (ລະບົບເອກະສານນິຕິກຳ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/legislations/`
* **ຄວາມຮັບຜິດຊອບ:** ຈັດການເອກະສານນິຕິກຳ, ກົດໝາຍ, ດຳລັດ, ຂໍ້ຕົກລົງ ແລະ ລະບຽບການ ພ້ອມໄຟລ໌ PDF ສຳລັບດາວໂຫຼດ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/legislations` | Public | ດຶງລາຍການນິຕິກຳທັງໝົດ (ຮອງຮັບ `?category=&search=`) |
| `GET` | `/api/v1/legislations/:id` | Public | ດຶງຂໍ້ມູນນິຕິກຳຕາມ ID |
| `POST` | `/api/v1/legislations` | JWT | ສ້າງລາຍການນິຕິກຳໃໝ່ |
| `PUT` | `/api/v1/legislations/:id` | JWT | ແກ້ໄຂຂໍ້ມູນນິຕິກຳ |
| `DELETE` | `/api/v1/legislations/:id` | JWT | ລຶບນິຕິກຳ |
| `POST` | `/api/v1/legislations/:id/upload/document` | JWT | ອັບໂຫຼດໄຟລ໌ເອກະສານ PDF (form-data: `file`) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. ສ້າງຂໍ້ມູນນິຕິກຳ: ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/legislations`.
2. ອັບໂຫຼດໄຟລ໌ PDF: ສົ່ງ Multipart Form-Data ໄປທີ່ `POST /api/v1/legislations/:id/upload/document` (`file`: ໄຟລ໌ PDF, ບັນທຶກລົງ `/uploads/legislations/`).

#### ໂຄງສ້າງ DTO (`CreateLegislationDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `title` | `string` | Yes | ຊື່ເອກະສານນິຕິກຳ |
| `docNumber` | `string` | No | ເລກທີເອກະສານ ເຊັ່ນ: `"ເລກທີ 012/ສພຊ"` |
| `category` | `string` | Yes | ປະເພດນິຕິກຳ: `LAW`, `DECREE`, `DECISION`, `REGULATION` |
| `publishedDate` | `string` | No | ວັນທີປະກາດໃຊ້ (ISO 8601 ເຊັ່ນ `"2026-01-15T00:00:00.000Z"`) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "title": "ກົດໝາຍວ່າດ້ວຍໄຟຟ້າ (ສະບັບປັບປຸງ)",
  "docNumber": "ເລກທີ 012/ສພຊ",
  "category": "LAW",
  "publishedDate": "2026-01-15T00:00:00.000Z",
  "status": "ACTIVE"
}
```

---

### 3.17 Electricity Tariffs Module (ລະບົບໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/electricity-tariffs/`
* **ຄວາມຮັບຜິດຊອບ:** ເຜີຍແຜ່ໂຄງສ້າງລາຄາໄຟຟ້າແຕ່ລະປະເພດຜູ້ໃຊ້ (ທີ່ຢູ່ອາໄສ, ທຸລະກິດ, ອຸດສາຫະກຳ, ກະສິກຳ, ຫ້ອງການ).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-tariffs` | Public | ດຶງຂໍ້ມູນອັດຕາຄ່າໄຟທັງໝົດ |
| `GET` | `/api/v1/electricity-tariffs/:id` | Public | ດຶງຂໍ້ມູນອັດຕາຄ່າໄຟຕາມ ID |
| `POST` | `/api/v1/electricity-tariffs` | JWT | ສ້າງຂໍ້ມູນອັດຕາຄ່າໄຟໃໝ່ |
| `PUT` | `/api/v1/electricity-tariffs/:id` | JWT | ແກ້ໄຂຂໍ້ມູນອັດຕາຄ່າໄຟ |
| `DELETE` | `/api/v1/electricity-tariffs/:id` | JWT | ລຶບຂໍ້ມູນອັດຕາຄ່າໄຟ |
| `POST` | `/api/v1/electricity-tariffs/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບຕາຕະລາງ (form-data: `file`) |
| `POST` | `/api/v1/electricity-tariffs/:id/upload/document` | JWT | ອັບໂຫຼດໄຟລ໌ເອກະສານ PDF (form-data: `file`) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. ສ້າງຂໍ້ມູນອັດຕາຄ່າໄຟ: `POST /api/v1/electricity-tariffs` ພ້ອມ JSON Body.
2. ອັບໂຫຼດຮູບພາບ: `POST /api/v1/electricity-tariffs/:id/upload/image` (form-data: `file` -> `/uploads/electricity-tariffs/images/`).
3. ອັບໂຫຼດໄຟລ໌ເອກະສານ: `POST /api/v1/electricity-tariffs/:id/upload/document` (form-data: `file` -> `/uploads/electricity-tariffs/documents/`).

#### ໂຄງສ້າງ DTO (`CreateElectricityTariffDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `title` | `string` | Yes | ຫົວຂໍ້ອັດຕາຄ່າໄຟຟ້າ |
| `customerType` | `string` | Yes | ປະເພດຜູ້ຊົມໃຊ້: `RESIDENTIAL`, `COMMERCIAL`, `INDUSTRIAL`, `AGRICULTURE`, `OFFICE` |
| `voltageLevel` | `string` | No | ລະດັບແຮງດັນ: `LOW_VOLTAGE`, `MEDIUM_VOLTAGE`, `HIGH_VOLTAGE` |
| `effectiveDate` | `string` | No | ວັນທີເລີ່ມມີຜົນ (ISO 8601 ເຊັ່ນ `"2026-01-01T00:00:00.000Z"`) |
| `description` | `string` | No | ລາຍລະອຽດໂຄງສ້າງຄ່າໄຟ (HTML/Rich Text) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "title": "ອັດຕາຄ່າໄຟຟ້າປະເພດທີ່ຢູ່ອາໄສ ປີ 2026",
  "customerType": "RESIDENTIAL",
  "voltageLevel": "LOW_VOLTAGE",
  "effectiveDate": "2026-01-01T00:00:00.000Z",
  "description": "<p>ລາຍລະອຽດອັດຕາຄ່າໄຟຟ້າແບບຂັ້ນບັນໄດສຳລັບຄົວເຮືອນ...</p>",
  "status": "ACTIVE"
}
```

---

### 3.18 Procurements Module (ລະບົບປະກາດຈັດຊື້-ຈັດຈ້າງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/procurements/`
* **ຄວາມຮັບຜິດຊອບ:** ປະກາດປະມູນຈັດຊື້-ຈັດຈ້າງ, ວຽກກໍ່ສ້າງ, ບໍລິການ, ທີ່ປຶກສາ ພ້ອມໄຟລ໌ TOR/PDF.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/procurements` | Public | ດຶງປະກາດຈັດຊື້-ຈັດຈ້າງທັງໝົດ |
| `GET` | `/api/v1/procurements/:id` | Public | ດຶງຂໍ້ມູນປະກາດຕາມ ID |
| `POST` | `/api/v1/procurements` | JWT | ສ້າງປະກາດຈັດຊື້-ຈັດຈ້າງໃໝ່ |
| `PUT` | `/api/v1/procurements/:id` | JWT | ແກ້ໄຂປະກາດຈັດຊື້-ຈັດຈ້າງ |
| `DELETE` | `/api/v1/procurements/:id` | JWT | ລຶບປະກາດຈັດຊື້-ຈັດຈ້າງ |
| `POST` | `/api/v1/procurements/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບປະກອບ (form-data: `file`) |
| `POST` | `/api/v1/procurements/:id/upload/document` | JWT | ອັບໂຫຼດເອກະສານ TOR/PDF (form-data: `file`) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. ສ້າງປະກາດປະມູນ: `POST /api/v1/procurements` ພ້ອມ JSON Body (ກຳນົດ `openDate` ແລະ `closeDate`).
2. ອັບໂຫຼດຮູບປະກອບ: `POST /api/v1/procurements/:id/upload/image` (`file` -> `/uploads/procurements/images/`).
3. ອັບໂຫຼດເອກະສານ TOR: `POST /api/v1/procurements/:id/upload/document` (`file` -> `/uploads/procurements/documents/`).

#### ໂຄງສ້າງ DTO (`CreateProcurementDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `title` | `string` | Yes | ຫົວຂໍ້ການປະກາດປະມູນ |
| `procurementType` | `string` | Yes | ປະເພດ: `GOODS`, `WORKS`, `SERVICES`, `CONSULTING` |
| `budgetAmount` | `number` | No | ມູນຄ່າງົບປະມານ (ກີບ) |
| `openDate` | `string` | Yes | ວັນທີເປີດຮັບຊອງ (ISO 8601) |
| `closeDate` | `string` | Yes | ວັນທີປິດຮັບຊອງ (ISO 8601) |
| `content` | `string` | No | ເງື່ອນໄຂ ແລະ ລາຍລະອຽດເຕັກນິກ (HTML) |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `DRAFT`, `CANCELLED`, `CLOSED` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "title": "ປະກາດປະມູນຈັດຊື້ໝໍ້ແປງໄຟຟ້າຂະໜາດ 250 kVA",
  "procurementType": "GOODS",
  "budgetAmount": 500000000,
  "openDate": "2026-11-01T00:00:00.000Z",
  "closeDate": "2026-11-30T17:00:00.000Z",
  "content": "<p>ເງື່ອນໄຂ ແລະ ລາຍລະອຽດເຕັກນິກຂອງໝໍ້ແປງໄຟຟ້າ...</p>",
  "status": "ACTIVE"
}
```

---

### 3.19 Positions Module (ລະບົບຈັດການຕຳແໜ່ງງານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/positions/`
* **ຄວາມຮັບຜິດຊອບ:** ຈັດການ Master Data ຕຳແໜ່ງງານຕ່າງໆ ພາຍໃນອົງກອນ ເພື່ອໃຊ້ຜູກມັດກັບປະກາດຮັບສະໝັກພະນັກງານ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/positions` | Public | ດຶງລາຍຊື່ຕຳແໜ່ງງານທັງໝົດ |
| `GET` | `/api/v1/positions/:id` | Public | ດຶງຂໍ້ມູນຕຳແໜ່ງງານຕາມ ID |
| `POST` | `/api/v1/positions` | JWT | ສ້າງຕຳແໜ່ງງານໃໝ່ |
| `PUT` | `/api/v1/positions/:id` | JWT | ແກ້ໄຂຂໍ້ມູນຕຳແໜ່ງງານ |
| `DELETE` | `/api/v1/positions/:id` | JWT | ລຶບຕຳແໜ່ງງານ |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/positions`.
- **ໝາຍເຫດ:** ຕຳແໜ່ງງານຕ້ອງຖືກສ້າງຂຶ້ນກ່ອນ ຈຶ່ງຈະສາມາດສ້າງປະກາດຮັບສະໝັກງານໃນ Job Postings Module ໄດ້ (Foreign Key: `positionId`).

#### ໂຄງສ້າງ DTO (`CreatePositionDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Yes | ຊື່ຕຳແໜ່ງງານ |
| `departmentId` | `number` | No | ລະຫັດຝ່າຍຕົ້ນສັງກັດ (Foreign Key) |
| `description` | `string` | No | ຄຳອະທິບາຍໜ້າທີ່ຕຳແໜ່ງ |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "name": "ນັກວິສະວະກອນໄຟຟ້າ",
  "departmentId": 1,
  "description": "ຮັບຜິດຊອບການອອກແບບ ແລະ ຄວບຄຸມລະບົບສາຍສົ່ງໄຟຟ້າ",
  "status": "ACTIVE"
}
```

---

### 3.20 Job Postings Module (ລະບົບປະກາດຮັບສະໝັກພະນັກງານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/job-postings/`
* **ຄວາມຮັບຜິດຊອບ:** ປະກາດຮັບສະໝັກພະນັກງານໃໝ່, ກຳນົດຄຸນສົມບັດ, ວັນທີປິດຮັບສະໝັກ, ແລະ ອັບໂຫຼດຮູບປ້າຍປະກາດ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/job-postings` | Public | ດຶງລາຍການປະກາດຮັບສະໝັກງານທັງໝົດ |
| `GET` | `/api/v1/job-postings/:id` | Public | ດຶງຂໍ້ມູນປະກາດຮັບສະໝັກງານຕາມ ID |
| `POST` | `/api/v1/job-postings` | JWT | ສ້າງປະກາດຮັບສະໝັກງານໃໝ່ |
| `PUT` | `/api/v1/job-postings/:id` | JWT | ແກ້ໄຂປະກາດຮັບສະໝັກງານ |
| `DELETE` | `/api/v1/job-postings/:id` | JWT | ລຶບປະກາດຮັບສະໝັກງານ |
| `POST` | `/api/v1/job-postings/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບປ້າຍປະກາດ (form-data: `file`) |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. ສ້າງປະກາດຮັບສະໝັກ: `POST /api/v1/job-postings` ພ້ອມ JSON Body (ຕ້ອງມີ `positionId` ທີ່ສ້າງມາແລ້ວ).
2. ອັບໂຫຼດຮູບປ້າຍ Banner/Poster: `POST /api/v1/job-postings/:id/upload/image` (form-data: `file` -> `/uploads/job-postings/`).

#### ໂຄງສ້າງ DTO (`CreateJobPostingDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `title` | `string` | Yes | ຫົວຂໍ້ປະກາດຮັບສະໝັກ |
| `positionId` | `number` | Yes | ລະຫັດຕຳແໜ່ງງານ (Foreign Key) |
| `departmentId` | `number` | No | ລະຫັດຝ່າຍທີ່ສັງກັດ (Foreign Key) |
| `location` | `string` | No | ສະຖານທີ່ປະຕິບັດງານ ເຊັ່ນ: `"ນະຄອນຫຼວງວຽງຈັນ"` |
| `employmentType` | `string` | Yes | ປະເພດການຈ້າງ: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP` |
| `openDate` | `string` | Yes | ວັນທີເປີດຮັບສະໝັກ (ISO 8601) |
| `closeDate` | `string` | Yes | ວັນທີປິດຮັບສະໝັກ (ISO 8601) |
| `description` | `string` | No | ລາຍລະອຽດໜ້າທີ່ຮັບຜິດຊອບ (HTML) |
| `qualifications` | `string` | No | ເງື່ອນໄຂ ແລະ ຄຸນສົມບັດຜູ້ສະໝັກ (HTML) |
| `status` | `string` | No | ສະຖານະ: `OPEN`, `CLOSED`, `DRAFT` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "title": "ຮັບສະໝັກນັກວິສະວະກອນໄຟຟ້າ 2 ຕຳແໜ່ງ",
  "positionId": 1,
  "departmentId": 1,
  "location": "ນະຄອນຫຼວງວຽງຈັນ",
  "employmentType": "FULL_TIME",
  "openDate": "2026-11-01T00:00:00.000Z",
  "closeDate": "2026-11-25T17:00:00.000Z",
  "description": "<p>ປະຕິບັດໜ້າທີ່ໃນການຄວບຄຸມ ແລະ ບຳລຸງຮັກສາລະບົບສາຍສົ່ງ...</p>",
  "qualifications": "<p>ຈົບປະລິນຍາຕີ ສາຂາວິສະວະກຳໄຟຟ້າ ຫຼື ສາຂາທີ່ກ່ຽວຂ້ອງ</p>",
  "status": "OPEN"
}
```

---

### 3.21 Roles Module (ລະບົບຈັດການສິດທິບົດບາດ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/roles/`
* **ຄວາມຮັບຜິດຊອບ:** ລະບົບບໍລິຫານບົດບາດຜູ້ໃຊ້ (RBAC) ພ້ອມຜູກສິດທິລະອຽດ (Fine-grained Permissions).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/roles` | JWT | ດຶງລາຍຊື່ບົດບາດທັງໝົດ (ຮອງຮັບ `?search=&page=&limit=`) |
| `GET` | `/api/v1/roles/dropdown` | JWT | ດຶງບົດບາດແບບ Dropdown (ສະເພາະ ACTIVE) |
| `GET` | `/api/v1/roles/:id` | JWT | ດຶງຂໍ້ມູນບົດບາດຕາມ ID |
| `POST` | `/api/v1/roles` | JWT | ສ້າງບົດບາດໃໝ່ |
| `PUT` | `/api/v1/roles/:id` | JWT | ແກ້ໄຂບົດບາດ |
| `DELETE` | `/api/v1/roles/:id` | JWT | ລຶບບົດບາດ |

#### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/roles` (ສິດ `ROLES:CREATE`).
- ສາມາດກຳນົດ Array ຂອງ `permissionIds` ເພື່ອຜູກສິດທິເຂົ້າກັບບົດບາດໄດ້ທັນທີຕອນສ້າງ.

#### ໂຄງສ້າງ DTO (`CreateRoleDto`):
| Field | Type | Required | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `code` | `string` | Yes | ລະຫັດບົດບາດ (Unique) ເຊັ່ນ: `"FINANCE_MANAGER"` |
| `name` | `string` | Yes | ຊື່ບົດບາດ ເຊັ່ນ: `"ຜູ້ຈັດການຝ່າຍການເງິນ"` |
| `description` | `string` | No | ຄຳອະທິບາຍຂອບເຂດສິດທິ |
| `permissionIds` | `number[]` | No | ລາຍການ ID ສິດທິທີ່ຕ້ອງການຜູກ |
| `status` | `string` | No | ສະຖານະ: `ACTIVE`, `INACTIVE` |

#### ຕົວຢ່າງ Request Payload:
```json
{
  "code": "FINANCE_MANAGER",
  "name": "ຜູ້ຈັດການຝ່າຍການເງິນ",
  "description": "ສິດທິໃນການຄຸ້ມຄອງ ແລະ ອະນຸມັດລາຍການຈັດຊື້-ຈັດຈ້າງ ແລະ ຄ່າໄຟ",
  "permissionIds": [1, 2, 5, 8],
  "status": "ACTIVE"
}
```

---

### 3.22 Electricity Calculator System (ລະບົບຄິດໄລ່ຄ່າໄຟຟ້າ ແລະ ແຜນປະຢັດໄຟ)
ລະບົບ **Electricity Calculator** ຂອງ ຟຟລ ໄດ້ຮັບການອອກແບບ ແລະ ພັດທະນາຕາມຫຼັກການ **Clean Architecture / Domain-Driven Design (DDD)** ໂດຍແຍກໂຄງສ້າງການເຮັດວຽກອອກເປັນ **6 ໂມດູນຍ່ອຍ (6 Submodules, ລວມ 30 Endpoints)** ເພື່ອໃຫ້ແຕ່ລະສ່ວນມີ Single Responsibility, ງ່າຍຕໍ່ການຮັກສາ, ແລະ ສາມາດເຊື່ອມຕໍ່ກັບຖານຂໍ້ມູນ PostgreSQL ຜ່ານ Prisma ORM ໄດ້ຢ່າງມີປະສິດທິພາບ.

```
   ┌────────────────────────────────────────────────────────────────────────┐
   │                  Electricity Calculator System (30 APIs)               │
   ├────────────────────────────────────────────────────────────────────────┤
   │ 3.22.1 Tariff Categories Submodule        (5 Endpoints - Admin CRUD)   │
   │ 3.22.2 Tariff Schedules & Notices Submodule (7 Endpoints - Admin CRUD) │
   │ 3.22.3 Appliance Categories Submodule     (5 Endpoints - Admin CRUD)   │
   │ 3.22.4 Appliance Presets Submodule        (5 Endpoints - Admin CRUD)   │
   │ 3.22.5 Saving Templates Submodule         (5 Endpoints - Admin CRUD)   │
   │ 3.22.6 Electricity Calculation Engine     (3 Endpoints - Public APIs)  │
   └────────────────────────────────────────────────────────────────────────┘
```

---

#### 3.22.1 Tariff Categories Submodule (ລະບົບປະເພດອັດຕາຄ່າໄຟຟ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/tariff-categories/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງປະເພດຜູ້ຊົມໃຊ້ໄຟຟ້າ (ເຊັ່ນ: ທີ່ຢູ່ອາໄສ - Residential, ທຸລະກິດ - Commercial, ອຸດສາຫະກຳ - Industrial, ກະສິກຳ - Agriculture, ຫ້ອງການລັດ - Government).
  - ເປັນ Master Data ສຳລັບຜູກມັດກັບປະກາດອັດຕາຄ່າໄຟ ແລະ ຕາຕະລາງຄ່າໄຟຂັ້ນບັນໄດລາຍເດືອນ.

##### Use Cases ໃນລະບົບ:
1. **`GetTariffCategoriesUseCase`**: ດຶງລາຍການປະເພດອັດຕາຄ່າໄຟທັງໝົດ.
2. **`GetTariffCategoryByIdUseCase`**: ດຶງຂໍ້ມູນປະເພດອັດຕາຄ່າໄຟຕາມ ID.
3. **`CreateTariffCategoryUseCase`**: ສ້າງປະເພດອັດຕາຄ່າໄຟໃໝ່.
4. **`UpdateTariffCategoryUseCase`**: ແກ້ໄຂຂໍ້ມູນປະເພດອັດຕາຄ່າໄຟ.
5. **`DeleteTariffCategoryUseCase`**: ລຶບປະເພດອັດຕາຄ່າໄຟ (ປ້ອງກັນການລຶບຖ້າມີ Schedules ຜູກຢູ່).

##### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-calculator/tariff-categories` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງປະເພດລາຄາໄຟທັງໝົດ (ຮອງຮັບ `?search=`) |
| `GET` | `/api/v1/electricity-calculator/tariff-categories/:id` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງປະເພດລາຄາໄຟຕາມ ID |
| `POST` | `/api/v1/electricity-calculator/tariff-categories` | JWT (ELECTRICITY_CALCULATOR:CREATE) | ສ້າງປະເພດລາຄາໄຟໃໝ່ |
| `PUT` | `/api/v1/electricity-calculator/tariff-categories/:id` | JWT (ELECTRICITY_CALCULATOR:UPDATE) | ແກ້ໄຂປະເພດລາຄາໄຟ |
| `DELETE` | `/api/v1/electricity-calculator/tariff-categories/:id` | JWT (ELECTRICITY_CALCULATOR:DELETE) | ລຶບປະເພດລາຄາໄຟ |

##### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ HTTP POST ໄປທີ່ `POST /api/v1/electricity-calculator/tariff-categories` ພ້ອມ JSON Body (ສິດ `ELECTRICITY_CALCULATOR:CREATE`).

##### ໂຄງສ້າງ DTO (`CreateTariffCategoryDto`):
| Field | Type | Required | Default | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :---: | :--- |
| `nameLa` | `string` | Yes | - | ຊື່ປະເພດພາສາລາວ ເຊັ່ນ: `"ປະເພດທີ່ຢູ່ອາໄສ (Residential)"` |
| `nameEn` | `string` | No | - | ຊື່ປະເພດພາສາອັງກິດ ເຊັ່ນ: `"Residential"` |
| `categoryGroup` | `string` | No | - | ກຸ່ມປະເພດອັດຕາ ເຊັ່ນ: `"RESIDENTIAL"`, `"NON_RESIDENTIAL"` |
| `voltageLevel` | `string` | No | - | ລະດັບແຮງດັນໄຟຟ້າ ເຊັ່ນ: `"0.4 kV"`, `"22 kV"`, `"115 kV"` |
| `description` | `string` | No | - | ຄຳອະທິບາຍລາຍລະອຽດ |
| `orderIndex` | `number` | No | `0` | ລຳດັບການສະແດງຜົນ |
| `status` | `string` | No | `ACTIVE` | ສະຖານະ (`ACTIVE`, `INACTIVE`) |

##### ຕົວຢ່າງ Request Payloads:
```json
// 1. POST /api/v1/electricity-calculator/tariff-categories
{
  "nameLa": "ອົງການຈັດຕັ້ງສາກົນ",
  "nameEn": "International Organizations",
  "categoryGroup": "NON_RESIDENTIAL",
  "voltageLevel": "0.4 kV",
  "description": "ສະຖານທູດ ແລະ ອົງການຈັດຕັ້ງສາກົນ ແຮງດັນຕ່ຳ 0.4 kV",
  "orderIndex": 2,
  "status": "ACTIVE"
}

// 2. PUT /api/v1/electricity-calculator/tariff-categories/1
{
  "nameLa": "ອົງການຈັດຕັ້ງສາກົນ (ປັບປຸງ)",
  "categoryGroup": "NON_RESIDENTIAL",
  "voltageLevel": "0.4 kV",
  "orderIndex": 2,
  "status": "ACTIVE"
}
```

---

#### 3.22.2 Tariff Schedules & Notices Submodule (ລະບົບປະກາດອັດຕາຄ່າໄຟ & ຕາຕະລາງ 8 ຂັ້ນບັນໄດ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/tariff-schedules/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງແຈ້ງການອັດຕາຄ່າໄຟ (`TariffNotice`): ເລກທີແຈ້ງການ, ວັນທີອອກ ແລະ ວັນທີເລີ່ມມີຜົນ, ອັດຕາອາກອນມູນຄ່າເພີ່ມ (`vatRate: 0.1`), ເພດານໜ່ວຍໄຟສ່ວນຫຼຸດລະດູຮ້ອນ (`hotSeasonDiscountCapKwh: 300`), ແລະ ຄ່າບຳລຸງຮັກສາມິດເຕີ (`maintenanceFeeKip: 5000`).
  - ຄຸ້ມຄອງຕາຕະລາງອັດຕາຄ່າໄຟລາຍເດືອນ (`TariffMonthlySchedule`) ພ້ອມອັດຕາຄ່າໄຟ **8 ຂັ້ນບັນໄດ** (`TariffTier`) ແບບ Transactional Upsert.

##### Use Cases ໃນລະບົບ:
1. **`GetTariffNoticesUseCase`**: ດຶງລາຍການແຈ້ງການອັດຕາຄ່າໄຟທັງໝົດ.
2. **`GetTariffNoticeByIdUseCase`**: ດຶງແຈ້ງການພ້ອມຕາຕະລາງອັດຕາຄ່າໄຟທັງໝົດທີ່ຂຶ້ນກັບແຈ້ງການນັ້ນ.
3. **`CreateTariffNoticeUseCase`**: ສ້າງແຈ້ງການອັດຕາຄ່າໄຟໃໝ່.
4. **`UpdateTariffNoticeUseCase`**: ແກ້ໄຂຂໍ້ມູນແຈ້ງການອັດຕາຄ່າໄຟ.
5. **`DeleteTariffNoticeUseCase`**: ລຶບແຈ້ງການອັດຕາຄ່າໄຟ.
6. **`UpsertTariffScheduleUseCase`**: ບັນທຶກ ຫຼື ອັບເດດຕາຕະລາງຄ່າໄຟລາຍເດືອນ ພ້ອມຂັ້ນບັນໄດ 8 ຂັ້ນໃນ Transaction ດຽວ.
7. **`DeleteTariffScheduleUseCase`**: ລຶບຕາຕະລາງອັດຕາຄ່າໄຟລາຍເດືອນ.

##### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-calculator/tariff-notices` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງລາຍການປະກາດອັດຕາຄ່າໄຟທັງໝົດ |
| `GET` | `/api/v1/electricity-calculator/tariff-notices/:id` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງປະກາດອັດຕາຄ່າໄຟ ພ້ອມຕາຕະລາງຂັ້ນບັນໄດ |
| `POST` | `/api/v1/electricity-calculator/tariff-notices` | JWT (ELECTRICITY_CALCULATOR:CREATE) | ສ້າງປະກາດອັດຕາຄ່າໄຟໃໝ່ |
| `PUT` | `/api/v1/electricity-calculator/tariff-notices/:id` | JWT (ELECTRICITY_CALCULATOR:UPDATE) | ແກ້ໄຂປະກາດອັດຕາຄ່າໄຟ |
| `DELETE` | `/api/v1/electricity-calculator/tariff-notices/:id` | JWT (ELECTRICITY_CALCULATOR:DELETE) | ລຶບປະກາດອັດຕາຄ່າໄຟ |
| `PUT` | `/api/v1/electricity-calculator/schedules` | JWT (ELECTRICITY_CALCULATOR:UPDATE) | ບັນທຶກ/ອັບເດດຕາຕະລາງອັດຕາຄ່າໄຟລາຍເດືອນ + 8 ຂັ້ນບັນໄດ (Upsert) |
| `DELETE` | `/api/v1/electricity-calculator/schedules/:id` | JWT (ELECTRICITY_CALCULATOR:DELETE) | ລຶບຕາຕະລາງອັດຕາຄ່າໄຟລາຍເດືອນ |

##### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
1. **ສ້າງປະກາດອັດຕາຄ່າໄຟ:** ສົ່ງ `POST /api/v1/electricity-calculator/tariff-notices` ພ້ອມກຳນົດ `noticeNumber`, `effectiveFrom`, `effectiveTo`, `vatRate` (0.1), `hotSeasonDiscountCapKwh` (300), ແລະ `maintenanceFeeKip` (5000).
2. **Upsert ຕາຕະລາງ 8 ຂັ້ນບັນໄດ:** ສົ່ງ `PUT /api/v1/electricity-calculator/schedules` ໂດຍສົ່ງ `noticeId`, `categoryId`, `year`, `month`, ແລະ Array ຂອງ `tiers` ທັງ 8 ຂັ້ນພ້ອມກັນ.

##### ໂຄງສ້າງ DTOs:
- **`CreateTariffNoticeDto`:**
  | Field | Type | Required | Default | ຄຳອະທິບາຍ |
  | :--- | :--- | :---: | :--- |
  | `noticeNumber` | `string` | Yes | - | ເລກທີແຈ້ງການ ເຊັ່ນ: `"2026/ຟຟລ.ຝທຜ"` |
  | `title` | `string` | Yes | - | ຫົວຂໍ້ແຈ້ງການ |
  | `issuedDate` | `string` | Yes | - | ວັນທີອອກແຈ້ງການ (`YYYY-MM-DD`) |
  | `effectiveFrom` | `string` | Yes | - | ວັນທີເລີ່ມມີຜົນ (`YYYY-MM-DD`) |
  | `effectiveTo` | `string` | Yes | - | ວັນທີໝົດຜົນ (`YYYY-MM-DD`) |
  | `vatRate` | `number` | Yes | `0.1` | ອັດຕາ VAT (10% = 0.1) |
  | `hotSeasonDiscountCapKwh` | `number` | No | `300` | ເພດານໜ່ວຍໄຟທີ່ໄດ້ສ່ວນຫຼຸດລະດູຮ້ອນ (kWh) |
  | `maintenanceFeeKip` | `number` | No | `5000` | ຄ່າບໍລິການຮັກສາມິດເຕີ (ກີບ) |
  | `status` | `string` | No | `ACTIVE` | ສະຖານະ (`ACTIVE`, `INACTIVE`) |

- **`UpsertTariffScheduleDto`:**
  | Field | Type | Required | Default | ຄຳອະທິບາຍ |
  | :--- | :--- | :---: | :--- |
  | `noticeId` | `number` | Yes | - | ລະຫັດແຈ້ງການອັດຕາຄ່າໄຟ (Foreign Key) |
  | `categoryId` | `number` | Yes | - | ລະຫັດປະເພດອັດຕາຄ່າໄຟ (Foreign Key ອ້າງອີງ TariffCategory) |
  | `year` | `number` | Yes | - | ປີ ຄ.ສ. ເຊັ່ນ: `2026` |
  | `month` | `number` | Yes | - | ເດືອນ (1–12) |
  | `isHotSeason` | `boolean` | No | `false` | ເດືອນລະດູຮ້ອນ (ມີສ່ວນຫຼຸດສຳລັບ <= 300 kWh) |
  | `maintenanceFeeKip` | `number` | No | `5000` | ຄ່າບໍລິການມິດເຕີລາຍເດືອນ |
  | `tiers` | `TariffTierDto[]` | Yes | - | Array ຂອງຂັ້ນບັນໄດທັງ 8 ຂັ້ນ (`tierOrder`, `label`, `minKwh`, `maxKwh`, `rateKipPerKwh`) |

##### ຕົວຢ່າງ Request Payloads:
```json
// 1. POST /api/v1/electricity-calculator/tariff-notices
{
  "noticeNumber": "2026/ຟຟລ.ຝທຜ",
  "title": "ແຈ້ງການ ປັບປຸງໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ ສະບັບໃໝ່",
  "issuedDate": "2026-05-01",
  "effectiveFrom": "2026-06-01",
  "effectiveTo": "2029-12-31",
  "vatRate": 0.1,
  "hotSeasonDiscountCapKwh": 300,
  "maintenanceFeeKip": 5000,
  "status": "ACTIVE"
}

// 2. PUT /api/v1/electricity-calculator/schedules (Upsert 8 Tiers)
{
  "noticeId": 1,
  "categoryId": 1,
  "year": 2026,
  "month": 11,
  "isHotSeason": false,
  "maintenanceFeeKip": 5000,
  "tiers": [
    { "tierOrder": 1, "label": "0–25", "minKwh": 0, "maxKwh": 25, "rateKipPerKwh": 355 },
    { "tierOrder": 2, "label": "26–150", "minKwh": 26, "maxKwh": 150, "rateKipPerKwh": 422 },
    { "tierOrder": 3, "label": "151–300", "minKwh": 151, "maxKwh": 300, "rateKipPerKwh": 999 },
    { "tierOrder": 4, "label": "301–400", "minKwh": 301, "maxKwh": 400, "rateKipPerKwh": 1200 },
    { "tierOrder": 5, "label": "401–500", "minKwh": 401, "maxKwh": 500, "rateKipPerKwh": 1450 },
    { "tierOrder": 6, "label": "501–1,000", "minKwh": 501, "maxKwh": 1000, "rateKipPerKwh": 1750 },
    { "tierOrder": 7, "label": "1,001–1,500", "minKwh": 1001, "maxKwh": 1500, "rateKipPerKwh": 2050 },
    { "tierOrder": 8, "label": "> 1,500", "minKwh": 1501, "maxKwh": null, "rateKipPerKwh": 2350 }
  ]
}
```

---

#### 3.22.3 Appliance Categories Submodule (ລະບົບໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/appliance-categories/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງໝວດໝູ່ຂອງເຄື່ອງໃຊ້ໄຟຟ້າ (ເຊັ່ນ: ແອ, ຕູ້ເຢັນ, ໄຟເຍືອງທາງ, ໂທລະພາບ, ເຄື່ອງສາກ EV, ປ້ຳນ້ຳ) ພ້ອມໄອຄອນປະກອບ.

##### Use Cases ໃນລະບົບ:
1. **`GetApplianceCategoriesUseCase`**: ດຶງໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າທັງໝົດ.
2. **`GetApplianceCategoryByIdUseCase`**: ດຶງໝວດໝູ່ຕາມ ID.
3. **`CreateApplianceCategoryUseCase`**: ສ້າງໝວດໝູ່ໃໝ່.
4. **`UpdateApplianceCategoryUseCase`**: ແກ້ໄຂໝວດໝູ່.
5. **`DeleteApplianceCategoryUseCase`**: ລຶບໝວດໝູ່.

##### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-calculator/categories` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າທັງໝົດ (ຮອງຮັບ `?search=`) |
| `GET` | `/api/v1/electricity-calculator/categories/:id` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງໝວດໝູ່ຕາມ ID |
| `POST` | `/api/v1/electricity-calculator/categories` | JWT (ELECTRICITY_CALCULATOR:CREATE) | ສ້າງໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າໃໝ່ |
| `PUT` | `/api/v1/electricity-calculator/categories/:id` | JWT (ELECTRICITY_CALCULATOR:UPDATE) | ແກ້ໄຂໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ |
| `DELETE` | `/api/v1/electricity-calculator/categories/:id` | JWT (ELECTRICITY_CALCULATOR:DELETE) | ລຶບໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ |

##### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/electricity-calculator/categories`. ລະຫັດ `code` ຕ້ອງບໍ່ຊ້ຳກັນ (Unique).

##### ໂຄງສ້າງ DTO (`CreateApplianceCategoryDto`):
| Field | Type | Required | Default | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :---: | :--- |
| `nameLa` | `string` | Yes | - | ຊື່ໝວດໝູ່ພາສາລາວ |
| `nameEn` | `string` | No | - | ຊື່ໝວດໝູ່ພາສາອັງກິດ |
| `iconName` | `string` | No | - | ຊື່ໄອຄອນ Lucide React (ເຊັ່ນ `"Zap"`, `"Tv"`) |
| `orderIndex` | `number` | No | `0` | ລຳດັບການສະແດງຜົນ |
| `status` | `string` | No | `ACTIVE` | ສະຖານະ (`ACTIVE`, `INACTIVE`) |

##### ຕົວຢ່າງ Request Payload:
```json
{
  "nameLa": "ເຄື່ອງສາກລົດໄຟຟ້າ (EV Charger)",
  "nameEn": "EV Home Charger",
  "iconName": "Zap",
  "orderIndex": 11,
  "status": "ACTIVE"
}
```

---

#### 3.22.4 Appliance Presets Submodule (ລະບົບເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/appliance-presets/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ (Appliance Preset) ພ້ອມກຳລັງໄຟຟ້າ (Watts), ຈຳນວນເລີ່ມຕົ້ນ, ຊົ່ວໂມງນຳໃຊ້ຕໍ່ມື້, ແລະ ມື້ຕໍ່ເດືອນ.

##### Use Cases ໃນລະບົບ:
1. **`GetAppliancePresetsUseCase`**: ດຶງລາຍການ Presets ທັງໝົດ (Filter ຕາມ `categoryId`).
2. **`GetAppliancePresetByIdUseCase`**: ດຶງ Preset ຕາມ ID.
3. **`CreateAppliancePresetUseCase`**: ສ້າງ Preset ໃໝ່.
4. **`UpdateAppliancePresetUseCase`**: ແກ້ໄຂ Preset.
5. **`DeleteAppliancePresetUseCase`**: ລຶບ Preset.

##### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-calculator/presets` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບທັງໝົດ (`?categoryId=&search=`) |
| `GET` | `/api/v1/electricity-calculator/presets/:id` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບຕາມ ID |
| `POST` | `/api/v1/electricity-calculator/presets` | JWT (ELECTRICITY_CALCULATOR:CREATE) | ສ້າງເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບໃໝ່ |
| `PUT` | `/api/v1/electricity-calculator/presets/:id` | JWT (ELECTRICITY_CALCULATOR:UPDATE) | ແກ້ໄຂເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ |
| `DELETE` | `/api/v1/electricity-calculator/presets/:id` | JWT (ELECTRICITY_CALCULATOR:DELETE) | ລຶບເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ |

##### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/electricity-calculator/presets` (ຕ້ອງມີ `categoryId` ທີ່ສ້າງມາແລ້ວ).

##### ໂຄງສ້າງ DTO (`CreateAppliancePresetDto`):
| Field | Type | Required | Default | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :---: | :--- |
| `categoryId` | `number` | Yes | - | ລະຫັດໝວດໝູ່ຕົ້ນສັງກັດ (Foreign Key) |
| `nameLa` | `string` | Yes | - | ຊື່ເຄື່ອງໃຊ້ໄຟຟ້າພາສາລາວ |
| `nameEn` | `string` | No | - | ຊື່ເຄື່ອງໃຊ້ໄຟຟ້າພາສາອັງກິດ |
| `defaultWatt` | `number` | Yes | - | ກຳລັງໄຟຟ້າເລີ່ມຕົ້ນ (Watts) |
| `defaultQuantity` | `number` | No | `1` | ຈຳນວນເລີ່ມຕົ້ນ |
| `defaultHoursPerDay` | `number` | No | `0` | ຊົ່ວໂມງນຳໃຊ້ຕໍ່ມື້ |
| `defaultDaysPerMonth` | `number` | No | `30` | ມື້ນຳໃຊ້ຕໍ່ເດືອນ |
| `isSampleDefault` | `boolean` | No | `false` | ຄ່າເລີ່ມຕົ້ນສຳລັບຕົວຢ່າງໜ້າເວັບ |
| `orderIndex` | `number` | No | `0` | ລຳດັບການສະແດງຜົນ |
| `status` | `string` | No | `ACTIVE` | ສະຖານະ (`ACTIVE`, `INACTIVE`) |

##### ຕົວຢ່າງ Request Payload:
```json
{
  "categoryId": 1,
  "nameLa": "ແອ 24,000 BTU",
  "nameEn": "Air Conditioner 24,000 BTU",
  "defaultWatt": 2200,
  "defaultQuantity": 1,
  "defaultHoursPerDay": 8,
  "defaultDaysPerMonth": 30,
  "isSampleDefault": false,
  "orderIndex": 4,
  "status": "ACTIVE"
}
```

---

#### 3.22.5 Saving Templates Submodule (ລະບົບແມ່ແບບວິທີປະຢັດໄຟຟ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/saving-templates/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງແມ່ແບບວິທີປະຢັດໄຟຟ້າ ພ້ອມສູດການຄຳນວນ (Fixed Fraction, Reduce Hours, Replace Wattage) ແລະ ລະດັບຄວາມພະຍາຍາມ (Effort Level).

##### Use Cases ໃນລະບົບ:
1. **`GetSavingTemplatesUseCase`**: ດຶງແມ່ແບບວິທີປະຢັດໄຟທັງໝົດ (Filter ຕາມ `categoryId`).
2. **`GetSavingTemplateByIdUseCase`**: ດຶງແມ່ແບບຕາມ ID.
3. **`CreateSavingTemplateUseCase`**: ສ້າງແມ່ແບບໃໝ່.
4. **`UpdateSavingTemplateUseCase`**: ແກ້ໄຂແມ່ແບບ.
5. **`DeleteSavingTemplateUseCase`**: ລຶບແມ່ແບບ.

##### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-calculator/saving-templates` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງແມ່ແບບວິທີປະຢັດໄຟທັງໝົດ (`?categoryId=&search=`) |
| `GET` | `/api/v1/electricity-calculator/saving-templates/:id` | JWT (ELECTRICITY_CALCULATOR:READ) | ດຶງແມ່ແບບວິທີປະຢັດໄຟຕາມ ID |
| `POST` | `/api/v1/electricity-calculator/saving-templates` | JWT (ELECTRICITY_CALCULATOR:CREATE) | ສ້າງແມ່ແບບວິທີປະຢັດໄຟໃໝ່ |
| `PUT` | `/api/v1/electricity-calculator/saving-templates/:id` | JWT (ELECTRICITY_CALCULATOR:UPDATE) | ແກ້ໄຂແມ່ແບບວິທີປະຢັດໄຟ |
| `DELETE` | `/api/v1/electricity-calculator/saving-templates/:id` | JWT (ELECTRICITY_CALCULATOR:DELETE) | ລຶບແມ່ແບບວິທີປະຢັດໄຟ |

##### ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management):
- ສົ່ງ JSON Body ໄປທີ່ `POST /api/v1/electricity-calculator/saving-templates` (ຕ້ອງມີ `categoryId`).
- ສາມາດເລືອກ `ruleType` ເປັນ:
  - `FIXED_FRACTION`: ປະຢັດເປັນສັດສ່ວນ (ເຊັ່ນ `fixedFraction: 0.3` ຄື 30%).
  - `REDUCE_HOURS`: ຫຼຸດຈຳນວນຊົ່ວໂມງນຳໃຊ້ຕໍ່ມື້.
  - `REPLACE_WATTAGE`: ປ່ຽນອຸປະກອນທີ່ມີກຳລັງໄຟຕ່ຳກວ່າ.

##### ໂຄງສ້າງ DTO (`CreateSavingTemplateDto`):
| Field | Type | Required | Default | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :---: | :--- |
| `categoryId` | `number` | Yes | - | ລະຫັດໝວດໝູ່ (Foreign Key) |
| `titleLa` | `string` | Yes | - | ຫົວຂໍ້ວິທີປະຢັດໄຟພາສາລາວ |
| `titleEn` | `string` | No | - | ຫົວຂໍ້ວິທີປະຢັດໄຟພາສາອັງກິດ |
| `descriptionLa` | `string` | No | - | ຄຳອະທິບາຍພາສາລາວ |
| `descriptionEn` | `string` | No | - | ຄຳອະທິບາຍພາສາອັງກິດ |
| `effortLevel` | `string` | No | `NO_COST` | ລະດັບ: `NO_COST`, `LOW_EFFORT`, `INVESTMENT` |
| `ruleType` | `string` | Yes | - | ຮູບແບບ: `FIXED_FRACTION`, `REDUCE_HOURS`, `REPLACE_WATTAGE` |
| `fixedFraction` | `number` | No | - | ສັດສ່ວນການປະຢັດ ເຊັ່ນ `0.3` |
| `defaultSelected` | `boolean` | No | `false` | ຕິກເລືອກອັດຕະໂນມັດ |
| `orderIndex` | `number` | No | `0` | ລຳດັບການສະແດງຜົນ |
| `status` | `string` | No | `ACTIVE` | ສະຖານະ (`ACTIVE`, `INACTIVE`) |

##### ຕົວຢ່າງ Request Payload:
```json
{
  "categoryId": 1,
  "titleLa": "ປ່ຽນເຄື່ອງປັບອາກາດເປັນລະບົບ Inverter",
  "titleEn": "Upgrade to Inverter Air Conditioner",
  "descriptionLa": "ລະບົບ Inverter ຊ່ວຍຄວບຄຸມຮອບຄອມເພຣສເຊີ ປະຢັດໄຟລົງໄດ້ 30%",
  "descriptionEn": "Inverter compressors reduce power consumption by up to 30%",
  "effortLevel": "INVESTMENT",
  "ruleType": "FIXED_FRACTION",
  "fixedFraction": 0.3,
  "defaultSelected": false,
  "orderIndex": 8,
  "status": "ACTIVE"
}
```

---

#### 3.22.6 Electricity Calculation Engine Submodule (ລະບົບຄຳນວນຄ່າໄຟ & Public APIs)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/electricity-calculator/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ໃຫ້ບໍລິການ API ສາທາລະນະ (`@Public()`) ສຳລັບປະຊາຊົນ.
  - ຄຳນວນຄ່າໄຟຟ້າຕາມໂຄງສ້າງອັດຕາຄ່າໄຟຂັ້ນບັນໄດ 8 ຂັ້ນ ພ້ອມສ່ວນຫຼຸດລະດູຮ້ອນ (ສຳລັບຄົວເຮືອນທີ່ໃຊ້ໄຟບໍ່ເກີນ 300 kWh), ອາກອນມູນຄ່າເພີ່ມ (VAT 10%), ແລະ ຄ່າບຳລຸງຮັກສາມິດເຕີ (5,000 ກີບ).
  - ສ້າງແຜນປະຢັດໄຟອັດຕະໂນມັດ 3 ຮູບແບບ ແລະ ຄາດການແນວໂນ້ມຄ່າໄຟລາຍປີ Outlook 2026–2029.
  - ສົ່ງ Config ເລີ່ມຕົ້ນທັງໝົດໃຫ້ກັບ Frontend ໃນການໂຫຼດໜ້າເວັບຄັ້ງດຽວ.

##### Use Cases ໃນລະບົບ:
1. **`GetCalculatorConfigUseCase`**: ດຶງຂໍ້ມູນຕັ້ງຕົ້ນທັງໝົດສຳລັບ Render ໜ້າເວັບ.
2. **`GetTariffScheduleUseCase`**: ດຶງຕາຕະລາງ 8 ຂັ້ນບັນໄດລາຍເດືອນ.
3. **`CalculateElectricityBillUseCase`**: ຄຳນວນຄ່າໄຟຟ້າ, ສ່ວນຫຼຸດ, ພາສີ, ແຜນປະຢັດໄຟ, ແລະ Outlook.

##### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-calculator/config` | Public | ດຶງຂໍ້ມູນຕັ້ງຕົ້ນທັງໝົດສຳລັບໜ້າເວັບ |
| `GET` | `/api/v1/electricity-calculator/schedules` | Public | ດຶງຕາຕະລາງ 8 ຂັ້ນບັນໄດລາຍເດືອນ (`?year=&month=&categoryId=`) |
| `POST` | `/api/v1/electricity-calculator/calculate` | Public | ຄິດໄລ່ຄ່າໄຟ + ແຜນປະຢັດໄຟອັດຕະໂນມັດ + Outlook 2026–2029 |

##### ໂຄງສ້າງ DTO (`CalculateElectricityDto`):
| Field | Type | Required | Default | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :---: | :--- |
| `year` | `number` | Yes | - | ປີທີ່ຕ້ອງການຄິດໄລ່ (ເຊັ່ນ `2026`) |
| `month` | `number` | Yes | - | ເດືອນທີ່ຕ້ອງການຄິດໄລ່ (1–12) |
| `categoryId` | `number` | No | `1` | ລະຫັດປະເພດອັດຕາຄ່າໄຟ (Default: 1 ທີ່ຢູ່ອາໄສ) |
| `directTotalKwh` | `number` | No | - | ໜ່ວຍໄຟລວມ (kWh) ກໍລະນີປ້ອນໂດຍກົງ |
| `items` | `ApplianceCalculationItemDto[]` | No | - | ລາຍການເຄື່ອງໃຊ້ໄຟຟ້າທີ່ເລືອກຄຳນວນ |

##### ໂຄງສ້າງ `ApplianceCalculationItemDto`:
| Field | Type | Required | Default | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :---: | :--- |
| `presetId` | `number` | Yes | - | ລະຫັດເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ |
| `customWatt` | `number` | No | - | ກຳລັງໄຟຟ້າປັບແຕ່ງ (Watts) |
| `quantity` | `number` | Yes | `1` | ຈຳນວນເຄື່ອງ |
| `hoursPerDay` | `number` | Yes | - | ຊົ່ວໂມງນຳໃຊ້ຕໍ່ມື້ |
| `daysPerMonth` | `number` | Yes | `30` | ມື້ນຳໃຊ້ຕໍ່ເດືອນ |

##### ຕົວຢ່າງ Request Payload:
```json
{
  "year": 2026,
  "month": 11,
  "categoryId": 1,
  "items": [
    {
      "presetId": 1,
      "customWatt": 1050,
      "quantity": 1,
      "hoursPerDay": 8,
      "daysPerMonth": 30
    },
    {
      "presetId": 2,
      "customWatt": 150,
      "quantity": 1,
      "hoursPerDay": 24,
      "daysPerMonth": 30
    }
  ]
}
```

---

## 4. ແຜນພັດທະນາໂມດູນໃນອະນາຄົດ (Roadmap / Future Enhancements)

ທຸກໂມດູນຫຼັກຕາມ **Prisma Schema (`schema.prisma`)** ແລະ **Data Dictionary** ໄດ້ຖືກພັດທະນາຄົບຖ້ວນທັງ **22 ໂມດູນ** ຮຽບຮ້ອຍແລ້ວ. ສຳລັບແຜນພັດທະນາໃນໄລຍະຕໍ່ໄປປະກອບມີ:

1. **Audit Logs & Activity Tracking**: ບັນທຶກປະຫວັດການແກ້ໄຂ, ເພີ່ມ, ລຶບ ຂອງ Admin ແຕ່ລະຄົນ.
2. **Notification & Email Alert**: ແຈ້ງເຕືອນຜ່ານ Email / Webhook ເມື່ອມີການສະໝັກງານ ຫຼື ເປີດຊອງປະມູນ.
3. **Multi-language Expansion**: ຂະຫຍາຍການຮອງຮັບຫຼາຍພາສາ (ລາວ, ອັງກິດ, ຈີນ) ສຳລັບທຸກໂມດູນສາທາລະນະ.
4. **Role-Based Access Control (RBAC) Granular Permissions**: ແຍກສິດລະອຽດຕາມແຕ່ລະໂມດູນ (ເຊັ່ນ HR ເບິ່ງໄດ້ສະເພາະ Jobs/Positions, PR ເບິ່ງໄດ້ສະເພາະ News/Magazines).

---

## 5. ຄູ່ມືການອັບເດດເອກະສານ (Documentation Update Guide)

ເພື່ອຮັກສາໃຫ້ເອກະສານສະບັບນີ້ທັນສະໄໝຢູ່ສະເໝີເມື່ອມີການພັດທະນາເພີ່ມເຕີມ, ໃຫ້ປະຕິບັດຕາມຂັ້ນຕອນດັ່ງນີ້:

1. **ເມື່ອມີການເພີ່ມ Endpoint ຫຼື Use Case ໃໝ່ໃນ Module ເດີມ:**
   - ເຂົ້າໄປທີ່ຫົວຂໍ້ຂອງ Module ນັ້ນໆ.
   - ເພີ່ມຊື່ Use Case ພ້ອມອະທິບາຍ Logic ຫຍໍ້.
   - ເພີ່ມແຖວໃໝ່ໃນຕາຕະລາງ Endpoints (ລະບຸ Method, URL, Auth Guard, ຄຳອະທິບາຍ).
   - ອັບເດດໂຄງສ້າງ DTO ແລະ ຕົວຢ່າງ Request Payload ໃຫ້ສອດຄ່ອງ.
2. **ເມື່ອມີການສ້າງ Module ໃໝ່:**
   - ເພີ່ມລາຍຊື່ Module ເຂົ້າໃນ **ຕາຕະລາງສັງລວມ (Section 2)**.
   - ສ້າງຫົວຂໍ້ໃໝ່ໃນ **Section 3** ຕາມແບບແຜນມາດຕະຖານ:
     - ທີ່ຕັ້ງໂຟນເດີ (Folder Path)
     - ຄວາມຮັບຜິດຊອບ (Responsibilities)
     - Use Cases
     - ເສັ້ນທາງ API (Endpoints)
     - ວິທີການເພີ່ມ/ບັນທຶກຂໍ້ມູນ (Data Insertion & Management)
     - ໂຄງສ້າງ DTO
     - ຕົວຢ່າງ Request Payload
3. **ເມື່ອມີການປ່ຽນແປງ Schema ຖານຂໍ້ມູນ:**
   - ກວດສອບ ແລະ ອັບເດດໃຫ້ສອດຄ່ອງກັບ `prisma/schema.prisma` ແລະ `Data_Dictionary_EDL_Admin.md`.
4. **ເມື່ອມີການອັບເດດ Postman Collection:**
   - ຣັນຄຳສັ່ງ `node make_postman.cjs` ເພື່ອ Sync ໄຟລ໌ `EDL_Admin_API.postman_collection.json` ອັດຕະໂນມັດ.
