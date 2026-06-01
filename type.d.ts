import type { ImageSourcePropType } from "react-native";

declare global {
  type Frequency = "Monthly" | "Yearly";

  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface Subscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    price: number;
    currency?: string;
    frequency: Frequency;
    renewalDate?: string;
    color?: string;
  }

  interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency: string;
    daysLeft: number;
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {}

  interface ListHeadingProps {
    title: string;
    actionLabel?: string;
    onActionPress?: () => void;
  }

  interface WeeklyBar {
    label: string;
    amount: number;
  }

  interface HistoryEntry {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    color?: string;
    dateTime: string;
    price: number;
    currency?: string;
    frequency: Frequency;
  }

  interface InsightsData {
    monthLabel: string;
    monthlyTotal: number;
    currency: string;
    weekly: WeeklyBar[];
    peakIndex: number;
    peakAmount: number;
    trendPct: number;
    history: HistoryEntry[];
  }

  interface InsightsBarChartProps {
    weekly: WeeklyBar[];
    peakIndex: number;
    peakAmount: number;
    currency?: string;
  }

  type HistoryCardProps = Omit<HistoryEntry, "id">;
}

export {};
