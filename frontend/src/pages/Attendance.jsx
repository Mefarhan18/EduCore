import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Calendar, Percent, CheckCircle, XCircle } from 'lucide-react';
import { attendanceApi, studentsApi } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AttendanceChart from '../components/charts/AttendanceChart';
import { motion } from 'framer-motion';

export default function Attendance() {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals and Forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    date: '',
    status: 'PRESENT'
  });
  
  // Bulk marking
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStatus, setBulkStatus] = useState({});

  // Filtering
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (students.length > 0) {
      const initial = {};
      students.forEach(s => initial[s.id] = 'PRESENT');
      setBulkStatus(initial);
    }
  }, [students]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user?.role === 'ROLE_STUDENT') {
        const attendanceData = await attendanceApi.getMe();
        setAttendances(attendanceData);
        setStudents([]);
      } else {
        const [attendanceData, studentsData] = await Promise.all([
          attendanceApi.getAll(),
          studentsApi.getAll()
        ]);
        setAttendances(attendanceData);
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

  // Filter and compute statistics
  const filteredAttendances = useMemo(() => {
    if (!filterMonth) return attendances;
    return attendances.filter(record => record.date && record.date.startsWith(filterMonth));
  }, [attendances, filterMonth]);

  const stats = useMemo(() => {
    const total = filteredAttendances.length;
    const present = filteredAttendances.filter(a => a.status === 'PRESENT').length;
    const absent = filteredAttendances.filter(a => a.status === 'ABSENT').length;
    const late = filteredAttendances.filter(a => a.status === 'LATE').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, percentage };
  }, [filteredAttendances]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Attendance</h1>
        <div className="flex items-center gap-4">
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-xl bg-white/60 backdrop-blur-xl border border-indigo-100 p-2.5 shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900"
          />
          {user?.role !== 'ROLE_STUDENT' && user?.role !== 'ROLE_PARENT' && (
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200 font-medium"
            >
              <Plus className="w-5 h-5" /> Add Individual
            </button>
          )}
        </div>
      </div>

      {/* Analytics Summary */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-6 border border-white/50 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg text-white">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-indigo-900/60 text-xs font-bold uppercase tracking-wider">Total Days</p>
            <p className="text-2xl font-extrabold text-indigo-900 mt-1">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-6 border border-white/50 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-indigo-900/60 text-xs font-bold uppercase tracking-wider">Present</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.present + stats.late}</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-6 border border-white/50 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl shadow-lg text-white">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-indigo-900/60 text-xs font-bold uppercase tracking-wider">Absent</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{stats.absent}</p>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-6 border border-white/50 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl shadow-lg text-white">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-indigo-900/60 text-xs font-bold uppercase tracking-wider">Attendance Rate</p>
            <p className="text-2xl font-extrabold text-indigo-900 mt-1">{stats.percentage}%</p>
          </div>
        </div>
      </motion.div>

      {/* Charts & Bulk Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <AttendanceChart attendance={filteredAttendances} />
          </motion.div>
        </div>

        {/* Bulk Marking Section */}
        {user?.role !== 'ROLE_STUDENT' && user?.role !== 'ROLE_PARENT' && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 p-6 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-indigo-100 flex flex-col h-[350px]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-indigo-900">Mark Daily Attendance (Bulk)</h2>
              <div className="flex gap-4 items-center">
                <input 
                  type="date" 
                  value={bulkDate}
                  onChange={(e) => setBulkDate(e.target.value)}
                  className="rounded-xl bg-white/50 border border-indigo-100 p-2 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button 
                  onClick={handleBulkSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Submit All
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 rounded-xl border border-indigo-50/50">
              <table className="min-w-full divide-y divide-indigo-50">
                <thead className="bg-indigo-50/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50 bg-white/30">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-indigo-50/30">
                      <td className="py-3 px-6 text-sm font-medium text-indigo-900">{s.name} ({s.rollNo})</td>
                      <td className="py-3 px-6 text-right">
                        <select 
                          value={bulkStatus[s.id] || 'PRESENT'}
                          onChange={(e) => setBulkStatus({...bulkStatus, [s.id]: e.target.value})}
                          className={`text-xs font-bold rounded-xl px-3 py-1 outline-none border-none cursor-pointer ${
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
                  {students.length === 0 && (
                     <tr><td colSpan="2" className="py-8 text-center text-indigo-400">No students available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-indigo-900">Monthly Report Records</h2>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50">
          <table className="min-w-full divide-y divide-indigo-50">
            <thead className="bg-indigo-50/50">
              <tr>
                {user?.role !== 'ROLE_STUDENT' && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Student</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Status</th>
                {user?.role !== 'ROLE_STUDENT' && user?.role !== 'ROLE_PARENT' && (
                  <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-indigo-50">
              {filteredAttendances.length > 0 ? filteredAttendances.map((record) => (
                <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                  {user?.role !== 'ROLE_STUDENT' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{record.student?.name} ({record.student?.rollNo})</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700 font-medium">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl ${
                      record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 
                      record.status === 'ABSENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  {user?.role !== 'ROLE_STUDENT' && user?.role !== 'ROLE_PARENT' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(record)} className="text-indigo-600 hover:text-indigo-900 mr-3 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={user?.role !== 'ROLE_STUDENT' && user?.role !== 'ROLE_PARENT' ? 4 : user?.role !== 'ROLE_STUDENT' ? 3 : 2} className="px-6 py-8 text-center text-indigo-400">
                    No attendance records found for this month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/50">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">{editingAttendance ? 'Edit Attendance' : 'Add Attendance'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Student</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
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
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Status</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
