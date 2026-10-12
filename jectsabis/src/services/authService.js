const USERS_KEY = "manpower.users.v1";
const SESSION_KEY = "manpower.session.v1";

const DEMO_USERS = [
  { id: "U1001", name: "System Admin", email: "admin@company.co.th", dept: "Human Resources", role: "HR Administrator", password: "Admin123!", active: true },
  { id: "U1002", name: "Nattapong S.", email: "requester@company.co.th", dept: "IT Department", role: "Requester", password: "User123!", active: true },
  { id: "U1003", name: "Approver Demo", email: "approver@company.co.th", dept: "Management", role: "Approver", password: "User123!", active: true },
  { id: "U1004", name: "HR Manager Demo", email: "hr@company.co.th", dept: "Human Resources", role: "HR Manager", password: "User123!", active: true },
];

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* initialize demo data below */ }
  localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  return DEMO_USERS;
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
}
function publicUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export function getUsers() { return readUsers().map(publicUser); }
export function login(email, password) {
  const user = readUsers().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password && item.active);
  if (!user) return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกปิดใช้งาน" };
  const safeUser = publicUser(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return { ok: true, user: safeUser };
}
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const current = readUsers().find((u) => u.id === session.id && u.active);
    return current ? publicUser(current) : null;
  } catch { return null; }
}
export function logout() { localStorage.removeItem(SESSION_KEY); }
export function createUser(data) {
  const users = readUsers();
  const email = data.email.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) throw new Error("อีเมลนี้มีผู้ใช้แล้ว");
  if (!data.name.trim() || !email || !data.password || data.password.length < 8) throw new Error("กรุณากรอกข้อมูลให้ครบ และรหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  const idNumber = users.reduce((max, u) => Math.max(max, Number(String(u.id).replace(/\D/g, "")) || 1000), 1000) + 1;
  const user = { id: `U${idNumber}`, name: data.name.trim(), email, dept: data.dept, role: data.role, password: data.password, active: true };
  saveUsers([user, ...users]);
  return publicUser(user);
}
export function updateUser(id, patch) {
  const users = readUsers();
  const updated = users.map((user) => user.id === id ? { ...user, ...patch } : user);
  saveUsers(updated);
  const changed = updated.find((user) => user.id === id);
  return publicUser(changed);
}
export function resetUserPassword(id, password) {
  if (!password || password.length < 8) throw new Error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  const users = readUsers();
  if (!users.some((u) => u.id === id)) throw new Error("ไม่พบผู้ใช้");
  saveUsers(users.map((u) => u.id === id ? { ...u, password } : u));
}
