import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '给你的生日礼物',
  description: '把一起看过的风景，送给今天的你。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
