// components/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname.startsWith('/auth');

  return (
    <>
      {!hideNavbar && <Navbar user={null} />}
      {children}
    </>
  );
}