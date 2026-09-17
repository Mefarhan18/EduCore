import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const isFullHeightPage = location.pathname.startsWith('/ai-chat') || location.pathname.startsWith('/ai-tools');

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <Navbar />
        <main className={`flex-1 ${isFullHeightPage ? 'overflow-hidden flex flex-col' : 'overflow-x-hidden overflow-y-auto bg-gray-50'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
