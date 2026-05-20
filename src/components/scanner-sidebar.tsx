'use client';
import * as React from 'react';
import Link from 'next/link';
import { LayoutGrid, BarChart3, Star, Clock, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type ScannerSidebarProps = {
  activePage: 'scanner' | 'heatmap' | 'watchlist';
  setActivePage: (page: 'scanner' | 'heatmap' | 'watchlist') => void;
  canAccessGamma: boolean;
  canAccessFlow: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  setShowFilters: (show: boolean) => void;
  activeFilterCount: number;
  marketOpen: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  accountMenu: React.ReactNode;
};

type NavItem = {
  id: 'scanner' | 'heatmap' | 'watchlist' | 'historical';
  label: string;
  icon: React.ReactNode;
  badge?: 'NEW' | null;
  locked?: boolean;
};

export function ScannerSidebar({
  activePage,
  setActivePage,
  canAccessGamma,
  canAccessFlow,
  setShowUpgradeModal,
  setShowFilters,
  activeFilterCount,
  marketOpen,
  soundEnabled,
  toggleSound,
  accountMenu,
}: ScannerSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const onScannerRoute = pathname === '/scanner' || pathname?.startsWith('/scanner/');
  const onHistoricalRoute = pathname?.startsWith('/historical') ?? false;

  const navItems: NavItem[] = [
    { id: 'scanner', label: 'Flow', icon: <LayoutGrid className="w-6 h-6" />, locked: !canAccessFlow },
    { id: 'heatmap', label: 'GEX', icon: <BarChart3 className="w-6 h-6" />, badge: 'NEW', locked: !canAccessGamma },
    { id: 'watchlist', label: 'Watch', icon: <Star className="w-6 h-6" /> },
    { id: 'historical', label: 'Historical', icon: <Clock className="w-6 h-6" />, locked: !canAccessFlow },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.locked) {
      setShowUpgradeModal(true);
      return;
    }
    if (item.id === 'historical') {
      router.push('/historical');
      return;
    }
    // Flow / GEX / Watch: ensure we're on /scanner first, then set sub-page.
    if (!onScannerRoute) router.push('/scanner');
    setActivePage(item.id);
  };

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col items-center py-3"
      style={{
        backgroundColor: '#0B0E14',
        borderRight: '1px solid #1A1E27',
      }}
    >
      {/* Top: Logo */}
      <Link
        href="/"
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.04]"
        aria-label="Home"
      >
        <img src="/images/pb-logo.png" alt="Profit Builders" className="h-7 w-7 object-contain" />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {navItems.map((item) => {
          const isActive = item.id === 'historical'
            ? onHistoricalRoute
            : onScannerRoute && activePage === item.id;
          return (
            <SidebarNavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              badge={item.badge}
              locked={item.locked}
              onClick={() => handleNavClick(item)}
            />
          );
        })}

        {/* Divider */}
        <div className="my-2 h-px w-6" style={{ backgroundColor: '#1A1E27' }} />

        {/* Filters trigger (opens Dialog, doesn't change activePage) */}
        <SidebarNavItem
          label="Filters"
          icon={<SlidersHorizontal className="w-6 h-6" />}
          isActive={false}
          badge={activeFilterCount > 0 ? `${activeFilterCount}` : null}
          onClick={() => setShowFilters(true)}
        />
      </nav>

      {/* Bottom controls */}
      <div className="flex flex-col items-center gap-2 pb-1">
        {/* Market status */}
        <div className="group relative flex h-10 w-10 items-center justify-center">
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              marketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            )}
          />
          <SidebarTooltip>
            Market {marketOpen ? 'OPEN' : 'CLOSED'}
          </SidebarTooltip>
        </div>

        {/* Audio toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.04]"
          style={{ color: '#7A8BA8' }}
        >
          {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          <SidebarTooltip>
            Sound {soundEnabled ? 'on' : 'off'}
          </SidebarTooltip>
        </button>

        {/* User avatar — injected slot */}
        <div className="flex h-10 w-10 items-center justify-center">{accountMenu}</div>
      </div>
    </aside>
  );
}

function SidebarNavItem({
  label,
  icon,
  isActive,
  badge,
  locked,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  badge?: 'NEW' | string | null;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all',
        isActive
          ? 'bg-white/[0.06] text-white'
          : 'hover:bg-white/[0.04]',
        locked && 'opacity-50'
      )}
      style={!isActive ? { color: '#7A8BA8' } : undefined}
    >
      {icon}

      {isActive && (
        <span className="absolute right-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-l-full bg-gradient-to-b from-[#D4A574] to-[#C49A6C]" />
      )}

      {badge && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none',
            badge === 'NEW'
              ? 'bg-white text-zinc-950'
              : 'bg-white/10 text-white ring-1 ring-inset ring-white/20'
          )}
        >
          {badge}
        </span>
      )}

      <SidebarTooltip>
        {label}
        {locked && <span className="ml-1.5 text-white/60">· Locked</span>}
      </SidebarTooltip>
    </button>
  );
}

function SidebarTooltip({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-50"
      style={{
        backgroundColor: '#1A1E27',
        color: '#E8EDF5',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        border: '1px solid #252A35',
      }}
    >
      {children}
    </div>
  );
}
