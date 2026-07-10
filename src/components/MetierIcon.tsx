import { Wrench, Zap, KeyRound, Flame, Trees, type LucideProps } from "lucide-react";

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Wrench,
  Zap,
  KeyRound,
  Flame,
  Trees,
};

export default function MetierIcon({ nom, ...props }: { nom: string } & LucideProps) {
  const Icon = ICONS[nom] ?? Wrench;
  return <Icon {...props} />;
}
