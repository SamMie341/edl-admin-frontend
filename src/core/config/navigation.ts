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
} from 'lucide-react';
import type { UserRole } from '@/modules/auth/domain/auth.types';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: UserRole[];
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
      },
      {
        title: 'ວິໄສທັດ ແລະ ພາລະກິດ',
        href: '/vision-missions',
        icon: Target,
      },
      {
        title: 'ຂໍ້ມູນຝ່າຍ (Departments)',
        href: '/departments',
        icon: Building2,
      },
      {
        title: 'ຂໍ້ມູນສາຂາ (Branches)',
        href: '/branches',
        icon: GitBranch,
      },
      {
        title: 'ສູນບໍລິການລູກຄ້າ',
        href: '/service-centers',
        icon: MapPin,
      },
      {
        title: 'ຂໍ້ມູນແຂວງ / ເມືອງ / ບ້ານ',
        href: '/locations',
        icon: Map,
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
      },
      {
        title: 'ໝວດໝູ່ຂ່າວສານ',
        href: '/news-categories',
        icon: FolderKanban,
      },
      {
        title: 'ແທັກຂ່າວສານ (Tags)',
        href: '/news-tags',
        icon: Tags,
      },
      {
        title: 'ຄວາມຮູ້ດ້ານໄຟຟ້າ',
        href: '/electrical-knowledge',
        icon: Lightbulb,
      },
      {
        title: 'ວາລະສານ E-Magazine',
        href: '/magazines',
        icon: BookOpen,
      },
    ],
  },
  {
    groupTitle: 'ບໍລິການ & ປະກາດສາທາລະນະ',
    items: [
      {
        title: 'ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ',
        href: '/electricity-tariffs',
        icon: Zap,
      },
      {
        title: 'ເອກະສານນິຕິກຳ',
        href: '/legislations',
        icon: Scale,
      },
      {
        title: 'ປະກາດຈັດຊື້-ຈັດຈ້າງ',
        href: '/procurements',
        icon: FileText,
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
      },
      {
        title: 'ຕຳແໜ່ງງານ (Positions)',
        href: '/positions',
        icon: UserCheck,
      },
      {
        title: 'ຈັດການຜູ້ໃຊ້ງານ (IAM)',
        href: '/users',
        icon: Users,
        roles: ['SUPERADMIN', 'ADMIN'],
      },
    ],
  },
];
