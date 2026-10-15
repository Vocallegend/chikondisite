import {
  BadgeCheck,
  Bell,
  Compass,
  Eye,
  GraduationCap,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolve a feature's icon name to a lucide component.
 *
 * `features.ts` stores icon names as strings so the data stays serialisable.
 * Unknown names fall back to a neutral mark rather than crashing the page.
 */
const icons: Record<string, LucideIcon> = {
  BadgeCheck,
  Bell,
  Compass,
  Eye,
  GraduationCap,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
};

export function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
