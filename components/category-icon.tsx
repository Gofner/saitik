import React from "react";
import {
  User,
  Coins,
  Package,
  Wrench,
  Zap,
  Layers,
  Home,
  Briefcase,
  Spade,
  Car,
} from "lucide-react";


function TalismansIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* card */}
      <rect x="3" y="3" width="30" height="42" rx="5" stroke="currentColor" strokeWidth="2" />
      {/* inner border */}
      <rect x="6" y="6" width="24" height="36" rx="3.5" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />

      {/* emblem */}
      <circle cx="18" cy="24" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M18 19.2l1.4 3.6 3.8.2-3 2.3 1.1 3.8-3.3-2-3.3 2 1.1-3.8-3-2.3 3.8-.2 1.4-3.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* small corner accents */}
      <path d="M9 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M23 35h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  coins: Coins,
  package: Package,
  wrench: Wrench,
  zap: Zap,
  layers: Layers,
  home: Home,
  briefcase: Briefcase,
  spade: Spade,
  car: Car,

  talismans: TalismansIcon,
};

export function CategoryIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const Icon = ICON_MAP[icon] || Layers;
  return <Icon className={className} />;
}
