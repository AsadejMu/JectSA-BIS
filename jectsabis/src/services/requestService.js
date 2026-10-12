const STORAGE_KEY = "manpower.requests.v1";

const INITIAL_REQUESTS = [
  { id: "MR-2026-0018", position: "Software Developer", level: "Junior", requester: "Nattapong S.", requesterEmail: "requester@company.co.th", dept: "IT Department", date: "8 ต.ค. 2026", status: "pending", quantity: 1, reason: "ทีมพัฒนาระบบมีงานจากโครงการใหม่เพิ่มขึ้น ต้องการบุคลากรเพิ่มเติม", urgency: "normal", history: [] },
  { id: "MR-2026-0017", position: "QA Engineer", level: "Mid", requester: "Kanokwan P.", requesterEmail: "kanokwan@company.co.th", dept: "IT Department", date: "7 ต.ค. 2026", status: "pending", quantity: 1, reason: "ต้องการเพิ่มผู้ทดสอบระบบ", urgency: "normal", history: [] },
  { id: "MR-2026-0016", position: "Accountant", level: "Senior", requester: "Warunee C.", dept: "Finance", date: "5 ต.ค. 2026", status: "approved", quantity: 1, reason: "รองรับปริมาณงานบัญชีที่เพิ่มขึ้น", urgency: "normal", history: [] },
  { id: "MR-2026-0015", position: "Marketing Executive", level: "Junior", requester: "Pichit L.", dept: "Marketing", date: "3 ต.ค. 2026", status: "rejected", quantity: 1, reason: "ขยายทีมการตลาด", urgency: "normal", history: [] },
  { id: "MR-2026-0014", position: "Data Analyst", level: "Mid", requester: "Suda R.", dept: "Operations", date: "1 ต.ค. 2026", status: "approved", quantity: 1, reason: "ช่วยวิเคราะห์ข้อมูลการดำเนินงาน", urgency: "normal", history: [] },
];

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRequests() {
  const stored = readStored();
  if (Array.isArray(stored)) return stored;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
}

function saveRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  return requests;
}

export function createRequest(data) {
  const requests = getRequests();
  const nextNumber = requests.reduce((max, item) => {
    const match = item.id?.match(/MR-\d{4}-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
  const now = new Date();
  const request = {
    ...data,
    id: `MR-${now.getFullYear()}-${String(nextNumber).padStart(4, "0")}`,
    date: now.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }),
    status: "pending",
    history: [{ status: "pending", note: "ส่งคำขอ", date: now.toLocaleString("th-TH") }],
  };
  saveRequests([request, ...requests]);
  return request;
}

export function updateRequestStatus(id, status, note = "", actor = "ผู้อนุมัติ") {
  const requests = getRequests();
  const updated = requests.map((request) => {
    if (request.id !== id) return request;
    const now = new Date();
    return {
      ...request,
      status,
      history: [...(request.history || []), { status, note: note.trim(), actor, date: now.toLocaleString("th-TH") }],
    };
  });
  saveRequests(updated);
  return updated.find((request) => request.id === id) || null;
}
