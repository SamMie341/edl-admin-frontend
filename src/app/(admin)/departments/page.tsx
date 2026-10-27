import type { Metadata } from 'next';
import { DepartmentsView } from '@/modules/departments/presentation/departments-view';

export const metadata: Metadata = {
  title: 'ຂໍ້ມູນຝ່າຍ (Departments) | EDL Admin',
  description: 'ລະບົບບໍລິຫານຈັດການຂໍ້ມູນຝ່າຍ ລັດວິສາຫະກິດໄຟຟ້າລາວ',
};

export default function DepartmentsPage() {
  return <DepartmentsView />;
}
