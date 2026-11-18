import type { Metadata } from 'next';
import { ElectricityCalculatorView } from '@/modules/electricity-calculator/presentation/electricity-calculator-view';

export const metadata: Metadata = {
  title: 'ແມ່ແບບວິທີປະຢັດໄຟ (Saving Templates) | EDL Admin',
  description: 'ຈັດການແມ່ແບບວິທີປະຢັດໄຟຟ້າ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)',
};

export default function SavingTemplatesPage() {
  return <ElectricityCalculatorView initialTab="saving-templates" />;
}
