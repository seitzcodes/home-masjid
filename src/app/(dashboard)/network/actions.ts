"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendConnectionRequest(requesterMasjidId: string, targetMasjidId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Validate requester is faculty
  const { data: isFaculty } = await (supabase as any).rpc("is_faculty_member", {
    check_masjid_id: requesterMasjidId,
    check_user_id: user.id
  });

  if (!isFaculty) return { error: "You must be faculty to send connection requests" };

  const { error } = await (supabase as any).from("masjid_connections")
    .insert({
      requester_masjid_id: requesterMasjidId,
      receiver_masjid_id: targetMasjidId,
      status: "pending"
    });

  if (error) {
    if (error.code === '23505') {
      return { error: "A connection request already exists between these masjids." };
    }
    console.error("Error sending connection request:", error);
    return { error: "Failed to send connection request." };
  }

  revalidatePath("/network/directory");
  return { success: true };
}

export async function respondToConnection(connectionId: string, status: "accepted" | "declined") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Note: RLS policies ensure the user can only update if they are faculty of the receiver masjid
  const { error } = await (supabase as any).from("masjid_connections")
    .update({ status })
    .eq("id", connectionId);

  if (error) {
    console.error("Error responding to connection:", error);
    return { error: "Failed to respond to connection." };
  }

  revalidatePath("/network/directory");
  revalidatePath("/network/messages");
  return { success: true };
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const senderMasjidId = formData.get("senderMasjidId") as string;
  const receiverMasjidId = formData.get("receiverMasjidId") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;
  const msgType = formData.get("msgType") as "standard" | "speaker_invite" || "standard";
  
  // Parse metadata if speaker invite
  let metadata = {};
  if (msgType === "speaker_invite") {
    const eventDate = formData.get("eventDate");
    const compensation = formData.get("compensation");
    if (eventDate) metadata = { ...metadata, eventDate };
    if (compensation) metadata = { ...metadata, compensation };
  }

  // Validate requester is faculty
  const { data: isFaculty } = await (supabase as any).rpc("is_faculty_member", {
    check_masjid_id: senderMasjidId,
    check_user_id: user.id
  });

  if (!isFaculty) return { error: "You must be faculty to send messages" };

  // Ensure connection exists and is accepted (we could query connection_id, but we'll enforce logically here)
  const { data: connection } = await (supabase as any).from("masjid_connections")
    .select("id")
    .or(`and(requester_masjid_id.eq.${senderMasjidId},receiver_masjid_id.eq.${receiverMasjidId}),and(requester_masjid_id.eq.${receiverMasjidId},receiver_masjid_id.eq.${senderMasjidId})`)
    .eq("status", "accepted")
    .single();

  if (!connection) return { error: "You can only message connected masjids." };

  const { error } = await (supabase as any).from("masjid_messages")
    .insert({
      connection_id: connection.id,
      sender_masjid_id: senderMasjidId,
      receiver_masjid_id: receiverMasjidId,
      msg_type: msgType,
      subject,
      body,
      metadata
    });

  if (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message." };
  }

  revalidatePath("/network/messages");
  return { success: true };
}
