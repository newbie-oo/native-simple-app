import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import dayjs from "dayjs";
import { create } from "zustand";

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
      amount += sub.billing === "Yearly" ? sub.price / 12 : sub.price;
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
