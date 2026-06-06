import { useState, useEffect, FormEvent } from 'react';
import { useStore } from '@/hooks/useStore';
import { Plus, Pencil, FileText, X, Check, Send, Trash2, ChevronDown } from 'lucide-react';

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

const MATERIAL_STATUS_LABELS: Record<string, string> = {
  pending: '待提交',
  submitted: '已提交',
  approved: '已通过',
  rejected: '已拒绝',
};

const MATERIAL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

const MATERIAL_TYPES = [
  { value: 'payment', label: '付款凭证' },
  { value: 'qualification', label: '资质证明' },
  { value: 'technical', label: '技术方案' },
  { value: 'agreement', label: '协议文件' },
  { value: 'other', label: '其他材料' },
];

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

interface MaterialFormData {
  material_name: string;
  material_type: string;
  description: string;
  file_url: string;
}

const emptyMaterialForm: MaterialFormData = {
  material_name: '',
  material_type: 'payment',
  description: '',
  file_url: '',
};

export default function Sections() {
  const { 
    sections, 
    fetchSections, 
    createSection, 
    updateSection,
    materials,
    fetchMaterialsBySection,
    createMaterial,
    updateMaterial,
    submitMaterial,
    approveMaterial,
    rejectMaterial,
    deleteMaterial,
  } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [materialForm, setMaterialForm] = useState<MaterialFormData>(emptyMaterialForm);
  const [materialError, setMaterialError] = useState<string | null>(null);
  const [rejectingMaterialId, setRejectingMaterialId] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState('');

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

  const openMaterialModal = async (section: any) => {
    setSelectedSection(section);
    setEditingMaterialId(null);
    setMaterialForm(emptyMaterialForm);
    setMaterialError(null);
    setRejectingMaterialId(null);
    setRejectComment('');
    setShowMaterialModal(true);
    await fetchMaterialsBySection(section.id);
  };

  const closeMaterialModal = () => {
    setShowMaterialModal(false);
    setSelectedSection(null);
  };

  const openCreateMaterial = () => {
    setEditingMaterialId(null);
    setMaterialForm(emptyMaterialForm);
    setMaterialError(null);
  };

  const openEditMaterial = (material: any) => {
    setEditingMaterialId(material.id);
    setMaterialForm({
      material_name: material.material_name || '',
      material_type: material.material_type || 'payment',
      description: material.description || '',
      file_url: material.file_url || '',
    });
    setMaterialError(null);
  };

  const handleMaterialSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMaterialError(null);
    const data = { ...materialForm, section_id: selectedSection.id };
    const res = editingMaterialId
      ? await updateMaterial(editingMaterialId, materialForm)
      : await createMaterial(data);
    if (res.success) {
      setEditingMaterialId(null);
      setMaterialForm(emptyMaterialForm);
    } else {
      setMaterialError(res.error || '操作失败，请重试');
    }
  };

  const handleSubmitMaterial = async (id: number) => {
    await submitMaterial(id);
  };

  const handleApproveMaterial = async (id: number) => {
    await approveMaterial(id);
  };

  const handleRejectMaterial = async (id: number) => {
    if (!rejectComment.trim()) return;
    await rejectMaterial(id, rejectComment);
    setRejectingMaterialId(null);
    setRejectComment('');
  };

  const handleDeleteMaterial = async (id: number) => {
    if (window.confirm('确定要删除该补充材料吗？')) {
      await deleteMaterial(id);
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
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(s)}
                      className="flex items-center gap-1 text-sm text-[#d4a843] hover:text-[#b8922e] transition-colors"
                    >
                      <Pencil size={14} />
                      编辑
                    </button>
                    <button
                      onClick={() => openMaterialModal(s)}
                      className="flex items-center gap-1 text-sm text-[#1e3a5f] hover:text-[#2a4f7a] transition-colors"
                    >
                      <FileText size={14} />
                      补充材料
                    </button>
                  </div>
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

      {showMaterialModal && selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeMaterialModal} />
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1e3a5f]">补充材料管理</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedSection.project_name} - {selectedSection.section_name} ({selectedSection.section_code})
                </p>
              </div>
              <button
                onClick={closeMaterialModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-[#1e3a5f]">材料列表</h4>
                  <button
                    onClick={openCreateMaterial}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2a4f7a] transition-colors"
                  >
                    <Plus size={14} />
                    新增材料
                  </button>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                  {materials.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-sm">
                      暂无补充材料
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">材料名称</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">类型</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-slate-600">描述</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-slate-600">状态</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-slate-600">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materials.map((m: any) => (
                          <tr key={m.id} className="hover:bg-white transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-700">{m.material_name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {MATERIAL_TYPES.find(t => t.value === m.material_type)?.label || m.material_type}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{m.description}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${MATERIAL_STATUS_COLORS[m.status] || ''}`}>
                                {MATERIAL_STATUS_LABELS[m.status] || m.status}
                              </span>
                              {m.status === 'rejected' && m.review_comment && (
                                <p className="text-xs text-red-500 mt-1">{m.review_comment}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {m.status === 'pending' && (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => openEditMaterial(m)}
                                    className="p-1 text-slate-500 hover:text-[#1e3a5f] hover:bg-slate-100 rounded transition-colors"
                                    title="编辑"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleSubmitMaterial(m.id)}
                                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                    title="提交"
                                  >
                                    <Send size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMaterial(m.id)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                              {m.status === 'submitted' && rejectingMaterialId !== m.id && (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleApproveMaterial(m.id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                                  >
                                    <Check size={12} />
                                    通过
                                  </button>
                                  <button
                                    onClick={() => { setRejectingMaterialId(m.id); setRejectComment(''); }}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                  >
                                    <X size={12} />
                                    拒绝
                                  </button>
                                </div>
                              )}
                              {m.status === 'submitted' && rejectingMaterialId === m.id && (
                                <div className="flex items-center justify-center gap-1.5">
                                  <input
                                    value={rejectComment}
                                    onChange={(e) => setRejectComment(e.target.value)}
                                    placeholder="拒绝原因"
                                    className="border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 w-28"
                                  />
                                  <button
                                    onClick={() => handleRejectMaterial(m.id)}
                                    disabled={!rejectComment.trim()}
                                    className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded transition-colors"
                                  >
                                    确认
                                  </button>
                                  <button
                                    onClick={() => { setRejectingMaterialId(null); setRejectComment(''); }}
                                    className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                                  >
                                    取消
                                  </button>
                                </div>
                              )}
                              {(m.status === 'approved' || m.status === 'rejected') && (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {(editingMaterialId !== null || !materials.length) && (
                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-sm font-semibold text-[#1e3a5f] mb-4">
                    {editingMaterialId ? '编辑材料' : '新增材料'}
                  </h4>

                  {materialError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      {materialError}
                    </div>
                  )}

                  <form onSubmit={handleMaterialSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">材料名称 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={materialForm.material_name}
                          onChange={(e) => setMaterialForm({ ...materialForm, material_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                          placeholder="请输入材料名称"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">材料类型 <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <select
                            value={materialForm.material_type}
                            onChange={(e) => setMaterialForm({ ...materialForm, material_type: e.target.value })}
                            className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] bg-white"
                          >
                            {MATERIAL_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">材料描述 <span className="text-red-500">*</span></label>
                      <textarea
                        value={materialForm.description}
                        onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                        rows={3}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] resize-none"
                        placeholder="请输入材料详细描述"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">文件链接（可选）</label>
                      <input
                        type="text"
                        value={materialForm.file_url}
                        onChange={(e) => setMaterialForm({ ...materialForm, file_url: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]"
                        placeholder="请输入文件访问链接"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      {editingMaterialId !== null && (
                        <button
                          type="button"
                          onClick={() => { setEditingMaterialId(null); setMaterialForm(emptyMaterialForm); }}
                          className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          取消编辑
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm text-white bg-[#1e3a5f] rounded-lg hover:bg-[#2d5f8a] transition-colors"
                      >
                        {editingMaterialId ? '保存修改' : '添加材料'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
