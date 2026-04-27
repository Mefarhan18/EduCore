import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { usersApi } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'STUDENT'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, formData);
      } else {
        await usersApi.create(formData);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.delete(id);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user', error);
        alert('Failed to delete user record.');
      }
    }
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingUser(record);
      setFormData({
        username: record.username,
        password: '', // Don't prefill password for security/UI
        role: record.role
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        username: '', 
        password: '', 
        role: 'STUDENT' 
      });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">User Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg shadow-indigo-200 font-medium"
        >
          <Plus className="w-5 h-5" /> Add User
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50">
        <table className="min-w-full divide-y divide-indigo-50">
          <thead className="bg-indigo-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Username</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-indigo-50">
            {users.map((record) => (
              <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{record.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl ${
                    record.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                    record.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {record.role}
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
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">{editingUser ? 'Edit User' : 'Add User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">
                    Password {editingUser && <span className="text-xs font-normal text-indigo-500">(Leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Role</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
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
