import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, PieChart, ArrowDownRight, ArrowUpRight, Plus, ShoppingCart, Home, Zap, ShieldCheck, ArrowRight, X, Sparkles, Wallet, Calendar, Trash2, Pencil, Download, CheckCircle2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
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

   const defaultBudgetLimit = 40000;

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
      
      // Dynamic budget: use the user's actual logged income as their monthly budget allowance/cap.
      // If no income has been recorded yet, fallback to default 40,000.
      const budgetCap = totalIncome > 0 ? totalIncome : defaultBudgetLimit;
      const spentPercentage = budgetCap > 0 ? Math.min(100, Math.round((totalExpenses / budgetCap) * 100)) : 0;
      const remaining = Math.max(0, budgetCap - totalExpenses);
      
      const categorySpending = expenses.reduce((acc, curr) => {
         const standardId = getCategoryIdFromDbName(curr.category, curr.type);
         const standardDbName = categoryIdToDbName[standardId] || 'Other Expenses';
         acc[standardDbName] = (acc[standardDbName] || 0) + curr.amount;
         acc[standardId] = (acc[standardId] || 0) + curr.amount;
         return acc;
      }, {});

      return { totalExpenses, totalIncome, budgetCap, spentPercentage, remaining, categorySpending };
   }, [transactions]);

   const budgetLimit = stats.budgetCap;

   const topExpenseCategory = React.useMemo(() => {
      let maxSpent = 0;
      let topCat = null;
      expenseCategories.forEach(cat => {
         const spent = stats.categorySpending[cat.id] || stats.categorySpending[categoryIdToDbName[cat.id]] || 0;
         if (spent > maxSpent) {
            maxSpent = spent;
            topCat = { ...cat, spent };
         }
      });
      return topCat;
   }, [stats.categorySpending, expenseCategories]);

   const handleAmountChange = (e) => {
      let val = e.target.value;
      if (val.includes('-')) {
         val = val.replace(/-/g, '');
      }
      if (val === '') {
         setAmount('');
         return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
         setAmount(val);
      }
   };

   const handleAddTransaction = async (e) => {
      e.preventDefault();

      if (transactionType === 'expense' && !editingId) {
         let entriesToSave = [...tempEntries];
         const parsedAmt = parseFloat(amount);
         if (amount && category && !isNaN(parsedAmt) && parsedAmt > 0) {
            entriesToSave.push({ category, amount: parsedAmt });
         }

         if (entriesToSave.length === 0) return;

         try {
            const promises = entriesToSave.map(entry => {
               const currentCategoryName = categoryIdToDbName[entry.category] || 'Other Expenses';
               const desc = note || currentCategoryName;
               const payload = {
                  category_name: currentCategoryName,
                  type: transactionType,
                  amount: Math.abs(parseFloat(entry.amount)),
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
         const parsedAmt = parseFloat(amount);
         if (isNaN(parsedAmt) || parsedAmt <= 0) return;

         const currentCategoryName = categoryIdToDbName[category] || 'Other Expenses';
         const desc = note || currentCategoryName;

         if (editingId) {
            try {
               const payload = {
                  category_name: currentCategoryName,
                  type: transactionType,
                  amount: parsedAmt,
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
                  amount: parsedAmt,
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
          const parsedAmt = parseFloat(amount);
          if (amount && !isNaN(parsedAmt) && parsedAmt > 0) {
             const targetCategory = (isCategorySelectedForCurrentEntry && category && category !== catId)
                ? category
                : catId;
             setTempEntries(prev => [...prev, { category: targetCategory, amount: parsedAmt }]);
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
                                    min="0.01"
                                    step="any"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    onKeyDown={(e) => {
                                       if (e.key === '-' || e.key === 'Subtract' || e.key === 'e' || e.key === 'E') {
                                          e.preventDefault();
                                       }
                                    }}
                                    onPaste={(e) => {
                                       const text = e.clipboardData.getData('text');
                                       if (text && (text.includes('-') || isNaN(parseFloat(text)) || parseFloat(text) <= 0)) {
                                          e.preventDefault();
                                          const clean = text.replace(/-/g, '').trim();
                                          if (clean && !isNaN(parseFloat(clean)) && parseFloat(clean) > 0) {
                                             setAmount(clean);
                                          }
                                       }
                                    }}
                                    placeholder={showOverlay ? "" : calculationPlaceholder}
                                    className="w-full bg-[#F5E6EA]/30 border-2 border-transparent focus:border-[#ff69b4]/20 rounded-[2rem] py-6 pl-12 pr-8 text-3xl font-black outline-none transition-all placeholder:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                              {amount !== '' && (!parseFloat(amount) || parseFloat(amount) <= 0) && (
                                 <p className="text-[11px] font-bold text-rose-500 px-4 flex items-center gap-1.5 animate-in fade-in duration-200">
                                    <AlertCircle size={13} className="shrink-0" />
                                    <span>{t('finance.positiveAmountRequired', 'Please enter a positive amount greater than ₹0')}</span>
                                 </p>
                              )}
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
                                    ? (tempEntries.length === 0 && (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || !category))
                                    : (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || !category)
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
               <div className="fixed inset-0 z-[20000] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setIsReportOpen(false)}
                     className="absolute inset-0 bg-[#15192c]/80 backdrop-blur-md"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 15 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 0 }}
                     transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                     className="relative w-full max-w-xl md:max-w-2xl bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[88vh] overflow-hidden"
                  >
                     {/* ── Sticky Top Header ── */}
                     <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-white via-rose-50/30 to-white border-b border-rose-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff69b4] to-[#ff1493] text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
                              <Sparkles size={20} />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">
                                    {t('finance.analysisComplete', 'AI Analysis Complete')}
                                 </span>
                                 <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
                                    {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                 </span>
                              </div>
                              <h3 className="text-xl sm:text-2xl font-black text-[#15192c] tracking-tight">
                                 {t('finance.monthlyReport', 'Monthly Financial Report')}
                              </h3>
                           </div>
                        </div>
                        <button 
                           onClick={() => setIsReportOpen(false)}
                           aria-label="Close report"
                           className="w-9 h-9 rounded-full border border-rose-100 bg-white hover:bg-rose-50 flex items-center justify-center text-[#9A8A8E] hover:text-[#ff69b4] transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                           <X size={18} />
                        </button>
                     </div>

                     {/* ── Scrollable Body ── */}
                     <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4 thin-scrollbar">
                        {/* 1. Key Metrics Strip (Inflow, Outflow, Net Balance) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                           {/* Income Card */}
                           <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F5FBF7] border border-emerald-100 flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">
                                    {t('finance.totalIncome', 'Total Income')}
                                 </span>
                                 <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <ArrowDownRight size={13} />
                                 </div>
                              </div>
                              <h4 className="text-xl sm:text-2xl font-black text-[#15192c]">
                                 ₹{stats.totalIncome.toLocaleString()}
                              </h4>
                              <p className="text-[10px] font-semibold text-emerald-600 mt-1">
                                 {t('finance.totalInflow', 'Total Inflow')}
                              </p>
                           </div>

                           {/* Expenses Card */}
                           <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FDEEF1] border border-rose-100 flex flex-col justify-between">
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-[9px] font-black uppercase tracking-wider text-[#D17B88]">
                                    {t('finance.expenses', 'Expenses')}
                                 </span>
                                 <div className="w-6 h-6 rounded-lg bg-rose-100 text-[#D17B88] flex items-center justify-center">
                                    <ArrowUpRight size={13} />
                                 </div>
                              </div>
                              <h4 className="text-xl sm:text-2xl font-black text-[#15192c]">
                                 ₹{stats.totalExpenses.toLocaleString()}
                              </h4>
                              <p className="text-[10px] font-semibold text-[#D17B88] mt-1">
                                 {stats.spentPercentage}% of {stats.totalIncome > 0 ? t('finance.income', 'income') : t('finance.limit', 'limit')}
                              </p>
                           </div>

                           {/* Net Savings Card */}
                           <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${
                              (stats.totalIncome - stats.totalExpenses) >= 0 
                                 ? 'bg-[#F5F1FE] border-purple-100' 
                                 : 'bg-amber-50/80 border-amber-200'
                           }`}>
                              <div className="flex items-center justify-between mb-2">
                                 <span className={`text-[9px] font-black uppercase tracking-wider ${
                                    (stats.totalIncome - stats.totalExpenses) >= 0 ? 'text-[#9079C1]' : 'text-amber-700'
                                 }`}>
                                    {t('finance.netSavings', 'Net Savings')}
                                 </span>
                                 <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                    (stats.totalIncome - stats.totalExpenses) >= 0 
                                       ? 'bg-purple-100 text-[#9079C1]' 
                                       : 'bg-amber-100 text-amber-700'
                                 }`}>
                                    <Wallet size={13} />
                                 </div>
                              </div>
                              <h4 className={`text-xl sm:text-2xl font-black ${
                                 (stats.totalIncome - stats.totalExpenses) >= 0 ? 'text-[#15192c]' : 'text-amber-800'
                              }`}>
                                 ₹{(stats.totalIncome - stats.totalExpenses).toLocaleString()}
                              </h4>
                              <p className={`text-[10px] font-semibold mt-1 ${
                                 (stats.totalIncome - stats.totalExpenses) >= 0 ? 'text-[#9079C1]' : 'text-amber-700'
                              }`}>
                                 {t('finance.netBalanceDesc', 'Net Account Balance')}
                              </p>
                           </div>
                        </div>

                        {/* Budget Limit Tracker Mini-bar */}
                        <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100/60">
                           <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                              <span className="text-[#6B5E63] text-[11px] flex items-center gap-1.5">
                                 <CreditCard size={13} className="text-[#ff69b4]" />
                                 {stats.totalIncome > 0 ? t('finance.monthlyIncomeCap', 'Monthly Income Cap') : t('finance.monthlyBudgetCap', 'Monthly Budget Cap')} (₹{stats.budgetCap.toLocaleString()})
                              </span>
                              <span className="text-[#15192c] font-black text-[11px]">
                                 ₹{stats.remaining.toLocaleString()} {t('finance.left', 'remaining')}
                              </span>
                           </div>
                           <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-rose-100">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${stats.spentPercentage}%` }}
                                 transition={{ duration: 0.8, ease: "easeOut" }}
                                 className={`h-full rounded-full ${stats.spentPercentage > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-[#ff69b4] to-[#ff1493]'}`}
                              />
                           </div>
                        </div>

                        {/* 2. Detailed Breakdown */}
                        <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#F5E6EA] space-y-3">
                           <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-black uppercase tracking-wider text-[#9A8A8E] flex items-center gap-1.5">
                                 <PieChart size={13} className="text-[#ff69b4]" />
                                 {t('finance.detailedBreakdown', 'Detailed Category Breakdown')}
                              </h5>
                              <span className="text-[10px] font-bold text-[#C4A0AC]">
                                 {expenseCategories.filter(cat => (stats.categorySpending[cat.id] || stats.categorySpending[categoryIdToDbName[cat.id]] || 0) > 0).length} of {expenseCategories.length} active
                              </span>
                           </div>

                           <div className="space-y-3">
                              {expenseCategories.map((cat) => {
                                 const spent = stats.categorySpending[cat.id] || stats.categorySpending[categoryIdToDbName[cat.id]] || 0;
                                 const percent = stats.totalExpenses > 0 ? Math.round((spent / stats.totalExpenses) * 100) : 0;
                                 return (
                                    <div key={cat.id} className="flex items-center gap-3">
                                       <div 
                                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs" 
                                          style={{ backgroundColor: cat.color, color: cat.text }}
                                       >
                                          <cat.icon size={15} />
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-center text-xs font-bold mb-1">
                                             <span className="text-[#15192c] truncate">{cat.label}</span>
                                             <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[#15192c] font-black">₹{spent.toLocaleString()}</span>
                                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-white border border-rose-100 text-[#9A8A8E]">
                                                   {percent}%
                                                </span>
                                             </div>
                                          </div>
                                          <div className="h-1.5 w-full bg-rose-50 rounded-full overflow-hidden">
                                             <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 0.6, ease: "easeOut" }}
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

                        {/* 3. Sakhi's AI Insights Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#15192c] via-[#241728] to-[#15192c] text-white relative overflow-hidden border border-white/10 shadow-lg">
                           <div className="absolute top-0 right-0 w-36 h-36 bg-[#ff69b4]/15 rounded-full blur-3xl pointer-events-none"></div>
                           <div className="flex items-start gap-3.5 relative z-10">
                              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 text-[#ff69b4]">
                                 <Sparkles size={18} />
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                 <div className="flex items-center justify-between flex-wrap gap-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#ff69b4]">
                                       {t('finance.sakhisInsight', "Sakhi's Financial Insight")}
                                    </p>
                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-pink-200">
                                       {(stats.totalIncome - stats.totalExpenses) >= 0 ? "✨ Healthy Cashflow" : "⚠️ Attention Needed"}
                                    </span>
                                 </div>
                                 <p className="text-xs sm:text-[13px] font-medium leading-relaxed text-slate-200">
                                    {(stats.totalIncome - stats.totalExpenses) < 0 
                                       ? t('finance.negativeBalanceTip', "Your expenses are higher than your income this month, sweetie. Let's try to focus on essential spending and bring it back to balance! 🌸") 
                                       : t('finance.underBudgetTip', "You're managing your budget wonderfully! You have plenty of room for your savings goals. Keep it up! ✨")}
                                 </p>
                                 {topExpenseCategory && topExpenseCategory.spent > 0 && (
                                    <p className="text-[11px] font-medium text-pink-200/90 pt-1.5 border-t border-white/10 flex items-center gap-1.5">
                                       <span>💡</span>
                                       <span>
                                          Top expense: <strong className="text-white font-bold">{topExpenseCategory.label}</strong> (₹{topExpenseCategory.spent.toLocaleString()}).
                                       </span>
                                    </p>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* ── Sticky Bottom Footer ── */}
                     <div className="px-5 sm:px-6 py-3.5 bg-[#FFF7F8] border-t border-rose-100 flex items-center justify-between gap-3 shrink-0">
                        <button
                           type="button"
                           onClick={() => setIsReportOpen(false)}
                           className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B5E63] hover:text-[#15192c] hover:bg-rose-100/60 transition-all cursor-pointer"
                        >
                           {t('common.close', 'Close')}
                        </button>
                        <button 
                           onClick={handleDownloadPDF}
                           disabled={isDownloading}
                           className="px-5 py-2.5 bg-gradient-to-r from-[#ff69b4] to-[#ff1493] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                           {isDownloading ? (
                              <>
                                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Sparkles size={14} />
                                 </motion.div>
                                 <span>{t('finance.preparingPdf', 'Preparing PDF...')}</span>
                              </>
                           ) : (
                              <>
                                 <Download size={14} />
                                 <span>{t('finance.downloadReport', 'Download PDF Report')}</span>
                              </>
                           )}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
             {isTipsOpen && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
                   <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsTipsOpen(false)}
                      className="absolute inset-0 bg-[#15192c]/80 backdrop-blur-md"
                   />
                   <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 0 }}
                      transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                      className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[85vh] overflow-hidden"
                   >
                      <div className="px-6 py-4 bg-gradient-to-r from-white via-rose-50/30 to-white border-b border-rose-100 flex items-center justify-between shrink-0">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff69b4] mb-1">{t('finance.smartHabits', 'Smart Habits')}</p>
                            <h3 className="text-xl sm:text-2xl font-black text-[#15192c]">{t('finance.sakhisBudgetTips', "Sakhi's Budget Tips")}</h3>
                         </div>
                         <button 
                            onClick={() => setIsTipsOpen(false)}
                            className="w-9 h-9 rounded-full border border-rose-100 bg-white hover:bg-rose-50 flex items-center justify-center text-[#9A8A8E] hover:text-[#ff69b4] transition-all cursor-pointer shadow-xs active:scale-95"
                         >
                            <X size={18} />
                         </button>
                      </div>

                      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-3 thin-scrollbar">
                         {budgetTips.map((tip) => (
                            <motion.div 
                               key={tip.id}
                               whileHover={{ x: 4 }}
                               className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50 hover:border-[#ff69b4]/30 hover:bg-rose-50/60 transition-all"
                            >
                               <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: tip.color, color: tip.text }}>
                                  <tip.icon size={18} />
                               </div>
                               <div className="min-w-0">
                                  <h4 className="text-sm font-black text-[#15192c] mb-1">{tip.title}</h4>
                                  <p className="text-[12px] leading-relaxed text-[#6B5E63] font-medium">{tip.desc}</p>
                               </div>
                            </motion.div>
                         ))}
                      </div>

                      <div className="px-6 py-3.5 bg-[#FFF7F8] border-t border-rose-100 shrink-0">
                         <button 
                            onClick={() => setIsTipsOpen(false)}
                            className="w-full py-3 bg-[#15192c] hover:bg-[#251a30] text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-md transition-all cursor-pointer active:scale-95"
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
