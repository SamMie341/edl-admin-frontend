# ບົດລາຍງານໂມດູນ ແລະ ສະຖາປັດຕະຍະກຳລະບົບ EDL Admin Backend
> **ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL Admin Management System)**  
> **ພາສາ/ເທັກໂນໂລຢີ:** NestJS (TypeScript), Prisma ORM, PostgreSQL  
> **ສະຖາປັດຕະຍະກຳ:** Clean Architecture / Domain-Driven Design (DDD)  
> **ສະຖານະ:** ພວມພັດທະນາ (Active Development) - 20 ໂມດູນ (112 Endpoints)  
> **ອັບເດດຫຼ້າສຸດ:** 2026-09-30

---

## ສາລະບານ (Table of Contents)
1. [ພາບລວມສະຖາປັດຕະຍະກຳລະບົບ (System Architecture Overview)](#1-ພາບລວມສະຖາປັດຕະຍະກຳລະບົບ-system-architecture-overview)
2. [ຕາຕະລາງສັງລວມໂມດູນທັງໝົດ (Modules Summary Matrix)](#2-ຕາຕະລາງສັງລວມໂມດູນທັງໝົດ-modules-summary-matrix)
3. [ລາຍລະອຽດແຕ່ລະໂມດູນທີ່ພັດທະນາແລ້ວ (Active Modules)](#3-ລາຍລະອຽດແຕ່ລະໂມດູນທີ່ພັດທະນາແລ້ວ-active-modules)
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
4. [ແຜນພັດທະນາໂມດູນໃນອະນາຄົດ (Roadmap / Future Enhancements)](#4-ແຜນພັດທະນາໂມດູນໃນອະນາຄົດ-roadmap--future-enhancements)
5. [ຄູ່ມືການອັບເດດເອກະສານ (Documentation Update Guide)](#5-ຄູ່ມືການອັບເດດເອກະສານ-documentation-update-guide)

---

## 1. ພາບລວມສະຖາປັດຕະຍະກຳລະບົບ (System Architecture Overview)

ລະບົບ EDL Admin Backend ໄດ້ຖືກອອກແບບໂດຍອີງໃສ່ຫຼັກການ **Clean Architecture** ເພື່ອໃຫ້ແຕ່ລະສ່ວນແຍກອອກຈາກກັນຢ່າງເປັນອິດສະຫຼະ (Decoupled), ງ່າຍຕໍ່ການຮັກສາ (Maintainability), ແລະ ສະດວກໃນການທົດສອບ (Testability).

```
   ┌────────────────────────────────────────────────────────┐
   │               Presentation Layer (Controllers)         │
   │               - ຮັບ HTTP Request / ສົ່ງ HTTP Response   │
   │               - ກວດສອບຂໍ້ມູນຜ່ານ DTOs                   │
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
| **1. Auth** | `/api/v1/auth` | 1 | ລະບົບ Hash ລະຫັດຜ່ານ (Bcrypt), JWT Auth | ພ້ອມໃຊ້ງານ |
| **2. Users** | `/api/v1/users` | 5 | EDL HRM API (Sync ພະນັກງານ) | ພ້ອມໃຊ້ງານ |
| **3. Departments** | `/api/v1/departments` | 5 | - | ພ້ອມໃຊ້ງານ |
| **4. Branches** | `/api/v1/branches` | 9 | EDL Inside API (Sync ສາຂາ & ຮູບພາບ) | ພ້ອມໃຊ້ງານ |
| **5. Service Centers** | `/api/v1/service-centers` | 8 | EDL Inside API (Sync ສູນບໍລິການ & ຮູບພາບ) | ພ້ອມໃຊ້ງານ |
| **6. Provinces** | `/api/v1/provinces` | 2 | EDL HRM Address API | ພ້ອມໃຊ້ງານ |
| **7. Districts** | `/api/v1/districts` | 3 | EDL HRM District API | ພ້ອມໃຊ້ງານ |
| **8. Villages** | `/api/v1/villages` | 3 | EDL HRM Village API | ພ້ອມໃຊ້ງານ |
| **9. Organization Structures** | `/api/v1/org-structures` | 6 | File System (/uploads/org-structures) | ພ້ອມໃຊ້ງານ |
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
| **ລວມທັງໝົດ (Total)** | **20 Modules** | **112 Endpoints** | | |

---

## 3. ລາຍລະອຽດແຕ່ລະໂມດູນທີ່ພັດທະນາແລ້ວ (Active Modules)

---

### 3.1 Auth Module (ລະບົບຢັ້ງຢືນຕົວຕົນ - Authentication)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/auth/`
* **ຄວາມຮັບຜິດຊອບ:** 
  - ຢັ້ງຢືນຕົວຕົນຂອງພະນັກງານ ແລະ ຜູ້ບໍລິຫານ ເພື່ອເຂົ້າໃຊ້ງານລະບົບ.
  - ກວດສອບລະຫັດຜ່ານດ້ວຍ `bcrypt.compare` ກັບ Password Hash ໃນຖານຂໍ້ມູນ.
  - ກວດສອບສະຖານະບັນຊີ (`status === 'ACTIVE'`).
  - ສ້າງ ແລະ ລົງລາຍເຊັນ JWT Access Token ພ້ອມຂໍ້ມູນ Payload.
  - ບັນທຶກເວລາເຂົ້າສູ່ລະບົບຫຼ້າສຸດ (`lastLoginAt`).
  - ໃຫ້ບໍລິການ `JwtAuthGuard` ແລະ `JwtStrategy` ສຳລັບ Guard API ອື່ນໆ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/login` | No | ເຂົ້າສູ່ລະບົບ (Payload: `empCode`, `password`) |

#### ໂຄງສ້າງ DTO:
- `LoginDto`: ປະກອບມີ `empCode` (string) ແລະ `password` (string).

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
5. **`ChangePasswordUseCase`**: ປ່ຽນລະຫັດຜ່ານຜູ້ໃຊ້ງານ (ຮອງຮັບທັງການປ່ຽນດ້ວຍຕົນເອງໂດຍກວດສອບ `oldPassword` ຫຼື Admin Reset ລະຫັດຜ່ານໃໝ່).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/users` | JWT | ດຶງລາຍຊື່ຜູ້ໃຊ້ທັງໝົດ |
| `POST` | `/api/v1/users/sync/:empCode` | JWT | ຊິ້ງຂໍ້ມູນພະນັກງານຈາກ HRM ເຂົ້າລະບົບ |
| `PUT` | `/api/v1/users/change-role/:id` | JWT | ປ່ຽນສິດທິຜູ້ໃຊ້ (Role) |
| `GET` | `/api/v1/users/permissions/list` | JWT | ດຶງລາຍການສິດທັງໝົດໃນລະບົບ |
| `PUT` | `/api/v1/users/:id/permissions` | JWT | ກຳນົດສິດການນຳໃຊ້ (Permissions) ໃຫ້ຜູ້ໃຊ້ |
| `PUT` | `/api/v1/users/change-password/:id` | JWT | ປ່ຽນລະຫັດຜ່ານຜູ້ໃຊ້ງານ |
| `DELETE` | `/api/v1/users/:id` | JWT | ລຶບບັນຊີຜູ້ໃຊ້ |

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

---

### 3.6 Provinces Module (ລະບົບຂໍ້ມູນແຂວງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/provinces/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນແຂວງທົ່ວປະເທດລາວ (18 ແຂວງ), ລະຫັດແຂວງ, ຕົວຫຍໍ້, ແລະ ລະຫັດສາຂາ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/provinces` | JWT | ດຶງລາຍຊື່ແຂວງທັງໝົດ (`?includeDistricts=true`) |
| `POST` | `/api/v1/provinces/sync` | JWT | ຊິ້ງຂໍ້ມູນແຂວງຈາກ HRM |

---

### 3.7 Districts Module (ລະບົບຂໍ້ມູນເມືອງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/districts/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນເມືອງທັງໝົດໃນ ສປປ ລາວ ພ້ອມຜູກໂຍງກັບລະຫັດແຂວງ (`provinceId`).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/districts` | JWT | ດຶງລາຍຊື່ເມືອງທັງໝົດ (ຮອງຮັບ `?provinceId=`) |
| `GET` | `/api/v1/districts/province/:provinceId` | JWT | ດຶງສະເພາະເມືອງທີ່ຂຶ້ນກັບແຂວງຕາມ ID |
| `POST` | `/api/v1/districts/sync` | JWT | ຊິ້ງຂໍ້ມູນເມືອງຈາກ HRM |

---

### 3.8 Villages Module (ລະບົບຂໍ້ມູນບ້ານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/villages/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນບ້ານທັງໝົດໃນ ສປປ ລາວ ພ້ອມຜູກໂຍງກັບລະຫັດເມືອງ (`districtId`).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/villages` | JWT | ດຶງລາຍຊື່ບ້ານທັງໝົດ (ຮອງຮັບ `?districtId=`) |
| `GET` | `/api/v1/villages/district/:districtId` | JWT | ດຶງສະເພາະບ້ານທີ່ຂຶ້ນກັບເມືອງຕາມ ID |
| `POST` | `/api/v1/villages/sync` | JWT | ຊິ້ງຂໍ້ມູນບ້ານຈາກ HRM |

---

### 3.9 Organization Structures Module (ລະບົບໂຄງຮ່າງການຈັດຕັ້ງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/organization-structures/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂໍ້ມູນແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງ (Board of Directors, Executive Board, Org Structure) ພ້ອມຮອງຮັບການອັບໂຫຼດຮູບພາບ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/org-structures` | JWT | ດຶງຂໍ້ມູນໂຄງຮ່າງການຈັດຕັ້ງທັງໝົດ |
| `GET` | `/api/v1/org-structures/dropdown` | JWT | ດຶງລາຍການໂຄງຮ່າງສຳລັບ Dropdown |
| `POST` | `/api/v1/org-structures` | JWT | ສ້າງໂຄງຮ່າງໃໝ່ |
| `PUT` | `/api/v1/org-structures/:id` | JWT | ແກ້ໄຂຂໍ້ມູນໂຄງຮ່າງ |
| `DELETE` | `/api/v1/org-structures/:id` | JWT | ລຶບຂໍ້ມູນໂຄງຮ່າງ |
| `POST` | `/api/v1/org-structures/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບໂຄງຮ່າງ (form-data: `file`) |

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

---

### 3.11 Electrical Knowledge Module (ລະບົບບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/electrical-knowledge/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງບົດຄວາມ ແລະ ວິດິໂອໃຫ້ຄວາມຮູ້ດ້ານໄຟຟ້າ ແລະ ຄວາມປອດໄພ, ນັບຍອດເຂົ້າຊົມ, ແລະ ອັບໂຫຼດຮູບໜ້າປົກ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electrical-knowledge` | JWT | ດຶງລາຍຊື່ບົດຄວາມທັງໝົດ |
| `GET` | `/api/v1/electrical-knowledge/:id` | JWT | ດຶງຂໍ້ມູນບົດຄວາມຕາມ ID |
| `POST` | `/api/v1/electrical-knowledge` | JWT | ສ້າງບົດຄວາມໃໝ່ |
| `PUT` | `/api/v1/electrical-knowledge/:id` | JWT | ແກ້ໄຂຂໍ້ມູນບົດຄວາມ |
| `DELETE` | `/api/v1/electrical-knowledge/:id` | JWT | ລຶບບົດຄວາມ |
| `PUT` | `/api/v1/electrical-knowledge/:id/view` | JWT | ເພີ່ມຍອດເຂົ້າຊົມບົດຄວາມ (`view_count`) |
| `POST` | `/api/v1/electrical-knowledge/:id/upload/cover` | JWT | ອັບໂຫຼດຮູບໜ້າປົກບົດຄວາມ (form-data: `file`) |

---

### 3.12 Magazines Module (ລະບົບວາລະສານດິຈິຕອນ E-Magazine)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/magazines/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງວາລະສານດິຈິຕອນ (E-Magazine) ຂອງ ຟຟລ ພ້ອມອັບໂຫຼດຮູບໜ້າປົກ ແລະ ໄຟລ໌ PDF, ນັບຍອດດາວໂຫຼດ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/magazines` | JWT | ດຶງລາຍຊື່ວາລະສານທັງໝົດ |
| `GET` | `/api/v1/magazines/:id` | JWT | ດຶງຂໍ້ມູນວາລະສານຕາມ ID |
| `POST` | `/api/v1/magazines` | JWT | ສ້າງວາລະສານໃໝ່ |
| `PUT` | `/api/v1/magazines/:id` | JWT | ແກ້ໄຂຂໍ້ມູນວາລະສານ |
| `DELETE` | `/api/v1/magazines/:id` | JWT | ລຶບວາລະສານ |
| `PUT` | `/api/v1/magazines/:id/download` | JWT | ເພີ່ມຍອດດາວໂຫຼດ (`download_count`) |
| `POST` | `/api/v1/magazines/:id/upload/cover` | JWT | ອັບໂຫຼດຮູບໜ້າປົກ (form-data: `file`) |
| `POST` | `/api/v1/magazines/:id/upload/document` | JWT | ອັບໂຫຼດໄຟລ໌ເອກະສານ PDF (form-data: `file`) |

---

### 3.13 News Categories Module (ລະບົບໝວດໝູ່ຂ່າວສານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/news-categories/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງໝວດໝູ່ຂ່າວສານປະຊາສຳພັນ, ການຈັດລຳດັບ (`order_index`), ແລະ ສະຖານະ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/news-categories` | JWT | ດຶງລາຍຊື່ໝວດໝູ່ຂ່າວທັງໝົດ |
| `GET` | `/api/v1/news-categories/:id` | JWT | ດຶງຂໍ້ມູນໝວດໝູ່ຕາມ ID |
| `POST` | `/api/v1/news-categories` | JWT | ສ້າງໝວດໝູ່ຂ່າວໃໝ່ |
| `PUT` | `/api/v1/news-categories/:id` | JWT | ແກ້ໄຂຂໍ້ມູນໝວດໝູ່ |
| `DELETE` | `/api/v1/news-categories/:id` | JWT | ລຶບໝວດໝູ່ຂ່າວ |

---

### 3.14 News Module (ລະບົບຂ່າວສານປະຊາສຳພັນ 2 ພາສາ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/news/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງຂ່າວສານ 2 ພາສາ (ລາວ-ອັງກິດ), ອັບໂຫຼດຮູບປົກ ແລະ Gallery ຫຼາຍຮູບ, ນັບຍອດເຂົ້າຊົມ, ຜູກໂຍງກັບໝວດໝູ່ ແລະ ແທັກ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/news` | JWT | ດຶງລາຍການຂ່າວສານ (Query: `search`, `page`, `limit`) |
| `GET` | `/api/v1/news/:id` | JWT | ດຶງຂໍ້ມູນຂ່າວຕາມ ID |
| `POST` | `/api/v1/news` | JWT | ສ້າງຂ່າວສານໃໝ່ (ຮອງຮັບ `tagIds`) |
| `PUT` | `/api/v1/news/:id` | JWT | ແກ້ໄຂຂໍ້ມູນຂ່າວສານ |
| `DELETE` | `/api/v1/news/:id` | JWT | ລຶບຂ່າວສານ |
| `PUT` | `/api/v1/news/:id/view` | JWT | ເພີ່ມຍອດເຂົ້າຊົມຂ່າວ (`view_count`) |
| `POST` | `/api/v1/news/:id/upload/cover` | JWT | ອັບໂຫຼດຮູບໜ້າປົກຂ່າວ (form-data: `file`) |
| `POST` | `/api/v1/news/:id/upload/gallery` | JWT | ອັບໂຫຼດຮູບ Gallery ຫຼາຍຮູບ (form-data: `files`) |

---

### 3.15 News Tags Module (ລະບົບແທັກຂ່າວສານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/news-tags/`
* **ຄວາມຮັບຜິດຊອບ:** ຄຸ້ມຄອງແທັກຂ່າວສານ (News Tags) ສຳລັບຈັດກຸ່ມ ແລະ ຄົ້ນຫາຂ່າວສານ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/news-tags` | JWT | ດຶງລາຍຊື່ແທັກທັງໝົດ |
| `GET` | `/api/v1/news-tags/:id` | JWT | ດຶງຂໍ້ມູນແທັກຕາມ ID |
| `POST` | `/api/v1/news-tags` | JWT | ສ້າງແທັກໃໝ່ |
| `PUT` | `/api/v1/news-tags/:id` | JWT | ແກ້ໄຂຂໍ້ມູນແທັກ |
| `DELETE` | `/api/v1/news-tags/:id` | JWT | ລຶບແທັກອອກຈາກລະບົບ |

---

### 3.16 Legislations Module (ລະບົບເອກະສານນິຕິກຳ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/legislations/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງເອກະສານນິຕິກຳ, ດຳລັດ, ຂໍ້ຕົກລົງ, ກົດໝາຍ ແລະ ລະບຽບການຕ່າງໆຂອງ ຟຟລ.
  - ຮອງຮັບການຄົ້ນຫາ (Search) ແລະ ການແບ່ງໜ້າ (Pagination: page, limit, totalPages).
  - ຮອງຮັບການອັບໂຫຼດໄຟລ໌ເອກະສານ PDF ມາຍັງ Server (`/uploads/legislations/documents/`).

#### Use Cases ໃນລະບົບ:
1. **`CreateLegislationUseCase`**: ສ້າງຂໍ້ມູນເອກະສານນິຕິກຳໃໝ່.
2. **`GetLegislationsUseCase`**: ດຶງລາຍການເອກະສານນິຕິກຳທັງໝົດ ພ້ອມ Pagination ແລະ ຄົ້ນຫາ.
3. **`GetLegislationByIdUseCase`**: ດຶງຂໍ້ມູນເອກະສານນິຕິກຳຕາມ ID.
4. **`UpdateLegislationUseCase`**: ແກ້ໄຂຂໍ້ມູນເອກະສານນິຕິກຳ.
5. **`DeleteLegislationUseCase`**: ລຶບເອກະສານນິຕິກຳ.
6. **`UploadLegislationDocumentUseCase`**: ອັບໂຫຼດໄຟລ໌ເອກະສານ PDF.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/legislations` | JWT | ດຶງລາຍການເອກະສານນິຕິກຳ (Query: `search`, `page`, `limit`) |
| `GET` | `/api/v1/legislations/:id` | JWT | ດຶງຂໍ້ມູນເອກະສານນິຕິກຳຕາມ ID |
| `POST` | `/api/v1/legislations` | JWT | ສ້າງເອກະສານນິຕິກຳໃໝ່ |
| `PUT` | `/api/v1/legislations/:id` | JWT | ແກ້ໄຂຂໍ້ມູນເອກະສານນິຕິກຳ |
| `DELETE` | `/api/v1/legislations/:id` | JWT | ລຶບເອກະສານນິຕິກຳ |
| `POST` | `/api/v1/legislations/:id/upload/document` | JWT | ອັບໂຫຼດໄຟລ໌ເອກະສານ PDF (form-data: `file`) |

---

### 3.17 Electricity Tariffs Module (ລະບົບໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/electricity-tariffs/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງຂໍ້ມູນປະກາດໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ (Residential, Commercial, Industrial, Agriculture, etc.).
  - ຮອງຮັບການອັບໂຫຼດຮູບພາບປະກອບ (`/uploads/electricity-tariffs/images/`) ແລະ ໄຟລ໌ເອກະສານ PDF (`/uploads/electricity-tariffs/documents/`).
  - ຮອງຮັບການຄົ້ນຫາ ແລະ ການແບ່ງໜ້າ (Pagination).

#### Use Cases ໃນລະບົບ:
1. **`CreateElectricityTariffUseCase`**: ສ້າງປະກາດອັດຕາຄ່າໄຟຟ້າໃໝ່.
2. **`GetElectricityTariffsUseCase`**: ດຶງລາຍການອັດຕາຄ່າໄຟຟ້າທັງໝົດ ພ້ອມ Pagination ແລະ ຄົ້ນຫາ.
3. **`GetElectricityTariffByIdUseCase`**: ດຶງຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າຕາມ ID.
4. **`UpdateElectricityTariffUseCase`**: ແກ້ໄຂຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າ.
5. **`DeleteElectricityTariffUseCase`**: ລຶບອັດຕາຄ່າໄຟຟ້າ.
6. **`UploadElectricityTariffFilesUseCase`**: ອັບໂຫຼດຮູບພາບ ຫຼື ໄຟລ໌ PDF.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/electricity-tariffs` | JWT | ດຶງລາຍການອັດຕາຄ່າໄຟຟ້າ (Query: `search`, `page`, `limit`) |
| `GET` | `/api/v1/electricity-tariffs/:id` | JWT | ດຶງຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າຕາມ ID |
| `POST` | `/api/v1/electricity-tariffs` | JWT | ສ້າງປະກາດອັດຕາຄ່າໄຟຟ້າໃໝ່ |
| `PUT` | `/api/v1/electricity-tariffs/:id` | JWT | ແກ້ໄຂຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າ |
| `DELETE` | `/api/v1/electricity-tariffs/:id` | JWT | ລຶບອັດຕາຄ່າໄຟຟ້າ |
| `POST` | `/api/v1/electricity-tariffs/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບອັດຕາຄ່າໄຟຟ້າ (form-data: `file`) |
| `POST` | `/api/v1/electricity-tariffs/:id/upload/document` | JWT | ອັບໂຫຼດໄຟລ໌ເອກະສານ PDF (form-data: `file`) |

---

### 3.18 Procurements Module (ລະບົບປະກາດຈັດຊື້-ຈັດຈ້າງ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/procurements/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງປະກາດປະມູນ, ຈັດຊື້-ຈັດຈ້າງສິນຄ້າ ແລະ ບໍລິການຂອງ ຟຟລ.
  - ເກັບກຳຂໍ້ມູນ: ຫົວຂໍ້, ເລກທີໂຄງການ (`procurementNo`), ປະເພດການຈັດຊື້, ງົບປະມານ, ວັນທີເລີ່ມຕົ້ນ-ສິ້ນສຸດການຍື່ນຊອງປະມູນ.
  - ຮອງຮັບການອັບໂຫຼດຮູບພາບໜ້າປົກ (`/uploads/procurements/images/`) ແລະ ເອກະສານ TOR/PDF (`/uploads/procurements/documents/`).

#### Use Cases ໃນລະບົບ:
1. **`CreateProcurementUseCase`**: ສ້າງປະກາດຈັດຊື້-ຈັດຈ້າງໃໝ່.
2. **`GetProcurementsUseCase`**: ດຶງລາຍການປະກາດຈັດຊື້ທັງໝົດ ພ້ອມ Pagination ແລະ ຄົ້ນຫາ.
3. **`GetProcurementByIdUseCase`**: ດຶງຂໍ້ມູນປະກາດຕາມ ID.
4. **`UpdateProcurementUseCase`**: ແກ້ໄຂຂໍ້ມູນປະກາດ.
5. **`DeleteProcurementUseCase`**: ລຶບປະກາດ.
6. **`UploadProcurementFilesUseCase`**: ອັບໂຫຼດຮູບພາບ ຫຼື ເອກະສານ TOR (PDF).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/procurements` | JWT | ດຶງລາຍການປະກາດຈັດຊື້-ຈັດຈ້າງ (Query: `search`, `page`, `limit`) |
| `GET` | `/api/v1/procurements/:id` | JWT | ດຶງຂໍ້ມູນປະກາດຕາມ ID |
| `POST` | `/api/v1/procurements` | JWT | ສ້າງປະກາດຈັດຊື້-ຈັດຈ້າງໃໝ່ |
| `PUT` | `/api/v1/procurements/:id` | JWT | ແກ້ໄຂຂໍ້ມູນປະກາດຈັດຊື້ |
| `DELETE` | `/api/v1/procurements/:id` | JWT | ລຶບປະກາດຈັດຊື້ |
| `POST` | `/api/v1/procurements/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບໜ້າປົກ (form-data: `file`) |
| `POST` | `/api/v1/procurements/:id/upload/document` | JWT | ອັບໂຫຼດໄຟລ໌ເອກະສານ TOR PDF (form-data: `file`) |

---

### 3.19 Positions Module (ລະບົບຈັດການຕຳແໜ່ງງານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/positions/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງ Master Data ຕຳແໜ່ງງານ ພ້ອມລະຫັດຕຳແໜ່ງ (`code`), ຊື່ຕຳແໜ່ງ (ລາວ/ອັງກິດ), ລາຍລະອຽດ, ແລະ ສະຖານະ.
  - ໃຊ້ສຳລັບຜູກໂຍງກັບປະກາດຮັບສະໝັກພະນັກງານ (`job_postings`) ແລະ ໂຄງສ້າງບຸກຄະລາກອນ.

#### Use Cases ໃນລະບົບ:
1. **`CreatePositionUseCase`**: ສ້າງຕຳແໜ່ງງານໃໝ່.
2. **`GetPositionsUseCase`**: ດຶງລາຍຊື່ຕຳແໜ່ງງານທັງໝົດ ພ້ອມ Pagination ແລະ ຄົ້ນຫາ.
3. **`GetPositionByIdUseCase`**: ດຶງຂໍ້ມູນຕຳແໜ່ງຕາມ ID.
4. **`UpdatePositionUseCase`**: ແກ້ໄຂຂໍ້ມູນຕຳແໜ່ງງານ.
5. **`DeletePositionUseCase`**: ລຶບຕຳແໜ່ງງານ (ມີ Business Logic ປ້ອງກັນຖ້າມີການນຳໃຊ້ຢູ່).

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/positions` | JWT | ດຶງລາຍຊື່ຕຳແໜ່ງງານທັງໝົດ (Query: `search`, `page`, `limit`) |
| `GET` | `/api/v1/positions/:id` | JWT | ດຶງຂໍ້ມູນຕຳແໜ່ງຕາມ ID |
| `POST` | `/api/v1/positions` | JWT | ສ້າງຕຳແໜ່ງງານໃໝ່ |
| `PUT` | `/api/v1/positions/:id` | JWT | ແກ້ໄຂຂໍ້ມູນຕຳແໜ່ງງານ |
| `DELETE` | `/api/v1/positions/:id` | JWT | ລຶບຕຳແໜ່ງງານ |

---

### 3.20 Job Postings Module (ລະບົບປະກາດຮັບສະໝັກພະນັກງານ)
* **ທີ່ຕັ້ງໂຟນເດີ:** `src/modules/job-postings/`
* **ຄວາມຮັບຜິດຊອບ:**
  - ຄຸ້ມຄອງປະກາດຮັບສະໝັກງານຂອງ ຟຟລ.
  - ຜູກໂຍງກັບຕຳແໜ່ງງານ (`positionId`), ຝ່າຍ/ສາຂາ (`departmentId`, `branchId`).
  - ເກັບກຳຂໍ້ມູນ: ຈຳນວນທີ່ຮັບສະໝັກ (`quantity`), ເງື່ອນໄຂຄຸນວຸດທິ, ເງື່ອນໄຂສະໝັກ, ສະຖານທີ່ປະຕິບັດງານ, ວັນທີເປີດ-ປິດຮັບສະໝັກ, ແລະ ສະຖານະ.
  - ຮອງຮັບການອັບໂຫຼດຮູບພາບໂປສເຕີປະກາດຮັບສະໝັກງານ (`/uploads/job-postings/images/`).

#### Use Cases ໃນລະບົບ:
1. **`CreateJobPostingUseCase`**: ສ້າງປະກາດຮັບສະໝັກງານໃໝ່.
2. **`GetJobPostingsUseCase`**: ດຶງລາຍການປະກາດຮັບສະໝັກງານທັງໝົດ ພ້ອມ Pagination ແລະ ຄົ້ນຫາ.
3. **`GetJobPostingByIdUseCase`**: ດຶງຂໍ້ມູນປະກາດຕາມ ID ພ້ອມຂໍ້ມູນ Relation (Position, Department, Branch).
4. **`UpdateJobPostingUseCase`**: ແກ້ໄຂຂໍ້ມູນປະກາດຮັບສະໝັກງານ.
5. **`DeleteJobPostingUseCase`**: ລຶບປະກາດຮັບສະໝັກງານ.
6. **`UploadJobPostingImageUseCase`**: ອັບໂຫຼດຮູບພາບໂປສເຕີປະກາດຮັບສະໝັກງານ.

#### ເສັ້ນທາງ API (Endpoints):
| Method | URL | Auth Guard | ຄຳອະທິບາຍ |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/job-postings` | JWT | ດຶງລາຍການປະກາດຮັບສະໝັກງານ (Query: `search`, `page`, `limit`) |
| `GET` | `/api/v1/job-postings/:id` | JWT | ດຶງຂໍ້ມູນປະກາດຮັບສະໝັກງານຕາມ ID |
| `POST` | `/api/v1/job-postings` | JWT | ສ້າງປະກາດຮັບສະໝັກງານໃໝ່ |
| `PUT` | `/api/v1/job-postings/:id` | JWT | ແກ້ໄຂຂໍ້ມູນປະກາດຮັບສະໝັກງານ |
| `DELETE` | `/api/v1/job-postings/:id` | JWT | ລຶບປະກາດຮັບສະໝັກງານ |
| `POST` | `/api/v1/job-postings/:id/upload/image` | JWT | ອັບໂຫຼດຮູບພາບໂປສເຕີຮັບສະໝັກງານ (form-data: `file`) |

---

## 4. ແຜນພັດທະນາໂມດູນໃນອະນາຄົດ (Roadmap / Future Enhancements)

ທຸກໂມດູນຫຼັກຕາມ **Prisma Schema (`schema.prisma`)** ແລະ **Data Dictionary** ໄດ້ຖືກພັດທະນາຄົບຖ້ວນທັງ **20 ໂມດູນ** ຮຽບຮ້ອຍແລ້ວ. ສຳລັບແຜນພັດທະນາໃນໄລຍະຕໍ່ໄປປະກອບມີ:

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
2. **ເມື່ອມີການສ້າງ Module ໃໝ່:**
   - ເພີ່ມລາຍຊື່ Module ເຂົ້າໃນ **ຕາຕະລາງສັງລວມ (Section 2)**.
   - ສ້າງຫົວຂໍ້ໃໝ່ໃນ **Section 3** ຕາມແບບແຜນມາດຕະຖານ:
     - ທີ່ຕັ້ງໂຟນເດີ (Folder Path)
     - ຄວາມຮັບຜິດຊອບ (Responsibilities)
     - Use Cases
     - ເສັ້ນທາງ API (Endpoints)
3. **ເມື່ອມີການປ່ຽນແປງ Schema ຖານຂໍ້ມູນ:**
   - ກວດສອບ ແລະ ອັບເດດໃຫ້ສອດຄ່ອງກັບ `prisma/schema.prisma` ແລະ `Data_Dictionary_EDL_Admin.md`.
4. **ເມື່ອມີການອັບເດດ Postman Collection:**
   - ຣັນຄຳສັ່ງ `node make_postman.cjs` ເພື່ອ Sync ໄຟລ໌ `EDL_Admin_API.postman_collection.json` ອັດຕະໂນມັດ.
