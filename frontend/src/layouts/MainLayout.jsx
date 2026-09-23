import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Badge, Breadcrumbs } from '../components/ui';
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  Cpu,
  LineChart,
  FileText,
  Users,
  Shield,
  Settings,
  LogOut,
  Cloud,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

export default function MainLayout() {
  const { user, role, isAdmin, isDeveloper, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Responsive sidebar states
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // User menu dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMobileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar Navigation */}
      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Sidebar Brand Header */}
        <div className="sidebar-header">
          <div className="brand-icon" aria-hidden="true">F</div>
          {!isCollapsed && (
            <div className="brand-info">
              <span className="brand-title">ForgeCloud</span>
              <span className="brand-badge">IDP</span>
            </div>
          )}
          {isMobileOpen && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              style={{ marginLeft: 'auto' }}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation drawer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sidebar Links */}
        <nav className="sidebar-nav">
          {/* Main App Control Section */}
          <div className="nav-section">
            {!isCollapsed && <span className="nav-section-title">Control Plane</span>}
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title="Dashboard"
            >
              <LayoutDashboard aria-hidden="true" />
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>
            <NavLink
              to="/applications"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
              title="Applications"
            >
              <Boxes aria-hidden="true" />
              {!isCollapsed && <span>Applications</span>}
            </NavLink>
            {isDeveloper && (
              <NavLink
                to="/applications/create"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title="Register Application"
              >
                <PlusCircle aria-hidden="true" />
                {!isCollapsed && <span>Create App</span>}
              </NavLink>
            )}
          </div>

          {/* Platform Infrastructure Section (Roadmap) */}
          <div className="nav-section">
            {!isCollapsed && <span className="nav-section-title">Platform & Telemetry</span>}
            <NavLink
              to="/infrastructure"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title="Infrastructure"
            >
              <Cpu aria-hidden="true" />
              {!isCollapsed && <span>Infrastructure</span>}
            </NavLink>
            <NavLink
              to="/monitoring"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title="Monitoring"
            >
              <LineChart aria-hidden="true" />
              {!isCollapsed && <span>Monitoring</span>}
            </NavLink>
            <NavLink
              to="/logs"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title="Platform Logs"
            >
              <FileText aria-hidden="true" />
              {!isCollapsed && <span>Platform Logs</span>}
            </NavLink>
          </div>

          {/* Administration Section (ADMIN Only) */}
          {isAdmin && (
            <div className="nav-section">
              {!isCollapsed && <span className="nav-section-title">Administration</span>}
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title="User Directory"
              >
                <Users aria-hidden="true" />
                {!isCollapsed && <span>User Directory</span>}
              </NavLink>
              <NavLink
                to="/admin/audit"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                title="Audit Logs"
              >
                <Shield aria-hidden="true" />
                {!isCollapsed && <span>Audit Logs</span>}
              </NavLink>
            </div>
          )}

          {/* System Settings */}
          <div className="nav-section" style={{ marginTop: 'auto' }}>
            {!isCollapsed && <span className="nav-section-title">Preferences</span>}
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title="Settings"
            >
              <Settings aria-hidden="true" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </nav>

        {/* Sidebar Footer with Collapse Toggle on Desktop */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          {!isCollapsed && (
            <span style={{ fontSize: '0.7rem', color: 'var(--fc-text-muted)' }}>
              v0.1.0 • Phase 4
            </span>
          )}
        </div>
      </aside>

      {/* Main Content Stage */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="app-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-trigger"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
            <Breadcrumbs />
          </div>

          <div className="header-right">
            {/* Control Plane Status Chip */}
            <div className="cloud-status-chip">
              <Cloud size={14} color="var(--fc-primary)" aria-hidden="true" />
              <span>Control Plane</span>
              <span className="status-dot-pulse" aria-hidden="true" />
            </div>

            {/* Theme Toggle Button */}
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User Dropdown Menu */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                type="button"
                className={`user-menu-trigger ${isUserMenuOpen ? 'active' : ''}`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-label="User profile and settings"
              >
                <div className="user-avatar" aria-hidden="true">
                  {userInitials}
                </div>
                <span
                  style={{
                    fontSize: 'var(--fc-font-size-small)',
                    fontWeight: 500,
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.name || 'Developer'}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--fc-text-muted)' }} />
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <div className="user-menu-header">
                    <div className="user-menu-name">{user?.name || 'Developer'}</div>
                    <div className="user-menu-email">{user?.email || ''}</div>
                    <div style={{ marginTop: '0.4rem' }}>
                      <Badge variant={isAdmin ? 'danger' : isDeveloper ? 'info' : 'warning'}>
                        {role || 'VIEWER'}
                      </Badge>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="user-menu-item"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/settings');
                    }}
                    role="menuitem"
                  >
                    <span>Account Settings</span>
                    <Settings size={14} />
                  </button>

                  <button
                    type="button"
                    className="user-menu-item logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <span>Sign Out</span>
                    <LogOut size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Routed Viewport */}
        <main className="content-body animate-fade-in" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
