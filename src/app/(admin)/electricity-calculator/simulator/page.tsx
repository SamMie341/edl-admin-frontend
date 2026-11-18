import type { Metadata } from 'next';
import { ElectricityCalculatorView } from '@/modules/electricity-calculator/presentation/electricity-calculator-view';

export const metadata: Metadata = {
  title: 'ທົດລອງຄິດໄລ່ຄ່າໄຟ (Electricity Simulator) | EDL Admin',
  description: 'ລະບົບທົດລອງຄິດໄລ່ຄ່າໄຟຟ້າຕາມອັດຕາ 8 ຂັ້ນບັນໄດ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)',
};

export default function SimulatorPage() {
  return <ElectricityCalculatorView initialTab="simulator" />;
}
