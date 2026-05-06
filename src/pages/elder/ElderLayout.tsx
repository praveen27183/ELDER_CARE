import type { ReactNode } from 'react';
import BottomNavbar from './bottomnav';

interface ElderLayoutProps {
  children: ReactNode;
}

export default function ElderLayout({ children }: ElderLayoutProps) {
  return (
    <div className="min-h-screen pb-20">
      {children}
      <BottomNavbar />
    </div>
  );
}
