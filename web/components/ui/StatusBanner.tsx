import { cn } from "@/lib/utils";

interface StatusBannerProps {
  status: string;
  eta: number | null;
}

const COPY: Record<string, string> = {
  pending: "Finding a rider nearby…",
  accepted: "Rider is on the way",
  arrived: "Your rider has arrived",
  in_progress: "On your way",
  completed: "Ride complete",
  cancelled: "Ride cancelled",
};

export default function StatusBanner({ status, eta }: StatusBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 shadow-lg backdrop-blur-xl border",
        status === "cancelled"
          ? "bg-red-500/90 border-red-400/40 text-white"
          : "bg-dark-800/95 border-dark-700 text-dark-50"
      )}
      role="status"
    >
      <p className="text-sm font-semibold">{COPY[status]}</p>
      {eta !== null && status !== "completed" && status !== "cancelled" && (
        <p className="text-xs text-dark-400 mt-0.5">{eta} min away</p>
      )}
    </div>
  );
}
