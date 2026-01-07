
import React from 'react';
import { Goal } from '../types';

const Goals: React.FC<{ goals: Goal[] }> = ({ goals }) => {
  const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    return (
      <div className="bento-card p-8 group transition-all hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-[10px] font-bold text-brand-glow uppercase tracking-widest mb-1">{goal.type} TERM PLAN</p>
            <h4 className="text-xl font-semibold text-white leading-tight">{goal.title}</h4>
            <div className="flex items-center gap-2 mt-2">
               <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
               <span className="text-[10px] text-gray-500 font-medium">Deadline: {goal.deadline}</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold text-white tracking-tighter">%{Math.round(progress)}</div>
          </div>
        </div>

        <div className="relative h-6 bg-brand-bg rounded-xl overflow-hidden mb-6 border border-white/5">
           <div 
             className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
             style={{ 
               width: `${progress}%`,
               background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.4) 25%, rgba(59, 130, 246, 0.6) 25%, rgba(59, 130, 246, 0.6) 50%, rgba(59, 130, 246, 0.4) 50%, rgba(59, 130, 246, 0.4) 75%, rgba(59, 130, 246, 0.6) 75%, rgba(59, 130, 246, 0.6) 100%)',
               backgroundSize: '20px 20px'
             }}
           >
             {progress > 15 && <div className="w-1 h-3 bg-white/40 rounded-full"></div>}
           </div>
        </div>

        <div className="flex justify-between items-center text-xs">
           <div>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter mb-1">Current Funding</p>
              <p className="font-semibold text-white">{goal.currentAmount.toLocaleString()} <span className="text-[10px] font-light text-gray-500">/ {goal.targetAmount.toLocaleString()}</span></p>
           </div>
           <button className="p-2 rounded-lg bg-brand-glow/10 hover:bg-brand-glow text-brand-glow hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 py-4 animate-in slide-in-from-bottom-5 duration-700">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-semibold text-white">Financial Targets</h2>
            <p className="text-gray-500 text-sm">Strategic planning for your future milestones.</p>
         </div>
         <button className="px-6 py-2.5 bg-brand-glow rounded-xl text-xs font-bold text-white hover:shadow-lg hover:shadow-brand-glow/30 transition-all">Create New Goal</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {goals.map(g => <GoalCard key={g.id} goal={g} />)}
        <div className="bento-card border-dashed border-2 border-white/5 flex flex-col items-center justify-center p-8 text-center gap-4 group cursor-pointer hover:border-brand-glow/40 transition-all">
           <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-glow/10 transition-all">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-brand-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
           </div>
           <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Add New Milestone</span>
        </div>
      </div>
    </div>
  );
};

export default Goals;
