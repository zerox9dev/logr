import { getSupabaseClient } from "./supabase";

// ── client_profiles ──────────────────────────────────────────────────────────

export async function getClientProfiles(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", userId);
  return { data: data || [], error };
}

export async function upsertClientProfile(userId, clientId, fields) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("client_profiles")
    .upsert(
      { user_id: userId, client_id: clientId, ...fields, updated_at: new Date().toISOString() },
      { onConflict: "user_id,client_id" }
    )
    .select()
    .single();
  return { data, error };
}

// ── leads ─────────────────────────────────────────────────────────────────────

export async function getLeads(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return { data: data || [], error };
}

export async function createLead(userId, leadData) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .insert({ user_id: userId, ...leadData })
    .select()
    .single();
  return { data, error };
}

export async function updateLead(id, updates) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("leads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteLead(id) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  return { error };
}

// ── invoices ──────────────────────────────────────────────────────────────────

export async function getInvoices(userId) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data: data || [], error };
}

export async function createInvoice(userId, invoiceData) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert({ user_id: userId, ...invoiceData })
    .select()
    .single();
  return { data, error };
}

export async function updateInvoice(id, updates) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invoices")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}
