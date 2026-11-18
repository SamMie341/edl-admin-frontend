## Summary_Overview

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| EDL ADMIN SYSTEM - DATABASE ARCHITECTURE & DATA DICTIONARY |  |  |  |  |
| ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL) | PostgreSQL Specification Document |  |  |  |
|  |  |  |  |  |
| 1. Database Specifications (ຂໍ້ກຳນົດພື້ນຖານຖານຂໍ້ມູນ) |  |  |  |  |
| Database Name | edl_admin_db | Character Set | UTF8 |  |
| DBMS Engine | PostgreSQL 15+ / 16+ | Collation | UTF8 (Multi-lingual Lao/EN/TH) |  |
| Architecture Pattern | Relational Schema (Normalized 3NF) | Primary Key Standard | INTEGER (SERIAL / IDENTITY) |  |
| Timestamp Convention | UTC / Asia/Vientiane (UTC+7) | Audit Standard | TIMESTAMPTZ with CURRENT_TIMESTAMP |  |
| Total Core Tables | 31 Tables (27 Core Tables + 4 Pivot/Junction Tables) | Status Pattern | CommonStatus / Specific Enums |  |
|  |  |  |  |  |
|  |  |  |  |  |
| 2. System Module Breakdown (ການແບ່ງໝວດໝູ່ໂມດູນຂອງລະບົບ) |  |  |  |  |
| Module Code | Module Name (English / Lao / Thai) | Included Tables | Description & Responsibilities |  |
| MOD-01 | Organization Structure & Branches (ໂຄງຮ່າງການຈັດຕັ້ງ ແລະ ສາຂາ) | departments, branches, service_centers, organization_structures, vision_missions | ຈັດການໂຄງສ້າງອົງກອນ, ຂໍ້ມູນຝ່າຍ (departments), ສາຂາທົ່ວປະເທດ, ສູນບໍລິການລູກຄ້າ ແລະ ວິໄສທັດ/ພາລະກິດ |  |
| MOD-02 | Geographic Administrative Data (ຂໍ້ມູນເຂດການປົກຄອງ) | provinces, districts, villages | ຂໍ້ມູນເຂດການປົກຄອງ ແຂວງ, ເມືອງ, ບ້ານ ສຳລັບຜູກກັບສູນບໍລິການ ແລະ ຂໍ້ມູນທີ່ຢູ່ |  |
| MOD-03 | News & Media Management (ຂ່າວສານ ແລະ ສື່ປະຊາສຳພັນ) | news, news_categories, news_tags, news_tag_relations, electrical_knowledge, magazines | ລະບົບຂ່າວສານປະຊາສຳພັນ 2 ພາສາ (ລາວ/ອັງກິດ), ໝວດໝູ່, ແທັກ, ວິດິໂອຄວາມຮູ້ໄຟຟ້າ ແລະ ວາລະສານດິຈິຕອນ |  |
| MOD-04 | Public Disclosure & Services (ຂໍ້ມູນສາທາລະນະ ແລະ ບໍລິການ) | electricity_tariffs, legislations, procurements, job_postings | ປະກາດລາຄາໄຟຟ້າ, ນິຕິກຳ/ລະບຽບການ (PDF), ປະກາດປະມູນຈັດຊື້-ຈັດຈ້າງ, ແລະ ປະກາດຮັບສະໝັກພະນັກງານ |  |
| MOD-05 | IAM & Personnel Management (ຈັດການຜູ້ໃຊ້, ບົດບາດ, ສິດທິ ແລະ ຕຳແໜ່ງ) | users, positions, roles, permissions, role_permissions, user_permissions | ລະບົບຈັດການບັນຊີຜູ້ໃຊ້ງານ (Admin/Staff), ການເຊື່ອມຕໍ່ HRM, ບົດບາດ (Roles), ສິດທິລະອຽດ (Permissions ALLOW/DENY), ແລະ ຕຳແໜ່ງ |  |
| MOD-06 | Electricity Calculator & Tariff Simulation (ລະບົບຄຳນວນຄ່າໄຟຟ້າ ແລະ ຈຳລອງລາຄາ) | tariff_categories, tariff_notices, tariff_schedules, tariff_tiers, appliance_categories, appliance_presets, saving_action_templates | ລະບົບຈຳລອງ ແລະ ຄຳນວນຄ່າໄຟຟ້າຂັ້ນບັນໄດ, ປະກາດອັດຕາຄ່າໄຟ, ປະເພດເຄື່ອງໃຊ້ໄຟຟ້າ, ຄ່າເລີ່ມຕົ້ນ, ແລະ ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟຟ້າ |  |

## Data_Dictionary

