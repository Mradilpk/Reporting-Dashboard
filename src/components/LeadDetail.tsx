import { 
  Building2, 
  MapPin, 
  Phone, 
  User, 
  TrendingUp, 
  Send, 
  Paperclip, 
  MoreVertical,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  Search,
  Check,
  Mic,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Lead, TimelineEntry, OrderStatus } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useState, KeyboardEvent, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

import { QASWA_PRODUCTS, DEFAULT_PRODUCTS, AGILE_PRODUCTS } from '../constants/products';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export function LeadDetail({ 
  lead, 
  onBack, 
  timeline, 
  onAddTimeline,
  selectedGroup
}: { 
  lead: Lead; 
  onBack: () => void; 
  timeline: TimelineEntry[]; 
  onAddTimeline: (entry: TimelineEntry) => void;
  selectedGroup: string;
}) {
  const products = selectedGroup === 'AGILE' ? AGILE_PRODUCTS : selectedGroup === 'QASWA' ? QASWA_PRODUCTS : DEFAULT_PRODUCTS;
  const [selectedProducts, setSelectedProducts] = useState<string[]>([products[0]]);
  const [productSearch, setProductSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Recovery');
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  // Order Details Form State
  const [orderProduct, setOrderProduct] = useState(products[0]);
  const [orderQty, setOrderQty] = useState('');
  const [orderUnit, setOrderUnit] = useState('Pcs');
  const [orderValue, setOrderValue] = useState('');
  const [orderItems, setOrderItems] = useState<{product: string, qty: string, unit: string, value: string}[]>([]);
  const [recoveryAmount, setRecoveryAmount] = useState('');
  const [interactionType, setInteractionType] = useState<string>('PHYSICAL');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const toggleProduct = (product: string) => {
    setSelectedProducts(prev => 
      prev.includes(product) ? prev.filter(p => p !== product) : [...prev, product]
    );
  };

  const addOrderItem = () => {
    if (!orderQty || !orderValue) return;
    setOrderItems(prev => [...prev, {
      product: orderProduct,
      qty: orderQty,
      unit: orderUnit,
      value: orderValue
    }]);
    setOrderQty('');
    setOrderValue('');
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const submitAction = () => {
    // Specific logic for Recovery
    if (orderStatus === 'Recovery') {
      if (recoveryAmount) {
        onAddTimeline({
          id: Date.now().toString(),
          role: 'Sales Person',
          name: 'Adi BSM',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          message: `Recovery recorded for amount: PKR ${recoveryAmount}.${chatMessage ? ` Notes: ${chatMessage}` : ''}`,
          status: 'Recovery',
          metrics: {
            recovery: `PKR ${recoveryAmount}`
          },
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adi',
        });
        setRecoveryAmount('');
        setChatMessage('');
      } else if (chatMessage.trim()) {
        // Just send the message if no recovery amount specified but chat exists
        handleSendMessage();
      }
      return;
    }

    // Specific logic for Confirm Order
    if (orderStatus === 'Confirm Order') {
      if (orderItems.length > 0 || (orderQty && orderValue)) {
        handleConfirmOrderSubmit();
        setChatMessage('');
      } else if (chatMessage.trim()) {
        handleSendMessage();
      }
      return;
    }

    // Fallback for simple message
    handleSendMessage();
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      role: 'Sales Person',
      name: 'Adi BSM',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      message: chatMessage,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adi',
    };
    
    onAddTimeline(newEntry);
    setChatMessage('');
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      console.log("Voice recognition started...");
    };
    
    recognition.onend = () => {
      setIsRecording(false);
      console.log("Voice recognition ended.");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcript received:", transcript);
      setChatMessage(prev => prev + (prev ? ' ' : '') + transcript);
      
      // Auto-trigger AI processing for longer inputs to turn them into professional messages
      if (transcript.length > 15) {
        // Use the current transcript for drafting immediately
        const fullMessage = (chatMessage ? chatMessage + ' ' : '') + transcript;
        handleAIDraft(fullMessage);
      }
    };

    recognition.start();
  };

  const handleAIDraft = async (manualInput?: string) => {
    const textToProcess = manualInput || chatMessage;

    if (!textToProcess || !textToProcess.trim() || isDrafting) {
      return;
    }
    
    setIsDrafting(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a specialized AI assistant for DMG Pharmaceuticals Sales Team.
Task: Understand these rough notes, voice transcript, or points and convert them into a PROFESSIONAL PHARMACEUTICAL SALES message for our internal chat/CRM.
Context: We are interacting with ${lead.businessName} (Contact Person: ${lead.contactPerson}).

Guidelines:
- Transform rough points into a polished, persuasive, and professional message.
- Use pharmaceutical industry terminology.
- Maintain a respectful yet business-oriented tone.
- If quantity, price, or specific products are mentioned, ensure they are preserved correctly.
- Respond ONLY with the polished message text. No meta-talk or intro/outro.

Rough input: ${textToProcess}`,
      });
      
      if (response.text) {
        setChatMessage(response.text.trim());
      }
    } catch (error) {
      console.error("AI Drafting error:", error);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitAction();
    }
  };

  const handleConfirmOrderSubmit = () => {
    let finalItems = [...orderItems];
    
    // Add current form state if it has values and isn't already added
    if (orderQty && orderValue) {
      finalItems.push({
        product: orderProduct,
        qty: orderQty,
        unit: orderUnit,
        value: orderValue
      });
    }

    if (finalItems.length === 0) return;

    const totalValue = finalItems.reduce((acc, item) => acc + parseFloat(item.value || '0'), 0);
    
    // Generate a detailed message if chatMessage is empty
    const itemSummary = finalItems.map(item => `${item.product} (${item.qty} ${item.unit})`).join(', ');
    const defaultMessage = `ORDER CONFIRMED: ${itemSummary}. Total Value: PKR ${totalValue.toLocaleString()}`;

    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      role: 'Sales Person',
      name: 'Adi BSM',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      message: chatMessage || defaultMessage,
      status: 'Confirm Order',
      promotedProduct: finalItems.length === 1 ? finalItems[0].product : `${finalItems.length} Products`,
      metrics: {
        orderItems: finalItems,
        totalSale: `PKR ${totalValue.toLocaleString()}`
      },
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adi',
    };

    onAddTimeline(newEntry);
    setOrderStatus('Recovery'); // Reset status or move to next phase
    setOrderQty('');
    setOrderValue('');
    setOrderItems([]);
    setChatMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] overflow-hidden font-sans">
      <div className="h-12 p-4 flex items-center border-b border-[#e1e4e8] bg-white z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-slate-50 rounded-md transition-colors text-slate-500"
            title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-[#00a2e8]" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <button onClick={onBack} className="text-[#00a2e8] text-[11px] font-bold uppercase tracking-wider hover:underline">Leads Overview</button>
          <ChevronRight className="w-3 h-3 text-[#999999] mx-2" />
          <span className="text-[#333333] text-[11px] font-bold uppercase tracking-wider">{lead.businessName}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
           <button className="p-1.5 text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Column 1: Profile & Interaction */}
        <motion.section 
          initial={false}
          animate={{ 
            width: isSidebarCollapsed ? 0 : 320,
            opacity: isSidebarCollapsed ? 0 : 1,
            marginRight: isSidebarCollapsed ? -12 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col gap-3 shrink-0 overflow-y-auto scrollbar-hide pb-4 overflow-hidden"
        >
          <div className="w-[320px] flex flex-col gap-3">
            <div className="bg-white border border-[#e1e4e8] rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] uppercase font-bold text-[#666666] tracking-wider">Account Profile</h3>
              <button className="text-[#999999] hover:text-[#00a2e8]"><ChevronDown className="w-4 h-4" /></button>
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#f8f9fb] flex items-center justify-center text-[#00a2e8] text-xl font-bold border border-[#e1e4e8] shadow-sm">
                {lead.businessName[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-base font-bold text-[#333333] leading-tight truncate">{lead.businessName}</p>
                <div className="flex gap-1.5 items-center mt-2">
                   <span className="text-[9px] font-bold text-white bg-[#00a2e8] px-2 py-0.5 rounded uppercase">Tier-1</span>
                   <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase border border-emerald-100">Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 py-4 border-t border-[#f0f2f5]">
              {[
                { label: 'Profile ID', value: `#NX-${lead.id}00`, mono: true },
                { label: 'Contact Person', value: lead.contactPerson },
                { label: 'Phone', value: lead.phone, mono: true, highlight: true },
                { label: 'City', value: lead.city },
                { label: 'Brick', value: lead.brick || 'N/A' },
                { label: 'Segment', value: lead.segment },
              ].map((item) => (
                <div key={item.label} className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <span className="text-[10px] font-bold text-[#999999] uppercase tracking-tight">{item.label}:</span>
                  <span className={cn(
                    "text-[10px] font-bold truncate transition-colors",
                    item.highlight ? "text-[#00a2e8]" : "text-[#333333]",
                    item.mono && "font-mono"
                  )}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e1e4e8] rounded-lg p-5 flex-1 shadow-sm flex flex-col gap-5">
            <h3 className="text-[11px] uppercase font-bold text-[#666666] tracking-wider">Interaction Logic</h3>
            
            <div className="space-y-3">
              <label className="text-[9px] font-bold text-[#999999] uppercase">Interaction Status</label>
              <div className="flex gap-2">
                {['PHYSICAL', 'Phone/Whatsapp'].map(type => (
                  <button
                    key={type}
                    onClick={() => setInteractionType(type)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-bold rounded uppercase transition-all shadow-sm active:scale-95 text-center flex-1 border",
                      interactionType === type 
                        ? "bg-[#00a2e8] border-[#00a2e8] text-white" 
                        : "bg-white border-[#e1e4e8] text-[#666666] hover:bg-[#f8f9fb]"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 flex flex-col h-[280px]">
              <label className="text-[9px] font-bold text-[#999999] uppercase">Product Line Selection</label>
              
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#999999]" />
                <input 
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-[#f8f9fb] border border-[#e1e4e8] rounded-md pl-9 pr-3 py-2 text-[11px] font-medium outline-none focus:ring-1 focus:ring-[#00a2e8] transition-all"
                />
              </div>

              <div className="flex-1 overflow-y-auto border border-[#e1e4e8] rounded-md bg-[#f8f9fb]/50 p-2 space-y-1.5 scrollbar-hide">
                {filteredProducts.map(p => (
                  <div 
                    key={p}
                    onClick={() => toggleProduct(p)}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-md cursor-pointer transition-all border",
                      selectedProducts.includes(p) 
                        ? "bg-[#00a2e8] border-[#00a2e8] text-white shadow-sm" 
                        : "bg-white border-[#e1e4e8] text-[#333333] hover:border-[#00a2e8]/30"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border",
                      selectedProducts.includes(p) 
                        ? "bg-white border-white text-[#00a2e8]" 
                        : "bg-[#f8f9fb] border-[#e1e4e8]"
                    )}>
                      {selectedProducts.includes(p) && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight truncate">{p}</span>
                  </div>
                ))}
              </div>
            </div>

              <label className="text-[9px] font-bold text-[#999999] uppercase">Order Logic Matrix</label>
              <div className="flex gap-3">
                {(['Confirm Order', 'Recovery'] as OrderStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatus(status)}
                    className={cn(
                      "px-3 py-2 text-[10px] font-bold rounded uppercase transition-all shadow-sm active:scale-95 text-center flex-1 border",
                      orderStatus === status 
                        ? "bg-[#00a2e8] border-[#00a2e8] text-white" 
                        : "bg-white border-[#e1e4e8] text-[#666666] hover:bg-[#f8f9fb]"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>

            {orderStatus === 'Confirm Order' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-4 space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00a2e8]" />
                  <span className="text-[11px] font-bold text-[#0369a1] uppercase">Confirm Order Parameters</span>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-[#0369a1] uppercase">Select Product</label>
                    <select 
                      value={orderProduct}
                      onChange={(e) => setOrderProduct(e.target.value)}
                      className="w-full bg-white border border-[#bae6fd] rounded px-3 py-2 text-[12px] font-bold text-slate-800 outline-none focus:ring-1 focus:ring-[#00a2e8]"
                    >
                      {products.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-24 flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-[#0369a1] uppercase">Qty</label>
                      <div className="flex bg-white border border-[#bae6fd] rounded overflow-hidden">
                        <input 
                          type="text" 
                          value={orderQty}
                          onChange={(e) => setOrderQty(e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-2 text-[12px] font-mono font-bold outline-none border-r border-[#bae6fd]" 
                        />
                        <select 
                          value={orderUnit}
                          onChange={(e) => setOrderUnit(e.target.value)}
                          className="bg-[#f8f9fb] px-1 text-[9px] font-bold outline-none"
                        >
                          <option>Pcs</option>
                          <option>Box</option>
                          <option>Ctn</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-[#0369a1] uppercase">Sales (PKR)</label>
                      <input 
                        type="text" 
                        value={orderValue}
                        onChange={(e) => setOrderValue(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white border border-[#bae6fd] rounded px-3 py-2 text-[12px] font-mono font-bold outline-none focus:ring-1 focus:ring-[#00a2e8]" 
                      />
                    </div>
                  </div>
                  
                  <button 
                    onClick={addOrderItem}
                    className="w-full py-1.5 border-2 border-dashed border-[#bae6fd] text-[#00a2e8] text-[10px] font-bold rounded uppercase hover:bg-[#ebf8ff] transition-all flex items-center justify-center gap-2"
                  >
                    + Add to List
                  </button>

                  {orderItems.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-[#bae6fd]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black text-[#0369a1] uppercase tracking-widest">Added to Selection</span>
                        <span className="text-[9px] font-bold text-[#999999]">{orderItems.length} items</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 scrollbar-hide">
                        {orderItems.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] bg-white border border-[#bae6fd]/40 p-2 rounded-md shadow-sm">
                            <div className="flex flex-col gap-0.5 overflow-hidden">
                              <span className="font-bold text-slate-800 truncate leading-tight">{item.product}</span>
                              <span className="text-[9px] font-mono text-[#00a2e8]">{item.qty} {item.unit}</span>
                            </div>
                            <button 
                              onClick={() => removeOrderItem(i)} 
                              className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={submitAction}
                  disabled={orderItems.length === 0 && (!orderQty || !orderValue)}
                  className="w-full py-3 bg-[#00a2e8] hover:bg-[#0081ba] text-white text-[12px] font-black rounded-xl uppercase tracking-wider shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Finalize Order
                </button>
              </motion.div>
            )}

            {orderStatus === 'Recovery' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-4 space-y-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00a2e8]" />
                  <span className="text-[11px] font-bold text-[#0369a1] uppercase">Recovery Parameters</span>
                </div>
                
                <div className="space-y-4">
                   <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-[#0369a1] uppercase">Recovery Amount (PKR)</label>
                      <input 
                         type="text"
                         inputMode="numeric"
                         value={recoveryAmount}
                         onChange={(e) => setRecoveryAmount(e.target.value.replace(/[^0-9]/g, ''))}
                         placeholder="Enter amount (PKR)"
                         className="w-full bg-white border border-[#bae6fd] rounded px-3 py-2 text-[12px] font-mono font-bold outline-none focus:ring-1 focus:ring-[#00a2e8]"
                      />
                   </div>

                   <button 
                      onClick={submitAction}
                      disabled={!recoveryAmount}
                      className="w-full py-3 bg-[#333333] hover:bg-black text-white text-[12px] font-black rounded-xl tracking-wider uppercase transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                   >
                      Submit Recovery
                   </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.section>

        {/* Column 2: Activity Flow */}
        <section className="flex-1 flex flex-col overflow-hidden">
           <div className="bg-white border border-[#e1e4e8] rounded-lg flex flex-col h-full shadow-sm overflow-hidden">
             <div className="px-5 py-3 border-b border-[#e1e4e8] flex justify-between items-center bg-[#f8f9fb]">
               <div className="flex items-center gap-3">
                 <div className="bg-[#00a2e8]/10 p-1.5 rounded">
                   <LayoutGrid className="w-4 h-4 text-[#00a2e8]" />
                 </div>
                 <div>
                   <h3 className="text-[11px] uppercase font-bold text-[#333333] tracking-widest">Task chat</h3>
                   <p className="text-[9px] text-[#999999] font-medium leading-none mt-1">3 members</p>
                 </div>
               </div>
               <div className="flex gap-2 items-center">
                 <div className="flex items-center gap-1 ml-2 border-l border-[#e1e4e8] pl-3">
                    <User className="w-4 h-4 text-[#999999]" />
                    <Search className="w-4 h-4 text-[#999999]" />
                 </div>
               </div>
             </div>

             <div 
               className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-[#bedade]"
               style={{ 
                 backgroundImage: 'radial-gradient(#a3c2c8 1.5px, transparent 0)', 
                 backgroundSize: '24px 24px' 
               }}
             >
                <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                  {/* Date separator */}
                  <div className="flex justify-center">
                    <span className="px-4 py-1 bg-[#90b1b9] text-white text-[10px] font-bold rounded-full shadow-sm">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  {timeline.map((entry) => (
                    <div key={entry.id} className={cn(
                      "flex gap-4",
                      entry.role === 'Sales Person' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className="shrink-0 pt-1">
                        <img 
                          src={entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}`} 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-white" 
                        />
                      </div>
                      <div className={cn(
                        "flex flex-col gap-1 max-w-[80%]",
                        entry.role === 'Sales Person' ? "items-end" : "items-start"
                      )}>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[10px] font-bold text-[#444444] uppercase tracking-tighter">{entry.name}</span>
                          <span className="text-[9px] font-medium text-[#666666]/70">{entry.time}</span>
                        </div>
                        <div className={cn(
                          "relative p-4 rounded-2xl shadow-sm text-[12px] leading-relaxed",
                          entry.role === 'Sales Person' 
                            ? "bg-[#dcf8c6] text-[#333333] rounded-tr-none border-t border-[#c5e1b0]" 
                            : "bg-white text-[#333333] rounded-tl-none border-t border-[#e1e4e8]"
                        )}>
                          {entry.promotedProduct && (
                            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-dashed border-[#666666]/10">
                               <Sparkles className="w-3.5 h-3.5 text-[#00a2e8]" />
                               <span className="text-[#00a2e8] font-bold">{entry.promotedProduct}</span>
                               <span className="ml-auto text-[9px] font-bold bg-[#00a2e8] text-white px-2 py-0.5 rounded uppercase">{entry.status}</span>
                            </div>
                          )}

                          {entry.status === 'Confirm Order' && (entry.metrics?.orderItems || entry.metrics?.product) && (
                            <div className="mb-4 overflow-hidden border border-[#e1e4e8] rounded-lg bg-[#fcfcfc]">
                              <table className="w-full text-[10px] text-left border-collapse">
                                <thead className="bg-[#f8f9fb] text-[#666666] border-b border-[#e1e4e8]">
                                  <tr>
                                    <th className="px-3 py-2 font-bold uppercase tracking-wider">Product Name</th>
                                    <th className="px-3 py-2 font-bold uppercase tracking-wider text-center">Quantity</th>
                                    <th className="px-3 py-2 font-bold uppercase tracking-wider text-right">Value (PKR)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f0f2f5]">
                                  {entry.metrics?.orderItems ? (
                                    entry.metrics.orderItems.map((item: any, idx: number) => (
                                      <tr key={idx}>
                                        <td className="px-3 py-2.5 font-bold text-[#333333] border-r border-[#f0f2f5]">{item.product}</td>
                                        <td className="px-3 py-2.5 text-center font-mono font-bold text-[#333333] border-r border-[#f0f2f5]">
                                          <div className="flex flex-col">
                                            <span>{item.qty}</span>
                                            <span className="text-[8px] text-[#999999] uppercase">{item.unit}</span>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono font-bold text-[#333333]">PKR {parseFloat(item.value).toLocaleString()}</td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td className="px-3 py-2.5 font-bold text-[#333333] border-r border-[#f0f2f5]">{entry.metrics.product}</td>
                                      <td className="px-3 py-2.5 text-center font-mono font-bold text-[#333333] border-r border-[#f0f2f5]">{entry.metrics.qty}</td>
                                      <td className="px-3 py-2.5 text-right font-mono font-bold text-[#333333]">{entry.metrics.totalSale}</td>
                                    </tr>
                                  )}
                                </tbody>
                                <tfoot className="bg-[#f8f9fb] border-t border-[#e1e4e8]">
                                  <tr>
                                    <td colSpan={2} className="px-3 py-2 font-bold text-[#666666] uppercase text-right border-r border-[#e1e4e8]">Grand Total</td>
                                    <td className="px-3 py-2 text-right font-mono font-bold text-[#00a2e8]">{entry.metrics?.totalSale}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap font-medium">{entry.message}</p>
                          
                          {entry.role === 'Sales Person' && (
                             <div className="flex justify-end mt-1">
                                <Check className="w-3 h-3 text-emerald-500" />
                                <Check className="w-3 h-3 text-emerald-500 -ml-1.5" />
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div className="p-4 border-t border-[#e1e4e8] bg-white">
                <div className="max-w-4xl mx-auto relative flex items-center gap-3 bg-[#f8f9fb] border border-[#e1e4e8] rounded-xl px-4 py-2 shadow-inner focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00a2e8]/20 transition-all">
                  <div className="flex gap-2 shrink-0 border-r border-[#e1e4e8] pr-3 mr-1">
                    <button 
                      onClick={startSpeechRecognition}
                      className={cn(
                        "p-1.5 rounded-full transition-all",
                        isRecording ? "text-rose-500 animate-pulse bg-rose-50" : "text-[#999999] hover:text-[#00a2e8]"
                      )}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <button className="text-[#999999] hover:text-[#00a2e8]">
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <input 
                    type="text" 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type @ or + to mention a person, a chat or AI" 
                    className="flex-1 bg-transparent text-[13px] font-medium text-[#333333] outline-none placeholder:text-[#999999]"
                  />

                  <div className="flex items-center gap-3 pl-3 border-l border-[#e1e4e8]">
                    <button 
                      onClick={() => handleAIDraft()}
                      disabled={!chatMessage.trim() || isDrafting}
                      className={cn(
                        "transition-all",
                        isDrafting ? "text-[#00a2e8] animate-spin" : "text-[#999999] hover:text-[#00a2e8] disabled:opacity-30"
                      )}
                    >
                      {isDrafting ? <Loader2 className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={submitAction}
                      disabled={(!chatMessage.trim() && !recoveryAmount && !orderQty) || isDrafting}
                      className="bg-[#00a2e8] text-white p-2 rounded-full shadow-lg hover:bg-[#0081ba] transition-all active:scale-90 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {isDrafting && (
                    <div className="absolute left-14 -top-6 flex items-center gap-1.5 px-3 py-1 bg-[#00a2e8] rounded-t-lg shadow-sm border-t border-x border-[#0081ba]">
                      <Sparkles className="w-3 h-3 text-white animate-pulse" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">AI Drafting</span>
                    </div>
                  )}
                </div>
             </div>
           </div>
        </section>
      </div>
    </div>
  );
}
