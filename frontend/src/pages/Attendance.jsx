import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { attendanceApi, studentsApi } from '../services/api';

export default function Attendance() {
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    status: 'PRESENT'
  });
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStatus, setBulkStatus] = useState({});

  useEffect(() => {
    if (students.length > 0) {
      const initial = {};
      students.forEach(s => initial[s.id] = 'PRESENT');
      setBulkStatus(initial);
    }
  }, [students]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceData, studentsData] = await Promise.all([
        attendanceApi.getAll(),
        studentsApi.getAll()
      ]);
      setAttendances(attendanceData);
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
        date: formData.date,
        status: formData.status
      };
      if (editingAttendance) {
        await attendanceApi.update(editingAttendance.id, payload);
      } else {
        await attendanceApi.create(payload);
      }
      setIsModalOpen(false);
      setEditingAttendance(null);
      setFormData({ studentId: '', date: '', status: 'PRESENT' });
      fetchData();
    } catch (error) {
      console.error('Failed to save attendance', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await attendanceApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete attendance', error);
        alert('Failed to delete attendance record.');
      }
    }
  };

  const handleBulkSubmit = async () => {
    try {
      const promises = Object.keys(bulkStatus).map(studentId => {
        return attendanceApi.create({
          student: { id: parseInt(studentId) },
          date: bulkDate,
          status: bulkStatus[studentId]
        });
      });
      await Promise.all(promises);
      alert('Bulk attendance marked successfully!');
      fetchData();
    } catch (error) {
      console.error('Failed to save bulk attendance', error);
      alert('Failed to save some records. They might already exist for this date.');
    }
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingAttendance(record);
      setFormData({
        studentId: record.student.id,
        date: record.date,
        status: record.status
      });
    } else {
      setEditingAttendance(null);
      setFormData({ studentId: students[0]?.id || '', date: new Date().toISOString().split('T')[0], status: 'PRESENT' });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Attendance</h1>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200 font-medium"
        >
          <Plus className="w-5 h-5" /> Add Individual
        </button>
      </div>

      {/* Bulk Marking Section */}
      <div className="mb-8 p-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-indigo-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-900">Mark Daily Attendance (Bulk)</h2>
          <div className="flex gap-4 items-center">
            <input 
              type="date" 
              value={bulkDate}
              onChange={(e) => setBulkDate(e.target.value)}
              className="rounded-xl bg-white/50 border border-indigo-100 p-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={handleBulkSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Submit All
            </button>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto pr-2">
          <table className="min-w-full divide-y divide-indigo-50">
            <tbody className="divide-y divide-indigo-50">
              {students.map(s => (
                <tr key={s.id} className="hover:bg-indigo-50/30">
                  <td className="py-3 px-4 text-sm font-medium text-indigo-900">{s.name} ({s.rollNo})</td>
                  <td className="py-3 px-4 text-right">
                    <select 
                      value={bulkStatus[s.id] || 'PRESENT'}
                      onChange={(e) => setBulkStatus({...bulkStatus, [s.id]: e.target.value})}
                      className={`text-xs font-bold rounded-xl px-3 py-1 outline-none border-none ${
                        bulkStatus[s.id] === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                        bulkStatus[s.id] === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <option value="PRESENT">PRESENT</option>
                      <option value="ABSENT">ABSENT</option>
                      <option value="LATE">LATE</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-xl font-bold text-indigo-900 mb-4">Recent Records</h2>
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50">
        <table className="min-w-full divide-y divide-indigo-50">
          <thead className="bg-indigo-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-indigo-50">
            {attendances.map((record) => (
              <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{record.student?.name} ({record.student?.rollNo})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl ${
                    record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 
                    record.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
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
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">{editingAttendance ? 'Edit Attendance' : 'Add Attendance'}</h2>
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
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Status</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                  </select>
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
