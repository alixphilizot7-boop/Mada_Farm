import { Sprout } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-emerald-600 text-white">
        <Sprout className="h-6 w-6" />
      </span>
    </div>
  );
}
