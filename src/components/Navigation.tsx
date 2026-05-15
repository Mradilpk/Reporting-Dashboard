import { 
  BarChart3, 
  Users, 
  UserCircle, 
  ShoppingBag, 
  Wallet, 
  FileText, 
  Layers, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  Settings, 
  Wrench,
  Plus,
  Home,
  ChevronDown,
  Bell,
  Grid,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SidebarProps {
  active?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ active = 'Leads', isCollapsed, onToggle }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'Target Dashboard' },
    { icon: BarChart3, label: 'Reporting Dashboard' },
    { icon: UserCircle, label: 'Customers' },
    { icon: Users, label: 'HR records', hasSub: true },
    { icon: TrendingUp, label: 'Sales', hasSub: true },
    { icon: Wallet, label: 'Expenses' },
    { icon: Layers, label: 'Projects' },
    { icon: Clock, label: 'Timesheets & Leave', hasSub: true },
    { icon: CheckSquare, label: 'Tasks' },
    { icon: ShoppingBag, label: 'Leads' },
    { icon: Wrench, label: 'Utilities', hasSub: true },
    { icon: FileText, label: 'Reports', hasSub: true },
    { icon: Settings, label: 'Setup' },
  ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 224 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 overflow-visible z-40 group/sidebar"
    >
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm z-50 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn(
        "p-4 flex items-center gap-3 border-b border-slate-100 shrink-0 overflow-hidden whitespace-nowrap transition-all duration-300",
        isCollapsed ? "px-3 justify-center" : "px-4"
      )}>
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
          <UserCircle className="text-white w-6 h-6" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-black text-sm text-slate-900 tracking-tight">Adil BSM</span>
            <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">Regional Manager</span>
          </motion.div>
        )}
      </div>

      <div className={cn(
        "px-2 py-4 flex-1 overflow-y-auto scrollbar-hide",
        isCollapsed && "px-1.5"
      )}>
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href="#"
              title={isCollapsed ? item.label : ""}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded text-[11px] font-bold transition-all group overflow-hidden whitespace-nowrap",
                active === item.label 
                  ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                isCollapsed && "justify-center px-0 border-l-0"
              )}
            >
              <item.icon className={cn(
                "w-4 h-4 shrink-0",
                active === item.label ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 uppercase tracking-tight"
                >
                  {item.label}
                </motion.span>
              )}
              {!isCollapsed && item.hasSub && (
                <ChevronDown className={cn(
                  "w-3 h-3 transition-transform",
                  active === item.label ? "text-blue-600" : "text-slate-300"
                )} />
              )}
            </a>
          ))}
        </nav>
      </div>

      <div className={cn(
        "mt-auto p-4 border-t border-slate-100 transition-all duration-300 overflow-hidden whitespace-nowrap",
        isCollapsed ? "p-2 justify-center flex" : "p-4"
      )}>
        {!isCollapsed ? (
          <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-slate-100">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Adi" 
              alt="User" 
              className="w-7 h-7 rounded-full border border-white shadow-sm shrink-0"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-[10px] text-slate-900 truncate">adi@dmgmrx.com</span>
              <div className="flex items-center gap-1 mt-0.5">
                 <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                 <span className="text-[8px] font-black text-slate-400 uppercase">System Active</span>
              </div>
            </div>
          </div>
        ) : (
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Adi" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200 shadow-sm shrink-0"
          />
        )}
      </div>
    </motion.aside>
  );
}

interface HeaderProps {
  title: string;
  currentView: 'leads' | 'analytics' | 'manager' | 'team';
  onDashboardClick: () => void;
  onManagerDashboardClick: () => void;
  onTeamDashboardClick: () => void;
  onLeadsClick: () => void;
}

export function Header({ title, currentView, onDashboardClick, onManagerDashboardClick, onTeamDashboardClick, onLeadsClick }: HeaderProps) {
  return (
    <header className="h-12 px-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-sm font-black text-slate-800 uppercase tracking-tight">ADMIN DASHBOARD</h1>
        <div className="h-6 w-[1px] bg-slate-200" />
        <div className="flex gap-1.5">
          <a 
            href="https://crm-profile-update.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-900 text-white rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider h-7 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-3 h-3" /> New Customer
          </a>
          <button 
            onClick={onLeadsClick}
            className={cn(
              "rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider h-7 flex items-center gap-1.5 transition-all border",
              currentView === 'leads' 
                ? "bg-slate-900 border-slate-900 text-white" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Leads overview
          </button>
          <button 
            onClick={onDashboardClick}
            className={cn(
              "rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider h-7 flex items-center gap-1.5 transition-all border",
              currentView === 'analytics' 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Admin Dashboard
          </button>
          <button 
            onClick={onManagerDashboardClick}
            className={cn(
              "rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider h-7 flex items-center gap-1.5 transition-all border",
              currentView === 'manager' 
                ? "bg-brand-blue border-brand-blue text-white shadow-sm" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Manager Dashboard
          </button>
          <button 
            onClick={onTeamDashboardClick}
            className={cn(
              "rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider h-7 flex items-center gap-1.5 transition-all border",
              currentView === 'team' 
                ? "bg-teal-600 border-teal-600 text-white shadow-sm" 
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            )}
          >
            Team Dashboard
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-slate-400">
        <div className="flex bg-slate-100 rounded p-0.5 border border-slate-200">
           <button className="p-1.5 hover:text-indigo-600 text-slate-900 transition-colors bg-white rounded shadow-sm">
             <LayoutGrid className="w-3.5 h-3.5" />
           </button>
           <button className="p-1.5 hover:text-indigo-600 transition-colors">
             <Bell className="w-3.5 h-3.5" />
           </button>
           <button className="p-1.5 hover:text-indigo-600 transition-colors">
             <Settings className="w-3.5 h-3.5" />
           </button>
        </div>
        <div className="w-7 h-7 rounded bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm">AD</div>
      </div>
    </header>
  );
}
