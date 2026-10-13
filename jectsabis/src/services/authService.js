
import { supabase } from "../lib/supabaseClient";

async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      email,
      dept,
      active,
      role_id,
      created_at,
      roles (
        role_name
      )
    `)
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { profile: null, error };
  }

  // แปลงชื่อ Role จากตาราง roles
  // ให้โค้ดเดิมยังใช้ user.role ได้เหมือนเดิม
  const profile = {
    ...data,
    role: data.roles?.role_name || null,
  };

  delete profile.roles;

  return { profile, error: null };
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return {
      ok: false,
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    };
  }

  const { profile, error: profileError } = await getProfile(
    data.user.id
  );

  if (profileError || !profile || !profile.active || !profile.role) {
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

  const { profile, error } = await getProfile(session.user.id);

  if (error || !profile || !profile.active || !profile.role) {
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
        password,
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
    .select(`
      id,
      name,
      email,
      dept,
      active,
      role_id,
      created_at,
      roles (
        role_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("โหลดรายชื่อผู้ใช้ไม่สำเร็จ: " + error.message);
  }

  return (data || []).map((profile) => ({
    ...profile,
    role: profile.roles?.role_name || null,
    roles: undefined,
  }));
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
  // แปลงชื่อ Role เป็น role_id ก่อนบันทึก
  const updateData = { ...patch };

  if (Object.prototype.hasOwnProperty.call(updateData, "role")) {
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("role_id")
      .eq("role_name", updateData.role)
      .single();

    if (roleError || !roleData) {
      throw new Error("ไม่พบ Role ที่เลือก");
    }

    updateData.role_id = roleData.role_id;
    delete updateData.role;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", id)
    .select(`
      id,
      name,
      email,
      dept,
      active,
      role_id,
      created_at,
      roles (
        role_name
      )
    `)
    .single();

  if (error) {
    throw new Error("อัปเดตผู้ใช้ไม่สำเร็จ: " + error.message);
  }

  return {
    ...data,
    role: data.roles?.role_name || null,
    roles: undefined,
  };
}