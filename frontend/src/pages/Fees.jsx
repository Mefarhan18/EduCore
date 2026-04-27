import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { feesApi, studentsApi } from '../services/api';

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    status: 'PENDING',
    dueDate: '',
    paymentDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [feesData, studentsData] = await Promise.all([
        feesApi.getAll(),
        studentsApi.getAll()
      ]);
      setFees(feesData);
      setStudents(studentsData);
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Fees</h1>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200 font-medium"
        >
          <Plus className="w-5 h-5" /> Add Fee
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50">
        <table className="min-w-full divide-y divide-indigo-50">
          <thead className="bg-indigo-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Payment Date</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-indigo-50">
            {fees.map((record) => (
              <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{record.student?.name} ({record.student?.rollNo})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-bold">${record.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl ${
                    record.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 
                    record.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.dueDate || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.paymentDate || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openModal(record)} className="text-indigo-600 hover:text-indigo-900 mr-3 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/50">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">{editingFee ? 'Edit Fee' : 'Add Fee'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Student</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Status</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Payment Date</label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
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
          </div>
        </div>
      )}
    </div>
  );
}
