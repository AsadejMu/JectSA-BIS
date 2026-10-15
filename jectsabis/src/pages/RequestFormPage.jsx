import { useState } from "react";
import Layout from "../components/Layout";

export default function RequestFormPage({ user, onNavigate, onLogout, onCreateRequest }) {
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("Junior");
  const [dept, setDept] = useState("IT Department");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!position.trim() || !reason.trim() || Number(quantity) < 1) {
      setError("กรุณากรอกตำแหน่ง เหตุผล และจำนวนพนักงานให้ถูกต้อง");
      return;
    }
    const requester = user?.email?.split("@")[0] || "Demo User";
    onCreateRequest?.({ position: position.trim(), level, dept, quantity: Number(quantity), reason: reason.trim(), urgency, requester });
  };

  return (
    <Layout active="requests" crumb={["Manpower Requests", "Create Request"]} onNavigate={onNavigate} onLogout={onLogout} user={user}>
      <button href="#" className="back" onClick={(e) => { e.preventDefault(); onNavigate?.("requests"); }}>← <span>กลับไปหน้ารายการคำขอ</span></button>
      <h1>สร้างคำขออัตรากำลังคน</h1>
      <div className="subtitle page-sub">กรอกข้อมูลที่จำเป็นเพื่อส่งคำขอให้ผู้อนุมัติพิจารณา</div>
      <section className="panel">
        <div className="panel-head"><h2>ข้อมูล Manpower Request</h2><small>ฟิลด์ที่มี * จำเป็นต้องกรอก</small></div>
        <div className="panel-body">
          {error && <div className="toast red" role="alert">{error}</div>}
          <form className="approval-form" onSubmit={submit}>
            <div className="field-grid">
              <div className="field"><label htmlFor="position">ตำแหน่งที่ต้องการ *</label><input id="position" className="search" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="เช่น Software Developer" required /></div>
              <div className="field"><label htmlFor="level">ระดับตำแหน่ง</label><select id="level" className="search" value={level} onChange={(e) => setLevel(e.target.value)}><option>Junior</option><option>Mid</option><option>Senior</option><option>Manager</option></select></div>
              <div className="field"><label htmlFor="dept">แผนก</label><select id="dept" className="search" value={dept} onChange={(e) => setDept(e.target.value)}><option>IT Department</option><option>Finance</option><option>Marketing</option><option>Operations</option><option>Human Resources</option></select></div>
              <div className="field"><label htmlFor="quantity">จำนวนพนักงาน *</label><input id="quantity" className="search" type="number" min="1" max="999" value={quantity} onChange={(e) => setQuantity(e.target.value)} required /></div>
              <div className="field"><label htmlFor="urgency">ความเร่งด่วน</label><select id="urgency" className="search" value={urgency} onChange={(e) => setUrgency(e.target.value)}><option value="normal">ปกติ</option><option value="urgent">เร่งด่วน</option></select></div>
            </div>
            <div className="field" style={{ marginTop: 20 }}><label htmlFor="reason">เหตุผลในการขออัตรากำลัง *</label><textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="อธิบายความจำเป็น เช่น ปริมาณงานเพิ่มขึ้น หรือมีพนักงานลาออก" required /></div>
            <div className="form-actions" style={{ marginTop: 20 }}><button type="button" className="btn" onClick={() => onNavigate?.("requests")}>ยกเลิก</button><button type="submit" className="btn primary">ส่งคำขอ</button></div>
          </form>
          <div className="notice" style={{ marginTop: 16 }}>หมายเหตุ: ข้อมูลคำขอจะถูกจัดเก็บในฐานข้อมูล Supabase</div>
        </div>
      </section>
    </Layout>
  );
}
