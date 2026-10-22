import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Search, Filter, ShieldCheck, Mail, Phone, MoreVertical, CheckCircle2, XCircle, X, ChevronDown, CheckCircle, Clock, Tag, ExternalLink, Trash2, Edit2, Eye } from 'lucide-react';
import adminApi from '../../api/adminApi';

// ── Premium Form Dropdown ─────────────────────────────────────────────────────
const FormDropdown = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full h-10 px-4 flex items-center justify-between bg-slate-50 border rounded-xl transition-all font-bold text-[9px] ${isOpen ? 'border-[#15192c] ring-4 ring-indigo-900/5' : 'border-black/5 hover:border-slate-200'}`}>
        <span className="text-slate-700">{value}</span>
        <ChevronDown size={15} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-[78px] left-0 w-full bg-white border border-black/5 rounded-xl shadow-xl z-[60] p-1.5 animate-in slide-in-from-top-2 duration-200">
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-4 py-2 rounded-lg text-[9px] font-bold transition-all ${value === opt ? 'bg-[#15192c] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Reusable Modal Shell (Fixed Scrollbar & Inset) ──────────────────────────────
const CMSModal = ({ open, onClose, title, icon: Icon, iconBg, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <style>{`
          .custom-adv-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-adv-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-adv-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
      `}</style>
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full sm:max-w-xl shadow-2xl border border-black/5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col overflow-hidden relative">
        <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${iconBg} text-white`}>
              <Icon size={18} />
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight leading-none">{title}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-all active:scale-90"><X size={20} /></button>
        </div>
        <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1 custom-adv-scrollbar pr-[18px]">{children}</div>
      </div>
    </div>
  );
};

import { useLanguage } from '../../context/LanguageContext';

