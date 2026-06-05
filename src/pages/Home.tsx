import { useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { FolderOpen, Receipt, RotateCcw, FileText, TrendingUp } from 'lucide-react';

export default function Home() {
  const { stats, fetchStats } = useStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cards = [
    { label: '项目标段', value: stats.sections, icon: FolderOpen, color: 'bg-[#1e3a5f]' },
    { label: '保证金流水', value: stats.bonds, icon: Receipt, color: 'bg-[#2d5f8a]' },
    { label: '待审批退还', value: stats.pendingRefunds, icon: RotateCcw, color: 'bg-[#d4a843]' },
    { label: '付款凭证', value: stats.vouchers, icon: FileText, color: 'bg-[#10b981]' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">工作台</h2>
        <p className="text-sm text-slate-500 mt-1">招投标保证金退还管理系统概览</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            <div className={`${card.color} p-4 flex items-center justify-between`}>
              <card.icon size={24} className="text-white" />
              <TrendingUp size={16} className="text-white/50" />
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-[#1e3a5f]">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">业务规则说明</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-md">
            <div className="w-2 h-2 rounded-full bg-[#ef4444] mt-1.5 shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-red-800">未开标项目不能退还</p>
              <p className="text-xs text-red-600 mt-0.5">标段状态为"未开标"时，该标段下所有保证金均不可发起退还申请</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-md">
            <div className="w-2 h-2 rounded-full bg-[#d4a843] mt-1.5 shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-amber-800">中标人未签合同不能退保证金</p>
              <p className="text-xs text-amber-600 mt-0.5">已定标但中标人尚未签署合同的标段，中标人的保证金不可退还（非中标人可正常退还）</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-md">
            <div className="w-2 h-2 rounded-full bg-[#10b981] mt-1.5 shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-emerald-800">正常退还流程</p>
              <p className="text-xs text-emerald-600 mt-0.5">已开标且非中标人（或中标人已签约）的保证金，可发起退还申请 → 审批通过 → 登记付款凭证</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
