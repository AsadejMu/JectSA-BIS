import { supabase } from "../lib/supabaseClient";

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password,
  });

  if (error) {
    return {
      ok: false,
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, email, dept, role, active")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile || !profile.active) {
    await supabase.auth.signOut();

    return {
      ok: false,
      message: "ไม่พบโปรไฟล์ผู้ใช้ หรือบัญชีถูกปิดใช้งาน",
    };
  }

  return {
    ok: true,
    user: profile,
  };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, email, dept, role, active")
    .eq("id", session.user.id)
    .single();

  if (error || !profile || !profile.active) {
    await supabase.auth.signOut();
    return null;
  }

  return profile;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function resetUserPassword(id, password) {
  if (!password || password.length < 8) {
    throw new Error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  }

  const { data, error } = await supabase.functions.invoke(
    "reset-user-password",
    {
      body: {
        userId: id,
        password: password,
      },
    }
  );

  if (error) {
    throw new Error(error.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.ok) {
    throw new Error("รีเซ็ตรหัสผ่านไม่สำเร็จ");
  }

  return data;
}

export async function getUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, dept, role, active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("โหลดรายชื่อผู้ใช้ไม่สำเร็จ: " + error.message);
  }

  return data || [];
}


export async function createUser(data) {
  const { data: result, error } = await supabase.functions.invoke(
    "create-user",
    {
      body: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        dept: data.dept,
        role: data.role,
        password: data.password,
      },
    }
  );

  if (error) {
    throw new Error(error.message || "สร้างบัญชีไม่สำเร็จ");
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  if (!result?.ok) {
    throw new Error("ไม่ได้รับผลยืนยันการสร้างบัญชี");
  }

  return result;
}


export async function updateUser(id, patch) {
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error("อัปเดตผู้ใช้ไม่สำเร็จ: " + error.message);
  }

  return data;
}