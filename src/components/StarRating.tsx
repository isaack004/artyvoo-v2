import { Star } from "lucide-react";

export default function StarRating({ note, size = 16 }: { note: number; size?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(note) ? "fill-brand-orange-400 text-brand-orange-400" : "text-brand-blue-100"}
        />
      ))}
    </div>
  );
}