const AdvisorCMS = () => {
  const { t } = useLanguage();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Experts');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewAdv, setViewAdv] = useState(null);
  const [editAdv, setEditAdv] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({ name: '', specialty: 'Hormonal Health', status: 'Pending', email: '', phone: '', bio: '', hourlyRate: '500', password: '' });

  const resetForm = () => setFormData({ name: '', specialty: 'Hormonal Health', status: 'Pending', email: '', phone: '', bio: '', hourlyRate: '500', password: '' });

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus !== 'All Experts') {
        params.status = filterStatus.toLowerCase();
      }
      const res = await adminApi.getAdvisors(params);
      setAdvisors(res.advisors || []);
    } catch (err) {
      console.error("Failed to load advisors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdvisors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editAdv) {
        // Edit advisor profile parameters
        await adminApi.updateAdvisor(editAdv.id, {
          qualification: formData.specialty,
          bio: formData.bio,
          hourlyRate: parseFloat(formData.hourlyRate || '500')
        });

        // If status changed, update it too
        const targetStatus = formData.status === 'Review' ? 'pending' : formData.status.toLowerCase();
        if (targetStatus !== editAdv.status) {
          await adminApi.updateAdvisorStatus(editAdv.id, targetStatus);
        }

        setEditAdv(null);
      } else {
        // Recruit new advisor
        const targetStatus = formData.status === 'Review' ? 'pending' : formData.status.toLowerCase();
        await adminApi.createAdvisor({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialty: formData.specialty,
          password: formData.password,
          status: targetStatus
        });
        setIsAddOpen(false);
      }
      resetForm();
      fetchAdvisors();
    } catch (err) {
      alert("Failed to save advisor: " + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      // De-recruit / suspend advisor
      await adminApi.updateAdvisorStatus(deleteId, 'suspended');
      setDeleteId(null);
      fetchAdvisors();
    } catch (err) {
      alert("Failed to suspend advisor: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">{t('adminAdvisors.title', 'Expert Management')}</h1>
          <p className="text-slate-500 text-sm font-medium">{t('adminAdvisors.desc', 'Verify credentials and manage schedules for {count} advisors.').replace('{count}', advisors.length)}</p>
        </div>
        <button onClick={() => { resetForm(); setIsAddOpen(true); }} className="px-4 py-3 bg-slate-900 text-white font-black rounded-xl text-[9px] uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all">
          <UserPlus size={16} /> {t('adminAdvisors.recruitAdvisor', 'Recruit Advisor')}
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/20">
          <div className="flex flex-wrap gap-2 sm:ml-4">
            {['All Experts', 'Pending', 'Approved'].map(opt => (
              <button key={opt} onClick={() => setFilterStatus(opt)} className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === opt ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-black/5 hover:bg-slate-50'}`}>
                {opt === 'All Experts' ? t('adminAdvisors.totalPool', 'TOTAL POOL') : opt === 'Pending' ? t('adminAdvisors.approvals', 'APPROVALS') : t('adminAdvisors.certified', 'CERTIFIED')}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-sm sm:mr-4 px-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('adminAdvisors.searchPlaceholder', 'Find advisor by name or specialty...')} className="w-full h-10 pl-11 pr-5 bg-white border border-black/5 rounded-2xl text-xs font-bold outline-none focus:border-[#15192c] transition-all shadow-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-black/5">
                <tr>
                  <th className="px-6 py-4">{t('adminAdvisors.expertProfile', 'Expert Profile')}</th>
                  <th className="px-6 py-4">{t('adminAdvisors.specialtyArea', 'Specialty Area')}</th>
                  <th className="px-6 py-4">{t('adminAdvisors.hourlyRate', 'Hourly Rate')}</th>
                  <th className="px-6 py-4">{t('adminAdvisors.status', 'Status')}</th>
                  <th className="px-6 py-4 text-right">{t('adminAdvisors.console', 'Console')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-[13px]">
                {advisors.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all font-black text-xs shadow-sm border border-black/5">
                          {(adv.fullName || 'Advisor').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-800 tracking-tight leading-none mb-1 text-sm">{adv.fullName}</p>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Email: {adv.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-[#15192c]" />
                        <span className="font-bold text-slate-600 text-sm">{adv.qualification}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <span className="text-slate-800 font-black text-sm">₹{Number(adv.hourlyRate).toLocaleString('en-IN')}</span> <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">/ hour</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${adv.status === 'approved' ? 'text-emerald-600' :
                          adv.status === 'pending' ? 'text-blue-500' : 'text-rose-500'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${adv.status === 'approved' ? 'bg-emerald-500' : (adv.status === 'pending' ? 'bg-blue-500 animate-pulse' : 'bg-rose-500')}`}></div>
                        {adv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 transition-all duration-300">
                        {adv.status === 'pending' && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to approve ${adv.fullName} as an active advisor?`)) {
                                try {
                                  await adminApi.updateAdvisorStatus(adv.id, 'approved');
                                  fetchAdvisors();
                                } catch (err) {
                                  alert("Failed to approve advisor: " + (err.response?.data?.error || err.message));
                                }
                              }
                            }}
                            className="p-2 bg-white border border-black/5 text-emerald-500 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm"
                            title="Approve Advisor"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <button onClick={() => setViewAdv(adv)} className="p-2 bg-white border border-black/5 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-all shadow-sm" title="View Details"><Eye size={14} /></button>
                        <button onClick={() => { setEditAdv(adv); setFormData({ name: adv.fullName, specialty: adv.qualification, status: adv.status === 'pending' ? 'Pending' : (adv.status === 'approved' ? 'Approved' : 'Review'), email: adv.email, phone: adv.phone || '', bio: adv.bio || '', hourlyRate: adv.hourlyRate || '500' }); }} className="p-2 bg-white border border-black/5 text-slate-400 rounded-lg hover:bg-[#15192c]/10 hover:text-[#15192c] transition-all shadow-sm" title="Edit Profile"><Edit2 size={14} /></button>
                        {adv.status !== 'suspended' && (
                          <button onClick={() => setDeleteId(adv.id)} className="p-2 bg-white border border-black/5 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all shadow-sm" title="Suspend Advisor"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {advisors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase">
                      No advisors recruited yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ────────────────────────────────────────────────── */}
      {(isAddOpen || editAdv) && (
        <CMSModal open title={editAdv ? 'Modify Expert Credentials' : 'Recruit New Advisor'} icon={UserPlus} iconBg={editAdv ? 'bg-[#15192c]' : 'bg-slate-900'} onClose={() => { setIsAddOpen(false); setEditAdv(null); resetForm(); }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input required disabled={!!editAdv} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner disabled:bg-slate-100 disabled:text-slate-500" placeholder="Dr. Sarah Jones" />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Email</label>
                <input required type="email" disabled={!!editAdv} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner disabled:bg-slate-100 disabled:text-slate-500" placeholder="sarah@healthsakhi.com" />
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Contact</label>
                <input required disabled={!!editAdv} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner disabled:bg-slate-100 disabled:text-slate-500" placeholder="+91 90000 00000" />
              </div>
              {!editAdv && (
                <div className="space-y-1 col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner" placeholder="Password" />
                </div>
              )}
              <div className="col-span-2 sm:col-span-1">
                <FormDropdown label="Primary Specialty (Qualification)" value={formData.specialty} options={['Hormonal Health', 'Diabetes Care', 'PCOD Diet', 'Stress Relief', 'Functional Medicine']} onChange={val => setFormData({ ...formData, specialty: val })} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <FormDropdown label="Verification Status" value={formData.status} options={['Pending', 'Approved', 'Review']} onChange={val => setFormData({ ...formData, status: val })} />
              </div>
              {editAdv && (
                <>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hourly Session Rate (₹)</label>
                    <input type="number" required value={formData.hourlyRate} onChange={e => setFormData({ ...formData, hourlyRate: e.target.value })} className="w-full h-10 px-3 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Professional Bio</label>
                    <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full h-24 p-3 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#15192c] text-sm font-bold shadow-inner resize-none" placeholder="Provide specialized credentials bio..." />
                  </div>
                </>
              )}
            </div>
            <div className="pt-5 border-t border-black/5 flex justify-end gap-3 mt-4">
              <button type="button" disabled={submitting} onClick={() => { setIsAddOpen(false); setEditAdv(null); resetForm(); }} className="px-5 py-2 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
              <button type="submit" disabled={submitting} className="px-8 py-2 bg-slate-900 text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/20">
                {submitting ? "Saving..." : (editAdv ? 'Save Changes' : 'Approve & Recruit')}
              </button>
            </div>
          </form>
        </CMSModal>
      )}

      {/* ── VIEW MODAL ────────────────────────────────────────────────────────── */}
      <CMSModal open={!!viewAdv} title="Advisor Dossier" icon={Eye} iconBg="bg-blue-500" onClose={() => setViewAdv(null)}>
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-2xl">{(viewAdv?.fullName || 'Advisor').split(' ').map(n => n[0]).join('')}</div>
            <div className="space-y-1.5">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{viewAdv?.fullName}</h3>
              <p className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none"><ShieldCheck size={14} className="text-[#15192c]" /> {viewAdv?.qualification}</p>
              <div className="pt-2 flex gap-4 text-slate-400 transition-colors">
                <Mail size={16} className="hover:text-slate-900 cursor-pointer" /> <Phone size={16} className="hover:text-slate-900 cursor-pointer" /> <ExternalLink size={16} className="hover:text-slate-900 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-black/5 text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Hourly Consultation Rate</p><p className="text-xl font-black text-slate-800">₹{Number(viewAdv?.hourlyRate || 0).toLocaleString('en-IN')}</p></div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-black/5 text-center"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Verification Status</p><p className="text-base font-black text-slate-800 uppercase tracking-tighter">{viewAdv?.status}</p></div>
          </div>
          <div className="p-8 bg-slate-50 border border-black/5 rounded-[2.5rem] shadow-inner text-sm font-bold text-slate-500 leading-relaxed italic">
            {viewAdv?.bio || `Verified health sakhi ert specialized in ${viewAdv?.qualification}. Dedicated to providing evidence-based wellness counseling to our global community of sisters.`}
          </div>
          <div className="flex justify-end pt-2"><button onClick={() => setViewAdv(null)} className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-black transition-all">Close Dossier</button></div>
        </div>
      </CMSModal>

      {/* ── SUSPEND CONTRACT MODAL ────────────────────────────────────────────── */}
      <CMSModal open={!!deleteId} title="De-Recruit / Suspend Expert" icon={Trash2} iconBg="bg-rose-500" onClose={() => setDeleteId(null)}>
        <div className="space-y-6">
          <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] space-y-3">
            <p className="text-lg font-black text-rose-800">Suspend advisor contract association?</p>
            <p className="text-sm font-bold text-rose-500 leading-relaxed italic">This advisor will be marked as suspended and will lose all access to patient profiles and schedule management.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
            <button onClick={() => setDeleteId(null)} className="px-8 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
            <button onClick={handleDelete} className="px-10 py-3 bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-rose-500/20 active:scale-95 transition-all">Suspend Expert</button>
          </div>
        </div>
      </CMSModal>

    </div>
  );
};

export default AdvisorCMS;
