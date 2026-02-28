import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Mail, MessageSquare, ClipboardList, Settings,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/members', icon: Users, label: 'Members Registry' },
  { to: '/email-composer', icon: Mail, label: 'Email Composer' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/activity-logs', icon: ClipboardList, label: 'Activity Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isMobileOpen, onMobileClose }: { isMobileOpen: boolean; onMobileClose: () => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const isExpanded = isMobile ? true : (!collapsed || isHovered);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity md:hidden ${
          isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
      />
      <aside
        className={`fixed md:sticky top-0 left-0 flex flex-col h-screen transition-all duration-300 shrink-0 z-40
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ width: isExpanded ? '220px' : '64px', background: 'hsl(var(--sidebar-bg))' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
      <div className="flex items-center gap-2.5 px-4 py-4 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary-foreground">IB</span>
        </div>
        {isExpanded && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'hsl(var(--sidebar-fg))' }}>IBMSSP ADMIN</p>
            <p className="text-xs" style={{ color: 'hsl(var(--sidebar-muted))' }}>Registry Panel</p>
          </div>
        )}
        <button
          type="button"
          onClick={onMobileClose}
          className="ml-auto p-1.5 rounded-md hover:bg-[hsl(var(--sidebar-hover-bg))] text-[hsl(var(--sidebar-muted))] md:hidden"
          aria-label="Close menu"
        >
          <X size={14} />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to}
              className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${
                !isExpanded
                  ? 'justify-center w-10 h-10 mx-auto px-0 py-0'
                  : 'gap-3 px-3 py-2.5'
              } ${isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-[hsl(var(--sidebar-hover-bg))] text-[hsl(var(--sidebar-fg))]'
              }`}
              title={!isExpanded ? label : undefined}>
              <Icon size={16} className="shrink-0" />
              {isExpanded && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <button onClick={() => setCollapsed(c => !c)}
        className="hidden md:flex items-center justify-center w-full py-3 border-t transition-colors hover:bg-[hsl(var(--sidebar-hover-bg))]"
        style={{ borderColor: 'hsl(var(--sidebar-border))', color: 'hsl(var(--sidebar-muted))' }}>
        {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span className="ml-2 text-xs">Collapse</span></>}
      </button>
      </aside>
    </>
  );
}
