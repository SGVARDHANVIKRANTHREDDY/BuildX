import React from 'react';
import { HeaderLogo } from './header/HeaderLogo';
import { DesktopNav } from './header/DesktopNav';
import { HeaderStatusArea } from './header/HeaderStatusArea';
import { MobileNav } from './header/MobileNav';
import type { ActiveTab } from './header/ActiveTab';

export type { ActiveTab } from './header/ActiveTab';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdminLoggedIn: boolean;
  cartCount: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  cartCount
}) => {
  return (
    <header id="app-header" className="bg-white border-b border-ink-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <HeaderLogo setActiveTab={setActiveTab} />
          <DesktopNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdminLoggedIn={isAdminLoggedIn}
            cartCount={cartCount}
          />
          <HeaderStatusArea isAdminLoggedIn={isAdminLoggedIn} setActiveTab={setActiveTab} />
        </div>
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </header>
  );
};
