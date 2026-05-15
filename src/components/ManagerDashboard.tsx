import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Activity, 
  ChevronDown, 
  Target, 
  UserCheck,
  ArrowLeft,
  LayoutGrid,
  Check,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  ComposedChart
} from 'recharts';
import { 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfQuarter, 
  endOfQuarter, 
  subQuarters, 
  isWithinInterval, 
  parseISO,
  startOfToday
} from 'date-fns';
import { Lead } from '../types';

interface ManagerDashboardProps {
  leads: Lead[];
  group: string;
  onBack: () => void;
}

export function ManagerDashboard({ leads: allLeads, group: initialGroup, onBack }: ManagerDashboardProps) {
  const [dateRange, setDateRange] = useState('This Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentGroup, setCurrentGroup] = useState(initialGroup || 'AGILE');
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [productSort, setProductSort] = useState<{ key: 'name' | 'value' | 'salesQty' | 'targetQty', direction: 'asc' | 'desc' }>({ key: 'value', direction: 'desc' });

  // Get unique groups from leads for the dropdown
  const allGroups = useMemo(() => {
    return Array.from(new Set(allLeads.map(l => l.group))).filter(Boolean).sort();
  }, [allLeads]);

  // Get managers for the current selected group
  const groupManagers = useMemo(() => {
    const managers = allLeads
      .filter(l => l.group === currentGroup)
      .map(l => l.manager);
    return Array.from(new Set(managers)).filter(Boolean).sort();
  }, [allLeads, currentGroup]);

  // Seeded random for consistent but changing dummy data when filters change
  const currentSeed = useMemo(() => {
    return dateRange + currentGroup + selectedManagers.join('') + customStartDate + customEndDate;
  }, [dateRange, currentGroup, selectedManagers, customStartDate, customEndDate]);

  const getDummyValue = (base: number, maxVariance: number, seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; 
    }
    const factor = Math.sin(hash * 437.58); 
    const val = base + (factor * maxVariance);
    return Math.max(0, val);
  };

  // 1. Filter leads by date range
  const filteredLeadsByDate = useMemo(() => {
    let start = new Date(0);
    let end = new Date(8640000000000000); 
    const now = new Date();

    switch (dateRange) {
      case 'This Month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'Last Month':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'This Quarter':
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case 'Last Quarter':
        const lastQuarter = subQuarters(now, 1);
        start = startOfQuarter(lastQuarter);
        end = endOfQuarter(lastQuarter);
        break;
      case 'Custom Date':
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
        }
        break;
    }

    return allLeads.filter(l => {
      try {
        const leadDate = parseISO(l.date);
        return isWithinInterval(leadDate, { start, end });
      } catch (e) {
        return true; 
      }
    });
  }, [allLeads, dateRange, customStartDate, customEndDate]);

  // 2. Filter leads by group and selected managers
  const groupLeads = useMemo(() => {
    return filteredLeadsByDate.filter(l => {
        const groupMatch = l.group === currentGroup;
        const managerMatch = selectedManagers.length === 0 || selectedManagers.includes(l.manager);
        return groupMatch && managerMatch;
    });
  }, [filteredLeadsByDate, currentGroup, selectedManagers]);

  // Summary Metrics
  const totalSales = useMemo(() => {
    const baseSales = groupLeads.reduce((acc, l) => acc + parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0'), 0);
    // Add dummy fluctuation if data is sparse
    if (baseSales === 0) return getDummyValue(4500000, 3000000, currentSeed + 'totalsales');
    return baseSales;
  }, [groupLeads, currentSeed]);

  const activeCustomers = useMemo(() => {
    const baseCount = groupLeads.length;
    if (baseCount === 0) return Math.floor(getDummyValue(40, 30, currentSeed + 'customers'));
    return baseCount;
  }, [groupLeads, currentSeed]);

  const avgOrderValue = totalSales / (activeCustomers || 1);
  
  const targetValue = useMemo(() => {
    return getDummyValue(6000000, 4000000, currentSeed + 'target_val');
  }, [currentSeed]);

  const achVsTarget = useMemo(() => {
    const ratio = (totalSales / targetValue) * 100;
    return Math.min(Math.round(ratio), 150);
  }, [totalSales, targetValue]);

  const salesPersonPerformance = useMemo(() => {
    const managers: Record<string, { name: string, sales: number, customers: number }> = {};
    
    // Ensure group managers shown even if no data
    groupManagers.forEach(name => {
       managers[name] = { 
         name, 
         sales: getDummyValue(1000000, 900000, currentSeed + name + 'perf'), 
         customers: Math.floor(getDummyValue(12, 10, currentSeed + name + 'cust')) 
       };
    });

    groupLeads.forEach(l => {
      if (managers[l.manager]) {
        managers[l.manager].sales += parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0');
        managers[l.manager].customers += 1;
      }
    });
    return Object.values(managers).sort((a, b) => b.sales - a.sales);
  }, [groupLeads, groupManagers, currentSeed]);

  const productPerformance = useMemo(() => {
    const products: Record<string, { name: string, value: number, salesQty: number, targetQty: number }> = {};
    
    const baseProductNames = [
        'Avilamycin', 'Tylosin', 'Vitamin AD3E', 'Calcium Powder', 
        'Oxytetracycline', 'Liver Tonic', 'Zinc Pro 50', 'Amino Acid 100', 
        'Electrolyte Plus', 'Growth Booster X', 'Mega Vita 22', 
        'Pure Clean 40', 'Rapid Recover', 'Shield Guard 90', 'Ultra Digest'
    ];

    baseProductNames.forEach(name => {
      const targetQty = Math.floor(getDummyValue(500, 400, currentSeed + name + 'target'));
      products[name] = { 
        name, 
        value: 0, 
        salesQty: 0, 
        targetQty 
      };
    });

    groupLeads.forEach(l => {
      if (products[l.product]) {
        products[l.product].value += parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0');
        products[l.product].salesQty += Math.floor(getDummyValue(20, 15, currentSeed + l.id));
      }
    });
    
    // Fill with fluctuating dummy data
    Object.keys(products).forEach(name => {
      if (products[name].value === 0) {
        products[name].value = getDummyValue(800000, 750000, currentSeed + name + 'val');
        products[name].salesQty = Math.floor(getDummyValue(products[name].targetQty * 0.7, products[name].targetQty * 0.4, currentSeed + name + 'qty'));
      }
    });

    return Object.values(products).sort((a, b) => {
      if (productSort.key === 'name') {
        return productSort.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      const valA = a[productSort.key];
      const valB = b[productSort.key];
      return productSort.direction === 'asc' ? valA - valB : valB - valA;
    });
  }, [groupLeads, productSort, currentSeed]);

  const toggleSort = (key: 'name' | 'value' | 'salesQty' | 'targetQty') => {
    setProductSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const cityData = useMemo(() => {
    const defaultCities = ['LAHORE', 'KARACHI', 'ISLAMABAD', 'FAISALABAD', 'SAHIWAL'];
    const cities: Record<string, { revenue: number, target: number }> = {};
    
    defaultCities.forEach(city => {
       cities[city] = { 
         revenue: getDummyValue(4, 3.5, currentSeed + city + 'rev'), 
         target: getDummyValue(5, 4, currentSeed + city + 'tgt') 
       };
    });

    groupLeads.forEach(l => {
      const city = l.city?.toUpperCase() || 'OTHER';
      if (!cities[city]) {
        cities[city] = { revenue: 0, target: 0 };
      }
      cities[city].revenue += parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0') / 1000000;
      cities[city].target = cities[city].revenue * 1.1; 
    });
    return Object.entries(cities)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [groupLeads, currentSeed]);

  const toggleManager = (name: string) => {
    setSelectedManagers(prev => 
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    );
  };

  return (
    <div className="p-8 space-y-10 bg-[#f8fafc] min-h-screen pb-20 overflow-x-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-brand-blue transition-colors text-xs font-black uppercase tracking-widest mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-4">
             <div className="p-3 bg-brand-blue text-white rounded-2xl shadow-lg">
               <Target className="w-6 h-6" />
             </div>
             <div>
               <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                 Manager Dashboard
               </h2>
             </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
          <div className="flex flex-col min-w-[140px]">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">Select Period</span>
             <div className="relative">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[12px] font-black text-slate-900 outline-none cursor-pointer hover:border-brand-blue hover:bg-white transition-all appearance-none"
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Quarter</option>
                  <option>Last Quarter</option>
                  <option>Custom Date</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>
          </div>

          <div className="flex flex-col min-w-[140px]">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">Select Group</span>
             <div className="relative">
                <select 
                  value={currentGroup}
                  onChange={(e) => {
                    setCurrentGroup(e.target.value);
                    setSelectedManagers([]); // Reset managers when group changes
                  }}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[12px] font-black text-slate-900 outline-none cursor-pointer hover:border-brand-blue hover:bg-white transition-all appearance-none"
                >
                  {allGroups.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
             </div>
          </div>

          <div className="flex flex-col min-w-[200px]">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">Select Managers</span>
             <div className="relative">
                <div 
                  onClick={() => setShowManagerDropdown(!showManagerDropdown)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center justify-between cursor-pointer hover:border-brand-blue hover:bg-white transition-all shadow-sm"
                >
                  <span className="text-xs font-black text-slate-900 truncate pr-2">
                    {selectedManagers.length === 0 ? 'All Managers' : 
                     selectedManagers.length === groupManagers.length ? 'All Team' :
                     `${selectedManagers.length} Selected`}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showManagerDropdown && "rotate-180")} />
                </div>
                
                {showManagerDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowManagerDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
                      <div className="max-h-[250px] overflow-y-auto custom-scrollbar space-y-0.5">
                        {groupManagers.map(m => (
                          <div 
                            key={m}
                            onClick={() => toggleManager(m)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                              selectedManagers.includes(m) ? "bg-blue-50 text-brand-blue" : "hover:bg-slate-50 text-slate-600"
                            )}
                          >
                            <span className="text-[11px] font-bold">{m}</span>
                            {selectedManagers.includes(m) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300" />}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-2 gap-2">
                        <button 
                          onClick={() => setSelectedManagers(groupManagers)}
                          className="flex-1 py-1.5 text-[9px] font-black text-brand-blue uppercase bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Select All
                        </button>
                        <button 
                          onClick={() => setSelectedManagers([])}
                          className="flex-1 py-1.5 text-[9px] font-black text-slate-400 uppercase bg-slate-50 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </>
                )}
             </div>
          </div>

          {dateRange === 'Custom Date' && (
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">From</span>
                  <input 
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[12px] font-black text-slate-900 outline-none hover:border-brand-blue hover:bg-white transition-all"
                  />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">To</span>
                  <input 
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[12px] font-black text-slate-900 outline-none hover:border-brand-blue hover:bg-white transition-all"
                  />
               </div>
            </div>
          )}

          <div className="hidden lg:block h-12 w-px bg-slate-100 mx-2" />
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1">Unit Health</span>
            <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 h-11">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[11px] font-black text-emerald-600 uppercase tracking-wider">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sales Value</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tighter">₨{(totalSales / 1000000).toFixed(2)}M</h3>
            </div>
            <div className="p-3 bg-blue-50 text-brand-blue rounded-xl group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-1 text-[10px] font-bold">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">↑ 12.4%</span>
              <span className="text-slate-400">vs last month</span>
            </div>
            <div className="px-2 py-1 bg-slate-50 rounded border border-slate-100 mt-1">
              <span className="text-slate-500 uppercase tracking-tighter text-[9px]">Target Value: </span>
              <span className="text-slate-900 font-black">₨{(targetValue / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Target Achievement</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tighter">{achVsTarget}%</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <LayoutGrid className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-rose-500 rounded-full" style={{ width: `${achVsTarget}%` }} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2">Current Performance Index</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Team</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tighter">{salesPersonPerformance.length}</h3>
            </div>
            <div className="p-3 bg-teal-50 text-brand-teal rounded-xl group-hover:bg-brand-teal group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
            <span className="text-brand-blue bg-blue-50 px-2 py-0.5 rounded">{activeCustomers} Customers</span>
            <span className="text-slate-400">Total reach</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2 font-mono tracking-tighter">{activeCustomers * 12}</h3>
            </div>
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl group-hover:bg-brand-slate group-hover:text-white transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold">
            <span className="text-brand-blue bg-blue-50 px-2 py-0.5 rounded">High Volume</span>
            <span className="text-slate-400">order velocity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* City-wise sales trend */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
                 <Activity className="w-5 h-5" />
               </div>
               <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">City wise sales trend</h4>
             </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cityData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#64748b' }} />
                <YAxis fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tickFormatter={(v) => `₨${v.toFixed(1)}M`} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#1e40af" radius={[6, 6, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="target" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2, stroke: '#0d9488' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Wise Sales Bar Graph */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-teal-50 text-brand-teal rounded-lg">
               <UserCheck className="w-5 h-5" />
             </div>
             <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">Team Wise Sales</h4>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={salesPersonPerformance.map(sp => ({ name: sp.name, sales: sp.sales }))}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                 <YAxis fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tickFormatter={(v) => `₨${(v/1000000).toFixed(1)}M`} tick={{ fill: '#64748b' }} />
                 <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                 <Bar dataKey="sales" fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product-Wise Sales Trends */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-brand-blue text-white rounded-lg">
               <ShoppingBag className="w-5 h-5" />
             </div>
             <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest">Product-Wise Sales Trends</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-100">
                    <th 
                      onClick={() => toggleSort('name')}
                      className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        Product
                        <ChevronDown className={cn("w-3 h-3 transition-transform", productSort.key === 'name' && productSort.direction === 'asc' && "rotate-180")} />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('targetQty')}
                      className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Target Qty
                        <ChevronDown className={cn("w-3 h-3 transition-transform", productSort.key === 'targetQty' && productSort.direction === 'asc' && "rotate-180")} />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('salesQty')}
                      className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Sales Qty
                        <ChevronDown className={cn("w-3 h-3 transition-transform", productSort.key === 'salesQty' && productSort.direction === 'asc' && "rotate-180")} />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('value')}
                      className="p-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-2">
                        Value
                        <ChevronDown className={cn("w-3 h-3 transition-transform", productSort.key === 'value' && productSort.direction === 'asc' && "rotate-180")} />
                      </div>
                    </th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {productPerformance.slice(0, showAllProducts ? undefined : 10).map((prod, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                       <td className="p-6 text-sm font-black text-slate-800">{prod.name}</td>
                       <td className="p-6 text-sm font-black text-slate-900 text-right">{prod.targetQty}</td>
                       <td className="p-6 text-sm font-black text-slate-900 text-right">{prod.salesQty}</td>
                       <td className="p-6 text-base font-black text-slate-900 text-right font-mono tracking-tighter">₨ {Math.floor(prod.value).toLocaleString()}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
           {!showAllProducts && productPerformance.length > 10 && (
             <button 
               onClick={() => setShowAllProducts(true)}
               className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 border-t border-slate-50 transition-colors"
             >
               Show All Products ({productPerformance.length} Total)
             </button>
           )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
