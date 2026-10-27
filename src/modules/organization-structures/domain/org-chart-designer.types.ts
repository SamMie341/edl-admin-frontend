export interface OrgChartPersonNode {
  id: string;
  nameLao: string;
  nameEn: string;
  roleLao: string;
  roleEn: string;
  departmentBadge?: string;
  photoUrl?: string; // Data URL or Image URL
}

export interface OrgChartStructure {
  id?: string;
  chartTitleLao: string;
  chartTitleEn: string;
  leader: OrgChartPersonNode;
  members: OrgChartPersonNode[];
}

export const DEFAULT_AVATAR_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200" fill="%23f1f5f9"><rect width="160" height="200" fill="%23f1f5f9"/><circle cx="80" cy="70" r="35" fill="%23cbd5e1"/><path d="M25 180 C25 125, 135 125, 135 180 Z" fill="%23cbd5e1"/></svg>';

export const DEFAULT_EDL_BOARD_PRESET: OrgChartStructure = {
  chartTitleLao: 'ປະທານສະພາຜູ້ບໍລິຫານ',
  chartTitleEn: 'CHAIRMAN OF THE BOARD',
  leader: {
    id: 'leader-1',
    nameLao: 'ທ່ານ ປອ. ອາຄົມເດດ ວົງໄຊ',
    nameEn: 'Akhomdeth VONGSAY, PH.D',
    roleLao: 'ປະທານສະພາຜູ້ບໍລິຫານ',
    roleEn: 'Chairman of the Board',
    departmentBadge: 'ປະທານສະພາຜູ້ບໍລິຫານ / CHAIRMAN OF THE BOARD',
  },
  members: [
    {
      id: 'member-1',
      departmentBadge:
        'ຫົວໜ້າກົມຄຸ້ມຄອງວິສາຫະກິດລັດລົງທຶນ ແລະ ການປະກັນໄພ, ກະຊວງການເງິນ',
      nameLao: 'ທ່ານ ໄພບູນ ທ່ຽງລະໄມ',
      nameEn: 'Mr.Phaithoun THIENGLAMAI',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    },
    {
      id: 'member-2',
      departmentBadge: 'ຫົວໜ້າກົມຄຸ້ມຄອງໜີ້ສິນສາທາລະນະ ກະຊວງການເງິນ',
      nameLao: 'ທ່ານ ວິເລດ ກິນນາວົງ',
      nameEn: 'Mr.Vileth KINNAVONG',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    },
    {
      id: 'member-3',
      departmentBadge: 'ຫົວໜ້າກົມກວດກາ ກະຊວງອຸດສາຫະກຳ ແລະ ການຄ້າ',
      nameLao: 'ທ່ານ ເພັດສະຫວັນ ລັດຕະນະທອງໄຊ',
      nameEn: 'Mr.Phetsavanh RATTANATHONGXAY',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    },
    {
      id: 'member-4',
      departmentBadge:
        'ຫົວໜ້າກົມນະໂຍບາຍ, ແຜນຍຸດທະສາດ ແລະ ປະເມີນຜົນ ກະຊວງອຸດສາຫະກຳ ແລະ ການຄ້າ',
      nameLao: 'ທ່ານ ນາງ ປອ. ສັນຕິສຸກ ພິມພະຈັນ',
      nameEn: 'Santisouk PHIMPHACHANH, PH.D',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    },
    {
      id: 'member-5',
      departmentBadge: 'ຫົວໜ້າຫ້ອງການຄະນະກຳມະການຄຸ້ມຄອງຫຼັກຊັບ',
      nameLao: 'ທ່ານ ປອ.ຊາຍຄຳ ພຸດທະວົງ',
      nameEn: 'Xaykham PHOUTTHAVONG, PH.D',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    },
    {
      id: 'member-6',
      departmentBadge: 'ຮອງອະທິການບໍດີ ມະຫາວິທະຍາໄລ ແຫ່ງຊາດ',
      nameLao: 'ທ່ານ ຮສ.ປອ ພູເພັດ ກ້ຽວພິລາວົງ',
      nameEn: 'Phouphet KYOPHILAVONG, Prof.D',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    },
    {
      id: 'member-7',
      departmentBadge:
        'ຫົວໜ້າກົມຄຸ້ມຄອງທະນາຄານທຸລະກິດ ທະນາຄານແຫ່ງ ສປປ ລາວ',
      nameLao: 'ທ່ານ ເພັດສະຖາພອນ ແກ້ວວົງວິຈິດ',
      nameEn: 'Mr.Phetsathaphone KEOVONGVICHITH',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    },
  ],
};

