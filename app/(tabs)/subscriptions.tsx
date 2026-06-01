import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import "@/global.css";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Subscriptions = () => {
    const [query, setQuery] = useState("");
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

    const filteredSubscriptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return HOME_SUBSCRIPTIONS;

        return HOME_SUBSCRIPTIONS.filter((subscription) => {
            const haystack = [
                subscription.name,
                subscription.category,
                subscription.plan,
                subscription.billing,
                subscription.status,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [query]);

    return (
        <SafeAreaView className="subs-screen">
            <Text className="subs-title">Subscriptions</Text>

            <View className="subs-search">
                <TextInput
                    className="subs-search-input"
                    placeholder="Search by name, category, or status"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <Pressable
                        className="subs-search-clear"
                        onPress={() => setQuery("")}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        hitSlop={8}
                    >
                        <Text className="subs-search-clear-text">×</Text>
                    </Pressable>
                )}
            </View>

            <FlatList
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() => {
                            setExpandedSubscriptionId((current) =>
                                current === item.id ? null : item.id
                            );
                        }}
                    />
                )}
                ListHeaderComponent={
                    <Text className="subs-count">
                        {filteredSubscriptions.length}{" "}
                        {filteredSubscriptions.length === 1 ? "subscription" : "subscriptions"}
                    </Text>
                }
                ItemSeparatorComponent={() => <View className="h-4" />}
                ListEmptyComponent={
                    <Text className="home-empty-state">
                        {`No subscriptions match "${query.trim()}".`}
                    </Text>
                }
                showsVerticalScrollIndicator={false}
                extraData={expandedSubscriptionId}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets
                contentContainerClassName="pb-20"
            />
        </SafeAreaView>
    );
};

export default Subscriptions;
