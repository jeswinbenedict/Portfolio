import React from "react";

interface HazardDividerProps {
  height?: string;
  className?: string;
}

export default function HazardDivider({
  height = "h-4",
  className = "",
}: HazardDividerProps) {
  return (
    <div
      className={`w-full ${height} bg-hazard-stripes border-y-3 border-ink dark:border-concrete ${className}`}
      role="separator"
      aria-label="Hazard stripe section divider"
    />
  );
}
