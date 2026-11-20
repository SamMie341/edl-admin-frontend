import type { Metadata } from 'next';
import { LegislationsView } from '@/modules/legislations/presentation/legislations-view';

export const metadata: Metadata = {
  title: 'ເອກະສານນິຕິກຳ (Legislations) | EDL Admin',
  description:
    'ລະບົບຄຸ້ມຄອງເອກະສານນິຕິກຳ, ດຳລັດ, ຂໍ້ຕົກລົງ ແລະ ລະບຽບການ ລັດວິສາຫະກິດໄຟຟ້າລາວ',
};

export default function LegislationsPage() {
  return <LegislationsView />;
}
