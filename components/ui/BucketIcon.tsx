import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BucketIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export function BucketIcon({
  className,
  size = 14,
  ...props
}: BucketIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M4 9c0-3.5 3.5-6 8-6s8 2.5 8 6" />
      <path d="M3 9h18" />
      <path d="M4.5 9l1.5 10.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.5L19.5 9" />
    </svg>
  );
}

export default BucketIcon;
