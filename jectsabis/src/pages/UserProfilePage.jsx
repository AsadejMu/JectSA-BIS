import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
  createUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from "../services/authService";

const ROLES = [
  "Requester",
  "Approver",
  "HR Manager",
  "HR Administrator",
];

const DEPARTMENTS = [
  "Human Resources",
  "IT Department",
  "Finance",
  "Marketing",
  "Operations",
  "Management",
];

const initials = (name = "") =>
  name
    .split(/\s+/)
    .map((p) => p[0] || "")
    .join("")
    .replace(".", "")
    .slice(0, 2)
    .toUpperCase();

export default function UserProfilePage({
  user,
  onNavigate,
  onLogout,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [roleFilter, setRoleFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    dept: "IT Department",
    role: "Requester",
    password: "",
  });

  // ข้อมูลสำหรับแก้ไขผู้ใช้
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    dept: "",
    role: "Requester",
  });

  const refresh = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setToast(error.message || "โหลดรายชื่อผู้ใช้ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // เปลี่ยน Role หรือสถานะบัญชี
  const update = async (id, patch, message) => {
    try {
      await updateUser(id, patch);
      await refresh();
      setToast(message);
    } catch (error) {
      setToast(error.message || "อัปเดตผู้ใช้ไม่สำเร็จ");
    }
  };

  // สร้างบัญชีใหม่
  const submit = async (event) => {
    event.preventDefault();

    try {
      await createUser(form);
      await refresh();

      setForm({
        name: "",
        email: "",
        dept: "IT Department",
        role: "Requester",
        password: "",
      });

      setShowForm(false);
      setToast("สร้างบัญชีผู้ใช้เรียบร้อยแล้ว");
    } catch (error) {
      setToast(error.message || "สร้างบัญชีไม่สำเร็จ");
    }
  };

  // เปิดฟอร์มแก้ไข
  const openEdit = (u) => {
    setEditingUser(u);

    setEditForm({
      name: u.name || "",
      dept: u.dept || "",
      role: u.role || "Requester",
    });

    setShowForm(false);
    setShowEditForm(true);
    setToast("");
  };

  // บันทึกการแก้ไขลง Supabase
  const saveEdit = async (event) => {
    event.preventDefault();

    if (!editingUser) return;

    if (!editForm.name.trim()) {
      setToast("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    setSaving(true);

    try {
      await updateUser(editingUser.id, {
        name: editForm.name.trim(),
        dept: editForm.dept || null,
        role: editForm.role,
      });

      await refresh();

      setShowEditForm(false);
      setEditingUser(null);
      setToast("แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว");
    } catch (error) {
      setToast(error.message || "แก้ไขข้อมูลผู้ใช้ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setShowEditForm(false);
    setEditingUser(null);
  };

  // รีเซ็ตรหัสผ่านผ่าน Edge Function
  const resetPassword = async (u) => {
    const password = window.prompt(
      `กำหนดรหัสผ่านใหม่ให้ ${u.name} (อย่างน้อย 8 ตัวอักษร)`
    );

    if (password === null) return;

    try {
      await resetUserPassword(u.id, password);
      setToast(`รีเซ็ตรหัสผ่านของ ${u.name} สำเร็จ`);
    } catch (error) {
      setToast(error.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
    }
  };

  const q = query.trim().toLowerCase();

  const visible = users.filter(
    (u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (!q ||
        [u.id, u.name, u.email, u.dept].some((v) =>
          String(v || "").toLowerCase().includes(q)
        ))
  );

  if (user?.role !== "HR Administrator") {
    return (
      <Layout
        active="requests"
        crumb={["Access denied", "Users & Roles"]}
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <h1>ไม่มีสิทธิ์เข้าถึง</h1>
        <p>เฉพาะ HR Administrator เท่านั้นที่จัดการบัญชีผู้ใช้ได้</p>
        <button
          className="btn"
          onClick={() => onNavigate?.("requests")}
        >
          กลับหน้าหลัก
        </button>
      </Layout>
    );
  }

  return (
    <Layout
      active="users"
      crumb={["Users & Roles", "User List"]}
      onNavigate={onNavigate}
      onLogout={onLogout}
      user={user}
    >
      <div className="heading">
        <div>
          <h1>ผู้ใช้งานและสิทธิ์</h1>
          <div className="subtitle page-sub">
            สร้างบัญชี | Change Role | Reset Password และ Lock / Unlock ผู้บัญชี
          </div>
        </div>

        <button
          className="btn primary"
          onClick={() => {
            setShowForm((v) => !v);
            setShowEditForm(false);
            setEditingUser(null);
          }}
        >
          {showForm ? "ยกเลิก" : "+ สร้างผู้ใช้"}
        </button>
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      {loading && <p>กำลังโหลดรายชื่อผู้ใช้...</p>}

      {/* ฟอร์มสร้างผู้ใช้ */}
      {showForm && (
        <section className="panel">
          <div className="panel-head">
            <h2>สร้างบัญชีผู้ใช้</h2>
            <small>กำหนดบัญชีและรหัสผ่านเริ่มต้น</small>
          </div>

          <div className="panel-body">
            <form className="approval-form" onSubmit={submit}>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="newName">ชื่อ-นามสกุล *</label>
                  <input
                    id="newName"
                    className="search"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="newEmail">
                    อีเมลสำหรับเข้าสู่ระบบ *
                  </label>
                  <input
                    id="newEmail"
                    className="search"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="newDept">แผนก</label>
                  <select
                    id="newDept"
                    className="search"
                    value={form.dept}
                    onChange={(e) =>
                      setForm({ ...form, dept: e.target.value })
                    }
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="newRole">Role</label>
                  <select
                    id="newRole"
                    className="search"
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="newPassword">
                    รหัสผ่านเริ่มต้น * (อย่างน้อย 8 ตัว)
                  </label>
                  <input
                    id="newPassword"
                    className="search"
                    type="password"
                    minLength={8}
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 18 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowForm(false)}
                >
                  ยกเลิก
                </button>

                <button type="submit" className="btn primary">
                  สร้างบัญชี
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ฟอร์มแก้ไขผู้ใช้ */}
      {showEditForm && (
        <section className="panel">
          <div className="panel-head">
            <h2>แก้ไขข้อมูลผู้ใช้</h2>
            <small>{editingUser?.email}</small>
          </div>

          <div className="panel-body">
            <form className="approval-form" onSubmit={saveEdit}>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="editName">ชื่อ-นามสกุล *</label>
                  <input
                    id="editName"
                    className="search"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="editDept">แผนก</label>
                  <select
                    id="editDept"
                    className="search"
                    value={editForm.dept}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        dept: e.target.value,
                      })
                    }
                  >
                    <option value="">ไม่ระบุ</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="editRole">Role</label>
                  <select
                    id="editRole"
                    className="search"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value,
                      })
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: 18 }}>
                <button
                  type="button"
                  className="btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="btn primary"
                  disabled={saving}
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* สรุปจำนวนผู้ใช้ */}
      <section className="summary">
        <div className="summary-card">
          <div className="label">ผู้ใช้ทั้งหมด</div>
          <div className="value">{users.length}</div>
        </div>

        <div className="summary-card">
          <div className="label">เปิดใช้งาน</div>
          <div className="value">
            {users.filter((u) => u.active).length}
          </div>
        </div>

        <div className="summary-card">
          <div className="label">ผู้อนุมัติ</div>
          <div className="value">
            {
              users.filter(
                (u) =>
                  u.role === "Approver"
              ).length
            }
          </div>
        </div>

        <div className="summary-card">
          <div className="label">ผู้ส่งคำขอ</div>
          <div className="value">
            {users.filter((u) => u.role === "Requester").length}
          </div>
        </div>
      </section>

      {/* ตารางผู้ใช้ */}
      <section className="panel">
        <div className="toolbar">
          <div className="tabs">
            {["all", ...ROLES].map((r) => (
              <button
                key={r}
                className={roleFilter === r ? "tab on" : "tab"}
                onClick={() => setRoleFilter(r)}
              >
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
                <th>Role</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
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
                  <td>{u.dept || "-"}</td>

                  <td>
                    <span>{u.role}</span>
                  </td>

                  <td>
                    <span
                      className={
                        u.active ? "status green" : "status off"
                      }
                    >
                      {u.active ? "Active" : "Locked"}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        className="btn"
                        onClick={() => openEdit(u)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn"
                        onClick={() => resetPassword(u)}
                      >
                        รีเซ็ตรหัส
                      </button>

                      <button
                        className={u.active ? "btn reject" : "btn"}
                        onClick={() =>
                          update(
                            u.id,
                            { active: !u.active },
                            `${u.active ? "ปิด" : "เปิด"}บัญชี ${u.name} แล้ว`
                          )
                        }
                      >
                        {u.active ? "Lock" : "Unlock"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="empty">
              ไม่พบผู้ใช้ที่ตรงกับเงื่อนไข
            </div>
          )}
        </div>
      </section>

      <div className="notice" style={{ marginTop: 14 }}>
        หมายเหตุ: ข้อมูลผู้ใช้จัดเก็บใน Supabase และการแก้ไขต้องผ่านสิทธิ์
        ที่กำหนดไว้ในฐานข้อมูล
      </div>
    </Layout>
  );
}