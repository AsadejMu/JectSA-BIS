import { useState } from "react";
import Layout from "../components/Layout";

const LABEL = { pending: "รออนุมัติ", approved: "อนุมัติ", rejected: "ไม่อนุมัติ" };
const CLASS = { pending: "status", approved: "status green", rejected: "status red" };
const TABS = [{ key: "all", label: "ทั้งหมด" }, { key: "pending", label: "รออนุมัติ" }, { key: "approved", label: "อนุมัติแล้ว" }, { key: "rejected", label: "ไม่อนุมัติ" }];

export default function RequestListPage({ user, requests = [], onNavigate, onLogout, onOpenRequest }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const count = (status) => requests.filter((r) => r.status === status).length;
  const q = query.trim().toLowerCase();
  const visible = requests.filter((r) => (tab === "all" || r.status === tab) && (!q || [r.id, r.position, r.requester, r.dept].some((v) => String(v || "").toLowerCase().includes(q))));

  return (
    
    <Layout active="requests" crumb={["Manpower Requests", "Requests"]} onNavigate={onNavigate} onLogout={onLogout} user={user}>
      {["HR Administrator", "Requester"].includes(user?.role) && (
  <div className="heading"><div><h1>ศูนย์คำขอ</h1><div className="subtitle page-sub">รายการคำขออัตรากำลังคน</div></div>
    <button
      className="btn primary"
      onClick={() => onNavigate?.("newRequest")}
    >
      + สร้างคำขอใหม่
    </button>
  </div>
)}
      <section className="summary">
        
        <div className="summary-card"><div className="label">คำขอทั้งหมด</div><div className="value">{requests.length}</div></div>
        <div className="summary-card"><div className="label">รออนุมัติ</div><div className="value">{count("pending")}</div></div>
        <div className="summary-card"><div className="label">อนุมัติ</div><div className="value">{count("approved")}</div></div>
        <div className="summary-card"><div className="label">ไม่อนุมัติ</div><div className="value">{count("rejected")}</div></div>
      </section>
      <section className="panel"><div className="toolbar"><div className="tabs">{TABS.map((t) => <button key={t.key} className={tab === t.key ? "tab on" : "tab"} onClick={() => setTab(t.key)}>{t.label}</button>)}</div><input className="search" type="search" placeholder="ค้นหาตำแหน่ง ผู้ขอ หรือรหัสคำขอ" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="table-wrap"><table><thead><tr><th>Request ID</th><th>ตำแหน่ง</th><th>ผู้ส่งคำขอ</th><th>จำนวน</th><th>วันที่ส่ง</th><th>สถานะ</th><th></th></tr></thead><tbody>
          {visible.map((r) => <tr key={r.id}><td>{r.id}</td><td><strong>{r.position}</strong><div className="sub">{r.level}</div></td><td>{r.requester}<div className="sub">{r.dept}</div></td><td>{r.quantity || 1}</td><td>{r.date}</td><td><span className={CLASS[r.status]}>{LABEL[r.status]}</span></td><td><button className="btn" onClick={() => onOpenRequest?.(r.id)}>ดูรายละเอียด</button></td></tr>)}
        </tbody></table>{visible.length === 0 && <div className="empty">ไม่พบคำขอที่ตรงกับเงื่อนไข</div>}</div>
      </section>
      <div className="notice" style={{ marginTop: 14 }}>หมายเหตุ: ข้อมูลคำขอจะถูกจัดเก็บในฐานข้อมูล Supabase</div>
    </Layout>
  );
}
