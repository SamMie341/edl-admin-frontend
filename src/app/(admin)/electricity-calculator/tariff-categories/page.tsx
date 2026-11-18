import type { Metadata } from 'next';
import { ElectricityCalculatorView } from '@/modules/electricity-calculator/presentation/electricity-calculator-view';

export const metadata: Metadata = {
  title: 'ປະເພດອັດຕາຄ່າໄຟ (Tariff Categories) | EDL Admin',
  description: 'ຈັດການປະເພດອັດຕາຄ່າໄຟຟ້າ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)',
};

export default function TariffCategoriesPage() {
  return <ElectricityCalculatorView initialTab="tariff-categories" />;
}
