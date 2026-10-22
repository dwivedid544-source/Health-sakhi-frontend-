import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Heart, Shield, Star, Plus, Edit2, Trash2, MessageSquare, 
  UserX, UserCheck, RefreshCw, X, Check, Lock, AlertTriangle, ArrowLeft,
  Smile, Baby, Activity, Sparkles, BookOpen, MessageCircle, Sun, Award, Zap, Target, Globe, Brain
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import { useLanguage } from '../../context/LanguageContext';

const iconOptions = [
  { id: 'Heart', label: 'Heart', icon: Heart },
  { id: 'Users', label: 'Users', icon: Users },
  { id: 'Shield', label: 'Shield', icon: Shield },
  { id: 'Star', label: 'Star', icon: Star },
  { id: 'Baby', label: 'Child/Baby', icon: Baby },
  { id: 'Smile', label: 'Mental Health', icon: Smile },
  { id: 'Activity', label: 'Fitness', icon: Activity },
  { id: 'Sparkles', label: 'Wellness', icon: Sparkles },
  { id: 'BookOpen', label: 'Learning', icon: BookOpen },
  { id: 'MessageCircle', label: 'Chat', icon: MessageCircle },
  { id: 'Sun', label: 'Positivity', icon: Sun },
  { id: 'Award', label: 'Achievement', icon: Award },
  { id: 'Zap', label: 'Energy', icon: Zap },
  { id: 'Target', label: 'Goals', icon: Target },
  { id: 'Globe', label: 'Global', icon: Globe },
  { id: 'Brain', label: 'Mind Care', icon: Brain }
];

const colorOptions = [
  '#ff69b4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'
];

