import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Plus, CheckCircle, XCircle, FileSignature } from 'lucide-react';

export default function Results() {
  const { results, sections, fetchResults, fetchSections, createResult, updateResult } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ section_id: '', winner_name: '', award_date: '' });

  useEffect(() => {
    fetchResults();
    fetchSections();
  }, [fetchResults, fetchSections]);

  const eligibleSections = sections.filter(
    (s) => s.status === 'opened' || s.status === 'awarded' || s.status === 'contracted'
  );

  const handleSubmit = async () => {
    if (!form.section_id || !form.winner_name || !form.award_date) {
      setFormError('请填写所有必填项');
      return;
    }
    const res = await createResult(form);
    if (res.success) {
      setShowModal(false);
      setForm({ section_id: '', winner_name: '', award_date: '' });
      setFormError(null);
    } else {
      setFormError(res.error || '录入失败');
    }
  };

  const handleMarkSigned = async (id: number) => {
    await updateResult(id, { contract_signed: true });
  };

  const getSectionName = (sectionId: number | string) => {
    const section = sections.find((s) => String(s.id) === String(sectionId));
    return section?.name || section?.section_name || `标段 ${sectionId}`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1e3a5f]">中标结果</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1e3a5f] text-white px-4 py-2 rounded-lg hover:bg-[#2d5f8a] transition-colors"
        >
          <Plus size={18} />
          录入中标结果
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1e3a5f] text-white text-sm">
              <th className="text-left px-6 py-3 font-medium">关联标段</th>
              <th className="text-left px-6 py-3 font-medium">中标人</th>
              <th className="text-left px-6 py-3 font-medium">中标日期</th>
              <th className="text-left px-6 py-3 font-medium">合同签约</th>
              <th className="text-left px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  暂无中标结果
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700">{getSectionName(r.section_id)}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{r.winner_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{r.award_date}</td>
                  <td className="px-6 py-4">
                    {r.contract_signed ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm">
                        <CheckCircle size={16} />
                        已签约
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 text-sm">
                        <XCircle size={16} />
                        未签约
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {!r.contract_signed && (
                      <button
                        onClick={() => handleMarkSigned(r.id)}
                        className="flex items-center gap-1.5 text-[#d4a843] hover:text-[#b8922e] text-sm font-medium transition-colors"
                      >
                        <FileSignature size={15} />
                        标记签约
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">录入中标结果</h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">关联标段</label>
                <select
                  value={form.section_id}
                  onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                >
                  <option value="">请选择标段</option>
                  {eligibleSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.section_name || `标段 ${s.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">中标人</label>
                <input
                  type="text"
                  value={form.winner_name}
                  onChange={(e) => setForm({ ...form, winner_name: e.target.value })}
                  placeholder="请输入中标人名称"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">中标日期</label>
                <input
                  type="date"
                  value={form.award_date}
                  onChange={(e) => setForm({ ...form, award_date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormError(null);
                  setForm({ section_id: '', winner_name: '', award_date: '' });
                }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2d5f8a] transition-colors"
              >
                确认录入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
