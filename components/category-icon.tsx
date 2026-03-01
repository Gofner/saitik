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
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g transform="translate(12 12) scale(1.5 2) translate(-12 -12)">
        <rect
          x="6"
          y="6"
          width="12"
          height="9"
          rx="2.2"
          stroke="currentColor"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="7"
          y="7"
          width="10"
          height="7"
          rx="1.8"
          stroke="currentColor"
          strokeWidth="1.2"
          opacity="0.7"
          vectorEffect="non-scaling-stroke"
        />

        {/* уголки */}
        <path
          d="M8.2 8.2h1.6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M14.2 13.6h1.6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/*  */}
      <circle
        cx="12"
        cy="12"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M11.1 12.2c.35-.55.85-.8 1.25-.55.42.25.42.75.1 1.15-.25.3-.7.55-1.35.75-.65-.2-1.1-.45-1.35-.75-.32-.4-.32-.9.1-1.15.4-.25.9 0 1.25.55Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.4v1.6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
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
