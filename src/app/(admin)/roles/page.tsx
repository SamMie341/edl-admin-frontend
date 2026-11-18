import type { Metadata } from 'next';
import { RolesView } from '@/modules/roles/presentation/roles-view';

export const metadata: Metadata = {
  title: 'ຈັດການສິດທິບົດບາດ (Roles & RBAC) | EDL Admin',
  description: 'ລະບົບບໍລິຫານຈັດການສິດທິບົດບາດ ລັດວິສາຫະກິດໄຟຟ້າລາວ',
};

export default function RolesPage() {
  return <RolesView />;
}
