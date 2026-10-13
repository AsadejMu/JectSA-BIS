
const NAV_ITEMS = [
  {
    icon: "▤",
    label: "Manpower Requests",
    page: "requests",
    roles: ["HR Administrator", "HR Manager", "Approver", "Requester"],
  },
  {
    icon: "✓",
    label: "ศูนย์อนุมัติ",
    page: "approvals",
    roles: ["HR Administrator", "HR Manager", "Approver"],
  },
  {
    icon: "♙",
    label: "Users & Roles",
    page: "users",
    roles: ["HR Administrator"],
  },
];

const ROLE_LABELS = {
  "HR Administrator": "ผู้ดูแลระบบ",
  "HR Manager": "ฝ่ายบุคคล",
  Approver: "ผู้อนุมัติ",
  Requester: "ผู้ส่งคำขอ",
};

export default function Layout({ active, crumb, user, onNavigate, onLogout, children }) {
  const name = user?.name || user?.email?.split("@")[0] || "User";
  const initials = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon">M</div><div><strong>Manpower Plan</strong><small>Workforce Management</small></div></div>
      <div className="nav-label">เมนูหลัก</div>
      <nav className="nav">{navItems.map((item) => <button key={item.page} type="button" className={item.page === active ? "active" : undefined} onClick={() => onNavigate?.(item.page)}><span className="ico">{item.icon}</span> {item.label}</button>)}</nav>
      <div className="sidebar-bottom"><div className="avatar">{initials}</div><div><strong>{name}</strong><small>{ROLE_LABELS[user?.role] || user?.role}</small></div></div>
    </aside>
    <main className="main"><header className="topbar"><div className="crumb">{crumb[0]} &nbsp; / &nbsp; <b>{crumb[1]}</b></div><div className="top-user"><div className="avatar">{initials}</div><div className="who"><strong>{name}</strong><div className="crumb">{user?.role}</div></div><button className="btn" onClick={() => onLogout?.()}>ออกจากระบบ</button></div></header><div className="content">{children}</div></main>
  </div>;
}
