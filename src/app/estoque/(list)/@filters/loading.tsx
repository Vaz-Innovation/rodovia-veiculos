import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 bg-card animate-pulse" />
          <div className="h-9 w-full bg-card animate-pulse" />
        </div>
      ))}
    </div>
  );
}
