import { useContext, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, GraduationCap, BookOpen } from 'lucide-react';
import MarksChart from '../components/charts/MarksChart';
import AttendanceChart from '../components/charts/AttendanceChart';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalClasses: 0 });
  const [allResults, setAllResults] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      api.get('/dashboard/admin').then((res) => {
        setStats(res.data);
      }).catch(err => console.error(err));
      
      api.get('/results').then(res => setAllResults(res.data)).catch(console.error);
      api.get('/attendance').then(res => setAllAttendance(res.data)).catch(console.error);
    }
  }, [user]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Dashboard</h1>
      </div>
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-8 mb-8 border border-white/50"
      >
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">Welcome back, {user?.username}! 👋</h2>
        <p className="text-indigo-900/60 font-medium">You are logged in as <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm ml-1">{user?.role.replace('ROLE_', '')}</span></p>
      </motion.div>

      {user?.role === 'ROLE_ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/students" className="block bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-8 flex items-center space-x-6 border border-white/50 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <p className="text-indigo-900/60 text-sm font-bold uppercase tracking-wider">Total Students</p>
                <p className="text-4xl font-extrabold text-indigo-900 mt-1">{stats.totalStudents}</p>
              </div>
            </Link>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Link to="/teachers" className="block bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-8 flex items-center space-x-6 border border-white/50 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 text-white group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <p className="text-indigo-900/60 text-sm font-bold uppercase tracking-wider">Total Teachers</p>
                <p className="text-4xl font-extrabold text-indigo-900 mt-1">{stats.totalTeachers}</p>
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <Link to="/classes" className="block bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-8 flex items-center space-x-6 border border-white/50 transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg shadow-purple-200 text-white group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <p className="text-indigo-900/60 text-sm font-bold uppercase tracking-wider">Total Classes</p>
                <p className="text-4xl font-extrabold text-indigo-900 mt-1">{stats.totalClasses}</p>
              </div>
            </Link>
          </motion.div>
        </div>
      )}

      {user?.role === 'ROLE_ADMIN' && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
        >
          <MarksChart results={allResults} />
          <AttendanceChart attendance={allAttendance} />
        </motion.div>
      )}
    </motion.div>
  );
}
