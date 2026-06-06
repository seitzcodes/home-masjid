"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Admin client for storage (bypass RLS on uploads)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "home_masjid" } }
);

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Fetch the faculty's masjid_id
  const { data: faculty } = await (supabase as any).from("masjid_faculty")
    .select("masjid_id")
    .eq("user_id", user.id)
    .single();

  if (!faculty?.masjid_id) {
    return { error: "No masjid found for your account" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const goalStr = formData.get("goal_amount") as string;
  const coverFile = formData.get("cover_image") as File | null;

  if (!title || title.length < 3) return { error: "Title must be at least 3 characters" };

  const goalAmount = parseFloat(goalStr);
  if (isNaN(goalAmount) || goalAmount < 100) {
    return { error: "Goal amount must be at least R100" };
  }

  // Upload cover image to Supabase Storage (optional)
  let coverUrl: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${faculty.masjid_id}/${crypto.randomUUID()}.${ext}`;
    const bytes = await coverFile.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from("project-covers")
      .upload(path, bytes, { contentType: coverFile.type, upsert: false });

    if (!uploadError) {
      const { data: urlData } = supabaseAdmin.storage
        .from("project-covers")
        .getPublicUrl(path);
      coverUrl = urlData.publicUrl;
    } else {
      console.error("Cover upload error:", uploadError);
      // Non-fatal — proceed without cover
    }
  }

  const { error: insertError } = await (supabase as any).from("projects").insert({
    masjid_id: faculty.masjid_id,
    title,
    description: description || null,
    goal_amount: goalAmount,
    current_amount: 0,
    is_active: true,
    cover_image_url: coverUrl,
  });

  if (insertError) {
    console.error("Project insert error:", insertError);
    return { error: "Failed to create project" };
  }

  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function toggleProjectStatus(projectId: string, newStatus: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify faculty owns this project's masjid
  const { data: project } = await (supabase as any).from("projects")
    .select("masjid_id")
    .eq("id", projectId)
    .single();

  if (!project?.masjid_id) return { error: "Project not found" };

  const { data: faculty } = await (supabase as any).from("masjid_faculty")
    .select("id")
    .eq("user_id", user.id)
    .eq("masjid_id", project.masjid_id)
    .single();

  if (!faculty) return { error: "Access denied" };

  const { error } = await (supabase as any).from("projects")
    .update({ is_active: newStatus })
    .eq("id", projectId);

  if (error) return { error: "Failed to update project status" };

  revalidatePath("/dashboard/projects");
  return { success: true };
}
