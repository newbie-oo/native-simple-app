import { Link, useLocalSearchParams } from 'expo-router';
import { styled } from "nativewind";
import { Text } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center">
            <Text className="text-foreground text-lg mb-4">
                SubscriptionDetail: {id}
            </Text>
            <Link href="/" className="text-primary">
                Go Back
            </Link>
        </SafeAreaView>
    )
}

export default SubscriptionDetails