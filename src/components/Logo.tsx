import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 font-extrabold ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue-600 text-white">
        A
      </span>
      <span className="text-xl text-brand-blue-700">
        Arty<span className="text-brand-orange-500">voo</span>
      </span>
    </Link>
  );
}
