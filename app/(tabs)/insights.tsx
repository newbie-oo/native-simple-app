import HistoryCard from "@/components/HistoryCard";
import InsightsBarChart from "@/components/InsightsBarChart";
import ListHeading from "@/components/ListHeading";
import { icons } from "@/constants/icons";
import "@/global.css";
import { selectInsights, useSubscriptionStore } from "@/lib/subscription-store";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useMemo } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
    const router = useRouter();
    const subscriptions = useSubscriptionStore((s) => s.subscriptions);
    const insights = useMemo(() => selectInsights(subscriptions), [subscriptions]);

    const goToSubscriptions = () => router.push("/subscriptions");
    const trendUp = insights.trendPct >= 0;

    return (
        <SafeAreaView className="insights-screen">
            <View className="insights-header">
                <Pressable
                    className="insights-header-btn"
                    onPress={() => (router.canGoBack() ? router.back() : goToSubscriptions())}
                >
                    <Image source={icons.back} className="insights-header-glyph" />
                </Pressable>

                <Text className="insights-header-title">Monthly Insights</Text>

                <Pressable className="insights-header-btn" onPress={goToSubscriptions}>
                    <Text className="insights-header-dots">⋯</Text>
                </Pressable>
            </View>

            <FlatList
                data={insights.history}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-5 pb-30"
                ItemSeparatorComponent={() => <View className="h-3" />}
                ListHeaderComponent={
                    <View>
                        <ListHeading title="Upcoming" onActionPress={goToSubscriptions} />

                        <InsightsBarChart
                            weekly={insights.weekly}
                            peakIndex={insights.peakIndex}
                            peakAmount={insights.peakAmount}
                            currency={insights.currency}
                        />

                        <View className="insights-expense-card">
                            <View>
                                <Text className="insights-expense-label">Expenses</Text>
                                <Text className="insights-expense-month">{insights.monthLabel}</Text>
                            </View>
                            <View>
                                <Text className="insights-expense-amount">
                                    -{formatCurrency(insights.monthlyTotal, insights.currency)}
                                </Text>
                                <Text className={trendUp ? "insights-trend-up" : "insights-trend-down"}>
                                    {trendUp ? "+" : ""}
                                    {insights.trendPct}%
                                </Text>
                            </View>
                        </View>

                        <ListHeading title="History" onActionPress={goToSubscriptions} />
                    </View>
                }
                renderItem={({ item }) => <HistoryCard {...item} />}
                ListEmptyComponent={
                    <Text className="home-empty-state">No payment history yet.</Text>
                }
            />
        </SafeAreaView>
    );
};

export default Insights;
