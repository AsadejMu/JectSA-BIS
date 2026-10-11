import { useState } from "react";
import Layout from "../components/Layout";

const ROLES = ["Requester", "Approver", "HR Manager", "HR Administrator"];

const INITIAL = [
  { id: "U1001", name: "Parichat K.", email: "parichat.k@company.co.th", dept: "Human Resources", role: "HR Administrator", active: true },
  { id: "U1003", name: "Sirilak T.", email: "sirilak.t@company.co.th", dept: "Human Resources", role: "HR Manager", active: true },
  { id: "U1024", name: "Nattapong S.", email: "nattapong.s@company.co.th", dept: "IT Department", role: "Requester", active: true },
  { id: "U1031", name: "Kanokwan P.", email: "kanokwan.p@company.co.th", dept: "IT Department", role: "Requester", active: true },
  { id: "U1040", name: "Warunee C.", email: "warunee.c@company.co.th", dept: "Finance", role: "Approver", active: true },
  { id: "U1047", name: "Pichit L.", email: "pichit.l@company.co.th", dept: "Marketing", role: "Requester", active: false },
];

const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .replace(".", "");

export default function UserProfilePage({ user, onNavigate, onLogout }) {
  const [users, setUsers] = useState(INITIAL);
  const [roleFilter, setRoleFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  const update = (id, patch, message) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    setToast(`${message} (ตัวอย่างฝั่งหน้าเว็บ ยังไม่ได้บันทึกลงฐานข้อมูล)`);
  };

  const q = query.trim().toLowerCase();
  const visible = users.filter(
    (u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (!q || [u.id, u.name, u.email, u.dept].some((v) => v.toLowerCase().includes(q)))
  );

  return (
    <Layout active="users" crumb={["Users & Roles", "User List"]} onNavigate={onNavigate} onLogout={onLogout} user={user}>
      <h1>ผู้ใช้งานและสิทธิ์</h1>
      <div className="subtitle page-sub">จัดการบทบาทและสถานะการใช้งานของผู้ใช้ในระบบ</div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <section className="summary">
        <div className="summary-card">
          <div className="label">ผู้ใช้ทั้งหมด</div>
          <div className="value">{users.length}</div>
        </div>
        <div className="summary-card">
          <div className="label">เปิดใช้งาน</div>
          <div className="value">{users.filter((u) => u.active).length}</div>
        </div>
        <div className="summary-card">
          <div className="label">ผู้อนุมัติ</div>
          <div className="value">{users.filter((u) => u.role === "Approver" || u.role === "HR Manager").length}</div>
        </div>
        <div className="summary-card">
          <div className="label">ผู้ส่งคำขอ</div>
          <div className="value">{users.filter((u) => u.role === "Requester").length}</div>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div className="tabs">
            {["all", ...ROLES].map((r) => (
              <button key={r} className={roleFilter === r ? "tab on" : "tab"} onClick={() => setRoleFilter(r)}>
                {r === "all" ? "ทั้งหมด" : r}
              </button>
            ))}
          </div>
          <input
            className="search"
            type="search"
            placeholder="ค้นหาชื่อ อีเมล หรือแผนก"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ผู้ใช้</th>
                <th>User ID</th>
                <th>แผนก</th>
                <th>บทบาท (Role)</th>
                <th>สถานะ</th>
                <th>ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="person">
                      <div className="avatar">{initials(u.name)}</div>
                      <div>
                        <strong>{u.name}</strong>
                        <div className="sub">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.id}</td>
                  <td>{u.dept}</td>
                  <td>
                    <select
                      className="role-select"
                      value={u.role}
                      aria-label={`บทบาทของ ${u.name}`}
                      onChange={(e) => update(u.id, { role: e.target.value }, `เปลี่ยนบทบาทของ ${u.name} เป็น “${e.target.value}” แล้ว`)}
                    >
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={u.active ? "status green" : "status off"}>{u.active ? "เปิดใช้งาน" : "ปิดใช้งาน"}</span>
                  </td>
                  <td>
                    <button
                      className={u.active ? "btn reject" : "btn"}
                      onClick={() => update(u.id, { active: !u.active }, `${u.active ? "ปิด" : "เปิด"}การใช้งานของ ${u.name} แล้ว`)}
                    >
                      {u.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข</div>}
        </div>
      </section>
    </Layout>
  );
}
