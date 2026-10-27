import type { Metadata } from 'next';
import { NewsCategoriesView } from '@/modules/news/presentation/news-categories-view';

export const metadata: Metadata = {
  title: 'ໝວດໝູ່ຂ່າວສານ | EDL Admin',
  description: 'ຄຸ້ມຄອງໝວດໝູ່ຂ່າວສານປະຊາສຳພັນ ໄຟຟ້າລາວ',
};

export default function NewsCategoriesPage() {
  return <NewsCategoriesView />;
}
