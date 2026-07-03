import React from "react";

export default function loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card aspect-4/3 animate-pulse" />
      ))}
    </div>
  );
}
