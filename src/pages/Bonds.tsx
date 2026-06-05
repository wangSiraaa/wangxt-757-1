import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Plus, X } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  paid: { label: '已缴纳', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refunded: { label: '已退还', className: 'bg-slate-50 text-slate-600 border-slate-200' },
  partial_refunded: { label: '部分退还', className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

interface FormData {
  section_id: string;
  payer_name: string;
  amount: string;
  bond_date: string;
}

const emptyForm: FormData = { section_id: '', payer_name: '', amount: '', bond_date: '' };

export default function Bonds() {
  const { bonds, sections, fetchBonds, fetchSections, createBond } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchBonds();
    fetchSections();
  }, [fetchBonds, fetchSections]);

  const handleSubmit = async () => {
    setSubmitError(null);
    const result = await createBond({
      section_id: Number(form.section_id),
      payer_name: form.payer_name,
      amount: Number(form.amount),
      bond_date: form.bond_date,
    });
    if (result.success) {
      setShowModal(false);
      setForm(emptyForm);
    } else {
      setSubmitError(result.error || '创建失败');
    }
  };

  const sectionMap = Object.fromEntries(sections.map((s: any) => [s.id, s.name]));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">保证金流水</h2>
          <p className="text-sm text-slate-500 mt-1">管理所有标段的保证金缴纳与退还记录</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setSubmitError(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5f8a] transition-colors"
        >
          <Plus size={18} />
          新增流水
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">关联标段</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">缴纳方</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">金额</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">缴纳日期</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">状态</th>
            </tr>
          </thead>
          <tbody>
            {bonds.map((bond: any) => {
              const status = STATUS_CONFIG[bond.status] || STATUS_CONFIG.paid;
              return (
                <tr key={bond.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-800">{sectionMap[bond.section_id] || bond.section_id}</td>
                  <td className="px-6 py-4 text-sm text-slate-800">{bond.payer_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-800 text-right font-mono">
                    ¥{Number(bond.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-800">{bond.bond_date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {bonds.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">暂无保证金流水记录</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-[#1e3a5f]">新增保证金流水</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {submitError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">关联标段</label>
                <select
                  value={form.section_id}
                  onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                >
                  <option value="">请选择标段</option>
                  {sections.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">缴纳方</label>
                <input
                  type="text"
                  value={form.payer_name}
                  onChange={(e) => setForm({ ...form, payer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  placeholder="请输入缴纳方名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">金额</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                  placeholder="请输入金额"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">缴纳日期</label>
                <input
                  type="date"
                  value={form.bond_date}
                  onChange={(e) => setForm({ ...form, bond_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2d5f8a] transition-colors"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