const CommunityManagement = () => {
  const { t } = useLanguage();
  
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Users',
    color: '#ff69b4'
  });

  // Chat Monitor & Members Oversight State
  const [circleMessages, setCircleMessages] = useState([]);
  const [circleMembers, setCircleMembers] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'members'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCircles();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadCircles = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCommunityCircles();
      if (res && res.success) {
        setCircles(res.circles || []);
      }
    } catch (err) {
      console.error('Failed to load community circles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setFormData({ name: '', description: '', icon: 'Users', color: '#ff69b4' });
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (circle) => {
    setSelectedCircle(circle);
    setFormData({
      name: circle.name,
      description: circle.description || '',
      icon: circle.icon || 'Users',
      color: circle.color || '#ff69b4'
    });
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (circle) => {
    setSelectedCircle(circle);
    setShowDeleteModal(true);
  };

  const handleOpenChatModal = async (circle) => {
    setSelectedCircle(circle);
    setActiveTab('chat');
    setShowChatModal(true);
    await loadCircleMessagesAndMembers(circle.id);
  };

  const loadCircleMessagesAndMembers = async (circleId) => {
    try {
      setIsChatLoading(true);
      const res = await adminApi.getCommunityCircleMessages(circleId);
      if (res && res.success) {
        setCircleMessages(res.messages || []);
        setCircleMembers(res.members || []);
      }
    } catch (err) {
      console.error('Failed to load circle chat oversight data:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Submit Create Circle
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      setSubmitting(true);
      const res = await adminApi.createCommunityCircle(formData);
      if (res && res.success) {
        triggerToast(t('admin.communityCreated', 'Community Circle created successfully! ✨'));
        setShowCreateModal(false);
        loadCircles();
      }
    } catch (err) {
      console.error('Failed to create circle:', err);
      alert(err.response?.data?.message || 'Failed to create community circle');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Update Circle
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCircle || !formData.name.trim()) return;
    try {
      setSubmitting(true);
      const res = await adminApi.updateCommunityCircle(selectedCircle.id, formData);
      if (res && res.success) {
        triggerToast(t('admin.communityUpdated', 'Community Circle updated successfully! ✏️'));
        setShowEditModal(false);
        loadCircles();
      }
    } catch (err) {
      console.error('Failed to update circle:', err);
      alert(err.response?.data?.message || 'Failed to update community circle');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Delete Circle
  const handleDeleteConfirm = async () => {
    if (!selectedCircle) return;
    try {
      setSubmitting(true);
      const res = await adminApi.deleteCommunityCircle(selectedCircle.id);
      if (res && res.success) {
        triggerToast(t('admin.communityDeleted', 'Community Circle deleted 🗑️'));
        setShowDeleteModal(false);
        loadCircles();
      }
    } catch (err) {
      console.error('Failed to delete circle:', err);
      alert('Failed to delete community circle');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Block Member in Group
  const handleToggleBlockMember = async (userId, currentBlockedState) => {
    if (!selectedCircle) return;
    const targetState = !currentBlockedState;
    const actionLabel = targetState ? 'block' : 'unblock';
    
    if (window.confirm(`Are you sure you want to ${actionLabel} this member in this community group?`)) {
      try {
        const res = await adminApi.toggleBlockCommunityMember(selectedCircle.id, userId, targetState);
        if (res && res.success) {
          triggerToast(targetState ? 'Member blocked from circle 🚫' : 'Member unblocked ✅');
          await loadCircleMessagesAndMembers(selectedCircle.id);
        }
      } catch (err) {
        console.error('Failed to toggle block status:', err);
        alert('Failed to update member status');
      }
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 text-left animate-in fade-in duration-300">
      
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-pink-300">
            {t('admin.communityMgmtTag', 'Admin Oversight & Moderation')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight flex items-center gap-3">
            <Users className="text-[#ff69b4]" size={28} /> {t('admin.communityMgmt', 'Community Management')}
          </h1>
          <p className="text-xs text-slate-300 font-medium max-w-xl">
            {t('admin.communityMgmtDesc', 'Manage community circles, monitor group discussions, and restrict rule-violating members.')}
          </p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-[#ff69b4] hover:bg-pink-600 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0 relative z-10"
        >
          <Plus size={16} /> {t('admin.createGroup', '+ Create New Group')}
        </button>
      </div>

      {/* ── CIRCLES GRID ── */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-10 h-10 border-4 border-pink-100 border-t-[#ff69b4] animate-spin rounded-full mx-auto mb-3"></div>
          <span className="text-xs font-bold uppercase tracking-widest">{t('admin.loadingGroups', 'Loading community groups...')}</span>
        </div>
      ) : circles.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Users size={48} className="mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">{t('admin.noGroupsFound', 'No community groups found')}</h3>
          <p className="text-xs">{t('admin.clickCreateGroup', 'Click "+ Create New Group" button above to add your first community circle.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => {
            const IconComp = iconOptions.find(i => i.id === circle.icon)?.icon || Users;
            return (
              <div 
                key={circle.id}
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `${circle.color}15`, color: circle.color }}>
                      <IconComp size={24} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(circle)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                        title={t('admin.editGroup', 'Edit Group')}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(circle)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title={t('admin.deleteGroup', 'Delete Group')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-800">{circle.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">{circle.description || 'No description added'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">👥 {circle.memberCount} Members</span>
                    <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">💬 {circle.messageCount} Messages</span>
                  </div>

                  <button
                    onClick={() => handleOpenChatModal(circle)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#ff69b4] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <MessageSquare size={13} /> {t('admin.readChat', 'Read Chat')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE GROUP MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-800">{t('admin.createNewCircle', 'Create Community Circle')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.groupName', 'Group Name')}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wellness Warriors"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.groupDescription', 'Group Description')}</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Safe space for sharing wellness and health goals..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.selectIcon', 'Select Icon')}</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 max-h-36 overflow-y-auto p-1 bg-slate-50 border rounded-2xl">
                  {iconOptions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={item.label}
                        onClick={() => setFormData(prev => ({ ...prev, icon: item.id }))}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                          formData.icon === item.id 
                            ? 'border-[#ff69b4] bg-pink-50 text-[#ff69b4] shadow-sm scale-105'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.accentColor', 'Accent Color')}</label>
                <div className="flex items-center gap-2 pt-1">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        formData.color === c ? 'ring-2 ring-slate-800 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ background: c }}
                    >
                      {formData.color === c && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold uppercase text-slate-500 hover:bg-slate-50"
                >
                  {t('admin.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#ff69b4] hover:bg-pink-600 text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : t('admin.createGroupBtn', 'Create Group')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT GROUP MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-800">{t('admin.updateCircle', 'Edit Community Circle')}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.groupName', 'Group Name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.groupDescription', 'Group Description')}</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-semibold outline-none focus:border-[#ff69b4] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.selectIcon', 'Select Icon')}</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 max-h-36 overflow-y-auto p-1 bg-slate-50 border rounded-2xl">
                  {iconOptions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        title={item.label}
                        onClick={() => setFormData(prev => ({ ...prev, icon: item.id }))}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                          formData.icon === item.id 
                            ? 'border-[#ff69b4] bg-pink-50 text-[#ff69b4] shadow-sm scale-105'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">{t('admin.accentColor', 'Accent Color')}</label>
                <div className="flex items-center gap-2 pt-1">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        formData.color === c ? 'ring-2 ring-slate-800 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ background: c }}
                    >
                      {formData.color === c && <Check size={12} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-bold uppercase text-slate-500 hover:bg-slate-50"
                >
                  {t('admin.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#ff69b4] text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : t('admin.saveChanges', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200 text-left">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-800">{t('admin.deleteCircleTitle', 'Delete Community Circle')}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Are you sure you want to delete <span className="font-bold text-slate-800">"{selectedCircle?.name}"</span>? All messages and membership data inside will be removed.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl border text-xs font-bold uppercase text-slate-500 hover:bg-slate-50"
              >
                {t('admin.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : t('admin.deleteConfirm', 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT MONITOR & MEMBER OVERSIGHT MODAL ── */}
      {showChatModal && selectedCircle && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-24 pb-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl border border-black/5 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col overflow-hidden my-auto text-left">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-pink-50 text-[#ff69b4] text-[9px] font-black uppercase tracking-widest rounded-md">
                  Admin Inspection Mode
                </span>
                <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1">{selectedCircle.name}</h2>
                <p className="text-[11px] font-semibold text-slate-400">{selectedCircle.description}</p>
              </div>

              <button 
                onClick={() => setShowChatModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs Bar */}
            <div className="flex border-b border-slate-100 bg-slate-50/30 text-xs font-bold uppercase tracking-wider text-slate-500">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'chat' ? 'border-[#ff69b4] text-[#ff69b4]' : 'border-transparent hover:text-slate-800'
                }`}
              >
                💬 Chat History ({circleMessages.length})
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-3 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'members' ? 'border-[#ff69b4] text-[#ff69b4]' : 'border-transparent hover:text-slate-800'
                }`}
              >
                👥 Group Members ({circleMembers.length})
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {isChatLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-8 h-8 border-4 border-pink-100 border-t-[#ff69b4] animate-spin rounded-full mx-auto mb-2"></div>
                  <span className="text-xs font-bold uppercase">{t('admin.loadingChat', 'Loading messages...')}</span>
                </div>
              ) : activeTab === 'chat' ? (
                circleMessages.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 space-y-1">
                    <MessageSquare size={36} className="mx-auto text-slate-300" />
                    <p className="text-xs font-bold">No messages logged in this group chat yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {circleMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          msg.isBlocked ? 'bg-red-50/60 border-red-200' : 'bg-white border-slate-100 shadow-sm'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{msg.senderName}</span>
                            {msg.isAnonymous && (
                              <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                                Anonymous Flag
                              </span>
                            )}
                            {msg.isBlocked && (
                              <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-0.5">
                                <Lock size={10} /> Blocked Member
                              </span>
                            )}
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium">{msg.message}</p>
                        </div>

                        <button
                          onClick={() => handleToggleBlockMember(msg.userId, msg.isBlocked)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer ${
                            msg.isBlocked
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                              : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                          }`}
                        >
                          {msg.isBlocked ? (
                            <><UserCheck size={12} /> Unblock Member</>
                          ) : (
                            <><UserX size={12} /> Block Member</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Members Tab */
                circleMembers.length === 0 ? (
                  <div className="py-16 text-center text-slate-400">
                    <Users size={36} className="mx-auto text-slate-300" />
                    <p className="text-xs font-bold mt-2">No members registered in this group yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {circleMembers.map((m) => (
                      <div 
                        key={m.userId}
                        className="p-3.5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-slate-800">{m.fullName}</h4>
                          <p className="text-[10px] text-slate-400">{m.email || 'No email registered'}</p>
                        </div>

                        <button
                          onClick={() => handleToggleBlockMember(m.userId, m.isBlocked)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            m.isBlocked
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                              : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                          }`}
                        >
                          {m.isBlocked ? (
                            <><UserCheck size={12} /> Unblock</>
                          ) : (
                            <><UserX size={12} /> Block</>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10100] bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10">
            <Check size={16} className="text-[#ff69b4]" />
            <span className="text-xs font-bold uppercase tracking-wider">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CommunityManagement;