|  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EDL ADMIN SYSTEM - COMPREHENSIVE DATA DICTIONARY (ຕາຕະລາງພົດຈະນານຸກົມຂໍ້ມູນ) |  |  |  |  |  |  |  |  |  |  |  |
| Master Data Dictionary for PostgreSQL: all 31 tables, columns, data types, keys, constraints, and Lao/Thai descriptions |  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |  |
| Table (Physical) | Table (Lao) | Table (Thai) | Column (Physical) | Column (Lao) | Column (Thai) | Data Type | Key | Nullability | Default Value | References (FK) | Description & Business Rules |
| TABLE: departments | ຕາຕະລາງຂໍ້ມູນຝ່າຍ (ตารางข้อมูลฝ่าย (Departments)) — ເກັບກຳຂໍ້ມູນລາຍຊື່ຝ່າຍຕ່າງໆ ພາຍໃນອົງກອນ (ເກັບສະເພາະຊື່ຝ່າຍ) |  |  |  |  |  |  |  |  |  |  |
| departments | ຕາຕະລາງຂໍ້ມູນຝ່າຍ | ตารางข้อมูลฝ่าย (Departments) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก (Primary Key) | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| departments | ຕາຕະລາງຂໍ້ມູນຝ່າຍ | ตารางข้อมูลฝ่าย (Departments) | name | ຊື່ຝ່າຍ | ชื่อฝ่าย (Department Name) | TEXT | - | NOT NULL | NULL | - | Department display name in Lao language |
| departments | ຕາຕະລາງຂໍ້ມູນຝ່າຍ | ตารางข้อมูลฝ่าย (Departments) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| departments | ຕາຕະລາງຂໍ້ມູນຝ່າຍ | ตารางข้อมูลฝ่าย (Departments) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: branches | ຕາຕະລາງຂໍ້ມູນສາຂາ (ตารางข้อมูลสาขาประจำแขวง/พื้นที่) — ເກັບກຳຂໍ້ມູນສາຂາຂອງ ຟຟລ ປະຈຳແຂວງ, ຮູບພາບ, ທີ່ຢູ່, ຊ່ອງທາງຕິດຕໍ່ ແລະ ພາລະບົດບາດ |  |  |  |  |  |  |  |  |  |  |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | department_id | ລະຫັດຝ່າຍ | รหัสฝ่ายที่สังกัด | INTEGER | FK | NOT NULL | NULL | departments(id) | Foreign Key references departments.id (ON DELETE RESTRICT) |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | branch_name | ຊື່ສາຂາ | ชื่อสาขาประจำแขวง | TEXT | - | NOT NULL | NULL | - | Branch official name in Lao |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | branch_image | ຮູບພາບສາຂາ | URL รูปภาพหลักของสาขา | TEXT | - | NULL | NULL | - | Primary branch exterior photo URL |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | cover_image | ຮູບໜ້າປົກ | URL รูปภาพหน้าปก (Cover Image) | TEXT | - | NULL | NULL | - | Banner/Cover image URL for profile |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | org_chart_image | ຮູບໂຄງຮ່າງ | URL รูปภาพผังการบริหารภายในสาขา | TEXT | - | NULL | NULL | - | Branch organizational hierarchy chart URL |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | address | ທີ່ຢູ່ | ที่อยู่สำนักงานสาขา | TEXT | - | NULL | NULL | - | Detailed physical address |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | location_coordinates | ພິກັດທີ່ຕັ້ງ | พิกัดแผนที่ (Latitude, Longitude) | TEXT | - | NULL | NULL | - | GPS coordinates string (Lat, Long) |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | email | ອີເມວ | อีเมลติดต่อสาขา | TEXT | - | NULL | NULL | - | Official contact email |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | phone_number | ເບີໂທລະສັບ | เบอร์โทรศัพท์ติดต่อ | TEXT | - | NULL | NULL | - | Official contact phone number |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | role_responsibilities | ພາລະບົດບາດ | บทบาท หน้าที่ และความรับผิดชอบ | TEXT | - | NULL | NULL | - | Official responsibilities & mission in markdown/text |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | status | ສະຖານະ | สถานะการเปิดใช้งาน (ACTIVE/INACTIVE/UNDER_MAINTENANCE) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE, UNDER_MAINTENANCE |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: service_centers | ຂໍ້ມູນສູນບໍລິການ (ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers)) — ເກັບກຳຂໍ້ມູນສູນບໍລິການລູກຄ້າໄຟຟ້າ ປະຈຳເມືອງ/ບ້ານ ພ້ອມພິກັດແຜນທີ່ |  |  |  |  |  |  |  |  |  |  |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | department_id | ລະຫັດຝ່າຍ | รหัสฝ่ายที่สังกัด | INTEGER | FK | NOT NULL | NULL | departments(id) | Foreign Key references departments.id |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | branch_id | ລະຫັດສາຂາ | รหัสสาขาประจำแขวง | INTEGER | FK | NOT NULL | NULL | branches(id) | Foreign Key references branches.id |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | center_name | ຊື່ສູນບໍລິການ | ชื่อศูนย์บริการลูกค้า | TEXT | - | NOT NULL | NULL | - | Customer service center official name |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | phone_number | ເບີໂທລະສັບ | เบอร์โทรศัพท์ติดต่อศูนย์บริการ | TEXT | - | NULL | NULL | - | Contact telephone number |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | province_id | ລະຫັດແຂວງ | รหัสแขวง | INTEGER | FK | NOT NULL | NULL | provinces(id) | Foreign Key references provinces.id |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | district_id | ລະຫັດເມືອງ | รหัสเมือง | INTEGER | FK | NOT NULL | NULL | districts(id) | Foreign Key references districts.id |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | village_id | ລະຫັດບ້ານ | รหัสบ้าน | INTEGER | FK | NOT NULL | NULL | villages(id) | Foreign Key references villages.id |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | longitude | ເສັ້ນແວງ (Longitude) | พิกัดลองจิจูด (Decimal 11,8) | DECIMAL(11,8) | - | NULL | NULL | - | GPS Longitude coordinate |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | latitude | ເສັ້ນຂະໜານ (Latitude) | พิกัดละติจูด (Decimal 10,8) | DECIMAL(10,8) | - | NULL | NULL | - | GPS Latitude coordinate |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | image_url | ຮູບພາບສູນ | URL รูปภาพศูนย์บริการ | TEXT | - | NULL | NULL | - | Photo of service center facility |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | status | ສະຖານະ | สถานะศูนย์บริการ (ACTIVE/INACTIVE/TEMPORARILY_CLOSED) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE, TEMPORARILY_CLOSED |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: organization_structures | ຂໍ້ມູນໂຄງຮ່າງ (ตารางข้อมูลแผนผังโครงสร้างองค์กร) — ເກັບກຳຮູບພາບ ແລະ ຂໍ້ມູນໂຄງຮ່າງການຈັດຕັ້ງ (ສະພາບໍລິຫານ, ຄະນະບໍລິຫານ, ການຈັດຕັ້ງ) |  |  |  |  |  |  |  |  |  |  |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | structure_type | ປະເພດ | ประเภทโครงสร้างองค์กร | TEXT | - | NOT NULL | NULL | - | Type: BOARD_OF_DIRECTORS, EXECUTIVE_BOARD, ORG_STRUCTURE |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | structure_name | ຊື່ໂຄງສ້າງ | ชื่อโครงสร้างองค์กร | TEXT | - | NOT NULL | NULL | - | Title/Name of organizational structure |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | image_url | ຮູບພາບ | URL รูปภาพแผนผังโครงสร้าง | TEXT | - | NOT NULL | NULL | - | High-resolution diagram image URL |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | status | ສະຖານະ | สถานะการแสดงผล | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: vision_missions | ຂໍ້ມູນວິໄສທັດ (ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม) — ເກັບກຳຂໍ້ມູນວິໄສທັດ, ພາລະກິດ, ສະໂລແກນ ແລະ ເປົ້າໝາຍຍຸດທະສາດຂອງອົງກອນ |  |  |  |  |  |  |  |  |  |  |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | entry_type | ປະເພດຂໍ້ມູນ | ประเภทข้อมูล (วิสัยทัศน์/พันธกิจ/ค่านิยม) | TEXT | - | NOT NULL | 'VISION' | - | Type: VISION, MISSION, CORE_VALUES, SLOGAN |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | title | ຫົວຂໍ້ | หัวข้อ / ชื่อเรื่อง | TEXT | - | NOT NULL | NULL | - | Title of vision or mission item |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | slogan | ສະໂລແກນ | คำขวัญ / สโลแกนประจำองค์กร | TEXT | - | NULL | NULL | - | Corporate slogan or tagline |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | content | ເນື້ອໃນ | รายละเอียดเนื้อหา | TEXT | - | NOT NULL | NULL | - | Comprehensive text/markdown description |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | image_url | ຮູບພາບ | URL รูปภาพประกอบ | TEXT | - | NULL | NULL | - | Optional illustrative image URL |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | status | ສະຖານະ | สถานะการเปิดใช้งาน | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: provinces | ຂໍ້ມູນແຂວງ (ตารางข้อมูลแขวง/จังหวัด) — ເກັບກຳຂໍ້ມູນແຂວງທົ່ວປະເທດລາວ ແລະ ລະຫັດສາຂາ ຟຟລ ປະຈຳແຂວງ |  |  |  |  |  |  |  |  |  |  |
| provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | id | ລະຫັດຫຼັກ | รหัสไอดีแขวง | INTEGER | PK | NOT NULL | MANUAL / ASSIGNED | - | Primary Key |
| provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | name | ຊື່ແຂວງ | ชื่อแขวง (ภาษาลาว) | TEXT | - | NOT NULL | NULL | - | Province name in Lao |
| provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | code | ລະຫັດແຂວງ | รหัสโค้ดแขวง | TEXT | - | NULL | NULL | - | Province official code |
| provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | short_name | ຊື່ຫຍໍ້ | ชื่อย่อแขวง | TEXT | - | NULL | NULL | - | Province abbreviated name |
| provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | branch_code | ລະຫັດສາຂາ | รหัสสาขา กฟล ประจำแขวง | TEXT | - | NULL | NULL | - | EDL branch code association |
| provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: districts | ຂໍ້ມູນເມືອງ (ตารางข้อมูลเมือง/อำเภอ) — ເກັບກຳຂໍ້ມູນເມືອງພາຍໃຕ້ແຕ່ລະແຂວງ |  |  |  |  |  |  |  |  |  |  |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | id | ລະຫັດຫຼັກ | รหัสไอดีเมือง | INTEGER | PK | NOT NULL | MANUAL / ASSIGNED | - | Primary Key |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | province_id | ລະຫັດແຂວງ | รหัสแขวงที่สังกัด | INTEGER | FK | NOT NULL | NULL | provinces(id) | Foreign Key references provinces.id |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | code | ລະຫັດເມືອງ | รหัสโค้ดเมือง | TEXT | - | NULL | NULL | - | District code |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | name | ຊື່ເມືອງ (ລາວ) | ชื่อเมืองภาษาลาว | TEXT | - | NULL | NULL | - | District name in Lao |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | name_en | ຊື່ເມືອງ (ອັງກິດ) | ชื่อเมืองภาษาอังกฤษ | TEXT | - | NULL | NULL | - | District name in English |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | status | ສະຖານະ | สถานะการใช้งาน | TEXT | - | NULL | NULL | - | Status indicator |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: villages | ຂໍ້ມູນບ້ານ (ตารางข้อมูลบ้าน/ตำบล) — ເກັບກຳຂໍ້ມູນບ້ານພາຍໃຕ້ແຕ່ລະເມືອງ |  |  |  |  |  |  |  |  |  |  |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | id | ລະຫັດຫຼັກ | รหัสไอดีบ้าน | INTEGER | PK | NOT NULL | MANUAL / ASSIGNED | - | Primary Key |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | district_id | ລະຫັດເມືອງ | รหัสเมืองที่สังกัด | INTEGER | FK | NOT NULL | NULL | districts(id) | Foreign Key references districts.id |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | code | ລະຫັດບ້ານ | รหัสโค้ดบ้าน | TEXT | - | NULL | NULL | - | Village code |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | name | ຊື່ບ້ານ (ລາວ) | ชื่อบ้านภาษาลาว | TEXT | - | NULL | NULL | - | Village name in Lao |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | name_en | ຊື່ບ້ານ (ອັງກິດ) | ชื่อบ้านภาษาอังกฤษ | TEXT | - | NULL | NULL | - | Village name in English |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | status | ສະຖານະ | สถานะการใช้งาน | TEXT | - | NULL | NULL | - | Status indicator |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ (ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน) — ບົດຄວາມ, ຮູບພາບ ແລະ ຄລິບວິດິໂອສຶກສາໃຫ້ຄວາມຮູ້ດ້ານໄຟຟ້າ ແລະ ຄວາມປອດໄພ |  |  |  |  |  |  |  |  |  |  |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | title | ຫົວຂໍ້ | ชื่อหัวข้อความรู้ | TEXT | - | NOT NULL | NULL | - | Article/Knowledge title |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | cover_image | ຮູບໜ້າປົກ | URL รูปภาพหน้าปกบทความ | TEXT | - | NULL | NULL | - | Banner thumbnail image URL |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | content | ເນື້ອໃນບົດຄວາມ | เนื้อหาบทความความรู้ | TEXT | - | NOT NULL | NULL | - | Main educational body text/markdown |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | video_url | ລິ້ງວິດິໂອ | URL คลิปวิดีโอ (YouTube/Embed) | TEXT | - | NULL | NULL | - | Video link or embedded player URL |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | status | ສະຖານະ | สถานะการเผยแพร่ (ACTIVE/DRAFT/ARCHIVED) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, DRAFT, ARCHIVED |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | view_count | ຈຳນວນຄົນອ່ານ | จำนวนครั้งที่เข้าอ่านบทความ | INTEGER | - | NOT NULL | 0 | - | Pageview metrics counter |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: magazines | ຂໍ້ມູນວາລະສານ (ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine)) — ວາລະສານປະຈຳງວດ/ປີ ຂອງ ຟຟລ ຮູບແບບດິຈິຕອນ ພ້ອມໄຟລ໌ PDF ສໍາລັບດາວໂຫຼດ |  |  |  |  |  |  |  |  |  |  |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | title | ຫົວຂໍ້ວາລະສານ | ชื่อฉบับวารสาร | TEXT | - | NOT NULL | NULL | - | Magazine issue title |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | issue_no | ສະບັບທີ | ฉบับที่ / เล่มที่ | TEXT | - | NULL | NULL | - | Issue number/code |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | publish_date | ວັນທີຕີພິມ | วันที่เผยแพร่วารสาร | DATE | - | NOT NULL | NULL | - | Official publication date |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | cover_image | ຮູບໜ້າປົກ | URL รูปภาพหน้าปกวารสาร | TEXT | - | NOT NULL | NULL | - | Front cover thumbnail image URL |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | file_pdf | ໄຟລ໌ PDF | URL ดาวน์โหลดไฟล์ PDF | TEXT | - | NOT NULL | NULL | - | Downloadable complete issue PDF URL |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | download_count | ຈຳນວນດາວໂຫຼດ | จำนวนครั้งที่ดาวน์โหลดไฟล์ | INTEGER | - | NOT NULL | 0 | - | Download metrics counter |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | status | ສະຖານະ | สถานะการเผยแพร่ | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: news_categories | ຂໍ້ມູນປະເພດຂ່າວ (ตารางข้อมูลหมวดหมู่ข่าวสาร) — ໝວດໝູ່ຂ່າວສານ ເຊັ່ນ: ຂ່າວກິດຈະກຳ, ຂ່າວສັງຄົມ, ຂ່າວເສດຖະກິດ-ພະລັງງານ |  |  |  |  |  |  |  |  |  |  |
| news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | name | ຊື່ໝວດໝູ່ | ชื่อหมวดหมู่ข่าวสาร | TEXT | - | NOT NULL | NULL | - | Category display name |
| news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | description | ຄຳອະທິບາຍ | รายละเอียดคำอธิบายหมวดหมู่ | TEXT | - | NULL | NULL | - | Category detailed description |
| news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | status | ສະຖານະ | สถานะหมวดหมู่ | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: news | ຂໍ້ມູນຂ່າວສານ (ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News)) — ລະບົບບົດຄວາມຂ່າວສານ 2 ພາສາ (ລາວ/ອັງກິດ), ຮູບພາບ, ອັນລະບັ້ມ ແລະ ວິດິໂອ |  |  |  |  |  |  |  |  |  |  |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | category_id | ໝວດໝູ່ຂ່າວ | รหัสหมวดหมู่ข่าวสาร | INTEGER | FK | NOT NULL | NULL | news_categories(id) | Foreign Key references news_categories.id |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | title_la | ຫົວຂໍ້ຂ່າວ (ລາວ) | หัวข้อข่าวสารภาษาลาว | TEXT | - | NOT NULL | NULL | - | News headline in Lao language |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | title_en | ຫົວຂໍ້ຂ່າວ (ອັງກິດ) | หัวข้อข่าวสารภาษาอังกฤษ | TEXT | - | NULL | NULL | - | News headline in English language |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | content_la | ເນື້ອໃນຂ່າວ (ລາວ) | เนื้อหาข่าวภาษาลาว | TEXT | - | NOT NULL | NULL | - | Comprehensive article body in Lao |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | content_en | ເນື້ອໃນຂ່າວ (ອັງກິດ) | เนื้อหาข่าวภาษาอังกฤษ | TEXT | - | NULL | NULL | - | Comprehensive article body in English |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | cover_image | ຮູບໜ້າປົກ | URL รูปภาพหน้าปกข่าวสาร | TEXT | - | NOT NULL | NULL | - | Main article thumbnail image URL |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | images | ອັນລະບັ້ມຮູບ | รายการ URL รูปภาพประกอบ (JSON Array) | JSONB | - | NULL | '[]'::jsonb | - | Array of gallery image URLs |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | video_url | ລິ້ງວິດິໂອ | URL วิดีโอประกอบข่าว | TEXT | - | NULL | NULL | - | Embedded YouTube or video URL |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | view_count | ຈຳນວນຄົນອ່ານ | จำนวนครั้งที่เข้าอ่านข่าวสาร | INTEGER | - | NOT NULL | 0 | - | Pageview metrics counter |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | is_pinned | ປັກໝຸດຂ່າວ | สถานะการปักหมุดข่าวเด่น (True/False) | BOOLEAN | - | NOT NULL | FALSE | - | Featured/Pinned article flag |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | status | ສະຖານະ | สถานะการเผยแพร่ (DRAFT/PUBLISHED/ARCHIVED) | TEXT | - | NOT NULL | 'DRAFT' | - | Status: DRAFT, PUBLISHED, ARCHIVED |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | published_at | ວັນທີເຜີຍແຜ່ | วันเวลาที่เผยแพร่ข่าวสู่สาธารณะ | TIMESTAMPTZ | - | NULL | NULL | - | Public release schedule timestamp |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: news_tags | ຂໍ້ມູນແທັກຂ່າວ (ตารางข้อมูลแท็กคำค้นข่าวสาร (Tags)) — ແທັກຄຳສັບຫຼັກສຳລັບຈັດໝວດໝູ່ ແລະ ຄົ້ນຫາຂ່າວສານໄດ້ສະດວກ |  |  |  |  |  |  |  |  |  |  |
| news_tags | ຂໍ້ມູນແທັກຂ່າວ | ตารางข้อมูลแท็กคำค้นข่าวสาร (Tags) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| news_tags | ຂໍ້ມູນແທັກຂ່າວ | ตารางข้อมูลแท็กคำค้นข่าวสาร (Tags) | name | ຊື່ແທັກ | ชื่อแท็กคำค้น | TEXT | UK | NOT NULL | NULL | - | Unique tag name |
| news_tags | ຂໍ້ມູນແທັກຂ່າວ | ตารางข้อมูลแท็กคำค้นข่าวสาร (Tags) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| news_tags | ຂໍ້ມູນແທັກຂ່າວ | ตารางข้อมูลแท็กคำค้นข่าวสาร (Tags) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: news_tag_relations | ຕາຕະລາງເຊື່ອມໂຍງຂ່າວ-ແທັກ (ตารางความสัมพันธ์ข่าวสารและแท็ก (Many-to-Many Pivot)) — ຕາຕະລາງ Pivot ເຊື່ອມໂຍງລະຫວ່າງ ຂ່າວສານ ແລະ ແທັກຂ່າວ (N:M Relationship) |  |  |  |  |  |  |  |  |  |  |
| news_tag_relations | ຕາຕະລາງເຊື່ອມໂຍງຂ່າວ-ແທັກ | ตารางความสัมพันธ์ข่าวสารและแท็ก (Many-to-Many Pivot) | news_id | ລະຫັດຂ່າວ | รหัสบทความข่าวสาร | INTEGER | PK, FK | NOT NULL | NULL | news(id) | Composite PK, FK references news.id (ON DELETE CASCADE) |
| news_tag_relations | ຕາຕະລາງເຊື່ອມໂຍງຂ່າວ-ແທັກ | ตารางความสัมพันธ์ข่าวสารและแท็ก (Many-to-Many Pivot) | tag_id | ລະຫັດແທັກ | รหัสแท็กคำค้น | INTEGER | PK, FK | NOT NULL | NULL | news_tags(id) | Composite PK, FK references news_tags.id (ON DELETE CASCADE) |
| TABLE: legislations | ຂໍ້ມູນນິຕິກຳ (ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย) — ເອກະສານນິຕິກຳ, ດຳລັດ, ຂໍ້ຕົກລົງ, ກົດໝາຍໄຟຟ້າ ແລະ ລະບຽບການຕ່າງໆ ຮູບແບບ PDF (ບໍ່ມີປະເພດນິຕິກຳ) |  |  |  |  |  |  |  |  |  |  |
| legislations | ຂໍ້ມູນນິຕິກຳ | ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| legislations | ຂໍ້ມູນນິຕິກຳ | ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย | title | ຫົວຂໍ້ນິຕິກຳ | ชื่อหัวข้อนิติกรรม/ระเบียบการ | TEXT | - | NOT NULL | NULL | - | Legal document title |
| legislations | ຂໍ້ມູນນິຕິກຳ | ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย | file_pdf | ໄຟລ໌ PDF | URL ดาวน์โหลดเอกสารฉบับเต็ม | TEXT | - | NOT NULL | NULL | - | Full legal document PDF URL |
| legislations | ຂໍ້ມູນນິຕິກຳ | ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย | status | ສະຖານະ | สถานะเอกสาร (ACTIVE/INACTIVE/ARCHIVED) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE, ARCHIVED |
| legislations | ຂໍ້ມູນນິຕິກຳ | ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| legislations | ຂໍ້ມູນນິຕິກຳ | ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ (ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs)) — ຕາຕະລາງລາຄາຄ່າໄຟຟ້າຕາມແຕ່ລະປະເພດຜູ້ຊົມໃຊ້ (ທີ່ຢູ່ອາໄສ, ທຸລະກິດ, ອຸດສາຫະກຳ) |  |  |  |  |  |  |  |  |  |  |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | title | ຫົວຂໍ້ປະກາດ | หัวข้อประกาศโครงสร้างราคาค่าไฟ | TEXT | - | NOT NULL | NULL | - | Tariff notification title |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | tariff_type | ປະເພດຜູ້ຊົມໃຊ້ | หมวดหมู่ประเภทผู้ใช้ไฟฟ้า | TEXT | - | NOT NULL | NULL | - | Category: RESIDENTIAL, COMMERCIAL, INDUSTRIAL |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | file_pdf | ໄຟລ໌ PDF | URL ดาวน์โหลดเอกสารโครงสร้างราคา | TEXT | - | NOT NULL | NULL | - | Full detailed tariff PDF URL |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | effective_date | ວັນທີມີຜົນບັງຄັບ | วันที่เริ่มมีผลบังคับใช้ | DATE | - | NOT NULL | NULL | - | Start effective date |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | status | ສະຖານະ | สถานะประกาศ (ACTIVE/INACTIVE/HISTORICAL) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE, HISTORICAL |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: procurements | ຂໍ້ມູນປະມູນ (ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement)) — ແຈ້ງການປະມູນໂຄງການ, ຈັດຊື້-ຈັດຈ້າງ, ວັນທີເປີດ-ປິດຮັບຊອງ ແລະ ເອກະສານ TOR |  |  |  |  |  |  |  |  |  |  |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | title | ຫົວຂໍ້ການປະມູນ | ชื่อโครงการจัดซื้อจัดจ้าง/ประกวดราคา | TEXT | - | NOT NULL | NULL | - | Tender project title |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | file_pdf | ໄຟລ໌ TOR (PDF) | URL ดาวน์โหลดเอกสาร TOR | TEXT | - | NOT NULL | NULL | - | Terms of Reference specification PDF URL |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | start_date | ວັນທີເລີ່ມເປີດຊອງ | วันที่เริ่มเปิดรับซองประกวดราคา | DATE | - | NOT NULL | NULL | - | Bid submission opening date |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | end_date | ວັນທີປິດຮັບຊອງ | วันที่ปิดรับซองประกวดราคา | DATE | - | NOT NULL | NULL | - | Bid submission closing deadline |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | status | ສະຖານະ | สถานะโครงการประกวดราคา | TEXT | - | NOT NULL | 'DRAFT' | - | Status: DRAFT, OPEN, CLOSED, CANCELLED, AWARDED |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: job_postings | ຂໍ້ມູນປະກາດວຽກ (ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment)) — ແຈ້ງການຮັບສະໝັກພະນັກງານ ຟຟລ, ຕຳແໜ່ງ, ວັນທີເປີດ-ປິດຮັບສະໝັກ ແລະ ເງື່ອນໄຂ |  |  |  |  |  |  |  |  |  |  |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | position_id | ລະຫັດຕຳແໜ່ງ | รหัสตำแหน่งงานที่เปิดรับ | INTEGER | FK | NOT NULL | NULL | positions(id) | Foreign Key references positions.id |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | title | ຫົວຂໍ້ປະກາດຮັບສະໝັກ | หัวข้อประกาศรับสมัครงาน | TEXT | - | NOT NULL | NULL | - | Job vacancy announcement headline |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | file_pdf | ໄຟລ໌ປະກາດ (PDF) | URL เอกสารประกาศฉบับเต็ม | TEXT | - | NOT NULL | NULL | - | Full announcement/JD PDF URL |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | quantity | ຈຳນວນທີ່ຮັບ | จำนวนอัตราที่เปิดรับสมัคร | INTEGER | - | NOT NULL | 1 | - | Number of available open seats |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | start_date | ວັນທີເລີ່ມເປີດຮັບ | วันที่เริ่มเปิดรับสมัครงาน | DATE | - | NOT NULL | NULL | - | Application opening date |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | end_date | ວັນທີປິດຮັບສະໝັກ | วันที่ปิดรับสมัครงาน | DATE | - | NOT NULL | NULL | - | Application closing deadline |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | status | ສະຖານະ | สถานะประกาศ (OPEN/CLOSED/CANCELLED) | TEXT | - | NOT NULL | 'OPEN' | - | Status: OPEN, CLOSED, CANCELLED |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: positions | ຂໍ້ມູນຕຳແໜ່ງ (ตารางข้อมูลตำแหน่งงาน (Job Positions สำหรับประกาศงาน)) — ລາຍການຕຳແໜ່ງງານສຳລັບໃຊ້ກັບການປະກາດຮັບສະໝັກພະນັກງານ (job_postings) |  |  |  |  |  |  |  |  |  |  |
| positions | ຂໍ້ມູນຕຳແໜ່ງ | ตารางข้อมูลตำแหน่งงาน (Job Positions สำหรับประกาศงาน) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| positions | ຂໍ້ມູນຕຳແໜ່ງ | ตารางข้อมูลตำแหน่งงาน (Job Positions สำหรับประกาศงาน) | name | ຊື່ຕຳແໜ່ງ | ชื่อตำแหน่งงานทางการ | TEXT | - | NOT NULL | NULL | - | Position title string |
| positions | ຂໍ້ມູນຕຳແໜ່ງ | ตารางข้อมูลตำแหน่งงาน (Job Positions สำหรับประกาศงาน) | description | ຄຳອະທິບາຍ | รายละเอียดลักษณะงาน | TEXT | - | NULL | NULL | - | General description |
| positions | ຂໍ້ມູນຕຳແໜ່ງ | ตารางข้อมูลตำแหน่งงาน (Job Positions สำหรับประกาศงาน) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| positions | ຂໍ້ມູນຕຳແໜ່ງ | ตารางข้อมูลตำแหน่งงาน (Job Positions สำหรับประกาศงาน) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: roles | ຕາຕະລາງບົດບາດ (ตารางบทบาทหน้าที่ (Roles)) — ບົດບາດຫຼັກໃນລະບົບ IAM ເຊັ່ນ: SUPERADMIN, ADMIN, EDITOR, STAFF |  |  |  |  |  |  |  |  |  |  |
| roles | ຕາຕະລາງບົດບາດ | ตารางบทบาทหน้าที่ (Roles) | id | ລະຫັດຫຼັກ | รหัสบทบาทหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| roles | ຕາຕະລາງບົດບາດ | ตารางบทบาทหน้าที่ (Roles) | name | ຊື່ບົດບາດ | ชื่อบทบาททางการ (Unique) | TEXT | UK | NOT NULL | NULL | - | Role name (SUPERADMIN, ADMIN, etc.) |
| roles | ຕາຕະລາງບົດບາດ | ตารางบทบาทหน้าที่ (Roles) | description | ຄຳອະທິບາຍ | คำอธิบายหน้าที่ความรับผิดชอบของบทบาท | TEXT | - | NULL | NULL | - | Role description |
| roles | ຕາຕະລາງບົດບາດ | ตารางบทบาทหน้าที่ (Roles) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| roles | ຕາຕະລາງບົດບາດ | ตารางบทบาทหน้าที่ (Roles) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: permissions | ຕາຕະລາງສິດທິລະບົບ (ตารางสิทธิ์การใช้งาน (Permissions)) — ລາຍການສິດລະດັບ Module ແລະ Action ໃນລະບົບ |  |  |  |  |  |  |  |  |  |  |
| permissions | ຕາຕະລາງສິດທິລະບົບ | ตารางสิทธิ์การใช้งาน (Permissions) | id | ລະຫັດຫຼັກ | รหัสสิทธิ์หลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| permissions | ຕາຕະລາງສິດທິລະບົບ | ตารางสิทธิ์การใช้งาน (Permissions) | module | ຊື່ໂມດູນ | ชื่อโมดูลที่ควบคุมสิทธิ์ | TEXT | - | NOT NULL | NULL | - | Module name (e.g. USERS, NEWS, ROLES) |
| permissions | ຕາຕະລາງສິດທິລະບົບ | ตารางสิทธิ์การใช้งาน (Permissions) | action | ການກະທຳ | การกระทำที่ได้รับอนุญาต | TEXT | - | NOT NULL | NULL | - | Action name (e.g. CREATE, READ, UPDATE, DELETE) |
| permissions | ຕາຕະລາງສິດທິລະບົບ | ตารางสิทธิ์การใช้งาน (Permissions) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| TABLE: role_permissions | ຕາຕະລາງເຊື່ອມໂຍງບົດບາດ-ສິດທິ (ตารางผูกบทบาทและสิทธิ์ (Role Permissions Pivot)) — ຕາຕະລາງ Pivot ກຳນົດສິດທິທີ່ແຕ່ລະ Role ໄດ້ຮັບ |  |  |  |  |  |  |  |  |  |  |
| role_permissions | ຕາຕະລາງເຊື່ອມໂຍງບົດບາດ-ສິດທິ | ตารางผูกบทบาทและสิทธิ์ (Role Permissions Pivot) | role_id | ລະຫັດບົດບາດ | รหัสบทบาท | INTEGER | PK, FK | NOT NULL | NULL | roles(id) | Composite PK, FK references roles.id (ON DELETE CASCADE) |
| role_permissions | ຕາຕະລາງເຊື່ອມໂຍງບົດບາດ-ສິດທິ | ตารางผูกบทบาทและสิทธิ์ (Role Permissions Pivot) | permission_id | ລະຫັດສິດທິ | รหัสสิทธิ์การใช้งาน | INTEGER | PK, FK | NOT NULL | NULL | permissions(id) | Composite PK, FK references permissions.id (ON DELETE CASCADE) |
| TABLE: user_permissions | ຕາຕະລາງສິດທິສະເພາະບຸກຄົນ (ตารางสิทธิ์เฉพาะบุคคล (User Permissions Pivot)) — ກຳນົດສິດເພີ່ມ (ALLOW) ຫຼື ຕັດສິດອອກຈາກ Role (DENY) ສຳລັບຜູ້ໃຊ້ແຕ່ລະຄົນ |  |  |  |  |  |  |  |  |  |  |
| user_permissions | ຕາຕະລາງສິດທິສະເພາະບຸກຄົນ | ตารางสิทธิ์เฉพาะบุคคล (User Permissions Pivot) | user_id | ລະຫັດຜູ້ໃຊ້ | รหัสผู้ใช้งาน | INTEGER | PK, FK | NOT NULL | NULL | users(id) | Composite PK, FK references users.id (ON DELETE CASCADE) |
| user_permissions | ຕາຕະລາງສິດທິສະເພາະບຸກຄົນ | ตารางสิทธิ์เฉพาะบุคคล (User Permissions Pivot) | permission_id | ລະຫັດສິດທິ | รหัสสิทธิ์การใช้งาน | INTEGER | PK, FK | NOT NULL | NULL | permissions(id) | Composite PK, FK references permissions.id (ON DELETE CASCADE) |
| user_permissions | ຕາຕະລາງສິດທິສະເພາະບຸກຄົນ | ตารางสิทธิ์เฉพาะบุคคล (User Permissions Pivot) | effect | ຮູບແບບຜົນບັງຄັບ | ผลบังคับใช้สิทธิ์ (ALLOW / DENY) | TEXT | - | NOT NULL | 'ALLOW' | - | Enum: ALLOW (ເພີ່ມສິດ), DENY (ຕັດສິດອອກຈາກ Role) |
| TABLE: users | ຂໍ້ມູນຜູ້ໃຊ້ (ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users)) — ບັນຊີຜູ້ໃຊ້ງານລະບົບ Admin, ພະນັກງານ, ສິດທິການເຂົ້າເຖິງ ແລະ ສັງກັດຝ່າຍ/ໜ່ວຍງານ |  |  |  |  |  |  |  |  |  |  |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | id | ລະຫັດຫຼັກ | รหัสไอดีหลัก | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | employee_code | ລະຫັດພະນັກງານ | รหัสพนักงาน (Unique Employee ID) | TEXT | UK | NOT NULL | NULL | - | Unique employee ID in EDL (Sync from HRM) |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | first_name | ຊື່ | ชื่อจริงพนักงาน | TEXT | - | NOT NULL | NULL | - | User first name |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | last_name | ນາມສະກຸນ | นามสกุล | TEXT | - | NOT NULL | NULL | - | User last name |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | email | ອີເມວ | อีเมลเข้าใช้งานระบบ (Username/Email) | TEXT | UK | NOT NULL | NULL | - | Unique login email address |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | password_hash | ລະຫັດຜ່ານ | รหัสผ่านแฮช (Bcrypt/Argon2) | TEXT | - | NOT NULL | NULL | - | Secure salted hash string |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | phone_number | ເບີໂທ | เบอร์โทรศัพท์ติดต่อ | TEXT | - | NULL | NULL | - | Contact phone number |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | department_id | ຝ່າຍ | รหัสฝ่ายที่สังกัด | INTEGER | FK | NULL | NULL | departments(id) | Foreign Key references departments.id (ON DELETE SET NULL) |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | department_name | ຊື່ຝ່າຍ | ชื่อฝ่ายที่สังกัด | TEXT | - | NULL | NULL | - | Department name from HRM |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | division_name | ພະແນກ | ชื่อแผนกย่อยที่สังกัด | TEXT | - | NULL | NULL | - | Division name within department |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | unit_name | ໜ່ວຍງານ | ชื่อหน่วยงานย่อย | TEXT | - | NULL | NULL | - | Work unit/sector name |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | role_id | ລະຫັດບົດບາດ | รหัสบทบาทสิทธิ์ (Role ID) | INTEGER | FK | NULL | NULL | roles(id) | Foreign Key references roles.id (ON DELETE SET NULL) |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | status | ສະຖານະ | สถานะบัญชี (ACTIVE/INACTIVE/SUSPENDED) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE, SUSPENDED |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | last_login_at | ເຂົ້າສູ່ລະບົບລ້າສຸດ | วันเวลาเข้าสู่ระบบครั้งล่าสุด | TIMESTAMPTZ | - | NULL | NULL | - | Last authentication timestamp |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ (ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า) — ໝວດໝູ່ຫຼັກສຳລັບຈັດກຸ່ມເຄື່ອງໃຊ້ໄຟຟ້າ ເຊັ່ນ: ເຮັດຄວາມເຢັນ, ແສງສະຫວ່າງ, ຄົວເຮືອນ |  |  |  |  |  |  |  |  |  |  |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | id | ລະຫັດຫຼັກ | รหัสไอดีหมวดหมู่อุปกรณ์ | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | name_la | ຊື່ໝວດໝູ່ (ລາວ) | ชื่อหมวดหมู่ภาษาลาว | TEXT | - | NOT NULL | NULL | - | Category display name in Lao |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | name_en | ຊື່ໝວດໝູ່ (ອັງກິດ) | ชื่อหมวดหมู่ภาษาอังกฤษ | TEXT | - | NULL | NULL | - | Category display name in English |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | icon_name | ຊື່ອາຍຄອນ | ชื่อไอคอนกราฟิก (Icon Name) | TEXT | - | NULL | NULL | - | Icon identifier string for UI |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | status | ສະຖານະ | สถานะหมวดหมู่ (ACTIVE/INACTIVE) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ (ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป) — ລາຍການເຄື່ອງໃຊ້ໄຟຟ້າພ້ອມກຳລັງວັດ (Watt) ແລະ ຊົ່ວໂມງນຳໃຊ້ເລີ່ມຕົ້ນ |  |  |  |  |  |  |  |  |  |  |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | id | ລະຫັດຫຼັກ | รหัสไอดีอุปกรณ์ | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | category_id | ລະຫັດໝວດໝູ່ | รหัสหมวดหมู่อุปกรณ์ที่สังกัด | INTEGER | FK | NOT NULL | NULL | appliance_categories(id) | Foreign Key references appliance_categories.id (ON DELETE RESTRICT) |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | name_la | ຊື່ອຸປະກອນ (ລາວ) | ชื่ออุปกรณ์ไฟฟ้าภาษาลาว | TEXT | - | NOT NULL | NULL | - | Preset appliance name in Lao |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | name_en | ຊື່ອຸປະກອນ (ອັງກິດ) | ชื่ออุปกรณ์ไฟฟ้าภาษาอังกฤษ | TEXT | - | NULL | NULL | - | Preset appliance name in English |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | default_watt | ກຳລັງໄຟເລີ່ມຕົ້ນ (W) | กำลังไฟฟ้าเริ่มต้น (วัตต์) | INTEGER | - | NOT NULL | NULL | - | Rated electric wattage in Watts |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | default_quantity | ຈຳນວນເລີ່ມຕົ້ນ | จำนวนเครื่องเริ่มต้น | INTEGER | - | NOT NULL | 1 | - | Initial quantity unit count |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | default_hours_per_day | ຊົ່ວໂມງຕໍ່ມື້ເລີ່ມຕົ້ນ | ชั่วโมงการใช้งานต่อวันเริ่มต้น | DECIMAL(4,1) | - | NOT NULL | 4.0 | - | Daily usage hours (e.g. 4.0 hrs/day) |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | default_days_per_month | ວັນຕໍ່ເດືອນເລີ່ມຕົ້ນ | วันการใช้งานต่อเดือนเริ่มต้น | INTEGER | - | NOT NULL | 30 | - | Monthly usage days (e.g. 30 days/month) |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | is_sample_default | ສະແດງໃນຕົວຢ່າງເລີ່ມຕົ້ນ | แสดงในชุดตัวอย่างเริ่มต้น (True/False) | BOOLEAN | - | NOT NULL | FALSE | - | Flag indicating preset inclusion in default user scenario |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | status | ສະຖານະ | สถานะการใช้งาน (ACTIVE/INACTIVE) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ (ตารางแม่แบบมาตรการประหยัดไฟฟ้า) — ມາດຕະການຫຼຸດການໃຊ້ໄຟຟ້າ ພ້ອມກົດເກນການຄຳນວນ (FIXED_FRACTION, REDUCE_HOURS, REPLACE_WATTAGE) |  |  |  |  |  |  |  |  |  |  |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | id | ລະຫັດຫຼັກ | รหัสไอดีมาตรการ | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | category_id | ລະຫັດໝວດໝູ່ | รหัสหมวดหมู่อุปกรณ์ที่ผูกมัด | INTEGER | FK | NOT NULL | NULL | appliance_categories(id) | Foreign Key references appliance_categories.id (ON DELETE CASCADE) |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | title_la | ຊື່ມາດຕະການ (ລາວ) | ชื่อมาตรการภาษาลาว | TEXT | - | NOT NULL | NULL | - | Measure title in Lao |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | title_en | ຊື່ມາດຕະການ (ອັງກິດ) | ชื่อมาตรการภาษาอังกฤษ | TEXT | - | NULL | NULL | - | Measure title in English |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | description_la | ຄຳອະທິບາຍ (ລາວ) | คำอธิบายรายละเอียดมาตรการ (ลาว) | TEXT | - | NOT NULL | NULL | - | Saving tip explanation in Lao |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | description_en | ຄຳອະທິບາຍ (ອັງກິດ) | คำอธิบายรายละเอียดมาตรการ (อังกฤษ) | TEXT | - | NULL | NULL | - | Saving tip explanation in English |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | effort_level | ລະດັບຄວາມຍາກງ່າຍ | ระดับความยากง่ายในการปฏิบัติ | TEXT | - | NOT NULL | 'EASY' | - | EffortLevel: EASY (ງ່າຍ), LOW_COST (ລົງທຶນໜ້ອຍ), INVESTMENT (ລົງທຶນ) |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | rule_type | ປະເພດກົດເກນ | รูปแบบการคำนวณการประหยัด | TEXT | - | NOT NULL | NULL | - | SavingRuleType: FIXED_FRACTION, REDUCE_HOURS, REPLACE_WATTAGE |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | fixed_fraction | ສັດສ່ວນການປະຢັດ (frac) | สัดส่วนเปอร์เซ็นต์ที่ประหยัดได้ (0-1) | DECIMAL(5,4) | - | NULL | NULL | - | Fractional saving ratio (e.g. 0.1500 = 15%) |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | reduce_hours_by | ຈຳນວນຊົ່ວໂມງທີ່ຫຼຸດລົງ | จำนวนชั่วโมงการใช้งานที่ลดลงต่อวัน | DECIMAL(4,1) | - | NULL | NULL | - | Number of hours reduced per day |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | target_watt_low | ກຳລັງວັດເປົ້າໝາຍຂັ້ນຕ່ຳ | วัตต์เป้าหมายขั้นต่ำหลังเปลี่ยนอุปกรณ์ | INTEGER | - | NULL | NULL | - | Target wattage low threshold for replacement |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | target_watt_high | ກຳລັງວັດເປົ້າໝາຍຂັ້ນສູງ | วัตต์เป้าหมายขั้นสูงหลังเปลี่ยนอุปกรณ์ | INTEGER | - | NULL | NULL | - | Target wattage high threshold for replacement |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | default_selected | ເລືອກໄວ້ເລີ່ມຕົ້ນ | ติ๊กเลือกมาตรการนี้เริ่มต้น (True/False) | BOOLEAN | - | NOT NULL | TRUE | - | Default selection state in savings calculator |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | status | ສະຖານະ | สถานะการใช้งาน (ACTIVE/INACTIVE) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ (ตารางประกาศอัตราค่าไฟฟ้าทางการ) — ປະກາດທາງການຂອງ ຟຟລ, ເລກທີແຈ້ງການ, ວັນທີບັງຄັບໃຊ້, ອັດຕາອາກອນມູນຄ່າເພີ່ມ (VAT), ຄ່າບໍລິການ ແລະ ເພດານຫຼຸດລາຄາລະດູຮ້ອນ |  |  |  |  |  |  |  |  |  |  |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | id | ລະຫັດຫຼັກ | รหัสไอดีประกาศ | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | notice_number | ເລກທີປະກາດ | เลขที่หนังสือประกาศทางการ (Unique) | TEXT | UK | NOT NULL | NULL | - | Official notice number (e.g. "0123/EDL") |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | title | ຫົວຂໍ້ປະກາດ | ชื่อประกาศอัตราค่าไฟ | TEXT | - | NOT NULL | NULL | - | Public official title of tariff notification |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | issued_date | ວັນທີອອກປະກາດ | วันที่ออกหนังสือประกาศ | DATE | - | NOT NULL | NULL | - | Date on official document |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | effective_from | ມີຜົນເລີ່ມຕັ້ງແຕ່ວັນທີ | วันที่เริ่มมีผลบังคับใช้ | DATE | - | NOT NULL | NULL | - | Start of validity period |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | effective_to | ມີຜົນສິ້ນສຸດວັນທີ | วันที่สิ้นสุดผลบังคับใช้ | DATE | - | NOT NULL | NULL | - | End of validity period |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | vat_rate | ອັດຕາອາກອນມູນຄ່າເພີ່ມ (VAT) | อัตราภาษีมูลค่าเพิ่ม (เช่น 0.10 หรือ 0.07) | DECIMAL(5,4) | - | NOT NULL | 0.1000 | - | Standard VAT rate applied (0.1000 = 10%) |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | hot_season_discount_cap_kwh | ເພດານຫຼຸດລະດູຮ້ອນ (kWh) | เพดานส่วนลดหน่วยค่าไฟฤดูร้อน (kWh) | INTEGER | - | NOT NULL | 300 | - | Cap in kWh for hot season subsidized discount |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | maintenance_fee_kip | ຄ່າບຳລຸງຮັກສາພື້ນຖານ (ກີບ) | ค่าธรรมเนียมบำรุงรักษาพื้นฐาน (กีบ) | DECIMAL(14,2) | - | NOT NULL | 0.00 | - | Default fixed monthly maintenance fee |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | status | ສະຖານະ | สถานะประกาศ (ACTIVE/INACTIVE) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ (ตารางประเภทอัตราค่าไฟฟ้า) — ປະເພດຜູ້ຊົມໃຊ້ໄຟຟ້າ ເຊັ່ນ: ທີ່ຢູ່ອາໄສ (Residential), ທຸລະກິດ, ອຸດສາຫະກຳ, ກະສິກຳ, ຫ້ອງການລັດ, ອົງການສາກົນ |  |  |  |  |  |  |  |  |  |  |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | id | ລະຫັດຫຼັກ | รหัสไอดีประเภทค่าไฟ | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | name_la | ຊື່ປະເພດ (ລາວ) | ชื่อประเภทผู้ใช้ไฟฟ้าภาษาลาว | TEXT | - | NOT NULL | NULL | - | Category official name in Lao |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | name_en | ຊື່ປະເພດ (ອັງກິດ) | ชื่อประเภทผู้ใช้ไฟฟ้าภาษาอังกฤษ | TEXT | - | NULL | NULL | - | Category official name in English |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | category_group | ກຸ່ມປະເພດ | กลุ่มประเภทผู้ใช้ไฟฟ้า (RESIDENTIAL / NON_RESIDENTIAL) | TEXT | - | NULL | NULL | - | Group: RESIDENTIAL, NON_RESIDENTIAL |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | voltage_level | ລະດັບແຮງດັນ | ระดับแรงดันไฟฟ้า (0.4 kV, 22 kV, 115 kV) | TEXT | - | NULL | NULL | - | Voltage level descriptor (e.g. 0.4 kV) |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | description | ຄຳອະທິບາຍ | คำอธิบายรายละเอียดกลุ่มผู้ใช้ | TEXT | - | NULL | NULL | - | Detailed description of the category |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | order_index | ລຳດັບການສະແດງ | ลำดับการแสดงผล | INTEGER | - | NOT NULL | 0 | - | Display sort ordering |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | status | ສະຖານະ | สถานะการใช้งาน (ACTIVE/INACTIVE) | TEXT | - | NOT NULL | 'ACTIVE' | - | Status: ACTIVE, INACTIVE |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | updated_at | ວັນທີອັບເດດ | วันที่อัปเดตข้อมูลล่าสุด | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record modification timestamp |
| TABLE: tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ (ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน) — ຕາຕະລາງເຊື່ອມໂຍງປະກາດ ແລະ ປະເພດລາຄາໄຟ ຕາມປີ/ເດືອນ ພ້ອມທຸງລະດູຮ້ອນ (is_hot_season) |  |  |  |  |  |  |  |  |  |  |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | id | ລະຫັດຫຼັກ | รหัสไอดีตารางค่าไฟ | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | notice_id | ລະຫັດປະກາດ | รหัสประกาศอัตราค่าไฟ | INTEGER | FK | NOT NULL | NULL | tariff_notices(id) | Foreign Key references tariff_notices.id (ON DELETE CASCADE) |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | category_id | ລະຫັດປະເພດ | รหัสประเภทผู้ใช้ไฟฟ้า | INTEGER | FK | NOT NULL | NULL | tariff_categories(id) | Foreign Key references tariff_categories.id (ON DELETE RESTRICT) |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | year | ປີ ຄ.ສ. | ปี ค.ศ. ที่มีผลบังคับ | INTEGER | - | NOT NULL | NULL | - | Calendar year (e.g. 2026) |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | month | ເດືອນ (1-12) | เดือนที่บังคับใช้ (1 - 12) | INTEGER | - | NOT NULL | NULL | - | Month of year (1-12) |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | is_hot_season | ລະດູຮ້ອນ (ມີສ່ວນຫຼຸດ) | ธงระบุเดือนฤดูร้อน (มีส่วนลดค่าไฟ) | BOOLEAN | - | NOT NULL | FALSE | - | Flag indicating hot season promotional discount |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | maintenance_fee_kip | ຄ່າບຳລຸງຮັກສາສະເພາະເດືອນ | ค่าบำรุงรักษารายเดือนเฉพาะกิจ (ถ้ามี) | DECIMAL(14,2) | - | NULL | NULL | - | Specific monthly maintenance fee override |
| tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | created_at | ວັນທີສ້າງ | วันที่สร้างข้อมูล | TIMESTAMPTZ | - | NOT NULL | CURRENT_TIMESTAMP | - | Record creation timestamp |
| TABLE: tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ (ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers)) — ຂັ້ນບັນໄດລາຄາຄ່າໄຟ (1-8 ຂັ້ນ) ຕາມຈຳນວນ kWh ທີ່ຊົມໃຊ້ (min_kwh, max_kwh, rate_kip_per_kwh) |  |  |  |  |  |  |  |  |  |  |
| tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | id | ລະຫັດຫຼັກ | รหัสไอดีขั้นบันได | INTEGER | PK | NOT NULL | IDENTITY / SERIAL | - | Primary Key, Auto increment |
| tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | schedule_id | ລະຫັດຕາຕະລາງ | รหัสตารางค่าไฟที่สังกัด | INTEGER | FK | NOT NULL | NULL | tariff_schedules(id) | Foreign Key references tariff_schedules.id (ON DELETE CASCADE) |
| tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | tier_order | ລຳດັບຂັ້ນ (1-8) | ลำดับขั้นบันได (1 ถึง 8) | INTEGER | - | NOT NULL | NULL | - | Tier order sequence index (1, 2, 3...) |
| tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | label | ປ້າຍຊື່ຂັ້ນ | ป้ายชื่อแสดงช่วงหน่วย (เช่น "0–25", "26–150") | TEXT | - | NOT NULL | NULL | - | Display label (e.g. "0–25 kWh", "> 1,500 kWh") |
| tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | min_kwh | ໜ່ວຍເລີ່ມຕົ້ນ (kWh) | หน่วยไฟฟ้าขั้นต่ำของขั้น (kWh) | INTEGER | - | NOT NULL | NULL | - | Inclusive minimum kWh boundary |
| tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | max_kwh | ໜ່ວຍສູງສຸດ (kWh) | หน่วยไฟฟ้าสูงสุดของขั้น (NULL = ไม่จำกัด) | INTEGER | - | NULL | NULL | - | Upper kWh boundary (NULL for unbounded top tier) |
| tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | rate_kip_per_kwh | ລາຄາຕໍ່ໜ່ວຍ (ກີບ/kWh) | อัตราค่าไฟฟ้าต่อหน่วย (กีบ/kWh) | DECIMAL(10,2) | - | NOT NULL | NULL | - | Electricity rate in Kip per kilowatt-hour |

