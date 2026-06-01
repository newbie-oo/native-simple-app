import { useUser } from "@clerk/expo";
import { posthog } from "@/lib/posthog";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
    const { user } = useUser();
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

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

                        <Image source={icons.add} className="home-add-icon" />
                    </View>

                    <View className="home-balance-card">
                        <Text className="home-balance-label">Balance</Text>

                        <View className="home-balance-row">
                            <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                            <Text className="home-balance-date">
                                {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                            </Text>

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
                data={HOME_SUBSCRIPTIONS}
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
        </SafeAreaView >
    );
}