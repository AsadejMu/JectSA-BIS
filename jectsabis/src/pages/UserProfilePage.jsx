import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { createUser, getUsers, resetUserPassword, updateUser } from "../services/authService";

const ROLES = ["Requester", "Approver", "HR Manager", "HR Administrator"];
const DEPARTMENTS = ["Human Resources", "IT Department", "Finance", "Marketing", "Operations", "Management"];
const initials = (name) => name.split(/\s+/).map((p) => p[0]).join("").replace(".", "").slice(0, 2).toUpperCase();

export default function UserProfilePage({ user, onNavigate, onLogout }) {
  const [users, setUsers] = useState(() => getUsers());
  const [roleFilter, setRoleFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", dept: "IT Department", role: "Requester", password: "" });

  const refresh = () => setUsers(getUsers());
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const update = (id, patch, message) => {
    if (id === user?.id && (patch.active === false || (patch.role && patch.role !== "HR Administrator"))) {
      setToast("ไม่สามารถปิดบัญชีตัวเองหรือเปลี่ยน Role ตัวเองออกจาก Admin ได้"); return;
    }
    updateUser(id, patch); refresh(); setToast(message);
  };
  const submit = (event) => {
    event.preventDefault();
    try {
      createUser(form); refresh(); setForm({ name: "", email: "", dept: "IT Department", role: "Requester", password: "" });
      setShowForm(false); setToast("สร้างบัญชีผู้ใช้เรียบร้อยแล้ว");
    } catch (error) { setToast(error.message || "สร้างบัญชีไม่สำเร็จ"); }
  };
  const resetPassword = (u) => {
    const password = window.prompt(`กำหนดรหัสผ่านใหม่ให้ ${u.name} (อย่างน้อย 8 ตัวอักษร)`);
    if (password === null) return;
    try { resetUserPassword(u.id, password); setToast(`รีเซ็ตรหัสผ่านของ ${u.name} แล้ว`); }
    catch (error) { setToast(error.message); }
  };
  const q = query.trim().toLowerCase();
  const visible = users.filter((u) => (roleFilter === "all" || u.role === roleFilter) && (!q || [u.id, u.name, u.email, u.dept].some((v) => String(v || "").toLowerCase().includes(q))));

  if (user?.role !== "HR Administrator") return <Layout active="requests" crumb={["Access denied", "Users & Roles"]} user={user} onNavigate={onNavigate} onLogout={onLogout}><h1>ไม่มีสิทธิ์เข้าถึง</h1><p>เฉพาะ HR Administrator เท่านั้นที่จัดการบัญชีผู้ใช้ได้</p><button className="btn" onClick={() => onNavigate?.("requests")}>กลับหน้าหลัก</button></Layout>;

  return <Layout active="users" crumb={["Users & Roles", "User List"]} onNavigate={onNavigate} onLogout={onLogout} user={user}>
    <div className="heading"><div><h1>ผู้ใช้งานและสิทธิ์</h1><div className="subtitle page-sub">สร้างบัญชี กำหนด Role รีเซ็ตรหัสผ่าน และเปิด/ปิดบัญชี</div></div><button className="btn primary" onClick={() => setShowForm((v) => !v)}>{showForm ? "ยกเลิก" : "+ สร้างผู้ใช้"}</button></div>
    {toast && <div className="toast" role="status">{toast}</div>}
    {showForm && <section className="panel"><div className="panel-head"><h2>สร้างบัญชีผู้ใช้</h2><small>กำหนดบัญชีและรหัสผ่านเริ่มต้น</small></div><div className="panel-body"><form className="approval-form" onSubmit={submit}><div className="field-grid">
      <div className="field"><label htmlFor="newName">ชื่อ-นามสกุล *</label><input id="newName" className="search" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="field"><label htmlFor="newEmail">อีเมลสำหรับเข้าสู่ระบบ *</label><input id="newEmail" className="search" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div className="field"><label htmlFor="newDept">แผนก</label><select id="newDept" className="search" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></div>
      <div className="field"><label htmlFor="newRole">Role</label><select id="newRole" className="search" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
      <div className="field"><label htmlFor="newPassword">รหัสผ่านเริ่มต้น * (อย่างน้อย 8 ตัว)</label><input id="newPassword" className="search" type="password" minLength={8} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
    </div><div className="form-actions" style={{ marginTop: 18 }}><button type="button" className="btn" onClick={() => setShowForm(false)}>ยกเลิก</button><button type="submit" className="btn primary">สร้างบัญชี</button></div></form><div className="notice" style={{ marginTop: 12 }}>ต้นแบบนี้เก็บข้อมูลใน localStorage ของเบราว์เซอร์ ไม่ควรใช้รหัสผ่านจริงหรือใช้กับระบบจริง</div></div></section>}
    <section className="summary"><div className="summary-card"><div className="label">ผู้ใช้ทั้งหมด</div><div className="value">{users.length}</div></div><div className="summary-card"><div className="label">เปิดใช้งาน</div><div className="value">{users.filter((u) => u.active).length}</div></div><div className="summary-card"><div className="label">ผู้อนุมัติ</div><div className="value">{users.filter((u) => u.role === "Approver" || u.role === "HR Manager").length}</div></div><div className="summary-card"><div className="label">ผู้ส่งคำขอ</div><div className="value">{users.filter((u) => u.role === "Requester").length}</div></div></section>
    <section className="panel"><div className="toolbar"><div className="tabs">{["all", ...ROLES].map((r) => <button key={r} className={roleFilter === r ? "tab on" : "tab"} onClick={() => setRoleFilter(r)}>{r === "all" ? "ทั้งหมด" : r}</button>)}</div><input className="search" type="search" placeholder="ค้นหาชื่อ อีเมล หรือแผนก" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      <div className="table-wrap"><table><thead><tr><th>ผู้ใช้</th><th>User ID</th><th>แผนก</th><th>Role</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>{visible.map((u) => <tr key={u.id}><td><div className="person"><div className="avatar">{initials(u.name)}</div><div><strong>{u.name}</strong><div className="sub">{u.email}</div></div></div></td><td>{u.id}</td><td>{u.dept}</td><td><select className="role-select" value={u.role} aria-label={`บทบาทของ ${u.name}`} onChange={(e) => update(u.id, { role: e.target.value }, `เปลี่ยน Role ของ ${u.name} แล้ว`)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></td><td><span className={u.active ? "status green" : "status off"}>{u.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span></td><td><div className="actions"><button className="btn" onClick={() => resetPassword(u)}>รีเซ็ตรหัส</button><button className={u.active ? "btn reject" : "btn"} onClick={() => update(u.id, { active: !u.active }, `${u.active ? "ปิด" : "เปิด"}บัญชี ${u.name} แล้ว`)}>{u.active ? "ปิดบัญชี" : "เปิดบัญชี"}</button></div></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข</div>}</div>
    </section><div className="notice" style={{ marginTop: 14 }}>หมายเหตุ: การกำหนด Role ในต้นแบบนี้ควบคุมเฉพาะ UI และ localStorage ไม่ใช่ระบบรักษาความปลอดภัยฝั่งเซิร์ฟเวอร์</div>
  </Layout>;
}
