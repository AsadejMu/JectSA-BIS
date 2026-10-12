
import { supabase } from "../lib/supabaseClient";

function formatDate(date) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRequest(row) {
  return {
    id: row.id,
    position: row.position,
    level: row.level,
    requester: row.requester,
    requesterEmail: row.requester_email,
    dept: row.dept,
    date: formatDate(row.request_date),
    status: row.status,
    quantity: row.quantity,
    reason: row.reason,
    urgency: row.urgency,
    history: row.history || [],
  };
}

export async function getRequests() {
  const { data, error } = await supabase
    .from("manpower_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(formatRequest);
}


export async function createRequest(data) {
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError || !authData.user) {
    throw new Error("กรุณาเข้าสู่ระบบใหม่");
  }

  const user = authData.user;
  const now = new Date();

  // ขอ Request ID จาก Supabase
  const { data: requestId, error: idError } = await supabase
    .rpc("generate_manpower_request_id");

  if (idError) throw idError;

  const request = {
    id: requestId,
    position: data.position,
    level: data.level,
    requester: data.requester,
    requester_email: user.email,
    requester_id: user.id,
    dept: data.dept,
    request_date: now.toISOString().slice(0, 10),
    status: "pending",
    quantity: Number(data.quantity) || 1,
    reason: data.reason,
    urgency: data.urgency || "normal",
    history: [
      {
        status: "pending",
        note: "ส่งคำขอ",
        date: now.toLocaleString("th-TH"),
      },
    ],
  };

  const { data: created, error } = await supabase
    .from("manpower_requests")
    .insert(request)
    .select()
    .single();

  if (error) throw error;

  return formatRequest(created);
}

export async function updateRequestStatus(
  id,
  status,
  note = "",
  actor = "ผู้อนุมัติ"
) {
  const { data: current, error: readError } = await supabase
    .from("manpower_requests")
    .select("history")
    .eq("id", id)
    .single();

  if (readError) throw readError;

  const history = current.history || [];

  const { data: updated, error } = await supabase
    .from("manpower_requests")
    .update({
      status,
      history: [
        ...history,
        {
          status,
          note: note.trim(),
          actor,
          date: new Date().toLocaleString("th-TH"),
        },
      ],
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return formatRequest(updated);
}