import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    setError("");
    onLogin?.({ email: email.trim(), remember });
  };

  return (
    <div className="login-page">
      <section className="login-aside">
        <div className="brand">
          <div className="brand-icon">M</div>
          <div>
            <strong>Manpower Plan</strong>
            <small>Workforce Management</small>
          </div>
        </div>
        <div className="login-pitch">
          <h2>จัดการคำขออัตรากำลังคนและการอนุมัติในที่เดียว</h2>
          <p>ส่งคำขอ ติดตามสถานะ และพิจารณาอนุมัติได้ง่าย พร้อมประวัติการดำเนินการครบถ้วน</p>
        </div>
        <div className="login-foot">© 2026 Manpower Plan</div>
      </section>

      <section className="login-side">
        <form className="login-card" onSubmit={submit} noValidate>
          <h1>เข้าสู่ระบบ</h1>
          <div className="subtitle">ใช้อีเมลบริษัทของคุณเพื่อเข้าใช้งาน</div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="name@company.co.th"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">รหัสผ่าน</label>
            <div className="input-wrap">
              <input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" className="pw-toggle" onClick={() => setShow((v) => !v)}>
                {show ? "ซ่อน" : "แสดง"}
              </button>
            </div>
          </div>

          <div className="login-row">
            <label className="check">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              จดจำการเข้าสู่ระบบ
            </label>
            <a href="#" onClick={(e) => e.preventDefault()}>
              ลืมรหัสผ่าน?
            </a>
          </div>

          <button type="submit" className="login-submit">
            เข้าสู่ระบบ
          </button>
          <div className="notice">หน้านี้เป็นตัวอย่างฝั่งหน้าเว็บเท่านั้น ยังไม่ได้ตรวจสอบกับฐานข้อมูลจริง</div>
        </form>
      </section>
    </div>
  );
}
