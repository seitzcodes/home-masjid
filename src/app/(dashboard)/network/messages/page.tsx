import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Search, Inbox, Send, Building2, Calendar, FileText, Check, X } from "lucide-react";
import { sendMessage, respondToConnection } from "../actions";

export default async function NetworkMessagesPage({
  searchParams
}: {
  searchParams: { connection?: string; tab?: string }
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  // 1. Get user's masjids
  const { data: facultyRoles } = await supabase
    .from("masjid_faculty")
    .select("masjid_id")
    .eq("user_id", session.user.id);
  
  const myMasjidIds = facultyRoles?.map(r => r.masjid_id) || [];
  if (myMasjidIds.length === 0) return <div>No masjid assigned.</div>;
  const myMasjidId = myMasjidIds[0];

  // 2. Get active connections
  const { data: connections } = await supabase
    .from("masjid_connections")
    .select(`
      id,
      status,
      created_at,
      requester_masjid_id,
      receiver_masjid_id,
      requester:masjids!requester_masjid_id(id, name, city),
      receiver:masjids!receiver_masjid_id(id, name, city)
    `)
    .or(`requester_masjid_id.eq.${myMasjidId},receiver_masjid_id.eq.${myMasjidId}`);

  // 3. Get messages for the active connection if selected
  let messages = null;
  let activeConnection = null;

  if (searchParams.connection) {
    activeConnection = connections?.find(c => c.id === searchParams.connection);
    
    if (activeConnection && activeConnection.status === "accepted") {
      const { data } = await supabase
        .from("masjid_messages")
        .select("*")
        .eq("connection_id", activeConnection.id)
        .order("created_at", { ascending: true });
      messages = data;
    }
  }

  const activeTab = searchParams.tab || "inbox";
  const pendingRequests = connections?.filter(c => c.status === "pending" && c.receiver_masjid_id === myMasjidId) || [];
  const activeConnections = connections?.filter(c => c.status === "accepted") || [];

  return (
    <>
      {/* Left Pane - Contact List */}
      <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <div className="flex gap-4 border-b border-slate-200 mb-4">
            <a href="?tab=inbox" className={`pb-2 text-sm font-medium border-b-2 px-1 ${activeTab === 'inbox' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-500'}`}>
              Messages
            </a>
            <a href="?tab=requests" className={`pb-2 text-sm font-medium border-b-2 px-1 flex items-center gap-1.5 ${activeTab === 'requests' ? 'border-[#0F172A] text-[#0F172A]' : 'border-transparent text-slate-500'}`}>
              Requests
              {pendingRequests.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
              )}
            </a>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "inbox" && (
            <div className="divide-y divide-slate-100">
              {activeConnections.map(conn => {
                const otherMasjid = conn.requester_masjid_id === myMasjidId ? conn.receiver : conn.requester;
                const isActive = searchParams.connection === conn.id;
                
                return (
                  <a 
                    key={conn.id}
                    href={`?connection=${conn.id}&tab=inbox`}
                    className={`flex items-start p-4 hover:bg-white transition-colors cursor-pointer ${isActive ? 'bg-white border-l-2 border-[#D4AF37]' : 'border-l-2 border-transparent'}`}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 mr-3">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{(otherMasjid as any).name}</h4>
                        <span className="text-xs text-slate-400">Mar 12</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate">Tap to view conversation</p>
                    </div>
                  </a>
                );
              })}
              {activeConnections.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No active connections yet.<br/>
                  <a href="/network/directory" className="text-[#D4AF37] hover:underline mt-2 inline-block">Browse Directory</a>
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="divide-y divide-slate-100 p-4 space-y-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{(req.requester as any).name}</h4>
                      <p className="text-xs text-slate-500">{(req.requester as any).city}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">Would like to connect with your masjid.</p>
                  <div className="flex gap-2">
                    <form action={async () => {
                      "use server";
                      await respondToConnection(req.id, "declined");
                    }} className="flex-1">
                      <button className="w-full py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1">
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await respondToConnection(req.id, "accepted");
                    }} className="flex-1">
                      <button className="w-full py-1.5 text-xs font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-md transition-colors flex items-center justify-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                    </form>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <div className="text-center text-slate-500 text-sm mt-4">
                  No pending requests.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConnection && activeConnection.status === "accepted" ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {(activeConnection.requester_masjid_id === myMasjidId ? activeConnection.receiver : activeConnection.requester as any).name}
                  </h3>
                  <p className="text-xs text-slate-500">Connected</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages?.map(msg => {
                const isMine = msg.sender_masjid_id === myMasjidId;
                const metadata = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;

                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${isMine ? 'bg-[#0F172A] text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                      {msg.msg_type === "speaker_invite" ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                            <Calendar className="w-4 h-4 text-[#D4AF37]" />
                            <span className="font-bold text-sm text-[#D4AF37]">Speaker Invitation</span>
                          </div>
                          {msg.subject && <p className="font-semibold text-sm">{msg.subject}</p>}
                          <p className={`text-sm ${isMine ? 'text-slate-300' : 'text-slate-600'}`}>{msg.body}</p>
                          {metadata?.eventDate && (
                            <div className={`mt-3 p-2 rounded-md text-xs flex justify-between ${isMine ? 'bg-white/10' : 'bg-slate-50'}`}>
                              <span>Date: <strong>{metadata.eventDate}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{msg.body}</p>
                      )}
                      <div className={`text-[10px] mt-2 text-right ${isMine ? 'text-slate-400' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!messages || messages.length === 0) && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Inbox className="w-8 h-8 opacity-50" />
                  <p className="text-sm">No messages yet. Send an invite or say salaam!</p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form action={sendMessage} className="flex gap-2">
                <input type="hidden" name="senderMasjidId" value={myMasjidId} />
                <input type="hidden" name="receiverMasjidId" value={activeConnection.requester_masjid_id === myMasjidId ? activeConnection.receiver_masjid_id : activeConnection.requester_masjid_id} />
                <input type="hidden" name="msgType" value="standard" />
                
                <input 
                  type="text" 
                  name="body"
                  placeholder="Type a message..." 
                  required
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-full bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all text-sm"
                />
                <button type="submit" className="w-10 h-10 bg-[#D4AF37] hover:bg-[#B8982D] text-white rounded-full flex items-center justify-center transition-colors shrink-0">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <MessageSquarePlaceholder />
            <p className="mt-4 text-sm font-medium">Select a conversation</p>
            <p className="text-xs mt-1">Or accept a pending connection request</p>
          </div>
        )}
      </div>
    </>
  );
}

function MessageSquarePlaceholder() {
  return (
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
      <FileText className="w-8 h-8 text-slate-300" />
    </div>
  );
}
