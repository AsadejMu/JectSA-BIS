import { useState } from "react";

export default function LoginPage({ onLogin, errorMessage = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน"); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("รูปแบบอีเมลไม่ถูกต้อง"); return; }
    setError(""); onLogin?.(email.trim(), password);
  };
  return <div className="login-page">
    <section className="login-aside"><div className="brand"><div className="brand-icon">M</div><div><strong>Manpower Plan</strong><small>Workforce Management</small></div></div><div className="login-pitch"><h2>จัดการคำขออัตรากำลังคนและการอนุมัติในที่เดียว</h2><p>เข้าสู่ระบบตามบัญชีที่ผู้ดูแลสร้างไว้ เมนูจะแสดงตาม Role ของคุณ</p></div><div className="login-foot">© 2026 Manpower Plan</div></section>
    <section className="login-side"><form className="login-card" onSubmit={submit} noValidate><h1>เข้าสู่ระบบ</h1><div className="subtitle">ใช้อีเมลและรหัสผ่านที่ผู้ดูแลระบบกำหนด</div>
      {(error || errorMessage) && <div className="login-error" role="alert">{error || errorMessage}</div>}
      <div className="login-field"><label htmlFor="email">อีเมล</label><input id="email" type="email" autoComplete="username" placeholder="name@company.co.th" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="login-field"><label htmlFor="password">รหัสผ่าน</label><div className="input-wrap"><input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className="pw-toggle" onClick={() => setShow((v) => !v)}>{show ? "ซ่อน" : "แสดง"}</button></div></div>
      <button type="submit" className="login-submit">เข้าสู่ระบบ</button>
    </form></section>
  </div>;
}
