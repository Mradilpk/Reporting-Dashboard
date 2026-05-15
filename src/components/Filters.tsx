import { Filter } from 'lucide-react';
import { Lead } from '../types';
import { cn } from '../lib/utils';
import { QASWA_PRODUCTS, DEFAULT_PRODUCTS, AGILE_PRODUCTS } from '../constants/products';
import { AGILE_LOCATIONS, QASWA_LOCATIONS } from '../constants/locations';

export interface FilterProps {
  selectedGroup: string; 
  onGroupChange: (group: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
  selectedBrick: string;
  onBrickChange: (brick: string) => void;
  selectedProduct: string;
  onProductChange: (product: string) => void;
  selectedProvince: string;
  onProvinceChange: (province: string) => void;
  selectedSegment: string;
  onSegmentChange: (segment: string) => void;
  fromDate: string;
  onFromDateChange: (date: string) => void;
  toDate: string;
  onToDateChange: (date: string) => void;
}

export function Filters({ 
  selectedGroup, 
  onGroupChange,
  selectedCity,
  onCityChange,
  selectedBrick,
  onBrickChange,
  selectedProduct,
  onProductChange,
  selectedProvince,
  onProvinceChange,
  selectedSegment,
  onSegmentChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange
}: FilterProps) {
  const groups = ['Select Group', 'AGILE', 'FAD', 'QASWA', 'Head Office'];
  const segmentGroups: Record<string, string[]> = {
    'AGILE': ['Broiler', 'Layer', 'Breeder', 'Trader', 'VET', 'Consultant'],
    'QASWA': ['VO', 'VA', 'AIT', 'Farmer', 'Trader', 'VET'],
    'FAD': ['Feed Mill', 'Hatchery', 'Dairy Farm'],
    'Head Office': ['General'],
    'Select Group': ['Broiler Farmer', 'Dairy Farmer', 'Vets & Consultant', 'Feed Mill', 'Dealer', 'Poultry Farm', 'Hatchery']
  };

  const currentSegments = ['Select Segment', ...(segmentGroups[selectedGroup] || segmentGroups['Select Group'])];
  
  const provinces = ['Select Province', 'Punjab', 'KPK', 'Sindh', 'Balochistan'];

  const provinceCityMap: Record<string, string[]> = {
    'Punjab': [
      'BAHAWALNAGAR', 'BAHAWALPUR', 'BHAKKAR', 'BUREWALA', 'FAISALABAD', 'GUJRANWALA', 
      'KHANEWAL', 'LAHORE', 'MULTAN', 'OKARA', 'RAWALPINDI', 'SAHIWAL', 'SARGODHA', 
      'GUJRAT', 'HAFIZABAD', 'JHANG', 'KABIRWALA', 'KASUR', 'LAYYAH', 'LODHRAN', 
      'PATTOKI', 'RAHIM YAR KHAN', 'SHEIKHUPURA', 'SIALKOT', 'VEHARI'
    ],
    'Sindh': [
      'HYDERABAD', 'DADU', 'Karachi', 'KHAIRPUR MIRUS', 'Mir pur Khas', 'MITHI', 
      'NAWABSHAH', 'SHIKARPUR', 'Thatta'
    ],
    'KPK': [
      'D.I Khan', 'KOHAT', 'MANSEHRA', 'MARDAN', 'PESHAWAR', 'UPPER DIR'
    ],
    'Balochistan': [
      'QUETTA'
    ]
  };

  const currentProducts = selectedGroup === 'AGILE' ? AGILE_PRODUCTS : selectedGroup === 'QASWA' ? QASWA_PRODUCTS : DEFAULT_PRODUCTS;
  
  const allLocations = [...AGILE_LOCATIONS, ...QASWA_LOCATIONS];
  
  const uniqueLocations = Array.from(new Set(allLocations.map(l => l.name))).map(name => {
    return allLocations.find(l => l.name === name)!;
  });

  const provinceCities = selectedProvince !== 'Select Province' 
    ? provinceCityMap[selectedProvince] || [] 
    : uniqueLocations.map(l => l.name);

  const cityOptions = ['Select City', ...uniqueLocations
    .filter(l => provinceCities.includes(l.name))
    .map(l => l.name)
    .sort()
  ];
  
  const currentCityData = uniqueLocations.find(l => l.name === selectedCity);
  const brickOptions = ['Select Brick', ...(currentCityData?.bricks || [])];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-brand-blue rounded-lg">
            <Filter className="w-4 h-4" />
          </div>
          <h3 className="text-[13px] font-extrabold text-slate-900 uppercase tracking-widest">Global Intelligence Filters</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[9px] font-black uppercase tracking-wider">Cloud Data Synchronized</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {/* Date Group */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-slate-50 focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue/10">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Analysis Period</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">From</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">To</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Region Group */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-slate-50 focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue/10">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Spatial Targeting</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Province</label>
              <select 
                value={selectedProvince}
                onChange={(e) => {
                  onProvinceChange(e.target.value);
                  onCityChange('Select City');
                  onBrickChange('Select Brick');
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat"
              >
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">City</label>
              <select 
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat"
              >
                {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Categorization Group */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-slate-50 focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue/10">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Business Operations</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Strategic Unit</label>
              <select 
                value={selectedGroup}
                onChange={(e) => onGroupChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat"
              >
                {groups.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Micro Brick</label>
              <select 
                value={selectedBrick}
                onChange={(e) => onBrickChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat"
              >
                {brickOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Product Group */}
        <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-slate-50 focus-within:border-brand-blue focus-within:ring-1 focus-within:ring-brand-blue/10">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-200 pb-2">Product Segment</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Segment</label>
              <select 
                value={selectedSegment}
                onChange={(e) => onSegmentChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat"
              >
                {currentSegments.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500">Product SKU</label>
              <select 
                value={selectedProduct}
                onChange={(e) => onProductChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:border-brand-blue cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M1%201L5%205L9%201%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:10px_6px] bg-[right_12px_center] bg-no-repeat"
              >
                {['Select SKU', ...currentProducts].map(p => <option key={p} value={p === 'Select SKU' ? 'Select Product' : p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center w-full pt-4 border-t border-slate-100">
        <div className="flex gap-2">
           <p className="text-[11px] font-bold text-slate-400 italic">Filter changes apply dynamically to all visual modules</p>
        </div>
        <button 
          onClick={() => {
            onGroupChange('Select Group');
            onCityChange('Select City');
            onBrickChange('Select Brick');
            onSegmentChange('Select Segment');
            onProductChange('Select Product');
            onProvinceChange('Select Province');
            onFromDateChange('');
            onToDateChange('');
          }}
          className="px-8 h-10 text-[11px] font-black text-white bg-slate-900 hover:bg-black rounded-lg uppercase tracking-widest transition-all shadow-md active:scale-95"
        >
          Reset Environment
        </button>
      </div>
    </div>
  );
}
