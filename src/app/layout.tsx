import React, { PropsWithChildren } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import '@xyflow/react/dist/style.css';
import '../globals.css';
import { Metadata } from 'next';
import '../lab.css';
import ClientProviders from '@/app/components/ClientProviders';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || ''),
  title: 'DPS Lab — Progression Path',
  description: 'Compare Old School RuneScape loadouts. An independent GPL-3.0 fork of the OSRS Wiki DPS calculator.',
  authors: [{ name: 'OSRS Wiki', url: 'https://oldschool.runescape.wiki' }],
  keywords: ['osrs', 'old school runescape', 'runescape', 'dps calculator', 'osrs dps', 'osrs wiki', 'osrs wiki dps'],
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_BASE_PATH}` },
  twitter: {
    card: 'summary',
  },
};

const RootLayout: React.FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
  // We are suppressing hydration warnings here so that react-themes works correctly.
  // See https://github.com/pacocoursey/next-themes/issues/152#issuecomment-1364280564
    <html suppressHydrationWarning lang="en" className="pp-dps-lab">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
};

export default RootLayout;
