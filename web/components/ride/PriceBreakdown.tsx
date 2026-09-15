import { Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PriceBreakdownProps {
  baseFare: number;
  distanceFare: number;
  surgeMultiplier: number;
  isSurge: boolean;
  promoDiscount: number;
  total: number;
}

export default function PriceBreakdown({
  baseFare,
  distanceFare,
  surgeMultiplier,
  isSurge,
  promoDiscount,
  total,
}: PriceBreakdownProps) {
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-dark-400">Base fare</span>
        <span className="text-dark-200">{formatCurrency(baseFare)}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-dark-400">Distance</span>
        <span className="text-dark-200">{formatCurrency(distanceFare)}</span>
      </div>
      {isSurge && (
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-accent">
            <Zap size={13} className="fill-accent" />
            Surge {surgeMultiplier.toFixed(1)}×
          </span>
        </div>
      )}
      {promoDiscount > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-primary">Promo discount</span>
          <span className="text-primary">-{formatCurrency(promoDiscount)}</span>
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-dark-700">
        <span className="text-sm font-semibold text-dark-100">Total</span>
        <span className="text-lg font-bold text-dark-50">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
