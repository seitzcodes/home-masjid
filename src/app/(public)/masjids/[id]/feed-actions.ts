"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to like posts." };
  }

  // Check if like exists
  const { data: existingLike } = await (supabase as any).from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await (supabase as any).from("post_likes")
      .delete()
      .eq("id", existingLike.id);
    if (error) return { error: "Failed to unlike." };
  } else {
    // Like
    const { error } = await (supabase as any).from("post_likes")
      .insert({
        post_id: postId,
        user_id: user.id
      });
    if (error) return { error: "Failed to like." };
  }

  revalidatePath("/"); // Adjust according to where the feed is displayed
  return { success: true };
}

export async function submitComment(postId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to comment." };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Comment cannot be empty." };
  }

  const { error } = await (supabase as any).from("comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim()
    });

  if (error) {
    console.error("Error submitting comment:", error);
    return { error: "Failed to submit comment." };
  }

  revalidatePath("/");
  return { success: true };
}
