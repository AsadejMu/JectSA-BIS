import { useRef, useState } from "react";
import Layout from "../components/Layout";

export default function RequestDetailPage({ user, onNavigate, onLogout }) {
  const noteRef = useRef(null);
  const [note, setNote] = useState("");
  // null = pending, otherwise "approved" | "rejected"
  const [decision, setDecision] = useState(null);

  const approved = decision === "approved";
  const statusText = decision === null ? "รออนุมัติ" : approved ? "อนุมัติแล้ว" : "ไม่อนุมัติ";
  const statusClass = decision === null ? "status" : approved ? "status green" : "status red";
  const decidedNote = decision ? note.trim() : "";

  return (
    <Layout active="requests" crumb={["Manpower Requests", "Request Detail"]} onNavigate={onNavigate} onLogout={onLogout} user={user}>
      <a
        href="#"
        className="back"
        onClick={(e) => {
          e.preventDefault();
          onNavigate?.("requests");
        }}
      >
        ← <span>กลับไปหน้ารายการคำขอ</span>
      </a>
      <div className="heading">
        <div>
          <h1>รายละเอียดคำขออัตรากำลังคน</h1>
          <div className="subtitle">
            Request ID: <strong>MR-2026-0018</strong> &nbsp;·&nbsp; สร้างเมื่อ 8 ต.ค. 2026
          </div>
          <div style={{ marginTop: 12 }}>
            <span className={statusClass}>{statusText}</span>
          </div>
        </div>
        <div className="head-actions">
          <button className="btn lg" onClick={() => window.print()}>
            พิมพ์รายละเอียด
          </button>
          <button className="btn lg primary" onClick={() => noteRef.current?.focus()}>
            ดำเนินการอนุมัติ
          </button>
        </div>
      </div>

      {decision && (
        <div className="toast" role="status">
          {`ตัวอย่างการแสดงผล: คำขอนี้ถูกเปลี่ยนสถานะเป็น “${statusText}” บนหน้าเว็บแล้ว แต่ยังไม่ได้บันทึกลงฐานข้อมูล`}
        </div>
      )}

      <section className="summary">
        <div className="summary-card">
          <div className="label">หมายเลขคำขอ</div>
          <div className="value sm">MR-2026-0018</div>
          <div className="hint">Manpower Request</div>
        </div>
        <div className="summary-card">
          <div className="label">ผู้ส่งคำขอ</div>
          <div className="value sm">Nattapong S.</div>
          <div className="hint">IT Department</div>
        </div>
        <div className="summary-card">
          <div className="label">ระดับตำแหน่ง</div>
          <div className="value sm">Junior</div>
          <div className="hint">Software Development</div>
        </div>
        <div className="summary-card">
          <div className="label">สถานะปัจจุบัน</div>
          <div className="value sm">{statusText}</div>
          <div className="hint">รอผู้อนุมัติพิจารณา</div>
        </div>
      </section>

      <div className="layout">
        <div className="stack">
          <section className="panel">
            <div className="panel-head">
              <h2>ข้อมูล Manpower Request</h2>
              <small>รายละเอียดคำขอ</small>
            </div>
            <div className="panel-body">
              <div className="field-grid">
                <div className="field">
                  <label>ตำแหน่งที่ต้องการ</label>
                  <div className="field-value">Software Developer</div>
                </div>
                <div className="field">
                  <label>ระดับตำแหน่ง (Position Level)</label>
                  <div className="field-value">Junior</div>
                </div>
                <div className="field">
                  <label>ผู้ร้องขอ (Requester)</label>
                  <div className="requester">
                    <div className="avatar">NS</div>
                    <div>
                      <strong>Nattapong S.</strong>
                      <small>IT Department · User ID: U1024</small>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label>วันที่ส่งคำขอ</label>
                  <div className="field-value">8 ตุลาคม 2026</div>
                  <div className="subvalue">09:30 น.</div>
                </div>
                <div className="field">
                  <label>สถานะคำขอ</label>
                  <div>
                    <span className={statusClass}>{statusText}</span>
                  </div>
                </div>
                <div className="field">
                  <label>ผู้รับผิดชอบการพิจารณา</label>
                  <div className="field-value">Sirilak T. (HR Manager)</div>
                  <div className="subvalue">User ID: U1003</div>
                </div>
              </div>
              <div style={{ marginTop: 24 }} className="field">
                <label>เหตุผลในการขออัตรากำลัง (Reason)</label>
                <div className="reason">
                  ทีมพัฒนาระบบมีงานจากโครงการใหม่เพิ่มขึ้น
                  ต้องการบุคลากรเพิ่มเติมเพื่อช่วยพัฒนาและดูแลระบบให้เสร็จตามกำหนดเวลา
                  รวมถึงลดภาระงานของทีมปัจจุบัน
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Approval Record</h2>
              <small>ประวัติการพิจารณา</small>
            </div>
            <div className="table-wrap">
              <table className="narrow">
                <thead>
                  <tr>
                    <th>Approval ID</th>
                    <th>Approver</th>
                    <th>ผลการพิจารณา</th>
                    <th>วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>AR-0081</td>
                    <td>Sirilak T.</td>
                    <td>
                      <span className={statusClass}>{statusText}</span>
                    </td>
                    <td>{decision ? "10 ต.ค. 2026" : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="empty-note">
              หมายเหตุ: ตัวอย่างนี้มีผู้อนุมัติ 1 คน สามารถเพิ่มหลายรายการได้ตามขั้นตอนจริงขององค์กร
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="panel">
            <div className="panel-head">
              <h2>Approval Workflow</h2>
              <span className={decision ? statusClass : "status"}>{decision ? "ดำเนินการแล้ว" : "กำลังดำเนินการ"}</span>
            </div>
            <div className="timeline">
              <div className="event">
                <div className="dot">✓</div>
                <div>
                  <div className="event-title">ส่งคำขอสำเร็จ</div>
                  <div className="event-meta">
                    Nattapong S. · Requester
                    <br />8 ต.ค. 2026 เวลา 09:30 น.
                  </div>
                </div>
              </div>
              {decision === null ? (
                <div className="event">
                  <div className="dot pending">…</div>
                  <div>
                    <div className="event-title">รอการอนุมัติ</div>
                    <div className="event-meta">
                      Sirilak T. · HR Manager
                      <br />
                      รอการพิจารณา
                    </div>
                  </div>
                </div>
              ) : (
                <div className="event">
                  <div className={approved ? "dot" : "dot rejected"}>{approved ? "✓" : "×"}</div>
                  <div>
                    <div className="event-title">{statusText}</div>
                    <div className="event-meta">
                      Sirilak T. · HR Manager
                      <br />
                      10 ต.ค. 2026 · ดำเนินการโดยผู้อนุมัติ
                    </div>
                    {decidedNote && <div className="event-note">{decidedNote}</div>}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>ดำเนินการพิจารณา</h2>
              <small>Approver only</small>
            </div>
            <form className="approval-form" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="approvalNote">ความคิดเห็นผู้อนุมัติ (ถ้ามี)</label>
              <textarea
                id="approvalNote"
                ref={noteRef}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ระบุเหตุผลหรือความคิดเห็นประกอบการพิจารณา..."
              />
              <div className="form-actions">
                <button type="button" className="btn approve" onClick={() => setDecision("approved")}>
                  อนุมัติ
                </button>
                <button type="button" className="btn reject" onClick={() => setDecision("rejected")}>
                  ปฏิเสธ
                </button>
              </div>
              <div className="notice">ปุ่มนี้เป็นตัวอย่างฝั่งหน้าเว็บเท่านั้น ยังไม่ได้บันทึกข้อมูลลงฐานข้อมูลจริง</div>
            </form>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>ข้อมูลที่เกี่ยวข้อง</h2>
            </div>
            <div className="panel-body" style={{ display: "grid", gap: 15 }}>
              <div className="field">
                <label>Request ID (FK)</label>
                <div className="field-value">MR-2026-0018</div>
              </div>
              <div className="field">
                <label>Requester ID (User)</label>
                <div className="field-value">U1024</div>
              </div>
              <div className="field">
                <label>Approver ID (User)</label>
                <div className="field-value">U1003</div>
              </div>
              <div className="field">
                <label>Approval ID</label>
                <div className="field-value">AR-0081</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
