import { User, Coins, Package, Wrench, Zap, Layers, Home, Briefcase, Spade, Car } from 'lucide-react'

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
}

export function CategoryIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = ICON_MAP[icon] || Layers
  return <Icon className={className} />
}
