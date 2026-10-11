const NAV_ITEMS = [
  { icon: "▤", label: "Manpower Requests", page: "requests" },
  { icon: "✓", label: "Approval Center", page: "approvals" },
  { icon: "♙", label: "Users & Roles", page: "users" },
];

/**
 * Shared shell: sidebar + top bar.
 * active  - key of the nav item to highlight (requests | approvals | users)
 * crumb   - [section, current page] shown in the top bar
 */
export default function Layout({ active, crumb, user, onNavigate, onLogout, children }) {
  // Display name = login email without "@gmail.com"
  const name = user?.email?.split("@")[0] ?? "";
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>
          <div>
            <strong>Manpower Plan</strong>
            <small>Workforce Management</small>
          </div>
        </div>
        <div className="nav-label">เมนูหลัก</div>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              href="#"
              className={item.page === active ? "active" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(item.page);
              }}
            >
              <span className="ico">{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{name}</strong>
            <small>HR Administrator</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            {crumb[0]} &nbsp; / &nbsp; <b>{crumb[1]}</b>
          </div>
          <div className="top-user">
            <div className="avatar">{initials}</div>
            <div className="who">
              <strong>{name}</strong>
              <div className="crumb">HR Administrator</div>
            </div>
            <button className="btn" onClick={() => onLogout?.()}>
              ออกจากระบบ
            </button>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
