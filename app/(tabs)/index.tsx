import { useUser } from "@clerk/expo";
import { posthog } from "@/lib/posthog";
import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { selectBalance, useSubscriptionStore } from "@/lib/subscription-store";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const { user } = useUser();
    const subscriptions = useSubscriptionStore((s) => s.subscriptions);
    const addSubscription = useSubscriptionStore((s) => s.addSubscription);
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const balance = useMemo(() => selectBalance(subscriptions), [subscriptions]);

    const existingColors = useMemo(
        () => new Set(subscriptions.map((s) => s.color).filter(Boolean) as string[]),
        [subscriptions],
    );

    const displayName = user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "User";

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <FlatList
                ListHeaderComponent={(<>
                    <View className="home-header">
                        <View className="home-user">
                            {user?.imageUrl ? (
                                <Image source={{ uri: user.imageUrl }} className="w-12 h-12 rounded-full" />
                            ) : (
                                <View className="w-12 h-12 rounded-full bg-accent items-center justify-center">
                                    <Text className="text-lg font-sans-bold text-background">
                                        {displayName.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            )}
                            <Text className="home-user-name">{displayName}</Text>
                        </View>

                        <Pressable onPress={() => setModalVisible(true)}>
                            <Image source={icons.add} className="home-add-icon" />
                        </Pressable>
                    </View>

                    <View className="home-balance-card">
                        <Text className="home-balance-label">Balance</Text>

                        <View className="home-balance-row">
                            <Text className="home-balance-amount">{formatCurrency(balance.amount)}</Text>
                            {balance.nextRenewalDate && (
                                <Text className="home-balance-date">
                                    {dayjs(balance.nextRenewalDate).format("MM/DD")}
                                </Text>
                            )}

                        </View>
                    </View>

                    <View className="mb-5">
                        <ListHeading title="Upcoming" />
                        <FlatList
                            data={UPCOMING_SUBSCRIPTIONS}
                            renderItem={({ item }) => (<UpcomingSubscriptionCard {...item} />)}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
                        />
                    </View>

                    <ListHeading title="All Subscriptions" />
                </>
                )}
                data={subscriptions}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => {
                            const isExpanding = expandedSubscriptionId !== item.id;
                            setExpandedSubscriptionId(isExpanding ? item.id : null);
                            if (isExpanding) {
                                posthog.capture("subscription_card_expanded", {
                                    subscription_id: item.id,
                                    subscription_name: item.name,
                                });
                            }
                        }} />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet</Text>}
                contentContainerClassName="pb-20"
            />
            <CreateSubscriptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onCreate={addSubscription}
                existingColors={existingColors}
            />
        </SafeAreaView >
    );
}