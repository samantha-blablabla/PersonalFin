
import React from 'react';
import { Investment } from '../types';

const Investments: React.FC<{ investments: Investment[] }> = ({ investments }) => {
  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-center">
         <h2 className="text-3xl font-bold text-white tracking-tighter">Market Assets</h2>
         <div className="flex gap-4">
            <div className="px-4 py-2 glass-card rounded-full text-xs font-bold text-green-400 border-green-500/20">VNINDEX: 1,282.15</div>
            <div className="px-4 py-2 glass-card rounded-full text-xs font-bold text-brand-cyan border-brand-cyan/20">USD/VND: 25.420</div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {investments.map(inv => {
          const isProfit = inv.currentPrice >= inv.avgPrice;
          return (
            <div key={inv.id} className="glass-card p-8 rounded-[40px] group">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-bold text-white group-hover:bg-brand-blue/20 transition-all">
                  {inv.symbol.substring(0, 1)}
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${isProfit ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                   {isProfit ? '▲' : '▼'} {(((inv.currentPrice - inv.avgPrice)/inv.avgPrice)*100).toFixed(2)}%
                </span>
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">{inv.symbol}</h4>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">{inv.type === 'STOCK' ? 'Equities' : 'Mutual Fund'}</p>
              
              <div className="space-y-4 border-t border-white/5 pt-6">
                 <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Current</span>
                    <span className="text-sm font-bold text-white">{inv.currentPrice.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Holding</span>
                    <span className="text-sm font-bold text-brand-cyan">{inv.quantity} units</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Investments;
