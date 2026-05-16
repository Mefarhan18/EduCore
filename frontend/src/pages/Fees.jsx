import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CreditCard, Download, X } from 'lucide-react';
import { feesApi, studentsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Fees() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [feeToPay, setFeeToPay] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    status: 'PENDING',
    dueDate: '',
    paymentDate: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user?.role === 'ROLE_STUDENT' || user?.role === 'ROLE_PARENT') {
        const feesData = await feesApi.getMe();
        setFees(feesData);
      } else {
        const [feesData, studentsData] = await Promise.all([
          feesApi.getAll(),
          studentsApi.getAll()
        ]);
        setFees(feesData);
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student: { id: formData.studentId },
        amount: parseFloat(formData.amount),
        status: formData.status,
        dueDate: formData.dueDate || null,
        paymentDate: formData.paymentDate || null
      };
      if (editingFee) {
        await feesApi.update(editingFee.id, payload);
      } else {
        await feesApi.create(payload);
      }
      setIsModalOpen(false);
      setEditingFee(null);
      setFormData({ studentId: '', amount: '', status: 'PENDING', dueDate: '', paymentDate: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to save fee', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await feesApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete fee', error);
        alert('Failed to delete fee record.');
      }
    }
  };

  const openPayModal = (fee) => {
    setFeeToPay(fee);
    setPaymentAmount('');
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      await feesApi.pay(feeToPay.id, { amount: parseFloat(paymentAmount) });
      alert('Payment successful!');
      setIsPayModalOpen(false);
      setFeeToPay(null);
      fetchData();
    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment failed.');
    }
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingFee(record);
      setFormData({
        studentId: record.student.id,
        amount: record.amount,
        status: record.status,
        dueDate: record.dueDate || '',
        paymentDate: record.paymentDate || ''
      });
    } else {
      setEditingFee(null);
      setFormData({
        studentId: students[0]?.id || '',
        amount: '',
        status: 'PENDING',
        dueDate: '',
        paymentDate: ''
      });
    }
    setIsModalOpen(true);
  };

  const generatePDF = (record) => {
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.setTextColor(49, 46, 129);
    doc.text("Springfield High School", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(63, 81, 181);
    doc.text("Fee Payment Receipt", 105, 30, { align: "center" });

    doc.setDrawColor(224, 231, 255);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt ID: FEE-${record.id}-${new Date().getTime().toString().slice(-4)}`, 14, 45);
    doc.text(`Student Name: ${record.student?.name || 'N/A'}`, 14, 52);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 59);

    const tableColumn = ["Description", "Amount"];
    const tableRows = [
        ["Total Fee Amount", `$${record.amount}`],
        ["Amount Paid", `$${record.paidAmount || 0}`],
        ["Pending Balance", `$${record.amount - (record.paidAmount || 0)}`],
        ["Status", record.status]
    ];

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
      styles: { fontSize: 11, cellPadding: 4 }
    });

    doc.save(`Fee_Receipt_${record.id}.pdf`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Fees</h1>
        {user?.role === 'ROLE_ADMIN' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 font-medium"
          >
            <Plus className="w-5 h-5" /> Add Fee
          </motion.button>
        ) : (
          <div className="flex gap-4">
             <div className="text-indigo-800 font-medium self-center bg-white/50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                Student Account Active
             </div>
          </div>
        )}
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50"
      >
        <table className="min-w-full divide-y divide-indigo-50">
          <thead className="bg-indigo-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Total Fee</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Paid Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Pending</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-indigo-50">
            {fees.map((record) => {
              const pendingAmount = record.amount - (record.paidAmount || 0);
              return (
              <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{record.student?.name} ({record.student?.rollNo})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-bold">${record.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-bold">${record.paidAmount || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-rose-600 font-bold">${pendingAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl ${record.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                      record.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.dueDate || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user?.role === 'ROLE_ADMIN' ? (
                    <>
                      <button onClick={() => openModal(record)} className="text-indigo-600 hover:text-indigo-900 mr-3 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex justify-end gap-2">
                      {record.status !== 'PAID' && (
                        <button onClick={() => openPayModal(record)} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors font-bold flex items-center gap-1">
                          <CreditCard className="w-4 h-4" /> Pay
                        </button>
                      )}
                      {(record.status === 'PAID' || record.status === 'PARTIAL') && (
                        <button onClick={() => generatePDF(record)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors font-bold flex items-center gap-1">
                          <Download className="w-4 h-4" /> Receipt
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </motion.div>

      {/* Admin Add/Edit Fee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/50"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-900">{editingFee ? 'Edit Fee' : 'Add Fee'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-indigo-400 hover:text-indigo-600"><X className="w-6 h-6"/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Student</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                  >
                    <option value="" disabled>Select a student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Status</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Payment Date</label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-indigo-200 rounded-xl text-indigo-700 font-medium hover:bg-indigo-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Student Simulate Payment Modal */}
      {isPayModalOpen && feeToPay && (
        <div className="fixed inset-0 bg-indigo-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6"/> Simulate Payment</h2>
                <p className="text-emerald-100 mt-1">Payment Gateway Simulation</p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="text-white hover:text-emerald-200 transition-colors"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handlePaySubmit} className="p-8">
              <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
                <div className="flex justify-between mb-2">
                  <span className="text-emerald-800 font-medium">Total Fee:</span>
                  <span className="text-emerald-900 font-bold">${feeToPay.amount}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-emerald-800 font-medium">Already Paid:</span>
                  <span className="text-emerald-900 font-bold">${feeToPay.paidAmount || 0}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-200">
                  <span className="text-rose-600 font-bold">Pending Amount:</span>
                  <span className="text-rose-600 font-bold">${feeToPay.amount - (feeToPay.paidAmount || 0)}</span>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount to Pay Now</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    max={feeToPay.amount - (feeToPay.paidAmount || 0)}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-lg font-bold text-slate-800 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all shadow-xl shadow-emerald-200 flex justify-center items-center gap-2 text-lg"
              >
                <CreditCard className="w-5 h-5"/> Pay Securely
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
