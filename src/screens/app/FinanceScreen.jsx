import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, PieChart, ArrowDownRight, ArrowUpRight, Plus, ShoppingCart, Home, Zap, ShieldCheck, ArrowRight, X, Sparkles, Wallet, Calendar, Trash2, Pencil } from 'lucide-react';
import memberApi from '../../api/memberApi';
import { useLanguage } from '../../context/LanguageContext';

const categoryIdToDbName = {
   food: 'Food & Dining',
   home: 'Home & Rent',
   utility: 'Bills & Utilities',
   health: 'Health & Wellness',
   others: 'Other Expenses',
   salary: 'Monthly Salary',
   bonus: 'Bonus / Gift',
   other_income: 'Other Income'
};

const categoryDbNameToId = {
   'Food & Dining': 'food',
   'Home & Rent': 'home',
   'Bills & Utilities': 'utility',
   'Health & Wellness': 'health',
   'Other Expenses': 'others',
   'Monthly Salary': 'salary',
   'Bonus / Gift': 'bonus',
   'Other Income': 'other_income'
};

const getCategoryIdFromDbName = (dbName, type) => {
   if (!dbName) return type === 'income' ? 'other_income' : 'others';
   const exactMatch = categoryDbNameToId[dbName];
   if (exactMatch) return exactMatch;
   
   const lower = dbName.toLowerCase();
   if (type === 'income') {
      if (lower.includes('salary')) return 'salary';
      if (lower.includes('bonus')) return 'bonus';
      return 'other_income';
   } else {
      if (lower.includes('food') || lower.includes('grocery')) return 'food';
      if (lower.includes('rent') || lower.includes('home')) return 'home';
      if (lower.includes('bill') || lower.includes('utility')) return 'utility';
      if (lower.includes('health') || lower.includes('wellness')) return 'health';
      return 'others';
   }
};

