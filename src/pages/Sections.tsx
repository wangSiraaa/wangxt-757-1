import { useState, useEffect, FormEvent } from 'react';
import { useStore } from '@/hooks/useStore';
import { Plus, Pencil } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  unopened: '未开标',
  opened: '已开标',
  awarded: '已定标',
  contracted: '已签约',
};

const STATUS_COLORS: Record<string, string> = {
  unopened: 'bg-slate-100 text-slate-700',
  opened: 'bg-blue-100 text-blue-700',
  awarded: 'bg-amber-100 text-amber-700',
  contracted: 'bg-emerald-100 text-emerald-700',
};

interface FormData {
  project_name: string;
  section_code: string;
  section_name: string;
  open_date: string;
  status: string;
}

const emptyForm: FormData = {
  project_name: '',
  section_code: '',
  section_name: '',
  open_date: '',
  status: 'unopened',
};

export default function Sections() {
  const { sections, fetchSections, createSection, updateSection } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSubmitError(null);
    setShowModal(true);
  };

  const openEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      project_name: s.project_name || '',
      section_code: s.section_code || '',
      section_name: s.section_name || '',
      open_date: s.open_date || '',
      status: s.status || 'unopened',
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const res = editingId
      ? await updateSection(editingId, form)
      : await createSection(form);
    if (res.success) {
      setShowModal(false);
    } else {
      setSubmitError(res.error || '操作失败，请重试');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1e3a5f]">项目标段管理</h2>
          <p className="text-sm text-slate-500 mt-1">管理招投标项目的标段信息</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5f8a] transition-colors"
        >
          <Plus size={18} />
          新增标段
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1e3a5f]/5 border-b border-slate-100">
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">标段编号</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">项目名称</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">标段名称</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">开标日期</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">状态</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-[#1e3a5f]">操作</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-700">{s.section_code}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{s.project_name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{s.section_name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{s.open_date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || ''}`}>
                    {STATUS_LABELS[s.status] || s.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex items-center gap-1 text-sm text-[#d4a843] hover:text-[#b8922e] transition-colors"
                  >
                    <Pencil size={14} />
                    编辑
                  </button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">暂无标段数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">
              {editingId ? '编辑标段' : '新增标段'}
            </h3>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">项目名称</label>
                <input
                  type="text"
                  value={form.project_name}
                  onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标段编号</label>
                <input
                  type="text"
                  value={form.section_code}
                  onChange={(e) => setForm({ ...form, section_code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">标段名称</label>
                <input
                  type="text"
                  value={form.section_name}
                  onChange={(e) => setForm({ ...form, section_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">开标日期</label>
                <input
                  type="date"
                  value={form.open_date}
                  onChange={(e) => setForm({ ...form, open_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] bg-white"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2d5f8a] transition-colors"
                >
                  {editingId ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
