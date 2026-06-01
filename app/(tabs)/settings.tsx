import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const { signOut } = useClerk();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.replace("/(auth)/sign-in");
    };

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="text-2xl font-sans-bold text-primary mb-6">Settings</Text>
            <TouchableOpacity
                className="items-center rounded-full bg-primary py-4"
                onPress={handleSignOut}
                activeOpacity={0.8}
            >
                <Text className="font-sans-bold text-background">Sign out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default Settings