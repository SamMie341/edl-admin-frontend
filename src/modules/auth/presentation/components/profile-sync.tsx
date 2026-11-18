'use client';

import { useProfile } from '../../application/use-profile.hook';

/**
 * Component ສຳລັບ Background Sync ຂໍ້ມູນ Profile ແລະ Permissions ຂອງຜູ້ໃຊ້
 * ເມື່ອ Mount ໃນ Root Admin Layout ຈະເຮັດໃຫ້ທຸກໆການ Refresh (F5) ຫຼື Focus ປ່ອງຢ້ຽມ
 * ມີການດຶງສິດທິຫຼ້າສຸດຈາກ Database ມາອັບເດດໃຫ້ທັນທີ
 */
export function ProfileSync() {
  useProfile();
  return null;
}
