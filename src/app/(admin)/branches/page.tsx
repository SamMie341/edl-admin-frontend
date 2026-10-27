import type { Metadata } from 'next';
import { BranchesView } from '@/modules/branches/presentation/branches-view';

export const metadata: Metadata = {
  title: 'ຂໍ້ມູນສາຂາ (Branches) | EDL Admin',
  description: 'ລະບົບບໍລິຫານຈັດການຂໍ້ມູນສາຂາ ຟຟລ ທົ່ວປະເທດ',
};

export default function BranchesPage() {
  return <BranchesView />;
}
