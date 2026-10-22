import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Plus, Search, Edit2, Trash2, Check, Package, X, ChevronDown, Eye } from 'lucide-react';
import adminApi from '../../api/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const planStyle = (name) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('premium') || lower.includes('gold') || lower.includes('elite') || lower.includes('pro')) return 'bg-amber-100 text-amber-600 border-amber-200';
  if (lower.includes('free')) return 'bg-gray-100 text-gray-500 border-gray-200';
  return 'bg-slate-200 text-slate-600 border-slate-300';
};

const PlanManagement = () => {
   const { t } = useLanguage();
   const [plans, setPlans] = useState([]);
   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [isCreating, setIsCreating] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [isViewing, setIsViewing] = useState(false);
   const [currentPlanId, setCurrentPlanId] = useState(null);
   const [viewPlan, setViewPlan] = useState(null);
   const [activeTab, setActiveTab] = useState('Plans');
   const [openDropdown, setOpenDropdown] = useState(null);
   
   const [formData, setFormData] = useState({
      name: '',
      price: '',
      originalPrice: '',
      duration: '1 Month',
      status: 'Active',
      shortDescription: '',
      features: ''
   });

   const fetchPlansAndRequests = async () => {
      setLoading(true);
      try {
         const planRes = await adminApi.getPlans();
         setPlans(planRes.plans || []);

         const queueRes = await adminApi.getQueue();
         setRequests(queueRes.queue || []);
      } catch (err) {
         console.error("Failed to load plans or request queue:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchPlansAndRequests();
   }, []);

   const handleRequestAction = async (userId, action) => {
      setSubmitting(true);
      try {
         const notes = `Manual ${action.toLowerCase()} by Admin`;
         if (action === 'Accepted') {
            await adminApi.approveMember(userId, notes);
         } else {
            await adminApi.rejectMember(userId, notes);
         }
         fetchPlansAndRequests();
      } catch (err) {
         alert(`Failed to resolve member registration: ` + (err.response?.data?.error || err.message));
      } finally {
         setSubmitting(false);
      }
   };

   const openCreateModal = () => {
      setFormData({ 
         name: '', 
         price: '', 
         originalPrice: '', 
         duration: '1 Month', 
         status: 'Active',
         shortDescription: '',
         features: ''
      });
      setIsCreating(true);
   };

    const openEditModal = (plan) => {
        const sortedFeatures = [...(plan.features || [])].sort((a, b) => {
           const nameA = a.name || a.featureName || '';
           const nameB = b.name || b.featureName || '';
           const idxA = nameA.toLowerCase().includes('feature') ? parseInt(nameA.replace(/\D/g, '') || '0', 10) : 0;
           const idxB = nameB.toLowerCase().includes('feature') ? parseInt(nameB.replace(/\D/g, '') || '0', 10) : 0;
           return idxA - idxB;
        });

        // Collect all features as newline-separated text
        const featuresText = sortedFeatures
           .filter(f => {
              const n = (f.name || f.featureName || '').toLowerCase();
              return !n.includes('duration') && !n.includes('short description');
           })
           .map(f => f.value || f.featureValue || '')
           .filter(Boolean)
           .join('\n');

        const descFeat = plan.features?.find(f => (f.name || f.featureName) === 'Short Description')?.value 
           || plan.features?.find(f => (f.name || f.featureName) === 'Short Description')?.featureValue 
           || plan.description || '';

        setFormData({
           name: plan.name,
           price: plan.price.toString(),
           originalPrice: plan.originalPrice ? plan.originalPrice.toString() : '',
           duration: plan.features?.find(f => (f.name || f.featureName) === 'Duration')?.value 
              || plan.features?.find(f => (f.name || f.featureName) === 'Duration')?.featureValue 
              || (plan.interval === 'YEARLY' ? '12 Months' : '1 Month'),
           status: plan.status === 'ACTIVE' ? 'Active' : 'Inactive',
           shortDescription: descFeat,
           features: featuresText
        });
        setCurrentPlanId(plan.id);
        setIsEditing(true);
     };

     const openViewModal = (plan) => {
        const sortedFeatures = [...(plan.features || [])].sort((a, b) => {
           const nameA = a.name || a.featureName || '';
           const nameB = b.name || b.featureName || '';
           const idxA = nameA.toLowerCase().includes('feature') ? parseInt(nameA.replace(/\D/g, '') || '0', 10) : 0;
           const idxB = nameB.toLowerCase().includes('feature') ? parseInt(nameB.replace(/\D/g, '') || '0', 10) : 0;
           return idxA - idxB;
        });

        const descFeat = plan.features?.find(f => (f.name || f.featureName) === 'Short Description')?.value 
           || plan.features?.find(f => (f.name || f.featureName) === 'Short Description')?.featureValue 
           || plan.description || '';
        const keyFeatures = sortedFeatures
           .filter(f => {
              const n = (f.name || f.featureName || '').toLowerCase();
              return !n.includes('duration') && !n.includes('short description');
           })
           .map(f => f.value || f.featureValue || '')
           .filter(Boolean);

        setViewPlan({
           ...plan,
           shortDescription: descFeat,
           keyFeatures
        });
        setIsViewing(true);
     };

   const openDeleteModal = (plan) => {
      setCurrentPlanId(plan.id);
      setIsDeleting(true);
   };

   const handleDelete = async () => {
      setSubmitting(true);
      try {
         // Soft delete/archival on the backend
         await adminApi.deletePlan(currentPlanId);
         setIsDeleting(false);
         fetchPlansAndRequests();
      } catch (err) {
         alert("Failed to archive plan: " + (err.response?.data?.error || err.message));
      } finally {
         setSubmitting(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
         const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
         const interval = formData.duration.includes('12') || formData.duration.toLowerCase().includes('year') ? 'YEARLY' : 'MONTHLY';
         const status = formData.status === 'Active' ? 'ACTIVE' : 'ARCHIVED';

         // Build features array from simple textarea (one feature per line)
         const featureLines = (formData.features || '')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

         const features = [
            { featureName: 'Duration', featureValue: formData.duration },
            { featureName: 'Short Description', featureValue: formData.shortDescription },
            ...featureLines.map((line, i) => ({ featureName: `Feature ${i + 1}`, featureValue: line }))
         ].filter(f => f.featureValue && f.featureValue.trim() !== '');

         const payload = {
            name: formData.name,
            slug,
            price: parseFloat(formData.price || '0'),
            interval,
            status,
            features
         };

         if (formData.originalPrice && formData.originalPrice.trim() !== '') {
            payload.originalPrice = parseFloat(formData.originalPrice);
         }

         if (isCreating) {
            await adminApi.createPlan(payload);
            setIsCreating(false);
         } else if (isEditing) {
            await adminApi.updatePlan(currentPlanId, payload);
            setIsEditing(false);
         }
         fetchPlansAndRequests();
      } catch (err) {
         alert("Failed to save plan: " + (err.response?.data?.error || err.message));
      } finally {
         setSubmitting(false);
      }
   };

   return (
      <div className="space-y-8 font-sans">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('adminPlans.title', 'Plan Management')}</h1>
               <p className="text-sm font-medium text-slate-500">{t('adminPlans.desc', 'Create pricing tiers and approve subscription requests.')}</p>
            </div>
            <button onClick={openCreateModal} className="px-6 py-3 bg-[#ff69b4] text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-[#ff69b4]/20 hover:brightness-110 flex items-center gap-2 transition-all">
                  <Plus size={16} /> {t('adminPlans.createNewPlan', 'Create New Plan')}
            </button>
         </div>

         {/* Plan Creation / Edit Modal */}
         {(isCreating || isEditing) && createPortal(
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2147483647 }}>
               <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="p-8 border-b border-black/5 flex items-center justify-between flex-shrink-0 bg-white z-10">
                     <h2 className="text-xl font-black text-slate-800 tracking-tight">{isCreating ? t('adminPlans.defineNewPlan', 'Define New Plan') : t('adminPlans.editPlan', 'Edit Plan')}</h2>
                     <button type="button" disabled={submitting} onClick={() => { setIsCreating(false); setIsEditing(false); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-[14px]">
                     <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2 col-span-2 sm:col-span-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.planName', 'Plan Name')}</label>
                              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Wellness Plus" className="w-full h-12 px-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#ff69b4] text-sm font-bold shadow-inner" />
                           </div>
                           <div className="space-y-2 col-span-2 sm:col-span-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.priceCurrency', 'Price (₹)')}</label>
                               <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="e.g. 999" className="w-full h-12 px-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#ff69b4] text-sm font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2 col-span-2 sm:col-span-1">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Price (₹) - Crossed out</label>
                               <input type="number" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} placeholder="e.g. 1499" className="w-full h-12 px-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#ff69b4] text-sm font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2 col-span-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Description</label>
                               <input type="text" value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} placeholder="e.g. Perfect monthly start for unlimited AI & healing resources." className="w-full h-12 px-4 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#ff69b4] text-sm font-bold shadow-inner" />
                            </div>
                           <div className="space-y-2 col-span-2 sm:col-span-1 border-none">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.duration', 'Duration')}</label>
                              <div className="relative">
                                 <div 
                                    className={`w-full h-12 px-4 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${openDropdown === 'duration' ? 'border-[#ff69b4] shadow-sm' : 'border-black/5 shadow-inner'}`}
                                    onClick={() => setOpenDropdown(openDropdown === 'duration' ? null : 'duration')}
                                 >
                                    <span className="text-sm font-bold text-slate-700">{formData.duration}</span>
                                    <ChevronDown size={14} strokeWidth={3} className={`text-slate-400 transition-transform duration-300 ${openDropdown === 'duration' ? 'rotate-180 text-[#ff69b4]' : ''}`} />
                                 </div>
                                 {openDropdown === 'duration' && (
                                    <>
                                       <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                       <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 py-2 opacity-100 transform translate-y-0 transition-all">
                                          {['1 Month', '12 Months', 'Lifetime'].map(opt => (
                                             <div 
                                                key={opt}
                                                className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${formData.duration === opt ? 'bg-[#ff69b4]/10 text-[#ff69b4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                                onClick={() => { setFormData({...formData, duration: opt}); setOpenDropdown(null); }}
                                             >
                                                {opt}
                                             </div>
                                          ))}
                                       </div>
                                    </>
                                 )}
                              </div>
                           </div>
                           <div className="space-y-2 col-span-2 sm:col-span-1 border-none">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.status', 'Status')}</label>
                              <div className="relative">
                                 <div 
                                    className={`w-full h-12 px-4 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${openDropdown === 'status' ? 'border-[#ff69b4] shadow-sm' : 'border-black/5 shadow-inner'}`}
                                    onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
                                 >
                                    <span className="text-sm font-bold text-slate-700">{formData.status}</span>
                                    <ChevronDown size={14} strokeWidth={3} className={`text-slate-400 transition-transform duration-300 ${openDropdown === 'status' ? 'rotate-180 text-[#ff69b4]' : ''}`} />
                                 </div>
                                 {openDropdown === 'status' && (
                                    <>
                                       <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                                       <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 py-2 opacity-100 transform translate-y-0 transition-all">
                                          {['Active', 'Inactive'].map(opt => (
                                             <div 
                                                key={opt}
                                                className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors ${formData.status === opt ? 'bg-[#ff69b4]/10 text-[#ff69b4]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                                onClick={() => { setFormData({...formData, status: opt}); setOpenDropdown(null); }}
                                             >
                                                {opt}
                                             </div>
                                          ))}
                                       </div>
                                    </>
                                 )}
                              </div>
                           </div>

                           {/* Key Plan Features */}
                           <div className="col-span-2 pt-4 border-t border-black/5">
                              <div className="flex items-center gap-2 mb-2">
                                 <Package size={14} className="text-[#ff69b4]" />
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Plan Features</label>
                              </div>
                              <textarea
                                 rows={5}
                                 value={formData.features}
                                 onChange={e => setFormData({...formData, features: e.target.value})}
                                 placeholder={`Enter one feature per line, e.g.:\nUnlimited AI Sakhi Chat\nAccess to all Books & Library\nWellness Community Circle\nMood Tracker + History`}
                                 className="w-full px-4 py-3 bg-slate-50 border border-black/5 rounded-xl outline-none focus:border-[#ff69b4] text-sm font-medium text-slate-700 shadow-inner resize-none leading-relaxed"
                              />
                              <p className="text-[10px] text-slate-400 font-medium mt-1.5">Each line = one feature bullet point shown to users.</p>
                           </div>
                        </div>
                        
                        <div className="pt-6 border-t border-black/5 flex justify-end gap-3 mt-4">
                           <button type="button" disabled={submitting} onClick={() => { setIsCreating(false); setIsEditing(false); }} className="px-6 py-2 text-slate-400 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all">
                              {t('adminPlans.cancel', 'Cancel')}
                           </button>
                           <button type="submit" disabled={submitting} className="px-8 py-2 bg-[#ff69b4] text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#ff69b4]/20">
                              {submitting ? t('adminPlans.savingPlan', 'Saving Plan...') : t('adminPlans.savePlan', 'Save Plan')}
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         , document.body)}

         {/* Delete Confirmation Modal (Soft-Archival) */}
         {isDeleting && createPortal(
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2147483647 }}>
               <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 overflow-hidden text-center">
                  <div className="p-8 pb-6">
                     <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={24} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{t('adminPlans.archivePlan', 'Archive Plan?')}</h3>
                     <p className="text-slate-500 text-sm font-medium mb-2">{t('adminPlans.archiveWarning', 'This plan will be archived and hidden from public subscriptions.')}</p>
                  </div>
                  <div className="p-6 bg-slate-50/50 border-t border-black/5 flex flex-col gap-3">
                     <button onClick={handleDelete} disabled={submitting} className="w-full py-3.5 bg-rose-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:brightness-110 transition-all">
                        {submitting ? t('adminPlans.archiving', 'Archiving...') : t('adminPlans.yesArchive', 'Yes, Archive Plan')}
                     </button>
                     <button type="button" disabled={submitting} onClick={() => setIsDeleting(false)} className="w-full py-3.5 bg-white border border-black/5 text-slate-600 font-extrabold rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        {t('adminPlans.cancel', 'Cancel')}
                     </button>
                  </div>
               </div>
            </div>
         , document.body)}

         {/* Render Active Tab Content */}
         {loading ? (
            <div className="h-40 flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-[#ff69b4] border-t-transparent rounded-full animate-spin"></div>
            </div>
                  ) : (
            <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="p-6 border-b border-black/5 flex items-center justify-between bg-slate-50/50">
                  <div className="relative">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input type="text" placeholder={t('adminPlans.searchPlaceholder', 'Search plans...')} className="h-10 pl-11 pr-4 bg-white border border-black/5 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#ff69b4] w-64" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.totalPlans', 'Total: {count} Plans').replace('{count}', plans.length)}</span>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                     <thead className="bg-[#fcfcfc] border-b border-black/5">
                        <tr>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.slug', 'Slug')}</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.name', 'Name')}</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.price', 'Price')}</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.billingCycle', 'Billing cycle')}</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('adminPlans.status', 'Status')}</th>
                           <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('adminPlans.actions', 'Actions')}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-black/5">
                        {plans.map((plan, i) => (
                           <tr key={plan.id || i} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4 font-black font-mono text-xs text-slate-500">{plan.slug}</td>
                              <td className="px-6 py-4 font-extrabold text-slate-800">{plan.name}</td>
                              <td className="px-6 py-4 font-black text-[#ff69b4]">₹{Number(plan.price).toLocaleString('en-IN')}</td>
                              <td className="px-6 py-4 font-bold text-slate-600 text-xs">{plan.interval}</td>
                              <td className="px-6 py-4">
                                 <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${plan.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {plan.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center justify-end gap-2 transition-all duration-300">
                                    <button onClick={() => openViewModal(plan)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all shadow-sm border border-black/5" title="View Plan"><Eye size={14} strokeWidth={2.5} /></button>
                                    <button onClick={() => openEditModal(plan)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-[#ff69b4] hover:bg-[#ff69b4]/10 rounded-lg transition-all shadow-sm border border-black/5" title="Edit Plan"><Edit2 size={14} /></button>
                                    {plan.status === 'ACTIVE' && (
                                       <button onClick={() => openDeleteModal(plan)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all shadow-sm border border-black/5" title="Archive Plan"><Trash2 size={14} /></button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {plans.length === 0 && (
                           <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-xs font-bold text-slate-400">
                                 {t('adminPlans.noPlans', 'No plans defined.')}
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* Read-Only View Modal */}
         {isViewing && viewPlan && createPortal(
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm z-[2147483647]">
               <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 sm:p-8 bg-slate-50 border-b border-black/5">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center shadow-inner">
                           <Eye size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                           <h2 className="text-xl font-black text-slate-800 tracking-tight">{t('adminPlans.planDetails', 'Plan Details')}</h2>
                           <p className="text-xs font-bold text-slate-400 mt-1">{t('adminPlans.infoCardFor', 'Information card for')} {viewPlan.name}</p>
                        </div>
                     </div>
                     <button onClick={() => setIsViewing(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} strokeWidth={2.5} />
                     </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-black/5">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('adminPlans.name', 'Plan Name')}</div>
                           <div className="text-sm font-bold text-slate-800">{viewPlan.name || '-'}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-black/5">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('adminPlans.priceCurrency', 'Price (₹)')}</div>
                           <div className="text-sm font-black text-[#ff69b4]">₹{Number(viewPlan.price).toLocaleString('en-IN') || '0'}</div>
                        </div>
                        {viewPlan.originalPrice && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-black/5">
                               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Original Price (₹)</div>
                               <div className="text-sm font-bold text-slate-500 line-through">₹{Number(viewPlan.originalPrice).toLocaleString('en-IN')}</div>
                            </div>
                        )}
                        <div className="bg-slate-50 p-4 rounded-xl border border-black/5">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('adminPlans.billingInterval', 'Billing Interval')}</div>
                           <div className="text-sm font-bold text-slate-800">{viewPlan.interval || '-'}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-black/5">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('adminPlans.status', 'Status')}</div>
                           <div className={`text-sm font-bold ${viewPlan.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-500'}`}>{viewPlan.status || '-'}</div>
                        </div>
                     </div>

                      <div className="pt-4 border-t border-black/5 mt-4">
                         <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2"><Package size={14} className="text-sky-500" /> Key Plan Features</h3>
                         {viewPlan.shortDescription && (
                            <p className="text-sm font-medium text-slate-500 mb-4 italic">{viewPlan.shortDescription}</p>
                         )}
                         {viewPlan.keyFeatures && viewPlan.keyFeatures.length > 0 ? (
                            <ul className="space-y-2">
                               {viewPlan.keyFeatures.map((feat, idx) => (
                                  <li key={idx} className="flex items-start gap-3 bg-slate-50 px-4 py-3 rounded-xl border border-black/5">
                                     <span className="w-5 h-5 rounded-full bg-[#ff69b4]/10 text-[#ff69b4] flex items-center justify-center flex-shrink-0 mt-0.5"><Check size={12} /></span>
                                     <span className="text-sm font-semibold text-slate-700">{feat}</span>
                                  </li>
                               ))}
                            </ul>
                         ) : (
                            <p className="text-xs text-slate-400 font-medium">No features listed for this plan.</p>
                         )}
                      </div>
                  </div>
               </div>
            </div>
         , document.body)}
      </div>
   );
};

export default PlanManagement;
