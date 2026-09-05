import React from "react";
import { cn } from "@/lib/utils/cn";

interface DayDreamLogoProps {
  className?: string;
  size?: number;
}

export function DayDreamLogo({
  className,
  size = 32,
}: DayDreamLogoProps) {
  return (
    <img
      src="/daydream-logo.png"
      alt="DayDream"
      width={size}
      height={size}
      className={cn("rounded-xl object-contain shrink-0 select-none", className)}
    />
  );
}

export default DayDreamLogo;

