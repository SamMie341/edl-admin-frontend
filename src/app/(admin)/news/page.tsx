import type { Metadata } from 'next';
import { NewsView } from '@/modules/news/presentation/news-view';

export const metadata: Metadata = {
  title: 'ຂ່າວສານປະຊາສຳພັນ | EDL Admin',
  description: 'ຄຸ້ມຄອງຂ່າວສານປະຊາສຳພັນ 2 ພາສາ ແລະ ສື່ດິຈິຕອນ ໄຟຟ້າລາວ',
};

export default function NewsPage() {
  return <NewsView />;
}
