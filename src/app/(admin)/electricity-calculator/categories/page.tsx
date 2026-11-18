import type { Metadata } from 'next';
import { ElectricityCalculatorView } from '@/modules/electricity-calculator/presentation/electricity-calculator-view';

export const metadata: Metadata = {
  title: 'ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ (Appliance Categories) | EDL Admin',
  description: 'ຈັດການໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)',
};

export default function ApplianceCategoriesPage() {
  return <ElectricityCalculatorView initialTab="categories" />;
}
