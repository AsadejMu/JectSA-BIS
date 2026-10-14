import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getApprovalRecords } from "../services/requestService";

const LABEL = {
  pending: "รออนุมัติ",
  approved: "อนุมัติ",
  rejected: "ไม่อนุมัติ",
};

const CLASS = {
  pending: "status",
  approved: "status green",
  rejected: "status red",
};

const TABS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติ" },
  { key: "rejected", label: "ไม่อนุมัติ" },
];

export default function ApprovalRecordPage({
  user,
  requests = [],
  onNavigate,
  onLogout,
  onOpenRequest,
  onDecideRequest,
}) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [toast] = useState("");

  const [approvalRecords, setApprovalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [recordError, setRecordError] = useState("");

  useEffect(() => {
    async function loadApprovalRecords() {
      try {
        setLoadingRecords(true);
        setRecordError("");

        const data = await getApprovalRecords();
        setApprovalRecords(data);
      } catch (error) {
        console.error("โหลดประวัติการอนุมัติไม่สำเร็จ:", error);
        setRecordError(error.message || "โหลดประวัติไม่สำเร็จ");
      } finally {
        setLoadingRecords(false);
      }
    }

    loadApprovalRecords();
  }, []);

  const count = (status) =>
    requests.filter((r) => r.status === status).length;

  const q = query.trim().toLowerCase();

  const visible = requests.filter(
    (r) =>
      (tab === "all" || r.status === tab) &&
      (!q ||
        [r.id, r.position, r.requester, r.dept].some((v) =>
          String(v || "").toLowerCase().includes(q)
        ))
  );

  return (
    <Layout
      active="approvals"
      crumb={["Approval Center", "Approvals"]}
      onNavigate={onNavigate}
      onLogout={onLogout}
      user={user}
    >
      <h1>ศูนย์อนุมัติ</h1>

      <div className="subtitle page-sub">
        ตรวจสอบและพิจารณาคำขออัตรากำลังคนที่รอการอนุมัติ
      </div>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <section className="summary cols-3">
        <div className="summary-card">
          <div className="label">รออนุมัติ</div>
          <div className="value">{count("pending")}</div>
        </div>

        <div className="summary-card">
          <div className="label">อนุมัติ</div>
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
              <button
                key={t.key}
                className={tab === t.key ? "tab on" : "tab"}
                onClick={() => setTab(t.key)}
              >
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
                <th>ดำเนินการ</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <strong>{r.position}</strong>
                    <div className="sub">
                      {r.level} · จำนวน {r.quantity || 1} คน
                    </div>
                  </td>
                  <td>
                    {r.requester}
                    <div className="sub">{r.dept}</div>
                  </td>
                  <td>{r.date}</td>
                  <td>
                    <span className={CLASS[r.status] || "status"}>
                      {LABEL[r.status] || r.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => onOpenRequest?.(r.id)}
                    >
                      ดูรายละเอียด
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="empty">
              ไม่พบคำขอที่ตรงกับเงื่อนไข
            </div>
          )}
        </div>
      </section>
      <section
        className="panel"
        style={{
          marginTop: 20,
          padding: "24px 20px",
        }}
      >
        <h2 style={{ margin: "0 0 12px 0" }}>
          ประวัติการอนุมัติ
        </h2>

        <div
          className="subtitle page-sub"
          style={{ marginBottom: 20 }}
        >
          ข้อมูลจากตาราง approval_records
        </div>


        {loadingRecords ? (
          <div className="empty">กำลังโหลดประวัติ...</div>
        ) : recordError ? (
          <div className="empty">
            โหลดประวัติไม่สำเร็จ: {recordError}
          </div>
        ) : approvalRecords.length === 0 ? (
          <div className="empty">ยังไม่มีประวัติการอนุมัติ</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>รหัสคำขอ</th>
                  <th>ผู้อนุมัติ</th>
                  <th>สถานะ</th>
                  <th>วันที่ดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {approvalRecords.map((record) => (
                  <tr key={record.approval_id}>
                    <td>{record.request_id}</td>
                    <td>
                      {record.profiles?.name ||
                        record.profiles?.email ||
                        record.approver_id}
                    </td>
                    <td>
                      <span
                        className={
                          CLASS[record.approval_status] || "status"
                        }
                      >
                        {LABEL[record.approval_status] ||
                          record.approval_status}
                      </span>
                    </td>
                    <td>
                      {record.created_at
                        ? new Date(record.created_at).toLocaleString(
                          "th-TH"
                        )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="notice" style={{ marginTop: 14 }}>
        ประวัติการอนุมัติถูกอ่านจากฐานข้อมูล Supabase
      </div>
    </Layout>
  );
}