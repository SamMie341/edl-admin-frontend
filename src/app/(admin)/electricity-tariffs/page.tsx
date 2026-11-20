import type { Metadata } from 'next';
import { ElectricityTariffsView } from '@/modules/electricity-tariffs/presentation/electricity-tariffs-view';

export const metadata: Metadata = {
  title: 'ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ (Electricity Tariffs) | EDL Admin',
  description:
    'ລະບົບຄຸ້ມຄອງປະກາດໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ, ຕາຕະລາງລາຄາ ແລະ ເອກະສານ PDF ລັດວິສາຫະກິດໄຟຟ້າລາວ',
};

export default function ElectricityTariffsPage() {
  return <ElectricityTariffsView />;
}
