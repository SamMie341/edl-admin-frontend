import type { Metadata } from 'next';
import { UsersView } from '@/modules/users/presentation/users-view';

export const metadata: Metadata = {
  title: 'ຈັດການຜູ້ໃຊ້ງານ (Users & IAM) | EDL Admin',
  description: 'ລະບົບບໍລິຫານຈັດການຜູ້ໃຊ້ງານ ແລະ ສິດທິການເຂົ້າເຖິງ ຟຟລ',
};

export default function UsersPage() {
  return <UsersView />;
}
