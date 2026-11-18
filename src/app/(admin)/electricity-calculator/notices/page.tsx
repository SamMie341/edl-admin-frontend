import type { Metadata } from 'next';
import { ElectricityCalculatorView } from '@/modules/electricity-calculator/presentation/electricity-calculator-view';

export const metadata: Metadata = {
  title: 'ປະກາດ & ຕາຕະລາງ 8 ຂັ້ນ (Tariff Notices & Schedules) | EDL Admin',
  description: 'ຈັດການປະກາດອັດຕາຄ່າໄຟຟ້າ ແລະ ຕາຕະລາງອັດຕາ 8 ຂັ້ນບັນໄດລາຍເດືອນ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)',
};

export default function TariffNoticesPage() {
  return <ElectricityCalculatorView initialTab="notices" />;
}
