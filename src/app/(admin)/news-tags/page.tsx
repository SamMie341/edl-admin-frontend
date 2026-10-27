import type { Metadata } from 'next';
import { NewsTagsView } from '@/modules/news/presentation/news-tags-view';

export const metadata: Metadata = {
  title: 'ແທັກຂ່າວສານ | EDL Admin',
  description: 'ຄຸ້ມຄອງແທັກຂ່າວສານປະຊາສຳພັນ ໄຟຟ້າລາວ',
};

export default function NewsTagsPage() {
  return <NewsTagsView />;
}
