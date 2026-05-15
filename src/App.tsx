/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Sidebar, Header } from './components/Navigation';
import { LeadTable } from './components/Dashboard';
import { Filters } from './components/Filters';
import { LeadDetail } from './components/LeadDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { TeamDashboard } from './components/TeamDashboard';
import { Lead, TimelineEntry } from './types';
import { leads as allLeads, timeline as initialTimeline } from './mockData';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<'leads' | 'analytics' | 'manager' | 'team'>('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedManagerGroup, setSelectedManagerGroup] = useState<string>('AGILE');
  const [timeline, setTimeline] = useState<TimelineEntry[]>(initialTimeline);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Filters State
  const [selectedGroup, setSelectedGroup] = useState('Select Group');
  const [selectedCity, setSelectedCity] = useState('Select City');
  const [selectedBrick, setSelectedBrick] = useState('Select Brick');
  const [selectedProduct, setSelectedProduct] = useState('Select Product');
  const [selectedProvince, setSelectedProvince] = useState('Select Province');
  const [selectedSegment, setSelectedSegment] = useState('Select Segment');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredLeads = useMemo(() => {
    return allLeads.filter(lead => {
      const groupMatch = selectedGroup === 'Select Group' || lead.group === selectedGroup;
      const cityMatch = selectedCity === 'Select City' || lead.city.toUpperCase() === selectedCity.toUpperCase();
      const brickMatch = selectedBrick === 'Select Brick' || lead.brick === selectedBrick;
      const productMatch = selectedProduct === 'Select Product' || lead.product === selectedProduct;
      const provinceMatch = selectedProvince === 'Select Province' || lead.province === selectedProvince;
      const segmentMatch = selectedSegment === 'Select Segment' || lead.segment === selectedSegment;
      
      const dateMatch = (!fromDate || lead.date >= fromDate) && (!toDate || lead.date <= toDate);
      
      return groupMatch && cityMatch && brickMatch && productMatch && provinceMatch && segmentMatch && dateMatch;
    });
  }, [selectedGroup, selectedCity, selectedBrick, selectedProduct, selectedProvince, selectedSegment, fromDate, toDate]);

  const isAnyFilterActive = useMemo(() => {
    return (
      selectedGroup !== 'Select Group' ||
      selectedCity !== 'Select City' ||
      selectedBrick !== 'Select Brick' ||
      selectedProduct !== 'Select Product' ||
      selectedProvince !== 'Select Province' ||
      selectedSegment !== 'Select Segment' ||
      fromDate !== '' ||
      toDate !== ''
    );
  }, [selectedGroup, selectedCity, selectedBrick, selectedProduct, selectedProvince, selectedSegment, fromDate, toDate]);

  const displayLeads = isAnyFilterActive ? filteredLeads : [];

  return (
    <div className="flex h-screen bg-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <Sidebar 
        active={currentView === 'leads' ? 'Leads' : 'Reporting Dashboard'} 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative border-l border-slate-800">
        <Header 
          title={selectedLead ? `Lead: ${selectedLead.businessName}` : 'Leads'} 
          currentView={currentView}
          onDashboardClick={() => {
            setCurrentView('analytics');
            setSelectedLead(null);
          }}
          onManagerDashboardClick={() => {
            setCurrentView('manager');
            setSelectedLead(null);
          }}
          onTeamDashboardClick={() => {
            setCurrentView('team');
            setSelectedLead(null);
          }}
          onLeadsClick={() => setCurrentView('leads')}
        />
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {currentView === 'analytics' ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <AdminDashboard 
                  leads={allLeads} 
                  onBack={() => setCurrentView('leads')} 
                  onOpenManager={(group) => {
                    setSelectedManagerGroup(group);
                    setCurrentView('manager');
                  }}
                  selectedGroup={selectedGroup} 
                  onGroupChange={(val) => {
                    setSelectedGroup(val);
                    setSelectedCity('Select City');
                    setSelectedBrick('Select Brick');
                    setSelectedProduct('Select Product');
                    setSelectedProvince('Select Province');
                    setSelectedSegment('Select Segment');
                  }}
                  selectedCity={selectedCity}
                  onCityChange={(val) => {
                    setSelectedCity(val);
                    setSelectedBrick('Select Brick');
                  }}
                  selectedBrick={selectedBrick}
                  onBrickChange={setSelectedBrick}
                  selectedProduct={selectedProduct}
                  onProductChange={setSelectedProduct}
                  selectedProvince={selectedProvince}
                  onProvinceChange={setSelectedProvince}
                  selectedSegment={selectedSegment}
                  onSegmentChange={setSelectedSegment}
                  fromDate={fromDate}
                  onFromDateChange={setFromDate}
                  toDate={toDate}
                  onToDateChange={setToDate}
                />
              </motion.div>
            ) : currentView === 'manager' ? (
              <motion.div
                key="manager"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ManagerDashboard 
                  leads={allLeads}
                  group={selectedManagerGroup}
                  onBack={() => setCurrentView('analytics')}
                />
              </motion.div>
            ) : currentView === 'team' ? (
              <motion.div
                key="team"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TeamDashboard 
                  leads={allLeads}
                  onBack={() => setCurrentView('leads')}
                />
              </motion.div>
            ) : !selectedLead ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <div className="p-2 space-y-2">
                  <Filters 
                    selectedGroup={selectedGroup} 
                    onGroupChange={(val) => {
                      setSelectedGroup(val);
                      setSelectedCity('Select City');
                      setSelectedBrick('Select Brick');
                      setSelectedProduct('Select Product');
                      setSelectedProvince('Select Province');
                      setSelectedSegment('Select Segment');
                    }}
                    selectedCity={selectedCity}
                    onCityChange={(val) => {
                      setSelectedCity(val);
                      setSelectedBrick('Select Brick');
                    }}
                    selectedBrick={selectedBrick}
                    onBrickChange={setSelectedBrick}
                    selectedProduct={selectedProduct}
                    onProductChange={setSelectedProduct}
                    selectedProvince={selectedProvince}
                    onProvinceChange={setSelectedProvince}
                    selectedSegment={selectedSegment}
                    onSegmentChange={setSelectedSegment}
                    fromDate={fromDate}
                    onFromDateChange={setFromDate}
                    toDate={toDate}
                    onToDateChange={setToDate}
                  />
                  <LeadTable 
                    leads={displayLeads}
                    onSelectLead={(lead) => setSelectedLead(lead)} 
                    isFilterActive={isAnyFilterActive}
                  />
                </div>
                
                <footer className="mt-auto h-6 bg-slate-200 flex items-center px-4 justify-between shrink-0">
                  <div className="flex gap-6 text-[9px] font-black text-slate-500 uppercase">
                    <span>Session: 02h 44m</span>
                    <span>Database: 14ms</span>
                    <span>Load: 0.12%</span>
                  </div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">© DMG PHARMA • LEADCONSOLE PRO</div>
                </footer>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <LeadDetail 
                  lead={selectedLead} 
                  onBack={() => setSelectedLead(null)} 
                  timeline={timeline.filter(t => t.id.includes(selectedLead.id) || t.id.length < 5)} // Filter logic for demo
                  onAddTimeline={(entry) => setTimeline(prev => [...prev, entry])}
                  selectedGroup={selectedGroup}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