## Tables_Catalog

|  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EDL ADMIN SYSTEM - TABLES CATALOG & INVENTORY (ລາຍການຕາຕະລາງທັງໝົດ) |  |  |  |  |  |  |  |  |
| Complete catalog of 31 PostgreSQL tables (27 core tables and 4 junction/pivot tables) with schema metrics |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
| No. | Module | Table Name (Physical) | Table Name (Lao) | Table Name (Thai) | Columns | Primary Key | Foreign Keys | Business Scope / Purpose |
| 1 | MOD-01: Organization | departments | ຕາຕະລາງຂໍ້ມູນຝ່າຍ | ตารางข้อมูลฝ่าย (Departments) | 4 | id | - | ເກັບກຳຂໍ້ມູນລາຍຊື່ຝ່າຍຕ່າງໆ ພາຍໃນອົງກອນ (ເກັບສະເພາະຊື່ຝ່າຍ) |
| 2 | MOD-01: Organization | branches | ຕາຕະລາງຂໍ້ມູນສາຂາ | ตารางข้อมูลสาขาประจำแขวง/พื้นที่ | 15 | id | department_id -> departments(id) | ເກັບກຳຂໍ້ມູນສາຂາຂອງ ຟຟລ ປະຈຳແຂວງ, ຮູບພາບ, ທີ່ຢູ່, ຊ່ອງທາງຕິດຕໍ່ ແລະ ພາລະບົດບາດ |
| 3 | MOD-01: Organization | service_centers | ຂໍ້ມູນສູນບໍລິການ | ตารางข้อมูลศูนย์บริการลูกค้า (Service Centers) | 14 | id | department_id -> departments(id); branch_id -> branches(id); province_id -> provinces(id); district_id -> districts(id); village_id -> villages(id) | ເກັບກຳຂໍ້ມູນສູນບໍລິການລູກຄ້າໄຟຟ້າ ປະຈຳເມືອງ/ບ້ານ ພ້ອມພິກັດແຜນທີ່ |
| 4 | MOD-01: Organization | organization_structures | ຂໍ້ມູນໂຄງຮ່າງ | ตารางข้อมูลแผนผังโครงสร้างองค์กร | 8 | id | - | ເກັບກຳຮູບພາບ ແລະ ຂໍ້ມູນໂຄງຮ່າງການຈັດຕັ້ງ (ສະພາບໍລິຫານ, ຄະນະບໍລິຫານ, ການຈັດຕັ້ງ) |
| 5 | MOD-01: Organization | vision_missions | ຂໍ້ມູນວິໄສທັດ | ตารางข้อมูลวิสัยทัศน์ พันธกิจ และค่านิยม | 10 | id | - | ເກັບກຳຂໍ້ມູນວິໄສທັດ, ພາລະກິດ, ສະໂລແກນ ແລະ ເປົ້າໝາຍຍຸດທະສາດຂອງອົງກອນ |
| 6 | MOD-02: Geographic | provinces | ຂໍ້ມູນແຂວງ | ตารางข้อมูลแขวง/จังหวัด | 7 | id | - | ຂໍ້ມູນແຂວງທົ່ວປະເທດລາວ ພ້ອມລະຫັດສາຂາ ຟຟລ |
| 7 | MOD-02: Geographic | districts | ຂໍ້ມູນເມືອງ | ตารางข้อมูลเมือง/อำเภอ | 8 | id | province_id -> provinces(id) | ຂໍ້ມູນເມືອງພາຍໃຕ້ແຕ່ລະແຂວງ |
| 8 | MOD-02: Geographic | villages | ຂໍ້ມູນບ້ານ | ตารางข้อมูลบ้าน/ตำบล | 8 | id | district_id -> districts(id) | ຂໍ້ມູນບ້ານພາຍໃຕ້ແຕ່ລະເມືອງ |
| 9 | MOD-03: News & Media | electrical_knowledge | ຂໍ້ມູນຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ | ตารางข้อมูลคลังความรู้เกี่ยวกับไฟฟ้าและพลังงาน | 9 | id | - | ບົດຄວາມ, ຮູບພາບ ແລະ ຄລິບວິດິໂອສຶກສາໃຫ້ຄວາມຮູ້ດ້ານໄຟຟ້າ ແລະ ຄວາມປອດໄພ |
| 10 | MOD-03: News & Media | magazines | ຂໍ້ມູນວາລະສານ | ตารางข้อมูลวารสารและสิ่งพิมพ์อิเล็กทรอนิกส์ (E-Magazine) | 10 | id | - | ວາລະສານປະຈຳງວດ/ປີ ຂອງ ຟຟລ ຮູບແບບດິຈິຕອນ ພ້ອມໄຟລ໌ PDF ສໍາລັບດາວໂຫຼດ |
| 11 | MOD-03: News & Media | news_categories | ຂໍ້ມູນປະເພດຂ່າວ | ตารางข้อมูลหมวดหมู่ข่าวสาร | 7 | id | - | ໝວດໝູ່ຂ່າວສານ ເຊັ່ນ: ຂ່າວກິດຈະກຳ, ຂ່າວສັງຄົມ, ຂ່າວເສດຖະກິດ-ພະລັງງານ |
| 12 | MOD-03: News & Media | news | ຂໍ້ມູນຂ່າວສານ | ตารางข้อมูลข่าวสารและประชาสัมพันธ์ (Articles & News) | 15 | id | category_id -> news_categories(id) | ລະບົບບົດຄວາມຂ່າວສານ 2 ພາສາ (ລາວ/ອັງກິດ), ຮູບພາບ, ອັນລະບັ້ມ ແລະ ວິດິໂອ |
| 13 | MOD-03: News & Media | news_tags | ຂໍ້ມູນແທັກຂ່າວ | ตารางข้อมูลแท็กคำค้นข่าวสาร (Tags) | 4 | id | - | ແທັກຄຳສັບຫຼັກສຳລັບຈັດໝວດໝູ່ ແລະ ຄົ້ນຫາຂ່າວສານໄດ້ສະດວກ |
| 14 | MOD-03: News & Media | news_tag_relations | ຕາຕະລາງເຊື່ອມໂຍງຂ່າວ-ແທັກ | ตารางความสัมพันธ์ข่าวสารและแท็ก (Many-to-Many Pivot) | 2 | news_id, tag_id | news_id -> news(id); tag_id -> news_tags(id) | ຕາຕະລາງ Pivot ເຊື່ອມໂຍງລະຫວ່າງ ຂ່າວສານ ແລະ ແທັກຂ່າວ (N:M Relationship) |
| 15 | MOD-04: Public Disclosure | legislations | ຂໍ້ມູນນິຕິກຳ | ตารางข้อมูลนิติกรรมและระเบียบกฎหมาย | 6 | id | - | ເອກະສານນິຕິກຳ, ດຳລັດ, ຂໍ້ຕົກລົງ, ກົດໝາຍໄຟຟ້າ ແລະ ລະບຽບການຕ່າງໆ ຮູບແບບ PDF |
| 16 | MOD-04: Public Disclosure | electricity_tariffs | ຂໍ້ມູນລາຄາໄຟຟ້າ | ตารางข้อมูลอัตราค่าไฟฟ้า (Electricity Tariffs) | 8 | id | - | ຕາຕະລາງລາຄາຄ່າໄຟຟ້າຕາມແຕ່ລະປະເພດຜູ້ຊົມໃຊ້ (PDF ດັ້ງເດີມ) |
| 17 | MOD-04: Public Disclosure | procurements | ຂໍ້ມູນປະມູນ | ตารางข้อมูลประกวดราคา จัดซื้อจัดจ้าง (Tenders & Procurement) | 8 | id | - | ແຈ້ງການປະມູນໂຄງການ, ຈັດຊື້-ຈັດຈ້າງ, ວັນທີເປີດ-ປິດຮັບຊອງ ແລະ ເອກະສານ TOR |
| 18 | MOD-04: Public Disclosure | job_postings | ຂໍ້ມູນປະກາດວຽກ | ตารางข้อมูลประกาศรับสมัครงานและตำแหน่งงานว่าง (Recruitment) | 10 | id | position_id -> positions(id) | ແຈ້ງການຮັບສະໝັກພະນັກງານ ຟຟລ, ຕຳແໜ່ງ, ວັນທີເປີດ-ປິດຮັບສະໝັກ ແລະ ເງື່ອນໄຂ |
| 19 | MOD-05: IAM & Personnel | positions | ຂໍ້ມູນຕຳແໜ່ງ | ตารางข้อมูลตำแหน่งงาน (Job Positions สำหรับประกาศงาน) | 5 | id | - | ລາຍການຕຳແໜ່ງງານສຳລັບໃຊ້ກັບການປະກາດຮັບສະໝັກພະນັກງານ (job_postings) |
| 20 | MOD-05: IAM & Personnel | roles | ຕາຕະລາງບົດບາດ | ตารางบทบาทหน้าที่ (Roles) | 5 | id | - | ບົດບາດຫຼັກໃນລະບົບ IAM (SUPERADMIN, ADMIN, EDITOR, STAFF) |
| 21 | MOD-05: IAM & Personnel | permissions | ຕາຕະລາງສິດທິລະບົບ | ตารางสิทธิ์การใช้งาน (Permissions) | 4 | id | - | ລາຍການສິດລະດັບ Module ແລະ Action ໃນລະບົບ (ເຊັ່ນ: USERS:READ, NEWS:CREATE) |
| 22 | MOD-05: IAM & Personnel | role_permissions | ຕາຕະລາງເຊື່ອມໂຍງບົດບາດ-ສິດທິ | ตารางผูกบทบาทและสิทธิ์ (Role Permissions Pivot) | 2 | role_id, permission_id | role_id -> roles(id); permission_id -> permissions(id) | ຕາຕະລາງ Pivot ຜູກມັດບົດບາດ ແລະ ສິດທິ |
| 23 | MOD-05: IAM & Personnel | user_permissions | ຕາຕະລາງສິດທິສະເພາະບຸກຄົນ | ตารางสิทธิ์เฉพาะบุคคล (User Permissions Pivot) | 3 | user_id, permission_id | user_id -> users(id); permission_id -> permissions(id) | ຕາຕະລາງ Pivot ສິດສະເພາະບຸກຄົນ ພ້ອມຜົນບັງຄັບ (ALLOW/DENY) |
| 24 | MOD-05: IAM & Personnel | users | ຂໍ້ມູນຜູ້ໃຊ້ | ตารางข้อมูลผู้ใช้งานระบบและแอดมิน (System Users) | 16 | id | department_id -> departments(id); role_id -> roles(id) | ບັນຊີຜູ້ໃຊ້ງານລະບົບ Admin, ພະນັກງານ, ສິດທິການເຂົ້າເຖິງ ແລະ ສັງກັດຝ່າຍ/ໜ່ວຍງານ |
| 25 | MOD-06: Calculator | appliance_categories | ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลหมวดหมู่อุปกรณ์ไฟฟ้า | 9 | id | - | ໝວດໝູ່ຫຼັກສຳລັບຈັດກຸ່ມເຄື່ອງໃຊ້ໄຟຟ້າ (ເຮັດຄວາມເຢັນ, ແສງສະຫວ່າງ, ຯລຯ) |
| 26 | MOD-06: Calculator | appliance_presets | ແມ່ແບບເຄື່ອງໃຊ້ໄຟຟ້າ | ตารางข้อมูลแม่แบบอุปกรณ์ไฟฟ้าสำเร็จรูป | 14 | id | category_id -> appliance_categories(id) | ລາຍການເຄື່ອງໃຊ້ໄຟຟ້າພ້ອມກຳລັງວັດ (Watt) ແລະ ຊົ່ວໂມງນຳໃຊ້ເລີ່ມຕົ້ນ |
| 27 | MOD-06: Calculator | saving_action_templates | ແມ່ແບບຄຳແນະນຳການປະຢັດໄຟ | ตารางแม่แบบมาตรการประหยัดไฟฟ้า | 17 | id | category_id -> appliance_categories(id) | ມາດຕະການຫຼຸດການໃຊ້ໄຟຟ້າ ພ້ອມກົດເກນການຄຳນວນ (FIXED_FRACTION, REDUCE_HOURS, REPLACE_WATTAGE) |
| 28 | MOD-06: Calculator | tariff_notices | ປະກາດອັດຕາຄ່າໄຟຟ້າ | ตารางประกาศอัตราค่าไฟฟ้าทางการ | 12 | id | - | ປະກາດທາງການຂອງ ຟຟລ, ເລກທີແຈ້ງການ, ວັນທີບັງຄັບໃຊ້, ອັດຕາ VAT, ຄ່າບໍລິການ ແລະ ສ່ວນຫຼຸດລະດູຮ້ອນ |
| 29 | MOD-06: Calculator | tariff_categories | ປະເພດອັດຕາຄ່າໄຟຟ້າ | ตารางประเภทอัตราค่าไฟฟ้า | 10 | id | - | ປະເພດຜູ້ຊົມໃຊ້ໄຟຟ້າ (ທີ່ຢູ່ອາໄສ, ທຸລະກິດ, ອຸດສາຫະກຳ, ກະສິກຳ, ຫ້ອງການລັດ, ອົງການສາກົນ) |
| 30 | MOD-06: Calculator | tariff_schedules | ຕາຕະລາງຄ່າໄຟລາຍເດືອນ | ตารางกำหนดการอัตราค่าไฟฟ้ารายเดือน | 8 | id | notice_id -> tariff_notices(id); category_id -> tariff_categories(id) | ຕາຕະລາງເຊື່ອມໂຍງປະກາດ ແລະ ປະເພດລາຄາໄຟ ຕາມປີ/ເດືອນ ພ້ອມທຸງລະດູຮ້ອນ |
| 31 | MOD-06: Calculator | tariff_tiers | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟ | ตารางขั้นบันไดอัตราค่าไฟฟ้า (Tariff Tiers) | 7 | id | schedule_id -> tariff_schedules(id) | ຂັ້ນບັນໄດລາຄາຄ່າໄຟ (1-8 ຂັ້ນ) ຕາມຈຳນວນ kWh ທີ່ຊົມໃຊ້ (min_kwh, max_kwh, rate_kip_per_kwh) |

