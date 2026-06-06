import React from "react";

export default function NetworkMessagesLayout({ children }: { children: React.ReactNode }) {
  // A dual-pane layout could be managed purely on the client side, but since we are doing 
  // server components for data fetching, we can wrap the inbox in a specific styled container.
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden min-h-[600px] flex shadow-sm">
      {children}
    </div>
  );
}