export const DEFAULT_EXECUTIVE_PRESET: OrgChartStructure = {
  chartTitleLao: 'ຄະນະຜູ້ອຳນວຍການໃຫຍ່',
  chartTitleEn: 'MANAGING DIRECTORS & EXECUTIVES',
  leader: {
    id: 'leader-exec',
    nameLao: 'ທ່ານ ຜູ້ອຳນວຍການໃຫຍ່ ຟຟລ',
    nameEn: 'Managing Director of EDL',
    roleLao: 'ຜູ້ອຳນວຍການໃຫຍ່',
    roleEn: 'Managing Director',
    departmentBadge: 'ຄະນະຜູ້ອຳນວຍການໃຫຍ່ / MANAGING DIRECTOR',
  },
  members: [
    {
      id: 'member-exec-1',
      departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານທຸລະກິດ',
      nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 1',
      nameEn: 'Deputy Managing Director 1',
      roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
      roleEn: 'Deputy Managing Director',
    },
    {
      id: 'member-exec-2',
      departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານເຕັກນິກ ແລະ ວິສະວະກຳ',
      nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 2',
      nameEn: 'Deputy Managing Director 2',
      roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
      roleEn: 'Deputy Managing Director',
    },
    {
      id: 'member-exec-3',
      departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານການເງິນ ແລະ ບັນຊີ',
      nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 3',
      nameEn: 'Deputy Managing Director 3',
      roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
      roleEn: 'Deputy Managing Director',
    },
    {
      id: 'member-exec-4',
      departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານແຜນການ ແລະ ຄຸ້ມຄອງລະບົບ',
      nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 4',
      nameEn: 'Deputy Managing Director 4',
      roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
      roleEn: 'Deputy Managing Director',
    },
  ],
};

export const DEFAULT_BLANK_PRESET: OrgChartStructure = {
  chartTitleLao: 'ໂຄງຮ່າງການຈັດຕັ້ງໃໝ່',
  chartTitleEn: 'ORGANIZATION STRUCTURE',
  leader: {
    id: 'leader-blank',
    nameLao: 'ຊື່ ແລະ ນາມສະກຸນ ຫົວໜ້າ',
    nameEn: 'Leader Name & Surname',
    roleLao: 'ຫົວໜ້າ / ຜູ້ອຳນວຍການ',
    roleEn: 'Head / Director',
    departmentBadge: 'ຕຳແໜ່ງສູງສຸດ / TOP LEADER',
  },
  members: [
    {
      id: 'member-blank-1',
      departmentBadge: 'ໜ່ວຍງານ / ພະແນກ / ສັງກັດ 1',
      nameLao: 'ຊື່ ສະມາຊິກ 1',
      nameEn: 'Member Name 1',
      roleLao: 'ຕຳແໜ່ງ 1',
      roleEn: 'Position 1',
    },
    {
      id: 'member-blank-2',
      departmentBadge: 'ໜ່ວຍງານ / ພະແນກ / ສັງກັດ 2',
      nameLao: 'ຊື່ ສະມາຊິກ 2',
      nameEn: 'Member Name 2',
      roleLao: 'ຕຳແໜ່ງ 2',
      roleEn: 'Position 2',
    },
  ],
};