const FinanceScreen = () => {
   const { t } = useLanguage();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [transactionType, setTransactionType] = useState('expense');
   const [amount, setAmount] = useState('');
   const [category, setCategory] = useState('');
   const [note, setNote] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [showSuccess, setShowSuccess] = useState(false);
   const [showAll, setShowAll] = useState(false);
   const [editingId, setEditingId] = useState(null);
   const [isReportOpen, setIsReportOpen] = useState(false);
   const [isTipsOpen, setIsTipsOpen] = useState(false);
   const [isDownloading, setIsDownloading] = useState(false);
   const [activeFilter, setActiveFilter] = useState('all');
   const [tempEntries, setTempEntries] = useState([]);
   const [isCategorySelectedForCurrentEntry, setIsCategorySelectedForCurrentEntry] = useState(false);
   const inputRef = React.useRef(null);

   const budgetLimit = 40000;

   const budgetTips = [
      { id: 1, title: t('finance.tips.tip1.title', "The 50/30/20 Strategy"), desc: t('finance.tips.tip1.desc', "For a balanced life, sweetie, use 50% of income for needs (rent, bills), 30% for wants (dining, fun), and save 20% immediately for your bright future! 🌸"), icon: PieChart, color: '#FDEEF1', text: '#D17B88' },
      { id: 2, title: t('finance.tips.tip2.title', "Automate Monthly Savings"), desc: t('finance.tips.tip2.desc', "Don't wait to save what's left! Set up a small automatic transfer on payday. Even 500-1000 rupees a month builds a beautiful habit over time. ✨"), icon: Zap, color: '#F5F1FE', text: '#9079C1' },
      { id: 3, title: t('finance.tips.tip3.title', "Build an Emergency Fund"), desc: t('finance.tips.tip3.desc', "Life is full of surprises! Aim to keep 3 to 6 months of basic expenses in a 'Sakhi Fund'. It's your financial safety net for healthcare or sudden needs. 🏥"), icon: Wallet, color: '#FFF9EE', text: '#CCAA3D' },
      { id: 4, title: t('finance.tips.tip4.title', "The 24-Hour Purchase Rule"), desc: t('finance.tips.tip4.desc', "Seen something pretty online? Wait 24 hours before buying! If you still want it tomorrow, it's a choice, not an impulse. Your bank balance will thank you! 🛍️"), icon: CreditCard, color: '#FDEEF1', text: '#D17B88' }
   ];

   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);

   const fetchTransactions = async () => {
      try {
         setLoading(true);
         const res = await memberApi.getTransactions();
         if (res.success && res.transactions) {
            const mapped = res.transactions.map(t => {
               const catId = getCategoryIdFromDbName(t.category, t.type);
               
               return {
                  id: t.id,
                  title: t.description || t.category,
                  amount: t.amount,
                  date: new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                  type: t.type,
                  category: t.category,
                  categoryId: catId
               };
            });
            setTransactions(mapped);
         }
      } catch (err) {
         console.error("Error loading transactions:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchTransactions();
   }, []);

   const expenseCategories = [
      { id: 'food', label: t('finance.categories.food', 'Food & Dining'), icon: ShoppingCart, color: '#FDEEF1', text: '#D17B88' },
      { id: 'home', label: t('finance.categories.home', 'Home & Rent'), icon: Home, color: '#F5F1FE', text: '#9079C1' },
      { id: 'utility', label: t('finance.categories.utility', 'Bills & Utilities'), icon: Zap, color: '#FFF9EE', text: '#CCAA3D' },
      { id: 'health', label: t('finance.categories.health', 'Health & Wellness'), icon: ShieldCheck, color: '#EBF7F2', text: '#3E8E75' },
      { id: 'others', label: t('finance.categories.others', 'Other Expenses'), icon: Wallet, color: '#F8F9FA', text: '#6C757D' }
   ];

   const incomeCategories = [
      { id: 'salary', label: t('finance.categories.salary', 'Monthly Salary'), icon: Wallet, color: '#EBF7F2', text: '#3E8E75' },
      { id: 'bonus', label: t('finance.categories.bonus', 'Bonus / Gift'), icon: Sparkles, color: '#FFF9EE', text: '#CCAA3D' },
      { id: 'other_income', label: t('finance.categories.other_income', 'Other Income'), icon: Plus, color: '#F5F1FE', text: '#9079C1' }
   ];

   const categories = [...expenseCategories, ...incomeCategories];
   const currentCategories = transactionType === 'expense' ? expenseCategories : incomeCategories;

   const categoryMap = categories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {});

   const runningSum = tempEntries.reduce((sum, entry) => sum + entry.amount, 0);
   const calculationPlaceholder = transactionType === 'expense' && !editingId && tempEntries.length > 0
      ? `${tempEntries.map(e => `₹${e.amount}`).join(' + ')} = ₹${runningSum}`
      : "0,00";
   const showOverlay = transactionType === 'expense' && !editingId && tempEntries.length > 0 && amount === '';

   const stats = React.useMemo(() => {
      const expenses = transactions.filter(t => t.type === 'expense');
      const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
      const spentPercentage = Math.min(100, Math.round((totalExpenses / budgetLimit) * 100));
      const remaining = Math.max(0, budgetLimit - totalExpenses);
      
      const categorySpending = expenses.reduce((acc, curr) => {
         const standardId = getCategoryIdFromDbName(curr.category, curr.type);
         const standardDbName = categoryIdToDbName[standardId] || 'Other Expenses';
         acc[standardDbName] = (acc[standardDbName] || 0) + curr.amount;
         return acc;
      }, {});

      return { totalExpenses, totalIncome, spentPercentage, remaining, categorySpending };
   }, [transactions]);

   const handleAddTransaction = async (e) => {
      e.preventDefault();

      if (transactionType === 'expense' && !editingId) {
         let entriesToSave = [...tempEntries];
         if (amount && category && !isNaN(parseFloat(amount))) {
            entriesToSave.push({ category, amount: parseFloat(amount) });
         }

         if (entriesToSave.length === 0) return;

         try {
            const promises = entriesToSave.map(entry => {
               const currentCategoryName = categoryIdToDbName[entry.category] || 'Other Expenses';
               const desc = note || currentCategoryName;
               const payload = {
                  category_name: currentCategoryName,
                  type: transactionType,
                  amount: parseFloat(entry.amount),
                  description: desc,
                  transaction_date: new Date().toISOString()
               };
               return memberApi.createTransaction(payload);
            });

            const results = await Promise.all(promises);
            if (results.some(res => res.success)) {
               await fetchTransactions();
            }
         } catch (err) {
            console.error("Error creating transactions:", err);
         }

         setIsModalOpen(false);
         setAmount('');
         setCategory('');
         setNote('');
         setTempEntries([]);
      } else {
         if (!amount || !category) return;

         const currentCategoryName = categoryIdToDbName[category] || 'Other Expenses';
         const desc = note || currentCategoryName;

         if (editingId) {
            try {
               const payload = {
                  category_name: currentCategoryName,
                  type: transactionType,
                  amount: parseFloat(amount),
                  description: desc,
                  transaction_date: new Date().toISOString()
               };
               const res = await memberApi.updateTransaction(editingId, payload);
               if (res.success) {
                  await fetchTransactions();
               }
            } catch (err) {
               console.error("Error updating transaction:", err);
            }
            setEditingId(null);
         } else {
            try {
               const payload = {
                  category_name: currentCategoryName,
                  type: transactionType,
                  amount: parseFloat(amount),
                  description: desc,
                  transaction_date: new Date().toISOString()
               };
               const res = await memberApi.createTransaction(payload);
               if (res.success) {
                  await fetchTransactions();
               }
            } catch (err) {
               console.error("Error creating transaction:", err);
            }
         }

         setIsModalOpen(false);
         setAmount('');
         setCategory('');
         setNote('');
      }
   };

    const handleCategoryClick = (catId) => {
       if (transactionType === 'expense' && !editingId) {
          if (amount && !isNaN(parseFloat(amount))) {
             const targetCategory = (isCategorySelectedForCurrentEntry && category && category !== catId)
                ? category
                : catId;
             setTempEntries(prev => [...prev, { category: targetCategory, amount: parseFloat(amount) }]);
             setAmount('');
             setCategory(catId);
          } else {
             setCategory(catId);
             setIsCategorySelectedForCurrentEntry(true);
          }
       } else {
          setCategory(catId);
       }
    };

    const openEditModal = (t) => {
       setTransactionType(t.type);
       setAmount(t.amount.toString());
       setCategory(t.categoryId);
       setNote(t.title === categoryMap[t.categoryId]?.label ? '' : t.title);
       setEditingId(t.id);
       setTempEntries([]);
       setIsCategorySelectedForCurrentEntry(false);
       setIsModalOpen(true);
    };

   const deleteTransaction = async (id) => {
      try {
         const res = await memberApi.deleteTransaction(id);
         if (res.success) {
            await fetchTransactions();
         }
      } catch (err) {
         console.error("Error deleting transaction:", err);
      }
   };

   const handleGenerateReport = () => {
      setIsGenerating(true);
      setTimeout(() => {
         setIsGenerating(false);
         setIsReportOpen(true);
      }, 2000);
   };

   const handleDownloadPDF = async () => {
      setIsDownloading(true);
      try {
         await memberApi.exportFinanceReport();

         const { default: jsPDF } = await import('jspdf');
         const { default: autoTable } = await import('jspdf-autotable');
         const doc = new jsPDF();
         const timestamp = new Date().toLocaleString();

         doc.setFontSize(22);
         doc.setTextColor(45, 21, 32);
         doc.text(t('finance.pdf.title', "Home Budget Sakhi - Financial Report"), 14, 22);
         
         doc.setFontSize(10);
         doc.setTextColor(196, 160, 172);
         doc.text(`${t('finance.pdf.generatedOn', 'Generated on')}: ${timestamp}`, 14, 30);

         doc.setFontSize(14);
         doc.setTextColor(45, 21, 32);
         doc.text(t('finance.pdf.executiveSummary', "Executive Summary"), 14, 45);

         const summaryData = [
            [t('finance.pdf.totalIncome', "Total Income"), `INR ${stats.totalIncome.toLocaleString()}`],
            [t('finance.pdf.totalExpenses', "Total Expenses"), `INR ${stats.totalExpenses.toLocaleString()}`],
            [t('finance.pdf.netSavings', "Net Savings"), `INR ${(stats.totalIncome - stats.totalExpenses).toLocaleString()}`]
         ];

         autoTable(doc, {
            startY: 50,
            head: [[t('finance.pdf.metric', 'Metric'), t('finance.pdf.value', 'Value')]],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: [255, 105, 180] }
         });

         doc.text(t('finance.pdf.categoryBreakdown', "Category Breakdown"), 14, doc.lastAutoTable.finalY + 15);

         const categoryData = expenseCategories.map(cat => [
            cat.label,
            `INR ${(stats.categorySpending[categoryIdToDbName[cat.id]] || 0).toLocaleString()}`
         ]);

         autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [[t('finance.pdf.category', 'Category'), t('finance.pdf.amountSpent', 'Amount Spent')]],
            body: categoryData,
            theme: 'grid',
            headStyles: { fillColor: [144, 121, 193] }
         });

         doc.text(t('finance.pdf.recentActivity', "Recent Activity"), 14, doc.lastAutoTable.finalY + 15);

         const transactionData = transactions.map(t => [
            t.date,
            t.title,
            categoryMap[t.categoryId]?.label || 'Other',
            t.type === 'expense' ? `-${t.amount}` : `+${t.amount}`
         ]);

         autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 20,
            head: [[t('finance.pdf.date', 'Date'), t('finance.pdf.description', 'Description'), t('finance.pdf.categoryCol', 'Category'), t('finance.pdf.amountInr', 'Amount (INR)')]],
            body: transactionData,
            theme: 'plain',
            headStyles: { fillColor: [45, 21, 32], textColor: [255, 255, 255] }
         });

         doc.setFontSize(8);
         doc.setTextColor(150);
         doc.text(t('finance.pdf.footer', "A smart companion for your financial wellness. Powered by Health Sakhi."), 14, doc.internal.pageSize.height - 10);

         doc.save("Sakhi_Financial_Report.pdf");
      } catch (error) {
         console.error("PDF Export failed:", error);
         const errorMsg = error.response?.data?.message || t('finance.pdf.errorMsg', "Statement and ledger export PDF downloads are blocked on the Free tier. Upgrade to Premium Pro to download reports.");
         alert(errorMsg);
      } finally {
         setIsDownloading(false);
      }
   };

   const container = {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.1 } }
   };

   const item = {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
   };

   return (
      <>
         <style>{`
            .no-scrollbar::-webkit-scrollbar {
               display: none;
            }
            .no-scrollbar {
               -ms-overflow-style: none;
               scrollbar-width: none;
            }
         `}</style>
         <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full pb-20 px-4 pt-8"
         >
            <motion.section variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
               <div className="space-y-1">
                  <h2 className="text-4xl font-black tracking-tight" style={{ color: '#15192c' }}>{t('finance.homeBudgetSakhi', 'Home Budget Sakhi')} 🏠</h2>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: '#C4A0AC' }}>{t('finance.financeCompanion', 'Smart Financial Companion')}</span>
               </div>
               <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-8 py-4 bg-[#ff69b4] text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 transition-all group"
               >
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" /> {t('finance.addTransaction', 'Add with Sakhi')}
               </button>
            </motion.section>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-[#15192c] text-white relative overflow-hidden group shadow-xl flex flex-col justify-between min-h-[160px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff69b4]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff69b4] mb-3">{t('finance.totalBalance', 'Total Balance')}</p>
                           <h3 className="text-2xl md:text-3xl font-black tracking-tight">₹{(stats.totalIncome - stats.totalExpenses).toLocaleString()}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 mt-4">
                           <Wallet size={14} /> {t('finance.netSavings', 'Net Savings')}
                        </div>
                     </motion.div>

                     <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-white border border-[#F5E6EA] shadow-sm flex flex-col justify-between min-h-[160px]">
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C4A0AC] mb-3">{t('finance.totalIncome', 'Total Income')}</p>
                           <h3 className="text-2xl md:text-3xl font-black tracking-tight text-emerald-500">₹{stats.totalIncome.toLocaleString()}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 mt-4">
                           <ArrowUpRight size={14} /> {t('finance.incomeAdded', 'Inflow')}
                        </div>
                     </motion.div>

                     <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-white border border-[#F5E6EA] shadow-sm flex flex-col justify-between min-h-[160px]">
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C4A0AC] mb-3">{t('finance.totalExpense', 'Total Expense')}</p>
                           <h3 className="text-2xl md:text-3xl font-black tracking-tight text-rose-500">₹{stats.totalExpenses.toLocaleString()}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 mt-4">
                           <ArrowDownRight size={14} /> {t('finance.expenseAdded', 'Outflow')}
                        </div>
                     </motion.div>
                  </div>

                  <motion.section variants={item}>
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#C4A0AC' }}>{t('finance.householdActivity', 'Household Activity')}</h3>
                        <div className="flex bg-rose-50/50 p-1 rounded-full border border-rose-100">
                           {['all', 'expense', 'income'].map((f) => (
                              <button
                                 key={f}
                                 onClick={() => setActiveFilter(f)}
                                 className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-[#ff69b4] text-white shadow-md' : 'text-[#D17B88] hover:bg-rose-100/50'}`}
                              >
                                 {t(`finance.${f}`, f)}
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="bg-white rounded-[3rem] border border-[#F5E6EA] overflow-hidden shadow-sm">
                        <div className="p-8 space-y-2">
                           <AnimatePresence mode="popLayout">
                              {transactions
                                 .filter(t => activeFilter === 'all' || t.type === activeFilter)
                                 .slice(0, showAll ? transactions.length : 4)
                                 .map((t) => {
                                 const cat = categoryMap[t.categoryId] || categories[0];
                                 return (
                                    <motion.div 
                                       layout
                                       initial={{ opacity: 0, x: -10 }}
                                       animate={{ opacity: 1, x: 0 }}
                                       key={t.id} 
                                       className="flex items-center justify-between group cursor-pointer hover:bg-rose-50/30 p-4 rounded-2xl transition-all"
                                    >
                                       <div className="flex items-center gap-5">
                                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: cat.color, color: cat.text }}>
                                             <cat.icon size={22} />
                                          </div>
                                          <div>
                                             <h4 className="text-[13px] font-black" style={{ color: '#15192c' }}>{t.title}</h4>
                                             <span className="text-[9px] font-bold text-[#C4A0AC] uppercase">{t.date}</span>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          <div className="text-right">
                                             <p className={`text-sm font-black ${t.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                                             </p>
                                             <span className="text-[8px] font-black uppercase text-[#C4A0AC]">{cat.label}</span>
                                          </div>
                                          <div className="flex items-center gap-2 transition-opacity">
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); openEditModal(t); }} 
                                                className="p-2 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-full transition-colors"
                                             >
                                                <Pencil size={14} />
                                             </button>
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id); }} 
                                                className="p-2 bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white rounded-full transition-colors"
                                             >
                                                <Trash2 size={14} />
                                             </button>
                                          </div>
                                       </div>
                                    </motion.div>
                                 );
                              })}
                           </AnimatePresence>
                        </div>
                        <div className="bg-rose-50/50 p-6 border-t border-[#F5E6EA] text-center">
                           <button 
                              onClick={() => setShowAll(!showAll)}
                              className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:underline"
                           >
                              {showAll ? t('finance.showRecentOnly', 'Show Recent Only') : t('finance.viewAll', 'View All Transactions')}
                           </button>
                        </div>
                     </div>
                  </motion.section>
               </div>

               <div className="lg:col-span-4 space-y-10">
                  <motion.div variants={item} className="p-8 bg-white rounded-[3rem] border border-[#F5E6EA] shadow-sm">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C4A0AC] mb-6">{t('finance.spendingAnalysis', 'Spending Analysis')}</h3>
                     <div className="space-y-6">
                        {expenseCategories.map((cat, i) => {
                           const dbName = categoryIdToDbName[cat.id] || 'Other Expenses';
                           const spent = stats.categorySpending[dbName] || 0;
                           const percent = stats.totalExpenses > 0 ? Math.round((spent / stats.totalExpenses) * 100) : 0;
                           return (
                              <div key={i}>
                                 <div className="flex justify-between text-[11px] font-black mb-1">
                                    <span style={{ color: '#6B5E63' }}>{cat.label}</span>
                                    <span style={{ color: '#15192c' }}>₹{spent.toLocaleString()}</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                                    <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${percent}%` }}
                                       className="h-full rounded-full" 
                                       style={{ backgroundColor: cat.text }}
                                    ></motion.div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                     <button 
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                        className={`w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all mt-8 ${showSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-[#FDEEF1] text-[#D17B88] hover:brightness-95'}`}
                     >
                        {isGenerating ? (
                           <span className="flex items-center justify-center gap-2">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                 <Sparkles size={14} />
                               </motion.div>
                               {t('finance.generatingReport', 'Analyzing transactions...')}
                           </span>
                        ) : showSuccess ? t('finance.reportGenerated', 'Report Generated! ✨') : t('finance.generateReport', 'Generate Monthly Report')}
                     </button>
                  </motion.div>

                  <motion.div variants={item} className="p-10 rounded-[3.5rem] bg-gradient-to-br from-[#15192c] to-[#4A2535] text-white shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                     <CreditCard size={32} className="text-[#ff69b4] mb-6" />
                     <h3 className="text-xl font-black mb-4 tracking-tight leading-tight">{t('finance.tipHeader', 'Save intelligently, spend mindfully.')}</h3>
                     <p className="text-[13px] text-white/50 mb-8 leading-relaxed font-medium italic">
                        "{t('finance.tipDesc', 'A small leak will sink a great ship. Track your small expenses.')}"
                     </p>
                      <button 
                         onClick={() => setIsTipsOpen(true)}
                         className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#ff69b4] hover:brightness-110 transition-all"
                      >
                         {t('finance.budgetTips', 'Home Budget Tips')} <ArrowRight size={14} />
                      </button>
                  </motion.div>
               </div>
            </main>
         </motion.div>

         <AnimatePresence>
            {isModalOpen && (
               <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => {
                        setIsModalOpen(false);
                        setEditingId(null);
                        setAmount('');
                        setCategory('');
                        setNote('');
                        setTempEntries([]);
                     }}
                     className="absolute inset-0 bg-[#15192c]/60 backdrop-blur-md"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
                     className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl max-h-[92vh] flex flex-col overflow-y-auto custom-user-scrollbar"
                  >
                     <div className="p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-[#FDEEF1] flex items-center justify-center text-[#ff69b4] shrink-0">
                                 <Sparkles size={20} />
                              </div>
                              <h3 className="text-xl font-black text-[#15192c]">{editingId ? t('finance.updateTransaction', 'Update Transaction') : t('finance.logWithSakhi', 'Log with Sakhi')}</h3>
                           </div>
                           <button 
                              type="button"
                              onClick={() => {
                                 setIsModalOpen(false);
                                 setEditingId(null);
                                 setAmount('');
                                 setCategory('');
                                 setNote('');
                                 setTempEntries([]);
                                 setIsCategorySelectedForCurrentEntry(false);
                              }} 
                              className="w-9 h-9 rounded-full border border-[#F5E6EA] flex items-center justify-center text-[#C4A0AC] hover:bg-[#FDEEF1] hover:text-[#ff69b4] transition-all z-50 shrink-0"
                           >
                              <X size={18} />
                           </button>
                        </div>
                           
                        <form onSubmit={handleAddTransaction} className="space-y-5">
                           <div className="flex bg-[#FDEEF1] p-1.5 rounded-[2rem]">
                              <button 
                                 type="button"
                                 onClick={() => {
                                    setTransactionType('expense');
                                    setAmount('');
                                    setCategory('');
                                    setTempEntries([]);
                                    setIsCategorySelectedForCurrentEntry(false);
                                 }}
                                 className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${transactionType === 'expense' ? 'bg-white text-[#ff69b4] shadow-sm' : 'text-[#D17B88]'}`}
                              >
                                 {t('finance.expense', 'Expense')}
                              </button>
                              <button 
                                 type="button"
                                 onClick={() => {
                                    setTransactionType('income');
                                    setAmount('');
                                    setCategory('');
                                    setTempEntries([]);
                                    setIsCategorySelectedForCurrentEntry(false);
                                 }}
                                 className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${transactionType === 'income' ? 'bg-white text-[#ff69b4] shadow-sm' : 'text-[#D17B88]'}`}
                              >
                                 {t('finance.income', 'Income')}
                              </button>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4A0AC] px-4">{t('finance.amountLabel', 'Amount (₹)')}</label>
                              <div className="relative">
                                 <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-[#15192c] z-10 pointer-events-none">₹</div>
                                 <input 
                                    ref={inputRef}
                                    autoFocus
                                    type="number" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={showOverlay ? "" : calculationPlaceholder}
                                    className="w-full bg-[#F5E6EA]/30 border-2 border-transparent focus:border-[#ff69b4]/20 rounded-[2rem] py-6 pl-12 pr-8 text-3xl font-black outline-none transition-all placeholder:opacity-50"
                                 />
                                 {showOverlay && (
                                    <div 
                                       onClick={() => inputRef.current?.focus()}
                                       className="absolute left-12 right-16 top-0 bottom-0 flex items-center text-3xl font-black text-[#15192c]/50 overflow-x-auto whitespace-nowrap no-scrollbar cursor-text select-none"
                                       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                       {calculationPlaceholder}
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4A0AC] px-4">
                                 {transactionType === 'expense' ? t('finance.category', 'Category') : t('finance.source', 'Source')}
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                 {currentCategories.map((cat) => (
                                    <button 
                                       key={cat.id}
                                       type="button"
                                       onClick={() => handleCategoryClick(cat.id)}
                                       className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${category === cat.id ? 'border-[#ff69b4] bg-[#ff69b4]/5' : 'border-[#F5E6EA] hover:border-[#ff69b4]/30'}`}
                                    >
                                       <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color, color: cat.text }}>
                                          <cat.icon size={18} />
                                       </div>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-[#15192c]">{cat.label}</span>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C4A0AC] px-4">{t('finance.noteLabel', 'Note (Optional)')}</label>
                              <input 
                                 type="text" 
                                 value={note}
                                 onChange={(e) => setNote(e.target.value)}
                                 placeholder={t('finance.notePlaceholder', 'What was this for?')}
                                 className="w-full bg-[#F5E6EA]/30 border-2 border-transparent focus:border-[#ff69b4]/20 rounded-[1.5rem] py-4 px-6 text-[12px] font-black outline-none transition-all"
                              />
                           </div>

                           <button
                              type="submit"
                              disabled={
                                 transactionType === 'expense' && !editingId
                                    ? (tempEntries.length === 0 && (!amount || !category))
                                    : (!amount || !category)
                              }
                              className="w-full h-14 bg-gradient-to-r from-[#ff69b4] to-[#ff1493] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-rose-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:shadow-none"
                           >
                              {editingId ? t('finance.update', 'Update') : t('finance.confirm', 'Confirm')} {t('finance.journeyItem', 'Journey Item')}
                           </button>
                        </form>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isReportOpen && (
               <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsReportOpen(false)}
                     className="absolute inset-0 bg-[#15192c]/80 backdrop-blur-xl"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 30 }}
                     className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar overflow-hidden"
                  >
                     <div className="p-10 md:p-14">
                        <div className="flex items-center justify-between mb-12">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff69b4] mb-2">{t('finance.analysisComplete', 'Analysis Complete')}</p>
                              <h3 className="text-3xl font-black" style={{ color: '#15192c' }}>{t('finance.monthlyReport', 'Monthly Report')}</h3>
                           </div>
                           <button 
                              onClick={() => setIsReportOpen(false)}
                              className="w-12 h-12 rounded-full border border-[#F5E6EA] flex items-center justify-center text-[#C4A0AC] hover:bg-[#FDEEF1] hover:text-[#ff69b4] transition-all"
                           >
                              <X size={24} />
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                           <div className="p-8 rounded-[2.5rem] bg-[#FDEEF1] border border-white/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#D17B88] mb-4">{t('finance.netSavings', 'Net Savings')}</p>
                              <h4 className="text-4xl font-black mb-2" style={{ color: '#15192c' }}>₹{(stats.totalIncome - stats.totalExpenses).toLocaleString()}</h4>
                              <p className="text-[11px] font-bold text-[#D17B88]">{t('finance.netBalanceDesc', 'Net Account Balance')}</p>
                           </div>
                           <div className="p-8 rounded-[2.5rem] bg-[#F5F1FE] border border-white/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#9079C1] mb-4">{t('finance.expenses', 'Expenses')}</p>
                              <h4 className="text-4xl font-black mb-2" style={{ color: '#15192c' }}>₹{stats.totalExpenses.toLocaleString()}</h4>
                              <p className="text-[11px] font-bold text-[#9079C1]">{t('finance.totalOutflow', 'Total Outflow')}</p>
                           </div>
                        </div>

                        <div className="space-y-8 mb-12">
                           <h5 className="text-[10px] font-black uppercase tracking-widest text-[#C4A0AC]">{t('finance.detailedBreakdown', 'Detailed Breakdown')}</h5>
                           <div className="space-y-6">
                              {expenseCategories.map((cat) => {
                                 const spent = stats.categorySpending[cat.id] || 0;
                                 const percent = stats.totalExpenses > 0 ? Math.round((spent / stats.totalExpenses) * 100) : 0;
                                 return (
                                    <div key={cat.id} className="flex items-center gap-6">
                                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color, color: cat.text }}>
                                          <cat.icon size={22} />
                                       </div>
                                       <div className="flex-1">
                                          <div className="flex justify-between text-xs font-black mb-2">
                                             <span style={{ color: '#15192c' }}>{cat.label}</span>
                                             <span style={{ color: '#6B5E63' }}>₹{spent.toLocaleString()} ({percent}%)</span>
                                          </div>
                                          <div className="h-2 w-full bg-rose-50 rounded-full overflow-hidden">
                                             <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                className="h-full rounded-full" 
                                                style={{ backgroundColor: cat.text }}
                                             />
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        </div>

                        <div className="p-10 rounded-[3rem] bg-[#15192c] text-white relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff69b4]/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                           <div className="flex items-start gap-5 relative z-10">
                              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                 <Sparkles className="text-[#ff69b4]" size={24} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4] mb-2">{t('finance.sakhisInsight', "Sakhi's Insight")}</p>
                                 <p className="text-sm font-medium leading-relaxed opacity-80">
                                    {(stats.totalIncome - stats.totalExpenses) < 0 
                                       ? t('finance.negativeBalanceTip', "Your expenses are higher than your income this month, sweetie. Let's try to focus on essential spending and bring it back to balance! 🌸") 
                                       : t('finance.underBudgetTip', "You're managing your budget wonderfully! You have plenty of room for your savings goals. Keep it up! ✨")}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <button 
                           onClick={handleDownloadPDF}
                           disabled={isDownloading}
                           className="w-full py-6 bg-rose-50 text-[#ff69b4] rounded-[2rem] text-xs font-bold uppercase tracking-widest mt-10 hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                        >
                           {isDownloading ? (
                              <>
                                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Sparkles size={16} />
                                 </motion.div>
                                 {t('finance.preparingPdf', 'Preparing PDF...')}
                              </>
                           ) : (
                              t('finance.downloadReport', 'Download PDF Report')
                           )}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {isTipsOpen && (
               <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsTipsOpen(false)}
                     className="absolute inset-0 bg-[#15192c]/80 backdrop-blur-xl"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 30 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 30 }}
                     className="relative w-full max-w-lg bg-white rounded-[4rem] shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
                  >
                     <div className="p-10 md:p-14">
                        <div className="flex items-center justify-between mb-10">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff69b4] mb-2">{t('finance.smartHabits', 'Smart Habits')}</p>
                              <h3 className="text-3xl font-black" style={{ color: '#15192c' }}>{t('finance.sakhisBudgetTips', "Sakhi's Budget Tips")}</h3>
                           </div>
                           <button 
                              onClick={() => setIsTipsOpen(false)}
                              className="w-12 h-12 rounded-full border border-[#F5E6EA] flex items-center justify-center text-[#C4A0AC] hover:bg-[#FDEEF1] hover:text-[#ff69b4] transition-all"
                           >
                              <X size={24} />
                           </button>
                        </div>

                        <div className="space-y-6">
                           {budgetTips.map((tip) => (
                              <motion.div 
                                 key={tip.id}
                                 whileHover={{ x: 5 }}
                                 className="flex items-start gap-5 p-6 rounded-3xl bg-rose-50/30 border border-transparent hover:border-plum-border transition-all"
                              >
                                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: tip.color, color: tip.text }}>
                                    <tip.icon size={22} />
                                 </div>
                                 <div>
                                    <h4 className="text-sm font-black mb-1" style={{ color: '#15192c' }}>{tip.title}</h4>
                                    <p className="text-[12px] leading-relaxed text-[#6B5E63] font-medium opacity-80">{tip.desc}</p>
                                 </div>
                              </motion.div>
                           ))}
                        </div>

                        <button 
                           onClick={() => setIsTipsOpen(false)}
                           className="w-full py-6 bg-[#15192c] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-2xl mt-10 hover:brightness-110 transition-all"
                        >
                           {t('finance.gotIt', 'Got it, Sakhi! 💖')}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </>
   );
};

export default FinanceScreen;
