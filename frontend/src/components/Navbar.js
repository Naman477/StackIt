import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.get('/api/notifications', config);
      setNotifications(res.data);
      setUnreadCount(res.data.filter(notif => !notif.isRead).length);
    } catch (err) {
      console.error(err);
    }
  }, []); // No dependencies for fetchNotifications itself, as it only uses state/props that are stable or part of its own scope

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.put(`/api/notifications/mark-read/${id}`, {}, config);
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.put('/api/notifications/mark-all-read', {}, config);
      fetchNotifications(); // Refresh notifications
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds (example)
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]); // fetchNotifications is now a stable dependency

  // Socket.IO setup for real-time notifications
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (isAuthenticated && userId) {
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

      socket.emit('joinRoom', userId); // Join a room specific to the user

      socket.on('newNotification', (notification) => {
        console.log('New real-time notification:', notification);
        fetchNotifications(); // Re-fetch all notifications to update count and list
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, fetchNotifications]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${searchQuery.trim()}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">StackIt</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/ask-question">Ask Question</Link>
            </li>
            {isAuthenticated ? (
              <li className="nav-item">
                <Link className="nav-link" to="/profile">My Profile</Link>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
          <form className="d-flex" onSubmit={handleSearch}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search questions..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-light" type="submit">Search</button>
          </form>
          {isAuthenticated && (
            <div className="d-flex">
              <div className="notification-icon" onClick={() => setShowDropdown(!showDropdown)}>
                <i className="fas fa-bell"></i> {unreadCount > 0 && <span className="badge bg-danger rounded-pill">{unreadCount}</span>}
                {showDropdown && (
                  <div className="notification-dropdown">
                    {notifications.length > 0 ? (
                      <>
                        <button className="btn btn-primary btn-sm w-100 mb-2" onClick={markAllAsRead}>Mark All as Read</button>
                        {notifications.map(notif => (
                          <div key={notif._id} className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}>
                            <p>{notif.message}</p>
                            {!notif.isRead && (
                              <button className="btn btn-success btn-sm" onClick={() => markAsRead(notif._id)}>Mark as Read</button>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-center text-muted">No new notifications</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
