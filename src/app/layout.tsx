import type { Metadata } from 'next';
import {
  Noto_Sans_Lao,
  Noto_Sans_Lao_Looped,
  Noto_Serif_Lao,
  Phetsarath,
  Noto_Sans,
  Noto_Serif,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { AppProviders } from '@/providers/query-provider';

const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao'],
  variable: '--font-noto-lao',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const notoSansLaoLooped = Noto_Sans_Lao_Looped({
  subsets: ['lao'],
  variable: '--font-noto-lao-looped',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const notoSerifLao = Noto_Serif_Lao({
  subsets: ['lao'],
  variable: '--font-noto-serif-lao',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const phetsarath = Phetsarath({
  subsets: ['lao'],
  variable: '--font-phetsarath',
  weight: ['400', '700'],
  display: 'swap',
  adjustFontFallback: false,
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'EDL Admin | ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ ຟຟລ',
  description: 'ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL Admin Management System)',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="lo"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        notoSansLao.variable,
        notoSansLaoLooped.variable,
        notoSerifLao.variable,
        phetsarath.variable,
        notoSans.variable,
        notoSerif.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
