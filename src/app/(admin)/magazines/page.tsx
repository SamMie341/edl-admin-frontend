import type { Metadata } from 'next';
import { MagazinesView } from '@/modules/magazines/presentation/magazines-view';

export const metadata: Metadata = {
  title: 'ວາລະສານ E-Magazine | EDL Admin',
  description:
    'ລະບົບຄຸ້ມຄອງວາລະສານດິຈິຕອນ ຟຟລ, ຮູບໜ້າປົກ ແລະ ເອກະສານ PDF ສຳລັບດາວໂຫຼດ',
};

export default function MagazinesPage() {
  return <MagazinesView />;
}
