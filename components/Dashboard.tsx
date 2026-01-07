
import React, { useEffect, useState, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getFinancialAdvice } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

const Dashboard: React.FC<{ transactions: any[], investments: any[] }> = ({ transactions, investments }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Chào bạn! Tôi là trợ lý tài chính AI. Bạn cần tư vấn gì về chi tiêu hay danh mục VNINDEX hôm nay không?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Bạn là chuyên gia tài chính cá nhân tại Việt Nam.
        Dữ liệu người dùng: 
        - Giao dịch: ${JSON.stringify(transactions.slice(0, 5))}
        - Đầu tư: ${JSON.stringify(investments)}
        Người dùng hỏi: "${userMsg}"
        Hãy trả lời ngắn gọn, chuyên nghiệp, tập trung vào tối ưu tài chính hoặc thị trường chứng khoán Việt Nam.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const aiText = result.text || "Xin lỗi, tôi gặp chút trục trặc. Bạn thử lại nhé!";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Tôi không thể kết nối ngay lúc này. Hãy kiểm tra lại kết nối mạng." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const performanceData = [
    { name: 'T2', val: 1200 }, { name: 'T3', val: 2400 }, { name: 'T4', val: 4800 },
    { name: 'T5', val: 3200 }, { name: 'T6', val: 5538 }, { name: 'T7', val: 4200 }, { name: 'CN', val: 5100 },
  ];

  const allocationData = [
    { name: 'Tiền mặt', value: 40, color: '#3B82F6' },
    { name: 'Chứng khoán', value: 35, color: '#60A5FA' },
    { name: 'Quỹ mở', value: 25, color: '#FBBF24' },
  ];

  const formatAmount = (amount: string) => isVisible ? amount : '••••••••';

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Stats */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="glass-panel p-10 flex flex-col justify-between min-h-[500px]">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Tổng giá trị tài sản</h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">Cập nhật theo giá thị trường</p>
               </div>
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-400 hover:text-white"
                  >
                    {isVisible ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    )}
                  </button>
                  <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20 text-[10px] font-black text-green-400 uppercase tracking-wider">
                      +1.2%
                  </div>
               </div>
            </div>

            <div className="mb-10">
               <h2 className="text-4xl font-black tracking-tight text-white leading-none">
                 {formatAmount("1.250.094.000")} <span className="text-xl text-gray-500 font-bold tracking-normal ml-1">đ</span>
               </h2>
            </div>

            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                     <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={3} fill="url(#colorGrowth)" dot={false} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-10">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black tracking-tight">Giao dịch gần đây</h3>
                <button className="text-xs font-black text-brand-blue hover:underline">Xem tất cả</button>
             </div>
             <div className="space-y-4">
                {[
                  { title: 'Lương tháng 10', cat: 'Thu nhập', amount: '+ 25.000.000đ', color: 'text-green-400', date: 'Hôm nay' },
                  { title: 'Mua Cafe Highland', cat: 'Ăn uống', amount: '- 65.000đ', color: 'text-gray-300', date: 'Hôm qua' },
                  { title: 'Khớp lệnh HPG', cat: 'Đầu tư', amount: '- 12.000.000đ', color: 'text-gray-300', date: '21/10' },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-gray-500">{t.cat[0]}</div>
                      <div>
                        <p className="text-base font-bold">{t.title}</p>
                        <p className="text-xs text-gray-500 font-bold">{t.date} • {t.cat}</p>
                      </div>
                    </div>
                    <span className={`text-base font-black ${t.color}`}>{isVisible ? t.amount : '••••••••'}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Side: AI Chatbox & Allocation */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          
          {/* AI Chatbox Interface */}
          <div className="glass-panel flex flex-col h-[500px] bg-gradient-to-br from-[#0F0F0F] to-black border-white/5 overflow-hidden">
             <div className="p-6 border-b border-white/5 flex items-center gap-4 shrink-0">
                <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center">
                   <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeWidth="2"/></svg>
                </div>
                <div>
                   <h3 className="text-sm font-black tracking-tight">Cố vấn AI</h3>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Online</span>
                   </div>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-bold leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-brand-blue text-white rounded-tr-none shadow-lg shadow-brand-blue/10' 
                        : 'bg-white/5 text-gray-300 border border-white/5 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
             </div>

             <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 shrink-0">
                <div className="relative">
                   <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Hỏi AI về tài chính..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-12 text-sm font-bold text-white focus:outline-none focus:border-brand-blue/50 transition-all placeholder:text-gray-600"
                   />
                   <button 
                    type="submit"
                    className="absolute right-2 top-2 p-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                   >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </button>
                </div>
             </form>
          </div>

          <div className="glass-panel p-10">
             <h3 className="text-lg font-black tracking-tight mb-8">Cấu trúc tài sản</h3>
             <div className="h-56 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={allocationData} innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="value">
                         {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                         ))}
                      </Pie>
                   </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                   <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">VNINDEX</span>
                   <span className="text-xl font-black">1,282.1</span>
                </div>
             </div>
             <div className="mt-8 space-y-3">
                {allocationData.map((item, i) => (
                   <div key={i} className="flex justify-between items-center text-sm font-bold">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-white">{isVisible ? `${item.value}%` : '••%'}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
