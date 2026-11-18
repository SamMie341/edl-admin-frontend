import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  MapPin,
  Network,
  Target,
  Lightbulb,
  BookOpen,
  Newspaper,
  Tags,
  FolderKanban,
  Scale,
  Zap,
  Briefcase,
  FileText,
  UserCheck,
  Map,
  ShieldCheck,
  Calculator,
  Layers,
  Sparkles,
  FileSpreadsheet,
  Tag,
} from 'lucide-react';
import type { UserRole } from '@/modules/auth/domain/auth.types';

export interface NavSubItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  roles?: (UserRole | string)[];
  module?: string;
  modules?: string[];
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: (UserRole | string)[];
  module?: string;
  modules?: string[];
  children?: NavSubItem[];
}

export interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const SIDEBAR_NAVIGATION: NavGroup[] = [
  {
    groupTitle: 'ພາບລວມລະບົບ',
    items: [
      {
        title: 'ໜ້າຫຼັກ (Dashboard)',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    groupTitle: 'ຂໍ້ມູນອົງກອນ & ສາຂາ',
    items: [
      {
        title: 'ໂຄງຮ່າງການຈັດຕັ້ງ',
        href: '/org-structures',
        icon: Network,
        module: 'ORGANIZATION_STRUCTURES',
      },
      {
        title: 'ວິໄສທັດ ແລະ ພາລະກິດ',
        href: '/vision-missions',
        icon: Target,
        module: 'VISION_MISSIONS',
      },
      {
        title: 'ຂໍ້ມູນຝ່າຍ (Departments)',
        href: '/departments',
        icon: Building2,
        module: 'DEPARTMENTS',
      },
      {
        title: 'ຂໍ້ມູນສາຂາ (Branches)',
        href: '/branches',
        icon: GitBranch,
        module: 'BRANCHES',
      },
      {
        title: 'ສູນບໍລິການລູກຄ້າ',
        href: '/service-centers',
        icon: MapPin,
        module: 'SERVICE_CENTERS',
      },
      {
        title: 'ຂໍ້ມູນແຂວງ / ເມືອງ / ບ້ານ',
        href: '/locations',
        icon: Map,
        modules: ['PROVINCES', 'DISTRICTS', 'VILLAGES'],
      },
    ],
  },
  {
    groupTitle: 'ຂ່າວສານ & ເນື້ອຫາດິຈິຕອນ',
    items: [
      {
        title: 'ຂ່າວສານປະຊາສຳພັນ',
        href: '/news',
        icon: Newspaper,
        module: 'NEWS',
      },
      {
        title: 'ໝວດໝູ່ຂ່າວສານ',
        href: '/news-categories',
        icon: FolderKanban,
        module: 'NEWS_CATEGORIES',
      },
      {
        title: 'ແທັກຂ່າວສານ (Tags)',
        href: '/news-tags',
        icon: Tags,
        module: 'NEWS_TAGS',
      },
      {
        title: 'ຄວາມຮູ້ດ້ານໄຟຟ້າ',
        href: '/electrical-knowledge',
        icon: Lightbulb,
        module: 'ELECTRICAL_KNOWLEDGE',
      },
      {
        title: 'ວາລະສານ E-Magazine',
        href: '/magazines',
        icon: BookOpen,
        module: 'MAGAZINES',
      },
    ],
  },
  {
    groupTitle: 'ບໍລິການ & ປະກາດສາທາລະນະ',
    items: [
      {
        title: 'ຄິດໄລ່ຄ່າໄຟຟ້າ & ແຜນປະຢັດໄຟ',
        href: '/electricity-calculator',
        icon: Calculator,
        module: 'ELECTRICITY_CALCULATOR',
        children: [
          {
            title: 'ປະເພດອັດຕາຄ່າໄຟ',
            href: '/electricity-calculator/tariff-categories',
            icon: Tag,
            module: 'ELECTRICITY_CALCULATOR',
          },
          {
            title: 'ປະກາດ & ຕາຕະລາງ 8 ຂັ້ນ',
            href: '/electricity-calculator/notices',
            icon: FileSpreadsheet,
            module: 'ELECTRICITY_CALCULATOR',
          },
          {
            title: 'ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ',
            href: '/electricity-calculator/categories',
            icon: Layers,
            module: 'ELECTRICITY_CALCULATOR',
          },
          {
            title: 'ເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ',
            href: '/electricity-calculator/presets',
            icon: Zap,
            module: 'ELECTRICITY_CALCULATOR',
          },
          {
            title: 'ແມ່ແບບວິທີປະຢັດໄຟ',
            href: '/electricity-calculator/saving-templates',
            icon: Sparkles,
            module: 'ELECTRICITY_CALCULATOR',
          },
          {
            title: 'ທົດລອງຄິດໄລ່ (Simulator)',
            href: '/electricity-calculator/simulator',
            icon: Calculator,
            module: 'ELECTRICITY_CALCULATOR',
          },
        ],
      },
      {
        title: 'ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ',
        href: '/electricity-tariffs',
        icon: Zap,
        module: 'ELECTRICITY_TARIFFS',
      },
      {
        title: 'ເອກະສານນິຕິກຳ',
        href: '/legislations',
        icon: Scale,
        module: 'LEGISLATIONS',
      },
      {
        title: 'ປະກາດຈັດຊື້-ຈັດຈ້າງ',
        href: '/procurements',
        icon: FileText,
        module: 'PROCUREMENTS',
      },
    ],
  },
  {
    groupTitle: 'ບຸກຄະລາກອນ & ຄວາມປອດໄພ',
    items: [
      {
        title: 'ປະກາດຮັບສະໝັກງານ',
        href: '/job-postings',
        icon: Briefcase,
        module: 'JOB_POSTINGS',
      },
      {
        title: 'ຕຳແໜ່ງງານ (Positions)',
        href: '/positions',
        icon: UserCheck,
        module: 'POSITIONS',
      },
      {
        title: 'ຈັດການຜູ້ໃຊ້ງານ (IAM)',
        href: '/users',
        icon: Users,
        module: 'USERS',
      },
      {
        title: 'ຈັດການສິດທິບົດບາດ (Roles)',
        href: '/roles',
        icon: ShieldCheck,
        module: 'ROLES',
      },
    ],
  },
];
