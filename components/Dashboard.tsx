
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getFinancialAdvice } from '../services/geminiService';

const Dashboard: React.FC<{ transactions: any[], investments: any[] }> = ({ transactions, investments }) => {
  const [advice, setAdvice] = useState<string[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoadingAdvice(true);
      const data = await getFinancialAdvice(transactions, investments);
      setAdvice(data);
      setLoadingAdvice(false);
    };
    fetchAdvice();
  }, []);

  const performanceData = [
    { name: 'T2', val: 1200 }, { name: 'T3', val: 2400 }, { name: 'T4', val: 4800 },
    { name: 'T5', val: 3200 }, { name: 'T6', val: 5538 }, { name: 'T7', val: 4200 }, { name: 'CN', val: 5100 },
  ];

  const allocationData = [
    { name: 'Tiền mặt', value: 40, color: '#3B82F6' },
    { name: 'Chứng khoán', value: 35, color: '#60A5FA' },
    { name: 'Quỹ mở', value: 25, color: '#FBBF24' },
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Stats: Tài sản & Biểu đồ tăng trưởng */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <div className="glass-panel p-10 flex flex-col justify-between min-h-[500px]">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <h3 className="text-xl font-black text-white tracking-tight">Tổng giá trị tài sản</h3>
                  <p className="text-sm text-gray-500 font-bold mt-1">Cập nhật theo giá thị trường</p>
               </div>
               <div className="px-4 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 text-xs font-black text-green-400">
                  +1.2% Hôm nay
               </div>
            </div>

            <div className="mb-8">
               <h2 className="text-6xl font-black tracking-tighter text-white leading-none">
                 1.250.094.000 <span className="text-2xl text-gray-500 font-bold tracking-normal">đ</span>
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
                     <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={4} fill="url(#colorGrowth)" dot={false} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          {/* Giao dịch cá nhân */}
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
                    <span className={`text-base font-black ${t.color}`}>{t.amount}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Side: AI Assistant & Allocation */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          
          {/* AI Advisor - Personalized */}
          <div className="glass-panel p-10 bg-gradient-to-br from-[#0F0F0F] to-black border-white/5">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center">
                   <svg className="w-6 h-6 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2"/></svg>
                </div>
                <h3 className="text-lg font-black tracking-tight">Cố vấn AI</h3>
             </div>
             
             <div className="space-y-4">
                {loadingAdvice ? (
                  <div className="space-y-3">
                     <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
                     <div className="h-10 bg-white/5 rounded-xl animate-pulse w-4/5"></div>
                  </div>
                ) : (
                  advice.map((item, i) => (
                    <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                       <p className="text-sm font-bold text-gray-300 leading-relaxed">"{item}"</p>
                    </div>
                  ))
                )}
             </div>
          </div>

          {/* Allocation Chart */}
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
                      <span className="text-white">{item.value}%</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Quick Plan Info */}
          <div className="glass-panel p-8 bg-brand-blue/5 border-brand-blue/10">
             <h4 className="text-xs font-black text-brand-blue uppercase tracking-widest mb-4">Mục tiêu ưu tiên</h4>
             <div className="flex justify-between items-end">
                <div>
                   <p className="text-lg font-black tracking-tight">Mua iPhone 16 Pro</p>
                   <p className="text-xs text-gray-500 font-bold mt-1">Còn lại 15.000.000đ</p>
                </div>
                <div className="text-right">
                   <span className="text-sm font-black text-brand-blue">60%</span>
                </div>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-brand-blue w-[60%] rounded-full"></div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
