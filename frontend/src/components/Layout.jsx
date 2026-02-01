import { NavLink, Outlet } from 'react-router-dom';

// Navigation items
const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/teams', label: 'Teams', icon: '🏏' },
    { path: '/players', label: 'Players', icon: '👤' },
    { path: '/matches', label: 'Matches', icon: '🏆' },
];

function Layout() {
    return (
        <div className="app">
            {/* Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar__logo">
                    <div className="sidebar__logo-icon">🏏</div>
                    <span className="sidebar__logo-text">IPL Hub</span>
                </div>

                <nav className="sidebar__nav">
                    <ul className="sidebar__nav-list">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `sidebar__nav-link ${isActive ? 'active' : ''}`
                                    }
                                    end={item.path === '/'}
                                >
                                    <span className="sidebar__nav-icon">{item.icon}</span>
                                    <span className="sidebar__nav-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        IPL Data Platform
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', opacity: 0.6 }}>
                        v1.0.0
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
