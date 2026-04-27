import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, GraduationCap, CalendarCheck, FileText, CreditCard, Bookmark } from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  const getLinks = () => {
    const links = [];

    if (user?.role === 'ROLE_ADMIN') {
      links.push(
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Students', path: '/students', icon: <Users className="w-5 h-5" /> },
        { name: 'Teachers', path: '/teachers', icon: <GraduationCap className="w-5 h-5" /> },
        { name: 'Classes', path: '/classes', icon: <BookOpen className="w-5 h-5" /> },
        { name: 'Subjects', path: '/subjects', icon: <Bookmark className="w-5 h-5" /> },
        { name: 'Attendance', path: '/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
        { name: 'Results', path: '/results', icon: <FileText className="w-5 h-5" /> },
        { name: 'Fees', path: '/fees', icon: <CreditCard className="w-5 h-5" /> },
        { name: 'Users', path: '/users', icon: <Users className="w-5 h-5" /> }
      );
    } else if (user?.role === 'ROLE_TEACHER') {
      links.push(
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'Students', path: '/students', icon: <Users className="w-5 h-5" /> },
        { name: 'Attendance', path: '/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
        { name: 'Results', path: '/results', icon: <FileText className="w-5 h-5" /> }
      );
    } else if (user?.role === 'ROLE_STUDENT') {
      links.push(
        { name: 'My Dashboard', path: '/student-dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { name: 'My Attendance', path: '/attendance', icon: <CalendarCheck className="w-5 h-5" /> },
        { name: 'My Results', path: '/results', icon: <FileText className="w-5 h-5" /> },
        { name: 'My Fees', path: '/fees', icon: <CreditCard className="w-5 h-5" /> }
      );
    }

    return links;
  };

  return (
    <div className="w-64 bg-gradient-to-b from-indigo-700 to-purple-800 text-white hidden md:flex flex-col h-screen fixed shadow-2xl z-20">
      <div className="h-16 flex items-center justify-center border-b border-indigo-500/30 shadow-sm">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold tracking-wider font-sans">SchoolHub</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-2">
          {getLinks().map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-[15px] font-medium rounded-2xl transition-all duration-300 transform ${
                  isActive 
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-md' 
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white hover:scale-105'
                }`
              }
            >
              <div className="mr-4">{link.icon}</div>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
