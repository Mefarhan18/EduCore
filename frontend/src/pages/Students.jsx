import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { studentsApi, usersApi } from '../services/api';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and Search State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    dob: '',
    contact: '',
    address: '',
    userId: ''
  });

  useEffect(() => {
    fetchStudents();
  }, [page, size, keyword]);

  // Debounced search logic could be used, or explicit search button. We'll use a timer for debounce.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setKeyword(searchInput);
      setPage(0); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [studentsData, usersData] = await Promise.all([
        studentsApi.search(page, size, keyword),
        usersApi.getAll()
      ]);
      setStudents(studentsData.content);
      setTotalPages(studentsData.totalPages);
      setTotalElements(studentsData.totalElements);
      setUsers(usersData.filter(u => u.role === 'STUDENT'));
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
        name: formData.name,
        rollNo: formData.rollNo,
        dob: formData.dob,
        contact: formData.contact,
        address: formData.address,
        user: formData.userId ? { id: formData.userId } : null
      };

      if (editingStudent) {
        await studentsApi.update(editingStudent.id, payload);
      } else {
        await studentsApi.create(payload);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ name: '', rollNo: '', dob: '', contact: '', address: '', userId: '' });
      fetchStudents();
    } catch (error) {
      console.error('Failed to save student', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsApi.delete(id);
        fetchStudents();
      } catch (error) {
        console.error('Failed to delete student', error);
        alert('Failed to delete student. It may be referenced by other records.');
      }
    }
  };

  const openModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        rollNo: student.rollNo,
        dob: student.dob || '',
        contact: student.contact || '',
        address: student.address || '',
        userId: student.user?.id || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({ name: '', rollNo: '', dob: '', contact: '', address: '', userId: '' });
    }
    setIsModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Students</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Dynamic Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
            <input 
              type="text" 
              placeholder="Search by name or roll no..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full rounded-xl bg-white/60 backdrop-blur-xl border border-indigo-100 shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900 outline-none transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg shadow-indigo-200 font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add Student
          </motion.button>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-50">
            <thead className="bg-indigo-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-indigo-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-indigo-400 font-medium">Loading...</td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-950 font-bold">{student.rollNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{student.contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{student.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openModal(student)} className="text-indigo-600 hover:text-indigo-900 mr-3 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-indigo-400 font-medium">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-indigo-50/30 px-6 py-4 border-t border-indigo-50 flex items-center justify-between">
          <div className="text-sm text-indigo-900 font-medium">
            Showing <span className="font-bold">{students.length > 0 ? page * size + 1 : 0}</span> to <span className="font-bold">{Math.min((page + 1) * size, totalElements)}</span> of <span className="font-bold">{totalElements}</span> results
          </div>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page === 0 ? 'text-indigo-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100 bg-white shadow-sm'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-indigo-900 px-4 py-2 bg-white rounded-lg shadow-sm border border-indigo-50">
              Page {page + 1} of {Math.max(1, totalPages)}
            </span>
            <button 
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page >= totalPages - 1 ? 'text-indigo-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100 bg-white shadow-sm'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/50"
          >
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Linked User Account</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  >
                    <option value="">-- No linked account --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Roll No</label>
                  <input
                    type="text"
                    required
                    value={formData.rollNo}
                    onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  />
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
    </motion.div>
  );
}