## Relationships_ERD

|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EDL ADMIN SYSTEM - ENTITY RELATIONSHIPS & FOREIGN KEY MATRIX |  |  |  |  |  |  |  |
| Foreign key mapping, cardinality (1:N, M:N), constraints, referential integrity actions |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
| Rel ID | Child Table (ตารางลูก) | Foreign Key (Column) | Parent Table (ตารางแม่) | Referenced PK | Cardinality | On Delete / On Update | Relationship Meaning & Business Logic |
| REL-01 | branches | department_id | departments | id | Many-to-One (N:1) | RESTRICT / CASCADE | ສາຂາແຕ່ລະແຫ່ງຂຶ້ນກັບຝ່າຍໃດໜຶ່ງ (แต่ละสาขาสังกัดภายใต้ฝ่ายงาน) |
| REL-02 | service_centers | department_id | departments | id | Many-to-One (N:1) | RESTRICT / CASCADE | ສູນບໍລິການສັງກັດພາຍໃຕ້ຝ່າຍກຳກັບດູແລ (ศูนย์บริการอยู่ภายใต้ฝ่ายงานที่กำกับดูแล) |
| REL-03 | service_centers | branch_id | branches | id | Many-to-One (N:1) | RESTRICT / CASCADE | ສູນບໍລິການແຕ່ລະແຫ່ງຂຶ້ນກັບສາຂາປະຈຳແຂວງ (ศูนย์บริการขึ้นตรงต่อสาขาประจำแขวง) |
| REL-04 | service_centers | province_id | provinces | id | Many-to-One (N:1) | RESTRICT / CASCADE | ສູນບໍລິການຕັ້ງຢູ່ພາຍໃນແຂວງ (ศูนย์บริการตั้งอยู่ภายในแขวง) |
| REL-05 | service_centers | district_id | districts | id | Many-to-One (N:1) | RESTRICT / CASCADE | ສູນບໍລິການຕັ້ງຢູ່ພາຍໃນເມືອງ (ศูนย์บริการตั้งอยู่ภายในเมือง) |
| REL-06 | service_centers | village_id | villages | id | Many-to-One (N:1) | RESTRICT / CASCADE | ສູນບໍລິການຕັ້ງຢູ່ພາຍໃນບ້ານ (ศูนย์บริการตั้งอยู่ภายในบ้าน) |
| REL-07 | districts | province_id | provinces | id | Many-to-One (N:1) | RESTRICT / CASCADE | ເມືອງຂຶ້ນກັບແຂວງ (เมืองขึ้นตรงต่อแขวง) |
| REL-08 | villages | district_id | districts | id | Many-to-One (N:1) | RESTRICT / CASCADE | ບ້ານຂຶ້ນກັບເມືອງ (บ้านขึ้นตรงต่อเมือง) |
| REL-09 | news | category_id | news_categories | id | Many-to-One (N:1) | RESTRICT / CASCADE | ບົດຄວາມຂ່າວສານແຕ່ລະເລື່ອງສັງກັດໃນໝວດໝູ່ຂ່າວ (ข่าวสารแต่ละเรื่องต้องผูกกับหมวดหมู่ข่าว) |
| REL-10 | news_tag_relations | news_id | news | id | Many-to-One (N:1) | CASCADE / CASCADE | ຕາຕະລາງ Pivot ເຊື່ອມຂ່າວ (ລຶບຂ່າວຈະລຶບແທັກທີ່ຜູກໄວ້ທັງໝົດອັດຕະໂນມັດ) |
| REL-11 | news_tag_relations | tag_id | news_tags | id | Many-to-One (N:1) | CASCADE / CASCADE | ຕາຕະລາງ Pivot ເຊື່ອມແທັກ (ລຶບແທັກຈະລຶບການເຊື່ອມໂຍງອອກ) |
| REL-12 | job_postings | position_id | positions | id | Many-to-One (N:1) | RESTRICT / CASCADE | ແຈ້ງການຮັບສະໝັກງານຕ້ອງເຊື່ອມໂຍງກັບຕຳແໜ່ງທີ່ກຳນົດໄວ້ (ประกาศรับสมัครงานเชื่อมโยงตำแหน่ง) |
| REL-13 | users | department_id | departments | id | Many-to-One (N:1) | SET NULL / CASCADE | ພະນັກງານ/ຜູ້ໃຊ້ງານລະບົບສັງກັດຝ່າຍ (ผู้ใช้งานสังกัดฝ่าย หากลบฝ่ายให้เป็น NULL) |
| REL-14 | users | role_id | roles | id | Many-to-One (N:1) | SET NULL / CASCADE | ຜູ້ໃຊ້ງານມີບົດບາດຫຼັກ (ผู้ใช้งานสังกัดบทบาทหลัก หากลบบทบาทให้เป็น NULL) |
| REL-15 | role_permissions | role_id | roles | id | Many-to-One (N:1) | CASCADE / CASCADE | ບົດບາດຜູກມັດກັບສິດທິ (ผูกบทบาทกับสิทธิ์ หากลบบทบาทให้ลบการเชื่อมโยง) |
| REL-16 | role_permissions | permission_id | permissions | id | Many-to-One (N:1) | CASCADE / CASCADE | ສິດທິຜູກມັດກັບບົດບາດ (ผูกสิทธิ์กับบทบาท หากลบสิทธิ์ให้ลบการเชื่อมโยง) |
| REL-17 | user_permissions | user_id | users | id | Many-to-One (N:1) | CASCADE / CASCADE | ສິດທິສະເພາະບຸກຄົນ (ສິດ ALLOW / DENY ຂອງຜູ້ໃຊ້, ລຶບຜູ້ໃຊ້ລຶບສິດສະເພາະອັດຕະໂນມັດ) |
| REL-18 | user_permissions | permission_id | permissions | id | Many-to-One (N:1) | CASCADE / CASCADE | ສິດທິສະເພາະບຸກຄົນຜູກກັບ Permission (ລຶບ Permission ລຶບການເຊື່ອມໂຍງ) |
| REL-19 | appliance_presets | category_id | appliance_categories | id | Many-to-One (N:1) | RESTRICT / CASCADE | ເຄື່ອງໃຊ້ໄຟຟ້າແຕ່ລະຢ່າງສັງກັດໝວດໝູ່ (อุปกรณ์ไฟฟ้าสังกัดหมวดหมู่ ห้ามลบหมวดหมู่ถ้ามีอุปกรณ์) |
| REL-20 | saving_action_templates | category_id | appliance_categories | id | Many-to-One (N:1) | CASCADE / CASCADE | ມາດຕະການປະຢັດໄຟສັງກັດໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ (มาตรการประหยัดไฟสังกัดหมวดหมู่อุปกรณ์) |
| REL-21 | tariff_schedules | notice_id | tariff_notices | id | Many-to-One (N:1) | CASCADE / CASCADE | ຕາຕະລາງຄ່າໄຟລາຍເດືອນຂຶ້ນກັບປະກາດອັດຕາຄ່າໄຟ (ตารางค่าไฟรายเดือนผูกกับประกาศอัตราค่าไฟ) |
| REL-22 | tariff_schedules | category_id | tariff_categories | id | Many-to-One (N:1) | RESTRICT / CASCADE | ຕາຕະລາງຄ່າໄຟລາຍເດືອນຜູກກັບປະເພດຜູ້ຊົມໃຊ້ (ตารางค่าไฟผูกกับประเภทผู้ใช้ไฟฟ้า) |
| REL-23 | tariff_tiers | schedule_id | tariff_schedules | id | Many-to-One (N:1) | CASCADE / CASCADE | ຂັ້ນບັນໄດອັດຕາຄ່າໄຟຜູກກັບຕາຕະລາງຄ່າໄຟລາຍເດືອນ (ขั้นบันไดค่าไฟผูกกับตารางค่าไฟรายเดือน) |
