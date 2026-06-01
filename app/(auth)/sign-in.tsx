import { useSignIn } from "@clerk/expo";
import { posthog } from "@/lib/posthog";
import { clsx } from "clsx";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isFetching = fetchStatus === "fetching";
  const canSubmit =
    emailAddress.trim().length > 0 && password.length > 0 && !isFetching;

  const handleSignIn = async () => {
    setSubmitError(null);

    try {
      const { error } = await signIn.password({ emailAddress, password });

      if (error) return;

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;

            const userId = session?.user?.id;
            if (userId) {
              posthog.identify(userId, {
                $set: { email: emailAddress },
                $set_once: { first_sign_in_date: new Date().toISOString() },
              });
              posthog.capture("user_signed_in", { email: emailAddress });
            }

            const url = decorateUrl("/");
            router.replace(url as Href);
          },
        });
      }
    } catch (err) {
      posthog.captureException(err, { $exception_source: "sign-in" });
      setSubmitError("Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="auth-content">
            {/* Brand */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">SMART BILLING</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* Form card */}
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errors?.fields?.identifier && "auth-input-error",
                    )}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                  />
                  {errors?.fields?.identifier && (
                    <Text className="auth-error">
                      {errors.fields.identifier.message}
                    </Text>
                  )}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errors?.fields?.password && "auth-input-error",
                    )}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    secureTextEntry
                    textContentType="password"
                    autoComplete="password"
                    value={password}
                    onChangeText={setPassword}
                  />
                  {errors?.fields?.password && (
                    <Text className="auth-error">
                      {errors.fields.password.message}
                    </Text>
                  )}
                </View>

                {errors?.global?.map((err, i) => (
                  <Text key={i} className="auth-error">
                    {err.message}
                  </Text>
                ))}

                {submitError && (
                  <Text className="auth-error">{submitError}</Text>
                )}

                <TouchableOpacity
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled",
                  )}
                  onPress={handleSignIn}
                  disabled={!canSubmit}
                  activeOpacity={0.8}
                >
                  {isFetching ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Recurly?</Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link">Create an account</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
