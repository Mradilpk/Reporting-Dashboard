import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Target,
  ChevronDown,
  MapPin,
  Building2,
  PieChart as PieChartIcon,
  LayoutGrid,
  BarChart2,
  TrendingDown,
  Activity
} from 'lucide-react';
import { Lead } from '../types';
import { Filters, FilterProps } from './Filters';

interface AdminDashboardProps extends FilterProps {
  leads: Lead[];
  onBack: () => void;
  onOpenManager: (group: string) => void;
}

const COLORS = ['#1e40af', '#0d9488', '#0f172a', '#3b82f6', '#14b8a6', '#64748b', '#2563eb', '#0891b2'];

export function AdminDashboard({ 
  leads: allLeads, 
  onBack,
  onOpenManager,
  ...filterProps
}: AdminDashboardProps) {
  const [dateRange, setDateRange] = React.useState('This Month');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  const [salesTrendFilter, setSalesTrendFilter] = React.useState('Monthly');
  const [showAllProducts, setShowAllProducts] = React.useState(false);
  const [productSort, setProductSort] = React.useState<{ key: 'name' | 'sales' | 'growth' | 'group', direction: 'asc' | 'desc' }>({ key: 'sales', direction: 'desc' });

  // Filter leads based on selected dimensions
  const leads = useMemo(() => {
    let filtered = allLeads.filter(lead => {
      const groupMatch = filterProps.selectedGroup === 'Select Group' || lead.group === filterProps.selectedGroup;
      const cityMatch = filterProps.selectedCity === 'Select City' || lead.city.toUpperCase() === filterProps.selectedCity.toUpperCase();
      const brickMatch = filterProps.selectedBrick === 'Select Brick' || lead.brick === filterProps.selectedBrick;
      const productMatch = filterProps.selectedProduct === 'Select Product' || lead.product === filterProps.selectedProduct;
      const provinceMatch = filterProps.selectedProvince === 'Select Province' || lead.province === filterProps.selectedProvince;
      const segmentMatch = filterProps.selectedSegment === 'Select Segment' || lead.segment === filterProps.selectedSegment;
      
      const dateMatch = (!filterProps.fromDate || lead.date >= filterProps.fromDate) && (!filterProps.toDate || lead.date <= filterProps.toDate);
      
      return groupMatch && cityMatch && brickMatch && productMatch && provinceMatch && segmentMatch && dateMatch;
    });

    // Simulate different data for different ranges
    if (dateRange === 'Last Month') {
      return filtered.slice(0, Math.floor(filtered.length * 0.85));
    }
    if (dateRange === 'This Quarter') {
      return filtered.slice(0, Math.floor(filtered.length * 1.5));
    }
    if (dateRange === 'Last Quarter') {
      return filtered.slice(0, Math.floor(filtered.length * 1.3));
    }
    if (dateRange === 'This Year') {
      return filtered.slice(0, Math.floor(filtered.length * 4.2));
    }
    if (dateRange === 'Custom Range' && customStartDate && customEndDate) {
      // In a real app we'd filter by lead.date, here we simulate a shift
      return filtered.slice(0, Math.floor(filtered.length * 0.9));
    }
    
    return filtered;
  }, [allLeads, filterProps, dateRange, customStartDate, customEndDate]);

  // --- Data Aggregations ---

  // 1. Group Sales Graph
  const groupSalesData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const saleValue = parseInt(l.totalSale.replace(/[^0-9]/g, '') || '0');
      counts[l.group] = (counts[l.group] || 0) + saleValue;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // 2. Top Cities Sales
  const topCitiesSalesData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const saleValue = parseInt(l.totalSale.replace(/[^0-9]/g, '') || '0');
      counts[l.city] = (counts[l.city] || 0) + saleValue;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [leads]);

  // 3. Bottom Cities Sales
  const bottomCitiesSalesData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      const saleValue = parseInt(l.totalSale.replace(/[^0-9]/g, '') || '0');
      counts[l.city] = (counts[l.city] || 0) + saleValue;
    });
    return Object.entries(counts)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [leads]);

  // 4. Group Customer-wise count
  const groupCustomerData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach(l => {
      counts[l.group] = (counts[l.group] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const totalSalesValue = leads.reduce((acc, lead) => acc + parseInt(lead.totalSale.replace(/[^0-9]/g, '') || '0'), 0);
  const totalPotentialValue = leads.reduce((acc, lead) => acc + (parseInt(lead.potential.replace(/[^0-9]/g, '') || '0') || 50000), 0);
  const totalCustomersCount = leads.length;
  const grossProfit = totalSalesValue * 0.27; // Simulated 27% margin
  const ordersCount = Math.floor(totalCustomersCount * 3.5); // Simulated order frequency
  const achVsTarget = useMemo(() => {
    if (totalPotentialValue <= 0) return 0;
    // Simulate realistic fluctuation based on data/filters
    const base = dateRange === 'This Month' ? 82 : dateRange === 'Last Month' ? 76 : dateRange === 'This Quarter' ? 74 : 79;
    const jitter = (leads.length % 7);
    return Math.min(100, base + jitter);
  }, [totalSalesValue, totalPotentialValue, dateRange, leads.length]);

  // Derive products performance from filtered leads
  const productPerformance = useMemo(() => {
    const products: Record<string, { name: string, group: string, sales: number, growth: number }> = {};
    leads.forEach(l => {
      const saleValue = parseInt(l.totalSale?.replace(/[^0-9]/g, '') || '0');
      if (!products[l.product]) {
        products[l.product] = {
          name: l.product,
          group: l.group,
          sales: 0,
          growth: 12 + (Math.random() * 15) // Simulated growth
        };
      }
      products[l.product].sales += saleValue;
    });

    let result = Object.values(products);
    
    // Sort
    result.sort((a, b) => {
      let valA: any = a[productSort.key];
      let valB: any = b[productSort.key];
      
      if (productSort.key === 'sales' || productSort.key === 'growth') {
        return productSort.direction === 'asc' ? valA - valB : valB - valA;
      }
      return productSort.direction === 'asc' 
        ? valA.toString().localeCompare(valB.toString())
        : valB.toString().localeCompare(valA.toString());
    });

    return result;
  }, [leads, productSort]);

  return (
    <div className="p-8 space-y-10 bg-[#f8fafc] min-h-screen pb-20 overflow-x-hidden font-sans">
      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Admin Dashboard
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Real-time performance analytics & business insights</p>
        </div>
        
        {/* Compact Header Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-wider">Analysis Period</span>
              <div className="flex items-center gap-2">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-[11px] font-bold text-slate-700 outline-none cursor-pointer hover:border-brand-blue transition-colors"
                >
                   <option>This Month</option>
                   <option>Last Month</option>
                   <option>This Quarter</option>
                   <option>Last Quarter</option>
                   <option>This Year</option>
                   <option>Custom Range</option>
                </select>
                
                {dateRange === 'Custom Range' && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                    <input 
                      type="date" 
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="h-9 border border-slate-200 rounded-lg px-3 text-[10px] font-bold outline-none font-mono focus:border-brand-blue"
                    />
                    <span className="text-slate-300 text-[10px] font-bold">to</span>
                    <input 
                      type="date" 
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="h-9 border border-slate-200 rounded-lg px-3 text-[10px] font-bold outline-none font-mono focus:border-brand-blue"
                    />
                  </div>
                )}
              </div>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="mt-4 h-9 bg-brand-blue text-white px-5 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95"
           >
              <Activity className="w-3.5 h-3.5" />
              Sync Data
           </button>
        </div>
      </div>

      {/* New Summary Cards Grid - Adjusted for 4 items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 text-brand-blue rounded-xl shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Sales <span className="text-[9px] font-medium">(PKR)</span></p>
              <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{(totalSalesValue / 1000000).toFixed(1)}M</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 mt-2">
                <span className="bg-emerald-50 px-1.5 py-0.5 rounded">↑ 18.6%</span>
                <span className="text-slate-400 uppercase font-semibold text-[9px]">vs Last Month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders / Screenings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-teal-100 text-brand-teal rounded-xl shrink-0 group-hover:bg-brand-teal group-hover:text-white transition-colors">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Orders / Screenings</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{ordersCount.toLocaleString()}</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 mt-2">
                <span className="bg-emerald-50 px-1.5 py-0.5 rounded">↑ 17.8%</span>
                <span className="text-slate-400 uppercase font-semibold text-[9px]">vs Last Month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl shrink-0 group-hover:bg-brand-slate group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Customers</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{totalCustomersCount.toLocaleString()}</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 mt-2">
                <span className="bg-emerald-50 px-1.5 py-0.5 rounded">↑ 9.4%</span>
                <span className="text-slate-400 uppercase font-semibold text-[9px]">vs Last Month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ach vs Target */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ach vs Target</p>
              <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{achVsTarget.toFixed(0)}%</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 mt-2">
                <span className="bg-emerald-50 px-1.5 py-0.5 rounded">↑ 2%</span>
                <span className="text-slate-400 uppercase font-semibold text-[9px]">vs Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Group Performance Summary */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h4 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-[0.15em] flex items-center gap-3">
            <Target className="w-4 h-4 text-brand-blue" />
            Performance by Business Unit
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'FAD', name: 'FAD', sub: 'Field Products', color: 'bg-brand-blue' },
            { id: 'AGILE', name: 'AGILE', sub: 'Poultry Solutions', color: 'bg-brand-teal' },
            { id: 'QASWA', name: 'QASWA', sub: 'Livestock Care', color: 'bg-slate-800' }
          ].map((grp, idx) => {
            const grpLeads = leads.filter(l => l.group === grp.id);
            // Dynamic shift based on dateRange (dummy data simulation)
            let factor = 1.0;
            switch(dateRange) {
              case 'Last Month': factor = 0.82; break;
              case 'This Quarter': factor = 2.4; break;
              case 'Last Quarter': factor = 2.1; break;
              case 'This Year': factor = 8.5; break;
              case 'Custom Range': factor = 0.95; break;
              default: factor = 1.0;
            }
            
            const sales = grpLeads.reduce((acc, l) => acc + parseInt(l.totalSale.replace(/[^0-9]/g, '') || '0'), 0) * (factor > 1 ? 1 : factor); 
            // Note: If factor is massive (yearly), we display the aggregated amount for the period
            const displaySales = grpLeads.reduce((acc, l) => acc + parseInt(l.totalSale.replace(/[^0-9]/g, '') || '0'), 0) * (dateRange === 'This Year' ? 3.5 : dateRange.includes('Quarter') ? 2.5 : factor);
            
            const pot = grpLeads.reduce((acc, l) => acc + (parseInt(l.potential.replace(/[^0-9]/g, '') || '0') || 50000), 0) * factor;
            // Dynamic Achievement calculation to show variation as requested
            const achBase = dateRange === 'This Month' ? 84 : dateRange === 'Last Month' ? 75 : 79;
            const achJitter = (grpLeads.length + idx) % 10;
            const ach = Math.min(100, achBase + achJitter);
            
            const customers = Math.floor(grpLeads.length * (dateRange === 'This Year' ? 1.2 : 1.0));
            const orders = Math.floor(customers * (dateRange.includes('Month') ? 3.2 : dateRange.includes('Quarter') ? 9.5 : 38));

            return (
              <div 
                key={grp.id} 
                className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col group"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Header */}
                <div className={`${grp.color} p-6 text-white relative overflow-hidden`}>
                  <div className="relative z-10">
                    <h5 className="text-2xl font-black tracking-tight leading-tight">{grp.name}</h5>
                    <span className="text-[11px] font-bold opacity-80 mt-1 uppercase tracking-[0.2em]">{grp.sub}</span>
                  </div>
                  {/* Decorative background element */}
                  <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform">
                    <Building2 className="w-24 h-24" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-6 space-y-8 flex-1">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between">
                       <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sales (PKR)</p>
                         <p className="text-3xl font-black text-slate-900 font-mono tracking-tighter">{(displaySales / 1000000).toFixed(1)}M</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Growth</p>
                         <p className="text-lg font-black text-emerald-600 flex items-center justify-end gap-1 font-mono">
                           <TrendingUp className="w-4 h-4" />
                           {(15 + (Math.random() * 5)).toFixed(1)}%
                         </p>
                       </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-50">
                       <div className="flex justify-between items-end mb-2">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ach vs Target</p>
                         <p className="text-sm font-black text-slate-900 font-mono">{ach.toFixed(0)}%</p>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={`h-full ${grp.color} rounded-full transition-all duration-1000 ease-out`}
                           style={{ width: `${ach}%` }}
                         />
                       </div>
                    </div>

                    <button 
                      onClick={() => onOpenManager(grp.id)}
                      className="w-full py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      Open Manager Dashboard
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-slate-50 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                      <p className="text-xl font-black text-slate-900 font-mono">{orders.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group-hover:bg-slate-50 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customers</p>
                      <p className="text-xl font-black text-slate-900 font-mono">{customers.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Trend Line Chart */}
      <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-widest">Revenue Growth Analytics</h4>
          </div>
          <select 
            value={salesTrendFilter}
            onChange={(e) => setSalesTrendFilter(e.target.value)}
            className="h-8 bg-slate-50 border border-slate-200 rounded-lg px-3 text-[10px] font-bold text-slate-600 outline-none cursor-pointer focus:border-brand-blue"
          >
            <option>Monthly Trend</option>
            <option>Quarterly View</option>
          </select>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={
              salesTrendFilter === 'Monthly' || salesTrendFilter === 'Monthly Trend' ? [
                { name: 'Nov', sales: 180 },
                { name: 'Dec', sales: 210 },
                { name: 'Jan', sales: 220 },
                { name: 'Feb', sales: 240 },
                { name: 'Mar', sales: 285 },
                { name: 'Apr', sales: 440 },
                { name: 'May', sales: 520 },
              ] : [
                { name: 'Q1', sales: 650 },
                { name: 'Q2', sales: 820 },
                { name: 'Q3', sales: 910 },
                { name: 'Q4', sales: 1240 },
              ]
            }>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                fontWeight="700" 
                axisLine={false} 
                tickLine={false} 
                dy={10}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                fontSize={9} 
                fontWeight="700" 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(v) => `₨${v}M`} 
                tick={{ fill: '#64748b' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#1e40af" 
                strokeWidth={4} 
                dot={{ r: 5, fill: '#1e40af', strokeWidth: 3, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-brand-blue" />
            <h4 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-widest">Top Selling Products Matrix</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th 
                  className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => setProductSort(prev => ({ key: 'name', direction: prev.key === 'name' && prev.direction === 'desc' ? 'asc' : 'desc' }))}
                >
                  <div className="flex items-center gap-2">
                    Product Identifier
                    {productSort.key === 'name' && (productSort.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 -rotate-180" />)}
                  </div>
                </th>
                <th 
                  className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] border-l border-slate-50 cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => setProductSort(prev => ({ key: 'group', direction: prev.key === 'group' && prev.direction === 'desc' ? 'asc' : 'desc' }))}
                >
                  <div className="flex items-center gap-2">
                    Strategic Unit
                    {productSort.key === 'group' && (productSort.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 -rotate-180" />)}
                  </div>
                </th>
                <th 
                  className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] border-l border-slate-50 text-right cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => setProductSort(prev => ({ key: 'sales', direction: prev.key === 'sales' && prev.direction === 'desc' ? 'asc' : 'desc' }))}
                >
                  <div className="flex items-center justify-end gap-2 text-right">
                    Net Revenue (PKR)
                    {productSort.key === 'sales' && (productSort.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 -rotate-180" />)}
                  </div>
                </th>
                <th 
                  className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em] border-l border-slate-50 text-center cursor-pointer hover:text-brand-blue transition-colors"
                  onClick={() => setProductSort(prev => ({ key: 'growth', direction: prev.key === 'growth' && prev.direction === 'desc' ? 'asc' : 'desc' }))}
                >
                  <div className="flex items-center justify-center gap-2">
                    Growth Mom
                    {productSort.key === 'growth' && (productSort.direction === 'desc' ? <ChevronDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 -rotate-180" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productPerformance.slice(0, showAllProducts ? undefined : 10).map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-5 text-sm font-bold text-slate-800">{prod.name}</td>
                  <td className="p-5 text-[11px] font-extrabold text-slate-400 border-l border-slate-50 uppercase tracking-wider">{prod.group}</td>
                  <td className="p-5 text-base font-black text-slate-900 text-right border-l border-slate-50 tracking-tighter font-mono">{(prod.sales / 1000000).toFixed(2)}M</td>
                  <td className="p-5 text-sm font-black border-l border-slate-50 text-center">
                    <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-mono flex items-center justify-center gap-1.5 w-fit mx-auto">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {prod.growth.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!showAllProducts && productPerformance.length > 10 && (
            <div className="p-4 text-center bg-slate-50/50 border-t border-slate-100">
               <button 
                 onClick={() => setShowAllProducts(true)}
                 className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:text-indigo-800 transition-colors"
               >
                 Load More Products ({productPerformance.length - 10} more)
               </button>
            </div>
          )}
          {showAllProducts && productPerformance.length > 10 && (
            <div className="p-4 text-center bg-slate-50/50 border-t border-slate-100">
               <button 
                 onClick={() => setShowAllProducts(false)}
                 className="text-xs font-black text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors"
               >
                 Show Less
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Sales Analytics Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Group Sales Graph */}
        <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h4 className="text-[12px] font-extrabold text-slate-900 uppercase tracking-widest">Business Unit Revenue (PKR)</h4>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupSalesData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis fontSize={9} fontWeight="700" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(v) => `₨${(v/1000000).toFixed(1)}M`} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#1e40af" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Group Customer Count */}
        <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-teal-50 text-brand-teal rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-[12px] font-extrabold text-slate-900 uppercase tracking-widest">Customer Distribution by Group</h4>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupCustomerData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis fontSize={9} fontWeight="700" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* City Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Top Performing Cities (Sales)</h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCitiesSalesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Cities */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Underperforming Cities (Sales)</h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottomCitiesSalesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-10">
        {/* Regional Performance Index Table */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 text-slate-800 rounded-lg">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <h4 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-widest">Macro Regional Performance Matrix</h4>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">PROVINCE ENTITY</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Customer Base</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Market Saturation Index</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Net Revenue (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {['Punjab', 'Sindh', 'KPK', 'Balochistan'].map((prov) => {
                  const provLeads = allLeads.filter(l => l.province === prov);
                  const salesValue = provLeads.reduce((acc, l) => acc + parseInt(l.totalSale.replace(/[^0-9]/g, '') || '0'), 0);
                  const saturation = Math.min(100, provLeads.length * 2);
                  
                  return (
                    <tr key={prov} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 text-sm font-bold text-slate-800">{prov}</td>
                      <td className="p-5 text-sm font-black text-slate-600 text-center font-mono">{provLeads.length}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[120px]">
                            <div className="h-full bg-brand-blue rounded-full transition-all duration-1000" style={{ width: `${saturation}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">{saturation}%</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-black text-slate-900 text-right font-mono tracking-tighter">
                        ₨ {salesValue.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Cities Performance Table */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-200 text-slate-800 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-widest">Active Urban Operations Index</h4>
            </div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Core Performance Hubs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Urban Hub</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Active Clients</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Strategic Importance</th>
                  <th className="p-5 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Revenue Yield (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topCitiesSalesData.slice(0, 10).map((city) => {
                  const cityLeads = allLeads.filter(l => l.city === city.name);
                  const marketShare = Math.min(100, Math.floor(Math.random() * 40) + 60); 
                  
                  return (
                    <tr key={city.name} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 text-sm font-bold text-slate-800">{city.name}</td>
                      <td className="p-5 text-sm font-black text-slate-600 text-center font-mono">{cityLeads.length}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full max-w-[120px]">
                            <div className="h-full bg-brand-teal rounded-full transition-all duration-1000" style={{ width: `${marketShare}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">{marketShare}%</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-black text-slate-900 text-right font-mono tracking-tighter">
                        ₨ {city.value.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
