import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface DayDreamLogoProps {
  className?: string;
  size?: number;
}

export function DayDreamLogo({
  className,
  size = 32,
}: DayDreamLogoProps) {
  const uid = useId();
  const bgId = `dd-bg-${uid}`;
  const ambientId = `dd-amb-${uid}`;
  const moonId = `dd-moon-${uid}`;
  const starId = `dd-star-${uid}`;
  const cloudId = `dd-cld-${uid}`;
  const borderId = `dd-brd-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("rounded-xl shrink-0 select-none overflow-hidden", className)}
      shapeRendering="geometricPrecision"
      aria-label="DayDream Logo"
    >
      <defs>
        {/* Deep midnight twilight background */}
        <linearGradient id={bgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b0f19" />
          <stop offset="45%" stopColor="#111827" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* Ambient indigo/cyan atmospheric glow */}
        <radialGradient id={ambientId} cx="42%" cy="45%" r="60%">
          <stop offset="0%" stopColor="rgba(99, 102, 241, 0.28)" />
          <stop offset="65%" stopColor="rgba(56, 189, 248, 0.08)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
        </radialGradient>

        {/* Pure lunar silver gradient */}
        <linearGradient id={moonId} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Golden radiant star gradient (goals, adventure, aspiration) */}
        <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Soft dream cloud gradient */}
        <linearGradient id={cloudId} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="60%" stopColor="rgba(226, 232, 240, 0.85)" />
          <stop offset="100%" stopColor="rgba(148, 163, 184, 0.70)" />
        </linearGradient>

        {/* Refined subtle border stroke */}
        <linearGradient id={borderId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.08)" />
          <stop offset="100%" stopColor="rgba(147, 197, 253, 0.16)" />
        </linearGradient>
      </defs>

      {/* Squircle Base */}
      <rect width="100" height="100" rx="22.5" fill={`url(#${bgId})`} />
      <rect width="100" height="100" rx="22.5" fill={`url(#${ambientId})`} />
      <rect
        x="0.75"
        y="0.75"
        width="98.5"
        height="98.5"
        rx="21.75"
        fill="none"
        stroke={`url(#${borderId})`}
        strokeWidth="1.5"
      />

      {/* Crescent Moon */}
      <path
        d="M 50 18 C 32.327 18 18 32.327 18 50 C 18 67.673 32.327 82 50 82 C 58.647 82 66.527 78.568 72.316 73.012 C 59.882 71.936 50 61.42 50 48.5 C 50 36.31 58.747 26.242 70.187 24.316 C 64.382 20.404 57.458 18 50 18 Z"
        fill={`url(#${moonId})`}
      />

      {/* Calming Dream Cloud */}
      <path
        d="M 36 74 C 31.582 74 28 70.418 28 66 C 28 61.986 30.957 58.663 34.829 58.077 C 36.216 52.378 41.353 48 47.5 48 C 54.673 48 60.536 53.585 60.971 60.655 C 62.196 59.626 63.774 59 65.5 59 C 69.642 59 73 62.358 73 66.5 C 73 70.446 69.957 73.68 66.082 73.974 C 65.892 73.991 65.698 74 65.5 74 Z"
        fill={`url(#${cloudId})`}
      />

      {/* Radiant Golden North Star */}
      <path
        d="M 70 20 Q 70 33 83 33 Q 70 33 70 46 Q 70 33 57 33 Q 70 33 70 20 Z"
        fill={`url(#${starId})`}
      />

      {/* Secondary Celestial Sparkle */}
      <path
        d="M 79 53 Q 79 57.5 83.5 57.5 Q 79 57.5 79 62 Q 79 57.5 74.5 57.5 Q 79 57.5 79 53 Z"
        fill="#38bdf8"
        opacity="0.95"
      />
    </svg>
  );
}

export default DayDreamLogo;

