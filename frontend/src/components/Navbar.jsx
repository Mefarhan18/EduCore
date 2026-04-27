import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Bell, Check } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Optional logo or title for mobile */}
          </div>
          <div className="flex items-center space-x-4">
            
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {notifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {notifications.filter(n => !n.isRead).length} New
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-indigo-50/30' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                              {!notification.isRead && (
                                <button 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-indigo-100 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 p-2 rounded-full">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.username}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 focus:outline-none transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
