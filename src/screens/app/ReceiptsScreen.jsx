import React, { useState, useEffect, useCallback } from 'react';
import { Download, ReceiptIndianRupee, RefreshCw, Loader2, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useLanguage } from '../../context/LanguageContext';

const ReceiptsScreen = () => {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null); // invoice id being downloaded

  // ─── Fetch invoices from backend ─────────────────────────────────────────────
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/subscriptions/my');
      setInvoices(res.data?.invoices || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  // ─── Status badge ─────────────────────────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      PAID:    { label: 'Paid',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle },
      PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200',       Icon: Clock },
      FAILED:  { label: 'Failed',  cls: 'bg-red-50 text-red-600 border-red-200',             Icon: XCircle },
    };
    const cfg = map[status] || map.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.cls}`}>
        <cfg.Icon size={10} />
        {cfg.label}
      </span>
    );
  };

  // ─── Download invoice as PDF ──────────────────────────────────────────────────
  const downloadInvoicePDF = async (inv) => {
    setDownloading(inv.id);
    try {
      // Fetch full invoice detail if needed
      let invoice = inv;
      try {
        const res = await axiosClient.get(`/subscriptions/invoice/${inv.id}`);
        invoice = res.data?.invoice || inv;
      } catch (_) {}

      const { default: jsPDF } = await import('jspdf');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // ── Header bar ──
      doc.setFillColor(255, 105, 180);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Health Sakhi', 15, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Payment Receipt', 15, 27);
      doc.text(`Receipt No: ${invoice.invoiceNumber || inv.id}`, 15, 34);

      // ── Body ──
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(12);

      const startY = 55;
      const lineH = 9;

      const row = (label, value, y, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(label, 15, y);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.text(String(value ?? '-'), 80, y);
      };

      row('Invoice Number',  invoice.invoiceNumber || inv.id,                                      startY);
      row('Plan',           invoice.plan?.name || invoice.planName || 'Subscription',               startY + lineH);
      row('Amount (excl. GST)', `\u20b9 ${Number(invoice.amount || 0).toLocaleString('en-IN')}`,    startY + lineH * 2);
      row('Discount',       `\u20b9 ${Number(invoice.discountAmount || 0).toLocaleString('en-IN')}`, startY + lineH * 3);
      row('GST (18%)',      `\u20b9 ${Number(invoice.tax || 0).toLocaleString('en-IN')}`,            startY + lineH * 4);
      row('Status',         invoice.status || inv.status,                                            startY + lineH * 5);
      row('Paid On',        invoice.paidAt ? new Date(invoice.paidAt).toLocaleString('en-IN') : 'N/A', startY + lineH * 6);
      row('Due Date',       invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-IN') : 'N/A', startY + lineH * 7);

      // ── Divider ──
      const divY = startY + lineH * 8 + 2;
      doc.setDrawColor(255, 105, 180);
      doc.setLineWidth(0.5);
      doc.line(15, divY, 195, divY);

      // ── Total ──
      const total = Number(invoice.amount || 0) - Number(invoice.discountAmount || 0) + Number(invoice.tax || 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 20, 147);
      doc.text('Total Paid', 15, divY + 10);
      doc.text(`\u20b9 ${total.toLocaleString('en-IN')}`, 80, divY + 10);

      // ── Footer ──
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Thank you for choosing Health Sakhi. This is a computer-generated receipt.', 15, 270);
      doc.text('For support: support@healthsakhi.com', 15, 275);

      doc.save(`HealthSakhi_Receipt_${invoice.invoiceNumber || inv.id}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-2 lg:px-0 mt-4 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#15192c]">
            {t('receipts.title', 'Payment Receipts')}
          </h1>
          <p className="text-sm font-medium text-[#9A8A8E] mt-1">
            {t('receipts.subtitle', 'All your billing receipts are available here. Download as PDF.')}
          </p>
        </div>
        <button
          onClick={loadInvoices}
          disabled={loading}
          className="p-2.5 rounded-xl bg-rose-50 text-[#ff69b4] hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={40} className="text-[#ff69b4] animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-[2rem] border border-[#F5E6EA] bg-white p-14 text-center">
          <div className="w-16 h-16 rounded-[1.5rem] bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-[#ff69b4]" />
          </div>
          <p className="text-sm font-black text-[#15192c]">
            {t('receipts.empty', 'No receipts yet')}
          </p>
          <p className="text-xs font-bold text-[#9A8A8E] mt-2">
            {t('receipts.emptyDesc', 'Receipts appear here after successful payments.')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl border border-[#F5E6EA] bg-white p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-md transition-shadow"
            >
              {/* Left info */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-[#ff69b4] shrink-0">
                  <ReceiptIndianRupee size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-[#15192c]">
                    {inv.invoiceNumber || inv.id}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(inv.status)}
                    {inv.paidAt && (
                      <span className="text-[9px] font-bold text-[#9A8A8E]">
                        {new Date(inv.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-black text-[#D17B88]">
                    ₹{Number(inv.amount || 0).toLocaleString('en-IN')}
                    {inv.discountAmount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 ml-2">
                        (- ₹{Number(inv.discountAmount).toLocaleString('en-IN')} discount)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={() => downloadInvoicePDF(inv)}
                disabled={downloading === inv.id}
                className="px-5 py-2.5 rounded-xl bg-[#ff69b4] text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shrink-0 disabled:opacity-60"
              >
                {downloading === inv.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {downloading === inv.id ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiptsScreen;
