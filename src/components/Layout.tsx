import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Receipt,
  Trophy,
  RotateCcw,
  FileText,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '首页', icon: LayoutDashboard },
  { to: '/sections', label: '项目标段', icon: FolderOpen },
  { to: '/bonds', label: '保证金流水', icon: Receipt },
  { to: '/results', label: '中标结果', icon: Trophy },
  { to: '/refunds', label: '退还申请', icon: RotateCcw },
  { to: '/vouchers', label: '付款凭证', icon: FileText },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-60 bg-[#1e3a5f] text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-wide">保证金退还管理</h1>
          <p className="text-xs text-white/50 mt-1">招投标保证金退还系统</p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-white/15 text-[#d4a843] font-medium'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/40">
          v1.0.0
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
