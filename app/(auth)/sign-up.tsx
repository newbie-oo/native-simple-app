import { useAuth, useSignUp } from "@clerk/expo";
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isFetching = fetchStatus === "fetching";

  const pendingVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    signUp.missingFields?.length === 0;

  if (signUp.status === "complete" || isSignedIn) return null;

  const handleSignUp = async () => {
    const { error } = await signUp.password({ emailAddress, password });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) return;

    if (signUp.status === "complete") {
      posthog.identify(emailAddress, {
        $set: { email: emailAddress },
        $set_once: { sign_up_date: new Date().toISOString() },
      });
      posthog.capture("user_signed_up", { email: emailAddress });

      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as Href);
        },
      });
    }
  };

  const handleResendCode = async () => {
    await signUp.verifications.sendEmailCode();
  };

  // --- Verification phase ---
  if (pendingVerification) {
    const canVerify = code.length > 0 && !isFetching;

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

                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to {emailAddress}
                </Text>
              </View>

              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx(
                        "auth-input",
                        errors?.fields?.code && "auth-input-error",
                      )}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.4)"
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="one-time-code"
                      value={code}
                      onChangeText={setCode}
                    />
                    {errors?.fields?.code && (
                      <Text className="auth-error">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  {errors?.global?.map((err, i) => (
                    <Text key={i} className="auth-error">
                      {err.message}
                    </Text>
                  ))}

                  <TouchableOpacity
                    className={clsx(
                      "auth-button",
                      !canVerify && "auth-button-disabled",
                    )}
                    onPress={handleVerify}
                    disabled={!canVerify}
                    activeOpacity={0.8}
                  >
                    {isFetching ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="auth-secondary-button"
                    onPress={handleResendCode}
                    disabled={isFetching}
                    activeOpacity={0.7}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // --- Registration phase ---
  const canSubmit =
    emailAddress.trim().length > 0 && password.length > 0 && !isFetching;

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

              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Start tracking and managing all your subscriptions
              </Text>
            </View>

            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      errors?.fields?.emailAddress && "auth-input-error",
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
                  {errors?.fields?.emailAddress && (
                    <Text className="auth-error">
                      {errors.fields.emailAddress.message}
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
                    placeholder="Create a password"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    secureTextEntry
                    textContentType="newPassword"
                    autoComplete="new-password"
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

                <TouchableOpacity
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled",
                  )}
                  onPress={handleSignUp}
                  disabled={!canSubmit}
                  activeOpacity={0.8}
                >
                  {isFetching ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in">
                <Text className="auth-link">Sign in</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
