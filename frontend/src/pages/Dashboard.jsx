import { useContext, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Users, GraduationCap, BookOpen, Wallet, Percent, Trophy, Bell } from 'lucide-react';
import MarksChart from '../components/charts/MarksChart';
import AttendanceChart from '../components/charts/AttendanceChart';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    totalTeachers: 0, 
    totalClasses: 0,
    totalFeesCollected: 0,
    totalFeesPending: 0,
    attendancePercentage: 0,
    passPercentage: 0
  });
  const [allResults, setAllResults] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.role === 'ROLE_ADMIN') {
      api.get('/dashboard/admin').then((res) => {
        setStats(res.data);
      }).catch(err => console.error(err));
      
      api.get('/results').then(res => setAllResults(res.data)).catch(console.error);
      api.get('/attendance').then(res => setAllAttendance(res.data)).catch(console.error);
      api.get('/notifications').then(res => setNotifications(res.data)).catch(console.error);
    } else if (user?.role === 'ROLE_TEACHER') {
      api.get('/dashboard/teacher').then((res) => {
        setStats(res.data);
      }).catch(err => console.error(err));
      api.get('/notifications').then(res => setNotifications(res.data)).catch(console.error);
    }
  }, [user]);

  if (user?.role === 'ROLE_STUDENT') {
    return <Navigate to="/student-dashboard" replace />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Dashboard</h1>
      </div>
      
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-8 border border-white/50"
      >
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">Welcome back, {user?.username}! 👋</h2>
        <p className="text-indigo-900/60 font-medium">You are logged in as <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm ml-1">{user?.role.replace('ROLE_', '')}</span></p>
      </motion.div>

      {/* Admin Dashboard */}
      {user?.role === 'ROLE_ADMIN' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users />} title="Total Students" value={stats.totalStudents} link="/students" color="blue" />
            <StatCard icon={<GraduationCap />} title="Total Teachers" value={stats.totalTeachers} link="/teachers" color="emerald" />
            <StatCard icon={<Wallet />} title="Fees Collected" value={`$${stats.totalFeesCollected}`} link="/fees" color="purple" />
            <StatCard icon={<Wallet />} title="Pending Fees" value={`$${stats.totalFeesPending}`} link="/fees" color="rose" />
            <StatCard icon={<BookOpen />} title="Total Classes" value={stats.totalClasses} link="/classes" color="amber" />
            <StatCard icon={<Percent />} title="Avg Attendance" value={`${stats.attendancePercentage}%`} link="/attendance" color="cyan" />
            <StatCard icon={<Trophy />} title="Pass Rate" value={`${stats.passPercentage}%`} link="/results" color="indigo" />
            <StatCard icon={<Bell />} title="Notifications" value={notifications.length} link="/notifications" color="fuchsia" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <MarksChart results={allResults} />
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                <AttendanceChart attendance={allAttendance} />
              </motion.div>
            </div>
            
            <div className="lg:col-span-1">
              <RecentNotifications notifications={notifications} />
            </div>
          </div>
        </>
      )}

      {/* Teacher Dashboard */}
      {user?.role === 'ROLE_TEACHER' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<Users />} title="Total Students" value={stats.totalStudents} link="/students" color="blue" />
            <StatCard icon={<BookOpen />} title="Total Classes" value={stats.totalClasses} link="/classes" color="purple" />
            <StatCard icon={<Percent />} title="Avg Attendance" value={`${stats.attendancePercentage}%`} link="/attendance" color="emerald" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-8 border border-white/50 flex flex-col justify-center items-center h-64">
              <BookOpen className="w-16 h-16 text-indigo-300 mb-4" />
              <h3 className="text-xl font-bold text-indigo-900 mb-2">Manage Your Classes</h3>
              <p className="text-indigo-500 text-center">Navigate to Attendance or Results to manage student progress.</p>
            </div>
            <div className="lg:col-span-1">
              <RecentNotifications notifications={notifications} />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function StatCard({ icon, title, value, link, color }) {
  const colors = {
    blue: 'from-blue-400 to-blue-600 shadow-blue-200',
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-200',
    purple: 'from-purple-400 to-purple-600 shadow-purple-200',
    rose: 'from-rose-400 to-rose-600 shadow-rose-200',
    amber: 'from-amber-400 to-amber-600 shadow-amber-200',
    cyan: 'from-cyan-400 to-cyan-600 shadow-cyan-200',
    indigo: 'from-indigo-400 to-indigo-600 shadow-indigo-200',
    fuchsia: 'from-fuchsia-400 to-fuchsia-600 shadow-fuchsia-200',
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="block bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-6 flex items-center space-x-4 border border-white/50 group transition-all">
      <Link to={link} className="flex items-center space-x-4 w-full">
        <div className={`p-4 bg-gradient-to-br ${colors[color]} rounded-2xl shadow-lg text-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-indigo-900/60 text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-indigo-900 mt-1">{value}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function RecentNotifications({ notifications }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ delay: 0.7 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50"
    >
      <div className="px-6 py-4 border-b border-indigo-50/50 bg-indigo-50/30 flex items-center justify-between">
        <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" /> Recent Alerts
        </h2>
      </div>
      <div className="divide-y divide-indigo-50">
        {notifications.length > 0 ? (
          notifications.slice(0, 5).map(notif => (
            <div key={notif.id} className="p-4 hover:bg-indigo-50/30 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  notif.type === 'FEES' ? 'bg-rose-100 text-rose-700' :
                  notif.type === 'RESULT' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {notif.type}
                </span>
                <span className="text-xs text-indigo-400">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-bold text-indigo-900 text-sm mb-1">{notif.title}</h4>
              <p className="text-sm text-indigo-600/80 line-clamp-2">{notif.message}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-indigo-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No recent notifications</p>
          </div>
        )}
      </div>
      {notifications.length > 0 && (
        <Link to="/notifications" className="block w-full text-center py-3 text-sm font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100 transition-colors">
          View All Notifications
        </Link>
      )}
    </motion.div>
  );
}
