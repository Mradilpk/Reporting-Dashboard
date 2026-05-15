import React, { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  ChevronDown, 
  RefreshCw,
  User,
  LayoutGrid,
  Search,
  Calendar,
  Building2,
  Package,
  TrendingDown,
  UserCheck,
  Activity,
  Check,
  CheckSquare,
  Square,
  ArrowUpDown
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Legend,
  ComposedChart,
  Line,
  Area
} from 'recharts';
import { Lead } from '../types';
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

interface TeamDashboardProps {
  leads: Lead[];
  onBack: () => void;
}

export function TeamDashboard({ leads: allLeads, onBack }: TeamDashboardProps) {
  const [selectedSalesPersons, setSelectedSalesPersons] = useState<string[]>(['Areeb Ahmed']);
  const [dateRange, setDateRange] = useState('This Month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [productSort, setProductSort] = useState<{ key: 'name' | 'sales' | 'target' | 'achievement', direction: 'asc' | 'desc' }>({ key: 'sales', direction: 'desc' });
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  
  const salesPersonsList = ['Areeb Ahmed', 'Adil BSM', 'Hamza Khan', 'Usman Sheikh'];

  const toggleSalesPerson = (person: string) => {
    setSelectedSalesPersons(prev => 
      prev.includes(person) 
        ? prev.filter(p => p !== person) 
        : [...prev, person]
    );
  };

  // Filter leads by date range
  const filteredLeadsByDate = useMemo(() => {
    let start = new Date(0);
    let end = new Date(8640000000000000); // Far future
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
      default:
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

  // Filter data based on selected sales persons
  const filteredData = useMemo(() => {
    if (selectedSalesPersons.length === 0) return [];
    return filteredLeadsByDate.filter(l => selectedSalesPersons.includes(l.manager));
  }, [filteredLeadsByDate, selectedSalesPersons]);


  // Seeded random for consistent but changing dummy data
  const getDummyValue = (base: number, maxVariance: number, seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; 
    }
    // Sine gives a predictable fluctuation between -1 and 1 for the seed
    const factor = Math.sin(hash * 437.58); 
    const val = base + (factor * maxVariance);
    return Math.max(0, val);
  };

  const currentSeed = useMemo(() => {
    return dateRange + selectedSalesPersons.join('') + customStartDate + customEndDate;
  }, [dateRange, selectedSalesPersons, customStartDate, customEndDate]);

  // Brick-wise Summary
  const brickSummary = useMemo(() => {
    const bricks: Record<string, { name: string, active: number, total: number, target: number, sales: number }> = {};
    
    // Base bricks
    const defaultBricks = ['Gulberg', 'Cattle Colony', 'Highway', 'Saddar', 'Malir', 'Korangi', 'Raiwind', 'Sahiwal'];
    defaultBricks.forEach((name, idx) => {
        bricks[name] = { 
            name, 
            active: Math.floor(getDummyValue(30, 25, currentSeed + name + 'active')), 
            total: Math.floor(getDummyValue(60, 40, currentSeed + name + 'total')), 
            target: Math.floor(getDummyValue(2500000, 1500000, currentSeed + name + 'target')), 
            sales: 0 
        };
    });

    filteredData.forEach(l => {
      const brick = l.brick || 'Other';
      if (!bricks[brick]) {
        bricks[brick] = { 
          name: brick, 
          active: Math.floor(getDummyValue(10, 20, currentSeed + brick)), 
          total: Math.floor(getDummyValue(20, 30, currentSeed + brick)), 
          target: 1500000, 
          sales: 0 
        };
      }
      bricks[brick].sales += parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0');
    });

    // Add dummy sales with significant fluctuations
    Object.keys(bricks).forEach(key => {
       if (bricks[key].sales === 0) {
         // Some bricks high (up to 4.5M), some low (500k)
         bricks[key].sales = getDummyValue(2000000, 1800000, currentSeed + key + 'sales');
       }
    });

    return Object.values(bricks);
  }, [filteredData, currentSeed]);

  // Segment Performance Summary
  const segmentPerformance = useMemo(() => {
    const segments: Record<string, { name: string, customers: number, sales: number }> = {
      'Broiler': { name: 'Broiler', customers: 0, sales: 0 },
      'Layer': { name: 'Layer', customers: 0, sales: 0 },
      'Breeder': { name: 'Breeder', customers: 0, sales: 0 },
      'Trader': { name: 'Trader', customers: 0, sales: 0 },
      'Consultant': { name: 'Consultant', customers: 0, sales: 0 }
    };

    filteredData.forEach(l => {
      const seg = l.segment;
      if (seg && segments[seg]) {
        segments[seg].sales += parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0');
        segments[seg].customers += 1;
      }
    });

    // Populate with dummy data that fluctuates
    Object.keys(segments).forEach(key => {
      if (segments[key].customers === 0) {
        segments[key].customers = Math.floor(getDummyValue(25, 20, currentSeed + key));
        segments[key].sales = getDummyValue(2500000, 2200000, currentSeed + key + 'seg');
      }
    });

    return Object.values(segments);
  }, [filteredData, currentSeed]);

  // Product Summary
  const productPerformance = useMemo(() => {
    const products: Record<string, { name: string, target: number, sales: number, achievement: number }> = {};
    
    const baseProductNames = [
        'Avilamycin', 'Tylosin', 'Vitamin AD3E', 'Calcium Powder', 
        'Oxytetracycline', 'Liver Tonic', 'Zinc Pro 50', 'Amino Acid 100', 
        'Electrolyte Plus', 'Growth Booster X', 'Mega Vita 22', 
        'Pure Clean 40', 'Rapid Recover', 'Shield Guard 90', 'Ultra Digest'
    ];
    
    baseProductNames.forEach((name, idx) => {
        products[name] = { 
          name, 
          target: Math.floor(getDummyValue(2500000, 1500000, currentSeed + name + 'target')), 
          sales: 0, 
          achievement: 0 
        };
    });

    filteredData.forEach(l => {
      if (products[l.product]) {
        products[l.product].sales += parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0');
      }
    });

    // Fill missing sales with wide variance
    Object.keys(products).forEach(name => {
      if (products[name].sales === 0) {
        // Achievement between 10% and 110%
        const target = products[name].target;
        products[name].sales = getDummyValue(target * 0.6, target * 0.5, currentSeed + name + 'prod');
      }
    });

    return Object.values(products)
      .map(p => ({ 
          ...p, 
          achievement: (p.sales / p.target) * 100, 
          color: (p.sales/p.target) > 0.8 ? 'text-emerald-600 bg-emerald-50' : (p.sales/p.target) > 0.6 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50'
      }))
      .sort((a, b) => {
        if (productSort.key === 'name') {
            return productSort.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        }
        const valA = a[productSort.key as 'sales' | 'target' | 'achievement'];
        const valB = b[productSort.key as 'sales' | 'target' | 'achievement'];
        return productSort.direction === 'asc' ? valA - valB : valB - valA;
      });
  }, [filteredData, productSort, currentSeed]);

  // Consistently derived Totals and KPIs from summary data
  const { totalCustomersCount, activeCustomersCount, totalBrickTarget, totalBrickSales, totalBricksCount } = useMemo(() => {
    return {
      totalCustomersCount: brickSummary.reduce((acc, b) => acc + b.total, 0),
      activeCustomersCount: brickSummary.reduce((acc, b) => acc + b.active, 0),
      totalBrickTarget: brickSummary.reduce((acc, b) => acc + b.target, 0),
      totalBrickSales: brickSummary.reduce((acc, b) => acc + b.sales, 0),
      totalBricksCount: brickSummary.length
    };
  }, [brickSummary]);

  const totalBrickAchievement = (totalBrickSales / (totalBrickTarget || 1)) * 100;

  const { totalProductTarget, totalProductSales } = useMemo(() => {
    return {
      totalProductTarget: productPerformance.reduce((acc, p) => acc + p.target, 0),
      totalProductSales: productPerformance.reduce((acc, p) => acc + p.sales, 0)
    };
  }, [productPerformance]);

  const totalProductAchievement = (totalProductSales / (totalProductTarget || 1)) * 100;

  const toggleSort = (key: 'name' | 'sales' | 'target' | 'achievement') => {
    setProductSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };


  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Team Performance</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Aggregate Sales, Target Achievement & Product Trends</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Multi-select Sales Person */}
          <div className="relative min-w-[200px]">
            <div 
              onClick={() => setShowPersonDropdown(!showPersonDropdown)}
              className="flex items-center justify-between gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-brand-blue transition-all"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-black text-slate-900 truncate">
                  {selectedSalesPersons.length === 0 ? 'Nobody Selected' : 
                   selectedSalesPersons.length === salesPersonsList.length ? 'All Team Members' :
                   `${selectedSalesPersons.length} Selected`}
                </span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showPersonDropdown && "rotate-180")} />
            </div>
            
            {showPersonDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {salesPersonsList.map(person => (
                    <div 
                      key={person}
                      onClick={() => toggleSalesPerson(person)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                        selectedSalesPersons.includes(person) ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-600"
                      )}
                    >
                      {selectedSalesPersons.includes(person) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      <span className="text-xs font-bold">{person}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between px-2">
                  <button 
                    onClick={() => setSelectedSalesPersons(salesPersonsList)}
                    className="text-[10px] font-black text-blue-600 uppercase"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedSalesPersons([])}
                    className="text-[10px] font-black text-slate-400 uppercase"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
            <div className="relative min-w-[140px]">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-9 bg-slate-50 border border-slate-100 rounded-lg px-3 text-[11px] font-black text-slate-900 outline-none cursor-pointer appearance-none pr-8"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>Last Quarter</option>
                <option>Custom Date</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {dateRange === 'Custom Date' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <input 
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-9 bg-slate-50 border border-slate-100 rounded-lg px-2 text-[11px] font-black text-slate-900 outline-none"
                />
                <span className="text-slate-300 text-xs">-</span>
                <input 
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-9 bg-slate-50 border border-slate-100 rounded-lg px-2 text-[11px] font-black text-slate-900 outline-none"
                />
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-tight">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Target */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
             <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Target (PKR)</p>
            <h3 className="text-lg font-black text-slate-900 font-mono tracking-tighter">{Math.floor(totalBrickTarget).toLocaleString()}</h3>
            <p className="text-[8px] font-bold text-slate-500">PKR</p>
          </div>
        </div>
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
             <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Sales (PKR)</p>
            <h3 className="text-lg font-black text-slate-900 font-mono tracking-tighter">{Math.floor(totalBrickSales).toLocaleString()}</h3>
            <p className="text-[8px] font-bold text-slate-500">PKR</p>
          </div>
        </div>
        {/* Achievement % */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center">
             <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Achievement %</p>
            <h3 className="text-lg font-black text-slate-900 font-mono tracking-tighter">{totalBrickAchievement.toFixed(2)}%</h3>
            <p className="text-[8px] font-bold text-slate-500">of Target</p>
          </div>
        </div>
        {/* Total Bricks */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
             <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Bricks</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{totalBricksCount}</h3>
          </div>
        </div>
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
             <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Customers</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{totalCustomersCount}</h3>
          </div>
        </div>
        {/* Active Customers */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
             <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Active Customers</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{activeCustomersCount}</h3>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 1. Brick-wise Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">1. Brick-wise Summary</h4>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-[#1e40af] text-white">
                 <tr>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Brick</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Total Customers</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Active Customers</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-right">Target (PKR)</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-right">Sales (PKR)</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Achievement %</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {brickSummary.map((brick, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 text-[11px] font-black text-slate-900">{brick.name}</td>
                     <td className="p-3 text-[11px] font-bold text-slate-500 text-center">{brick.total}</td>
                     <td className="p-3 text-[11px] font-bold text-slate-500 text-center">{brick.active}</td>
                     <td className="p-3 text-[11px] font-black text-slate-900 text-right font-mono">{Math.floor(brick.target).toLocaleString()}</td>
                     <td className="p-3 text-[11px] font-black text-blue-600 text-right font-mono">{Math.floor(brick.sales).toLocaleString()}</td>
                     <td className="p-3 text-[11px] font-black text-center">
                        <div className="flex flex-col items-center gap-1">
                           <span className={cn(
                             "px-2 py-0.5 rounded-full text-[9px] font-black",
                             (brick.sales / brick.target) >= 0.8 ? "text-emerald-600 bg-emerald-50" : (brick.sales / brick.target) >= 0.6 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50"
                           )}>
                             {(brick.sales / brick.target * 100).toFixed(1)}%
                           </span>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
               <tfoot className="bg-blue-50">
                 <tr className="font-black text-blue-800">
                   <td className="p-3 text-xs uppercase">Total</td>
                   <td className="p-3 text-xs text-center">{totalCustomersCount}</td>
                   <td className="p-3 text-xs text-center">{activeCustomersCount}</td>
                   <td className="p-3 text-xs text-right font-mono">{Math.floor(totalBrickTarget).toLocaleString()}</td>
                   <td className="p-3 text-xs text-right font-mono">{Math.floor(totalBrickSales).toLocaleString()}</td>
                   <td className="p-3 text-xs text-center">{(totalBrickSales / totalBrickTarget * 100).toFixed(2)}%</td>
                 </tr>
               </tfoot>
             </table>
           </div>
        </div>

        {/* 2. Brick-wise Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-8">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">2. Brick Wise Sales</h4>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-blue-600 rounded"></div>
                   <span className="text-[10px] font-bold text-slate-500 uppercase">Sales Value (PKR)</span>
                </div>
             </div>
           </div>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart 
                 data={brickSummary}
                 layout="horizontal"
                 margin={{ bottom: 20 }}
               >
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                   dataKey="name" 
                   fontSize={10} 
                   fontWeight="900" 
                   axisLine={false} 
                   tickLine={false}
                   tick={{ fill: '#64748b' }}
                 />
                 <YAxis 
                   fontSize={10} 
                   fontWeight="900" 
                   axisLine={false} 
                   tickLine={false} 
                   tickFormatter={(v) => `₨${(v/1000000).toFixed(1)}M`}
                   tick={{ fill: '#64748b' }}
                 />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="sales" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={40} />
                 <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#fff' }} />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* 3. Product-wise Sales Performance Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
           <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">3. Product-wise Sales Performance</h4>
           </div>
           <div className="overflow-x-auto h-[400px]">
             <table className="w-full text-left">
               <thead className="bg-[#1e40af] text-white">
                 <tr className="sticky top-0 z-10 bg-[#1e40af]">
                    <th 
                      onClick={() => toggleSort('name')}
                      className="p-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-800 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Product
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('target')}
                      className="p-3 text-[10px] font-bold uppercase tracking-wider text-right cursor-pointer hover:bg-blue-800 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        Target (PKR)
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('sales')}
                      className="p-3 text-[10px] font-bold uppercase tracking-wider text-right cursor-pointer hover:bg-blue-800 transition-colors"
                    >
                      <div className="flex items-center justify-end gap-1">
                        Sales (PKR)
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => toggleSort('achievement')}
                      className="p-3 text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer hover:bg-blue-800 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Achievement %
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {productPerformance.slice(0, showAllProducts ? undefined : 10).map((prod, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 text-[11px] font-black text-slate-900">{prod.name}</td>
                     <td className="p-3 text-[11px] font-black text-slate-900 text-right font-mono">{Math.floor(prod.target).toLocaleString()}</td>
                     <td className="p-3 text-[11px] font-black text-blue-600 text-right font-mono">{Math.floor(prod.sales).toLocaleString()}</td>
                     <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${prod.color}`}>
                          {prod.achievement.toFixed(2)}%
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
               <tfoot className="bg-blue-50 font-black text-blue-800 sticky bottom-0 z-10">
                 <tr>
                   <td className="p-3 text-xs uppercase">Total</td>
                   <td className="p-3 text-xs text-right font-mono">{Math.floor(totalProductTarget).toLocaleString()}</td>
                   <td className="p-3 text-xs text-right font-mono">{Math.floor(totalProductSales).toLocaleString()}</td>
                   <td className="p-3 text-xs text-center">{(totalProductSales / totalProductTarget * 100).toFixed(2)}%</td>
                 </tr>
               </tfoot>
             </table>
           </div>
           {!showAllProducts && productPerformance.length > 10 && (
             <button 
               onClick={() => setShowAllProducts(true)}
               className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 border-t border-slate-100 transition-colors"
             >
               Load All Products ({productPerformance.length} Total)
             </button>
           )}
        </div>

        {/* 4. Product Sales Value Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8">4. Product Sales Value</h4>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={productPerformance.slice(0, 10)}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                   dataKey="name" 
                   fontSize={10} 
                   fontWeight="900" 
                   axisLine={false} 
                   tickLine={false} 
                   angle={-30}
                   textAnchor="end"
                   height={80}
                   tick={{ fill: '#64748b' }}
                 />
                 <YAxis 
                   fontSize={10} 
                   fontWeight="900" 
                   axisLine={false} 
                   tickLine={false} 
                   tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`}
                   tick={{ fill: '#64748b' }}
                 />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="sales" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Top 10 Products</p>
        </div>

        {/* 5. Segment-wise Performance Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-4 bg-slate-50/50 border-b border-slate-100">
             <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">5. Segment-wise Performance</h4>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-[#1e40af] text-white">
                 <tr>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Segment</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Total Customers</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-right">Sales Value (PKR)</th>
                   <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-center">Contribution %</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {segmentPerformance.map((seg, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 text-[11px] font-black text-slate-900">{seg.name}</td>
                     <td className="p-3 text-[11px] font-bold text-slate-500 text-center">{seg.customers}</td>
                     <td className="p-3 text-[11px] font-black text-blue-600 text-right font-mono">{Math.floor(seg.sales).toLocaleString()}</td>
                     <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-50 text-blue-600">
                          {((seg.sales / (segmentPerformance.reduce((acc, s) => acc + s.sales, 0) || 1)) * 100).toFixed(1)}%
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
               <tfoot className="bg-blue-50">
                 <tr className="font-black text-blue-800">
                   <td className="p-3 text-xs uppercase">Total</td>
                   <td className="p-3 text-xs text-center">{segmentPerformance.reduce((acc, s) => acc + s.customers, 0)}</td>
                   <td className="p-3 text-xs text-right font-mono">{Math.floor(segmentPerformance.reduce((acc, s) => acc + s.sales, 0)).toLocaleString()}</td>
                   <td className="p-3 text-xs text-center">100%</td>
                 </tr>
               </tfoot>
             </table>
           </div>
        </div>

        {/* 6. Segment Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
           <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8">6. Segment Wise Sales</h4>
           <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={segmentPerformance}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                   dataKey="name" 
                   fontSize={10} 
                   fontWeight="900" 
                   axisLine={false} 
                   tickLine={false}
                   tick={{ fill: '#64748b' }}
                 />
                 <YAxis 
                   fontSize={10} 
                   fontWeight="900" 
                   axisLine={false} 
                   tickLine={false} 
                   tickFormatter={(v) => `₨${(v/1000000).toFixed(1)}M`}
                   tick={{ fill: '#64748b' }}
                 />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: any) => [`₨${Math.floor(value).toLocaleString()}`, "Sales Value"]}
                 />
                 <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={60} />
                 <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#fff' }} />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
           <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Sales Performance by Segment</p>
        </div>

      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
