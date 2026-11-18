import type { Metadata } from 'next';
import { ElectricityCalculatorView } from '@/modules/electricity-calculator/presentation/electricity-calculator-view';

export const metadata: Metadata = {
  title: 'ເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ (Appliance Presets) | EDL Admin',
  description: 'ຈັດການເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)',
};

export default function AppliancePresetsPage() {
  return <ElectricityCalculatorView initialTab="presets" />;
}
