import { useState, useEffect } from 'react';
import { Send, Users, User, Megaphone, Bell } from 'lucide-react';
import { usersApi, notificationsApi } from '../services/api';
import { motion } from 'framer-motion';

export default function Notifications() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetType, setTargetType] = useState('ALL_STUDENTS');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState('ANNOUNCEMENT');

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

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      let targetUserIds = [];

      if (targetType === 'ALL_STUDENTS') {
        targetUserIds = users.filter(u => u.role === 'ROLE_STUDENT').map(u => u.id);
      } else if (targetType === 'ALL_PARENTS') {
        targetUserIds = users.filter(u => u.role === 'ROLE_PARENT').map(u => u.id);
      } else if (targetType === 'ALL') {
        targetUserIds = users.filter(u => u.role !== 'ROLE_ADMIN').map(u => u.id);
      } else if (targetType === 'SPECIFIC' && selectedUserId) {
        targetUserIds = [parseInt(selectedUserId)];
      }

      if (targetUserIds.length === 0) {
        alert("No target users found.");
        return;
      }

      await notificationsApi.sendBulk({
        userIds: targetUserIds,
        title,
        message,
        type: notificationType
      });

      alert(`Successfully sent notification to ${targetUserIds.length} users!`);
      setTitle('');
      setMessage('');
      setTargetType('ALL_STUDENTS');
      setSelectedUserId('');
      
    } catch (error) {
      console.error('Failed to send notification', error);
      alert('Failed to send notification');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Send Announcements</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-8 border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <Megaphone className="w-6 h-6 text-indigo-700" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-900">Compose Message</h2>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-indigo-900 mb-2">Target Audience</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-indigo-900 font-medium"
                >
                  <option value="ALL_STUDENTS">All Students</option>
                  <option value="ALL_PARENTS">All Parents</option>
                  <option value="ALL">All Users (Students + Parents)</option>
                  <option value="SPECIFIC">Specific User</option>
                </select>
              </div>
              
              {targetType === 'SPECIFIC' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <label className="block text-sm font-bold text-indigo-900 mb-2">Select User</label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-indigo-900 font-medium"
                  >
                    <option value="" disabled>Select a user</option>
                    {users.filter(u => u.role !== 'ROLE_ADMIN').map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-indigo-900 mb-2">Message Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Important Update for Tomorrow"
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-indigo-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-indigo-900 mb-2">Message Type</label>
                <select
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-indigo-900 font-medium"
                >
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="FEES">Fees Reminder</option>
                  <option value="RESULT">Result Update</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-2">Message Body</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                rows="5"
                className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-indigo-900 font-medium resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3.5 rounded-xl flex items-center gap-2 shadow-xl shadow-indigo-200 font-bold text-lg"
              >
                <Send className="w-5 h-5" /> Broadcast Message
              </motion.button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell className="w-6 h-6"/> System Overview</h3>
            <p className="text-indigo-100 mb-6 text-sm leading-relaxed">
              Automated notifications are already running in the background for:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="font-medium text-sm">Attendance marking (Absent/Late)</span>
              </li>
              <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="font-medium text-sm">New result publications</span>
              </li>
              <li className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <span className="font-medium text-sm">New fee assignments</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-indigo-50 shadow-lg">
             <div className="flex items-center gap-3 mb-4">
                <Users className="text-indigo-500 w-5 h-5"/>
                <h3 className="font-bold text-indigo-900">User Statistics</h3>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-indigo-50">
                  <span className="text-indigo-600 font-medium">Students</span>
                  <span className="font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg">{users.filter(u => u.role === 'ROLE_STUDENT').length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-indigo-600 font-medium">Parents</span>
                  <span className="font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg">{users.filter(u => u.role === 'ROLE_PARENT').length}</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
