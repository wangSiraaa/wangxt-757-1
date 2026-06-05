import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Check, X, ChevronDown } from 'lucide-react';
import { useStore } from '@/hooks/useStore';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'bg-amber-100 text-amber-800' },
  approved: { label: '已通过', color: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
  paid: { label: '已付款', color: 'bg-blue-100 text-blue-800' },
};

export default function Refunds() {
  const { refunds, bonds, fetchRefunds, fetchBonds, createRefund, approveRefund, rejectRefund } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedBondId, setSelectedBondId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRefunds();
    fetchBonds();
  }, [fetchRefunds, fetchBonds]);

  const openModal = () => {
    setSelectedBondId('');
    setReason('');
    setApiError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setApiError('');
  };

  const handleSubmit = async () => {
    if (!selectedBondId || !reason.trim()) return;
    setApiError('');
    setSubmitting(true);
    try {
      const res = await createRefund({ bond_id: selectedBondId, reason });
      if (!res.success) {
        setApiError(res.error || '提交失败');
        return;
      }
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    await approveRefund(id);
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) return;
    await rejectRefund(id, rejectReason);
    setRejectingId(null);
    setRejectReason('');
  };

  const selectedBond = bonds.find((b: any) => b.id === selectedBondId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">退还申请</h2>
          <p className="text-sm text-slate-500 mt-1">管理保证金退还申请，系统自动校验业务规则</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium bg-[#1e3a5f] hover:bg-[#2a4f7a] transition-colors"
        >
          <Plus size={18} />
          发起退还
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">申请编号</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">关联标段</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">申请人</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">金额</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">状态</th>
              <th className="text-center px-6 py-3 text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {refunds.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">暂无退还申请</td>
              </tr>
            )}
            {refunds.map((refund: any) => (
              <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[#1e3a5f]">#{refund.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{refund.section_name || refund.section_code || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{refund.applicant_name}</td>
                <td className="px-6 py-4 text-sm text-right font-mono text-slate-700">¥{(refund.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[refund.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                    {statusConfig[refund.status]?.label || refund.status}
                  </span>
                  {refund.status === 'rejected' && refund.reject_reason && (
                    <p className="text-xs text-red-500 mt-1">{refund.reject_reason}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {refund.status === 'pending' && rejectingId !== refund.id && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleApprove(refund.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <Check size={14} />
                        通过
                      </button>
                      <button
                        onClick={() => { setRejectingId(refund.id); setRejectReason(''); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <X size={14} />
                        拒绝
                      </button>
                    </div>
                  )}
                  {refund.status === 'pending' && rejectingId === refund.id && (
                    <div className="flex items-center justify-center gap-2">
                      <input
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="拒绝原因"
                        className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 w-32"
                      />
                      <button
                        onClick={() => handleReject(refund.id)}
                        disabled={!rejectReason.trim()}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 transition-colors"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  )}
                  {refund.status !== 'pending' && (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">发起退还申请</h2>

            {apiError && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="text-sm font-bold text-red-800">退还申请被拒绝</p>
                  <p className="text-sm text-red-700 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1.5">
                  关联保证金 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedBondId}
                    onChange={(e) => { setSelectedBondId(Number(e.target.value) || ''); setApiError(''); }}
                    className="w-full appearance-none border border-slate-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
                  >
                    <option value="">请选择保证金流水</option>
                    {bonds.map((bond: any) => (
                      <option key={bond.id} value={bond.id}>
                        {bond.payer_name} · {bond.section_name || `标段#${bond.section_id}`} · ¥{(bond.amount || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {selectedBond && (
                  <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                    缴纳方：{selectedBond.payer_name} ｜ 标段：{selectedBond.section_name || `#${selectedBond.section_id}`} ｜ 金额：¥{(selectedBond.amount || 0).toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1.5">
                  退还原因 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="请输入退还原因"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedBondId || !reason.trim() || submitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#1e3a5f] hover:bg-[#2a4f7a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? '提交中...' : '提交申请'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
