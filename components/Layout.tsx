
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'transactions', label: 'Thu chi', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'investments', label: 'Đầu tư', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { id: 'goals', label: 'Kế hoạch', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sidebar - Personal Focus */}
      <aside 
        className={`bg-black border-r border-white/5 flex flex-col fixed lg:sticky top-0 h-screen transition-all duration-500 z-50 ${
          isCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className="p-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" strokeWidth="2.5"/></svg>
          </div>
          {!isCollapsed && <span className="text-xl font-black tracking-tighter">FINTRACK</span>}
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 py-4 rounded-2xl transition-all ${
                activeTab === item.id ? 'sidebar-item-active' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'
              } ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {!isCollapsed && <span className="text-base font-bold tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-6">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full h-12 flex items-center justify-center bg-white/5 rounded-xl text-gray-400 hover:text-white border border-white/5 transition-all"
          >
            <svg className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/5 sticky top-0 bg-black/80 backdrop-blur-3xl z-40">
           <div className="flex items-center gap-6">
              <h1 className="text-sm font-black tracking-tight text-gray-500 uppercase tracking-widest">
                 Private Dashboard <span className="text-white mx-3">/</span> 
                 <span className="text-brand-blue">{menuItems.find(m => m.id === activeTab)?.label}</span>
              </h1>
           </div>

           <div className="flex items-center gap-8">
              <div className="text-right hidden sm:block">
                 <p className="text-sm font-black leading-none text-white">Chào Hossein,</p>
                 <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-tighter">Thị trường VNINDEX: 1,282.15 (+0.4%)</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 flex items-center justify-center font-black text-brand-blue shadow-lg">H</div>
           </div>
        </header>

        <main className="p-12 max-w-[1600px] mx-auto w-full no-scrollbar">
           {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
