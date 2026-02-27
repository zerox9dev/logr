import { getSupabaseClient } from "./supabase";

const DEFAULT_STAGE_TITLES = {
  freelancer: ["Lead", "Negotiation", "Contract", "Active", "Done"],
  jobseeker: ["Saved", "Applied", "Response", "Interview", "Offer"],
  custom: ["Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5"],
};

function buildDefaultStages(type, customTitles = []) {
  const titles = customTitles.length === 5
    ? customTitles
    : (DEFAULT_STAGE_TITLES[type] || DEFAULT_STAGE_TITLES.custom);
  return titles.map((title, index) => ({
    key: type === "custom"
      ? `custom_${index + 1}`
      : ["lead", "negotiation", "contract", "active", "done"][index],
    title,
    position: index,
  }));
}

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

// ── funnels ───────────────────────────────────────────────────────────────────

export async function getFunnelsWithStages(userId) {
  const supabase = getSupabaseClient();

  const { data: funnels, error: funnelsError } = await supabase
    .from("funnels")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (funnelsError) return { data: [], error: funnelsError };
  if (!funnels || funnels.length === 0) return { data: [], error: null };

  const funnelIds = funnels.map((funnel) => funnel.id);
  const { data: stages, error: stagesError } = await supabase
    .from("funnel_stages")
    .select("*")
    .in("funnel_id", funnelIds)
    .order("position", { ascending: true });

  if (stagesError) return { data: [], error: stagesError };

  const stagesByFunnelId = (stages || []).reduce((acc, stage) => {
    if (!acc[stage.funnel_id]) acc[stage.funnel_id] = [];
    acc[stage.funnel_id].push(stage);
    return acc;
  }, {});

  return {
    data: funnels.map((funnel) => ({
      ...funnel,
      stages: stagesByFunnelId[funnel.id] || [],
    })),
    error: null,
  };
}

export async function createFunnelWithStages(userId, { type = "custom", name, customStageTitles = [] }) {
  const supabase = getSupabaseClient();
  const normalizedType = ["freelancer", "jobseeker", "custom"].includes(type) ? type : "custom";
  const fallbackName =
    normalizedType === "freelancer" ? "Freelancer Funnel" :
    normalizedType === "jobseeker" ? "Job Search Funnel" :
    "Custom Funnel";

  const { data: funnel, error: funnelError } = await supabase
    .from("funnels")
    .insert({
      user_id: userId,
      type: normalizedType,
      name: (name || "").trim() || fallbackName,
    })
    .select()
    .single();

  if (funnelError || !funnel) return { data: null, error: funnelError || new Error("Failed to create funnel") };

  const stagesToCreate = buildDefaultStages(normalizedType, customStageTitles).map((stage) => ({
    funnel_id: funnel.id,
    key: stage.key,
    title: stage.title,
    position: stage.position,
  }));

  const { data: stages, error: stagesError } = await supabase
    .from("funnel_stages")
    .insert(stagesToCreate)
    .select()
    .order("position", { ascending: true });

  if (stagesError) return { data: null, error: stagesError };

  return { data: { ...funnel, stages: stages || [] }, error: null };
}

export async function updateFunnelStage(stageId, updates) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("funnel_stages")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", stageId)
    .select()
    .single();
  return { data, error };
}

export async function deleteFunnelWithLeads(funnelId) {
  const supabase = getSupabaseClient();

  const { error: leadsError } = await supabase
    .from("leads")
    .delete()
    .eq("funnel_id", funnelId);
  if (leadsError) return { error: leadsError };

  const { error: funnelError } = await supabase
    .from("funnels")
    .delete()
    .eq("id", funnelId);
  return { error: funnelError || null };
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

export async function deleteInvoice(id) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  return { error };
}
