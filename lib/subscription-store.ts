import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { formatHistoryDateTime } from "@/lib/utils";
import dayjs from "dayjs";
import { create } from "zustand";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const toMonthlyPrice = (sub: Subscription): number =>
  sub.frequency === "Yearly" ? sub.price / 12 : sub.price;

interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptions: HOME_SUBSCRIPTIONS,
  addSubscription: (subscription) =>
    set((state) => ({ subscriptions: [subscription, ...state.subscriptions] })),
}));

export function selectBalance(subscriptions: Subscription[]): {
  amount: number;
  nextRenewalDate: string | null;
} {
  let amount = 0;
  let nearest: dayjs.Dayjs | null = null;

  for (const sub of subscriptions) {
    if (sub.status === "active") {
      amount += toMonthlyPrice(sub);
    }

    if (sub.renewalDate) {
      const d = dayjs(sub.renewalDate);
      if (!nearest || d.isBefore(nearest)) {
        nearest = d;
      }
    }
  }

  return {
    amount,
    nextRenewalDate: nearest?.toISOString() ?? null,
  };
}

export function selectInsights(subscriptions: Subscription[]): InsightsData {
  const currency = subscriptions[0]?.currency ?? "USD";

  // Weekly spend distribution: each active subscription contributes its
  // monthly-normalized price to the weekday it renews on (Mon..Sun).
  const weekly: WeeklyBar[] = WEEKDAY_LABELS.map((label) => ({ label, amount: 0 }));
  let monthlyTotal = 0;

  for (const sub of subscriptions) {
    if (sub.status !== "active") continue;

    const monthly = toMonthlyPrice(sub);
    monthlyTotal += monthly;

    if (sub.renewalDate) {
      const weekday = dayjs(sub.renewalDate).day(); // 0 = Sunday
      const index = weekday === 0 ? 6 : weekday - 1; // shift so Monday = 0
      weekly[index] = { ...weekly[index], amount: weekly[index].amount + monthly };
    }
  }

  let peakIndex = 0;
  for (let i = 1; i < weekly.length; i++) {
    if (weekly[i].amount > weekly[peakIndex].amount) peakIndex = i;
  }
  const peakAmount = weekly[peakIndex].amount;

  // Trend: how far the peak day sits above the average daily spend.
  const average = monthlyTotal / weekly.length;
  const trendPct = average > 0 ? Math.round(((peakAmount - average) / average) * 100) : 0;

  const history: HistoryEntry[] = subscriptions
    .filter((sub) => Boolean(sub.renewalDate))
    .slice()
    .sort((a, b) => dayjs(b.renewalDate).valueOf() - dayjs(a.renewalDate).valueOf())
    .map((sub) => ({
      id: sub.id,
      icon: sub.icon,
      name: sub.name,
      color: sub.color,
      dateTime: formatHistoryDateTime(sub.renewalDate),
      price: sub.price,
      currency: sub.currency,
      frequency: sub.frequency,
    }));

  return {
    monthLabel: dayjs().format("MMMM YYYY"),
    monthlyTotal,
    currency,
    weekly,
    peakIndex,
    peakAmount,
    trendPct,
    history,
  };
}
