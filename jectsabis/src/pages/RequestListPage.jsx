import { useState } from "react";
import Layout from "../components/Layout";

const REQUESTS = [
  { id: "MR-2026-0018", position: "Software Developer", level: "Junior", requester: "Nattapong S.", dept: "IT Department", date: "8 ต.ค. 2026", status: "pending" },
  { id: "MR-2026-0017", position: "QA Engineer", level: "Mid", requester: "Kanokwan P.", dept: "IT Department", date: "7 ต.ค. 2026", status: "pending" },
  { id: "MR-2026-0016", position: "Accountant", level: "Senior", requester: "Warunee C.", dept: "Finance", date: "5 ต.ค. 2026", status: "approved" },
  { id: "MR-2026-0015", position: "Marketing Executive", level: "Junior", requester: "Pichit L.", dept: "Marketing", date: "3 ต.ค. 2026", status: "rejected" },
  { id: "MR-2026-0014", position: "Data Analyst", level: "Mid", requester: "Suda R.", dept: "Operations", date: "1 ต.ค. 2026", status: "approved" },
];

const LABEL = { pending: "รออนุมัติ", approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ" };
const CLASS = { pending: "status", approved: "status green", rejected: "status red" };
const TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ไม่อนุมัติ" },
];

export default function RequestListPage({ user, onNavigate, onLogout }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const count = (s) => REQUESTS.filter((r) => r.status === s).length;
  const q = query.trim().toLowerCase();
  const visible = REQUESTS.filter(
    (r) =>
      (tab === "all" || r.status === tab) &&
      (!q || [r.id, r.position, r.requester, r.dept].some((v) => v.toLowerCase().includes(q)))
  );

  return (
    <Layout active="requests" crumb={["Manpower Requests", "Request List"]} onNavigate={onNavigate} onLogout={onLogout} user={user}>
      <h1>คำขออัตรากำลังคน</h1>
      <div className="subtitle page-sub">รายการคำขออัตรากำลังคนทั้งหมดในระบบ</div>

      <section className="summary">
        <div className="summary-card">
          <div className="label">คำขอทั้งหมด</div>
          <div className="value">{REQUESTS.length}</div>
        </div>
        <div className="summary-card">
          <div className="label">รออนุมัติ</div>
          <div className="value">{count("pending")}</div>
        </div>
        <div className="summary-card">
          <div className="label">อนุมัติแล้ว</div>
          <div className="value">{count("approved")}</div>
        </div>
        <div className="summary-card">
          <div className="label">ไม่อนุมัติ</div>
          <div className="value">{count("rejected")}</div>
        </div>
      </section>

      <section className="panel">
        <div className="toolbar">
          <div className="tabs">
            {TABS.map((t) => (
              <button key={t.key} className={tab === t.key ? "tab on" : "tab"} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <input
            className="search"
            type="search"
            placeholder="ค้นหาตำแหน่ง ผู้ขอ หรือรหัสคำขอ"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>ตำแหน่ง</th>
                <th>ผู้ส่งคำขอ</th>
                <th>วันที่ส่ง</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <strong>{r.position}</strong>
                    <div className="sub">{r.level}</div>
                  </td>
                  <td>
                    {r.requester}
                    <div className="sub">{r.dept}</div>
                  </td>
                  <td>{r.date}</td>
                  <td>
                    <span className={CLASS[r.status]}>{LABEL[r.status]}</span>
                  </td>
                  <td>
                    <button className="btn" onClick={() => onNavigate?.("detail")}>
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="empty">ไม่พบคำขอที่ตรงกับเงื่อนไข</div>}
        </div>
      </section>
    </Layout>
  );
}
