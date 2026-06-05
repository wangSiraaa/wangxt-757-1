import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Plus, FileText, X } from 'lucide-react';

interface VoucherForm {
  refund_id: string;
  voucher_no: string;
  amount: string;
  pay_date: string;
}

const emptyForm: VoucherForm = { refund_id: '', voucher_no: '', amount: '', pay_date: '' };

const statusMap: Record<string, { label: string; className: string }> = {
  issued: { label: '已开具', className: 'bg-blue-100 text-blue-700' },
  confirmed: { label: '已确认', className: 'bg-emerald-100 text-emerald-700' },
};

export default function Vouchers() {
  const { vouchers, refunds, fetchVouchers, fetchRefunds, createVoucher } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<VoucherForm>(emptyForm);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchVouchers();
    fetchRefunds();
  }, [fetchVouchers, fetchRefunds]);

  const approvedRefunds = refunds.filter((r: any) => r.status === 'approved');

  const openModal = () => {
    setForm(emptyForm);
    setSubmitError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const res = await createVoucher({
      refund_id: Number(form.refund_id),
      voucher_no: form.voucher_no,
      amount: Number(form.amount),
      pay_date: form.pay_date,
    });
    if (res.success) {
      setModalOpen(false);
    } else {
      setSubmitError(res.error || '创建失败');
    }
  };

  const updateField = (field: keyof VoucherForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={28} className="text-[#1e3a5f]" />
          <h2 className="text-2xl font-bold text-[#1e3a5f]">付款凭证</h2>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5f8a] transition-colors"
        >
          <Plus size={18} />
          登记凭证
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">凭证号</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">关联退还申请</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-[#1e3a5f]">付款金额</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">付款日期</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">状态</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  暂无凭证数据
                </td>
              </tr>
            ) : (
              vouchers.map((v: any) => {
                const status = statusMap[v.status] || { label: v.status, className: 'bg-slate-100 text-slate-600' };
                return (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-[#1e3a5f] font-medium">{v.voucher_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {v.refund_id ? `退还申请 #${v.refund_id}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-800 font-medium">
                      ¥{Number(v.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.pay_date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">登记付款凭证</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">关联退还申请</label>
                <select
                  value={form.refund_id}
                  onChange={(e) => updateField('refund_id', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                >
                  <option value="">请选择退还申请</option>
                  {approvedRefunds.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      退还申请 #{r.id} — ¥{Number(r.amount).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">凭证号</label>
                <input
                  type="text"
                  value={form.voucher_no}
                  onChange={(e) => updateField('voucher_no', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  placeholder="请输入凭证号"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">付款金额</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => updateField('amount', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  placeholder="请输入付款金额"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1e3a5f] mb-1">付款日期</label>
                <input
                  type="date"
                  value={form.pay_date}
                  onChange={(e) => updateField('pay_date', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2d5f8a] transition-colors"
                >
                  提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
