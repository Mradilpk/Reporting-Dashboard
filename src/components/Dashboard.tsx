import { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Lead } from '../types';
import { cn } from '../lib/utils';

type SortKey = keyof Lead;

export function LeadTable({ 
  leads: initialLeads, 
  onSelectLead,
  isFilterActive
}: { 
  leads: Lead[]; 
  onSelectLead: (lead: Lead) => void;
  isFilterActive: boolean;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('businessName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedLeads = useMemo(() => {
    let filtered = initialLeads;
    if (searchTerm) {
      filtered = initialLeads.filter(l => 
        l.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === undefined || bVal === undefined) return 0;

      // Handle PKR strings for sorting
      let finalA = aVal;
      let finalB = bVal;

      if (typeof aVal === 'string' && aVal.includes('PKR')) {
        finalA = parseFloat(aVal.replace(/[^0-9.]/g, ''));
      } else if (aVal === undefined) {
        finalA = 0;
      }

      if (typeof bVal === 'string' && bVal.includes('PKR')) {
        finalB = parseFloat(bVal.replace(/[^0-9.]/g, ''));
      } else if (bVal === undefined) {
        finalB = 0;
      }

      if (typeof finalA === 'string' && typeof finalB === 'string') {
        return sortOrder === 'asc' 
          ? finalA.localeCompare(finalB) 
          : finalB.localeCompare(finalA);
      }

      if (typeof finalA === 'number' && typeof finalB === 'number') {
        return sortOrder === 'asc' ? finalA - finalB : finalB - finalA;
      }

      return 0;
    });
  }, [initialLeads, sortKey, sortOrder, searchTerm]);

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown className="w-2.5 h-2.5 ml-1 opacity-20" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-2.5 h-2.5 ml-1 text-white" /> 
      : <ArrowDown className="w-2.5 h-2.5 ml-1 text-white" />;
  };

  const headers: { label: string; key: SortKey; align?: 'left' | 'center' | 'right' }[] = [
    { label: 'Business Name', key: 'businessName' },
    { label: 'Contact Person', key: 'contactPerson' },
    { label: 'Segment', key: 'segment' },
    { label: 'Potential', key: 'potential' },
    { label: 'Visit', key: 'visitNotes', align: 'center' },
    { label: 'Line Manager Remarks', key: 'lineManagerNotes', align: 'center' },
    { label: 'Manager Feedback', key: 'managerNotes', align: 'center' },
    { label: 'Order Confirm', key: 'confirmOrder', align: 'center' },
    { label: 'Secondary Sales', key: 'totalSale', align: 'right' },
    { label: 'Recovery', key: 'recovery', align: 'right' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden flex flex-col shadow-sm">
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Lead Repository</span>
          <button className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors">
             Import
          </button>
          <button className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-[10px] font-black uppercase hover:bg-slate-50 transition-colors">
             Export
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 rounded py-1 pl-8 pr-3 text-[10px] font-bold focus:ring-1 focus:ring-indigo-500 transition-all outline-none w-48"
            />
          </div>
          <button className="p-1.5 border border-slate-200 text-slate-400 rounded hover:text-slate-600 transition-colors">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead className="bg-[#065f46]">
            <tr>
              <th className="p-3 w-8 border-r border-emerald-700/50">
                <input type="checkbox" className="rounded border-emerald-600 w-3 h-3 bg-emerald-800" />
              </th>
              {headers.map((header) => (
                <th 
                  key={header.key}
                  onClick={() => handleSort(header.key)}
                  className={cn(
                    "p-3 font-black text-slate-50 uppercase tracking-tighter cursor-pointer hover:bg-emerald-700/50 transition-colors select-none group/header",
                    header.align === 'center' ? "text-center" : header.align === 'right' ? "text-right" : "text-left",
                    header.key === 'businessName' ? "min-w-[160px]" : "",
                    (header.key === 'confirmOrder' || header.key === 'totalSale') ? "whitespace-nowrap" : ""
                  )}
                >
                  <div className={cn(
                    "flex items-center",
                    header.align === 'center' ? "justify-center" : header.align === 'right' ? "justify-end" : "justify-start"
                  )}>
                    <span className={cn(
                      (header.key === 'lineManagerNotes' || header.key === 'managerNotes') ? "max-w-[70px] leading-tight" : ""
                    )}>
                      {header.label}
                    </span>
                    <SortIcon colKey={header.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!isFilterActive ? (
              <tr>
                <td colSpan={11} className="p-12 text-center bg-slate-50/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      <Filter className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">Select a filter to start</p>
                    <p className="text-[11px] text-slate-500 font-medium">Please select a filter (Date, Group, Province, City, Product, etc.) to view repository data.</p>
                  </div>
                </td>
              </tr>
            ) : sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-12 text-center bg-slate-50/50">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-bold text-slate-800">No leads found</p>
                    <p className="text-[11px] text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            ) : sortedLeads.map((lead) => (
              <tr 
                key={lead.id} 
                className="hover:bg-indigo-50/30 cursor-pointer transition-colors group"
                onClick={() => onSelectLead(lead)}
              >
                <td className="p-3 border-r border-slate-50" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" className="rounded border-slate-300 w-3 h-3" />
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-600 leading-tight min-w-[160px]">{lead.businessName}</div>
                </td>
                <td className="p-3">
                  <span className="font-semibold text-slate-500">
                    {lead.contactPerson}
                  </span>
                </td>
                <td className="p-3">
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                    lead.segment.includes('Broiler') ? "bg-rose-50 text-rose-600 border border-rose-100" :
                    (lead.segment.includes('Dairy') || lead.segment === 'Farmer') ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                    (lead.segment === 'VET' || lead.segment === 'VO' || lead.segment === 'VA' || lead.segment === 'Consultant') ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                    lead.segment === 'Feed Mill' ? "bg-slate-100 text-slate-600" :
                    lead.segment === 'Hatchery' ? "bg-cyan-50 text-cyan-600 border border-cyan-100" :
                    "bg-amber-50 text-amber-600 border border-amber-100"
                  )}>
                    {lead.segment}
                  </span>
                </td>
                <td className="p-3 font-mono font-bold text-slate-700">{lead.potential || '0'}</td>
                <td className="p-3 font-mono font-bold text-slate-950 text-center">{lead.visitNotes || 0}</td>
                <td className="p-3 font-mono font-bold text-slate-950 text-center">{lead.lineManagerNotes || 0}</td>
                <td className="p-3 font-mono font-bold text-slate-950 text-center">{lead.managerNotes || 0}</td>
                <td className="p-3 font-mono font-bold text-slate-950 text-center">{lead.confirmOrder || 0}</td>
                <td className="p-3 font-mono font-bold text-slate-900 text-right">{(lead.totalSale || '0').replace('PKR ', '')}</td>
                <td className="p-3 font-mono font-bold text-slate-900 text-right px-4">{(lead.recovery || '0').replace('PKR ', '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between px-4">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
          Session Data: 1-{sortedLeads.length} of {sortedLeads.length} entries
        </span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded bg-white border border-slate-200 text-slate-300 hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="w-6 h-6 rounded bg-indigo-600 text-white text-[10px] font-black shadow-sm">01</button>
          <button className="p-1 rounded bg-white border border-slate-200 text-slate-300 hover:text-slate-600 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
