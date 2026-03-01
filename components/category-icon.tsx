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

/** Простая иконка "карта/талисман" под категорию */
function TalismanCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* card */}
      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      {/* inner border */}
      <rect
        x="7"
        y="5.5"
        width="10"
        height="13"
        rx="1.8"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.7"
      />

      {/* emblem */}
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

      {/* small corner accents */}
      <path
        d="M8.3 8.0h1.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14.1 16.0h1.6"
        stroke="currentColor"
        strokeWidth="1.4"
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

  // ВАЖНО:
  // Если у тебя категория "Талисманы/Лаки" сейчас использует icon="layers",
  // то замени Layers на нашу карту:
  layers: TalismanCardIcon,

  home: Home,
  briefcase: Briefcase,
  spade: Spade,
  car: Car,

  // Если вдруг у тебя будет отдельный ключ, например "talisman",
  // можешь тоже добавить:
  talisman: TalismanCardIcon,
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
