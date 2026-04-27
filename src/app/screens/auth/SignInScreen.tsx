import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import Screen from '../../../components/common/Screen';
import { useAuth } from '../../../features/auth/AuthProvider';

export default function SignInScreen() {
  const {
    signInWithGoogle,
    googleLoading,
    sendPhoneOtp,
    verifyPhoneOtp,
    phoneLoading,
    recaptchaRef,
    firebaseAppForRecaptcha,
  } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePhoneSend = async () => {
    setError(null);
    try {
      const id = await sendPhoneOtp(phoneNumber);
      if (id) {
        setVerificationId(id);
      }
    } catch {
      setError('Could not send OTP. Check phone format and try again.');
    }
  };

  const handlePhoneVerify = async () => {
    if (!verificationId) return;

    setError(null);
    try {
      await verifyPhoneOtp(verificationId, otp);
    } catch {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <Screen>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseAppForRecaptcha.options}
      />

      <Text className="mt-16 text-3xl font-bold text-slate-900">Family Connection Hub</Text>
      <Text className="mt-3 text-base text-slate-600">
        Sign in with Google or phone to create and join your families.
      </Text>

      <Pressable
        className="mt-8 rounded-2xl bg-brand px-5 py-4"
        disabled={googleLoading}
        onPress={signInWithGoogle}
      >
        {googleLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-center text-base font-semibold text-white">Continue with Google</Text>
        )}
      </Pressable>

      <View className="mt-8 rounded-2xl bg-white p-4">
        <Text className="text-sm font-semibold text-slate-700">Phone authentication</Text>

        <TextInput
          className="mt-3 rounded-xl border border-slate-200 px-3 py-3"
          placeholder="+1 555 123 4567"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Pressable
          className="mt-3 rounded-xl border border-brand px-4 py-3"
          disabled={phoneLoading}
          onPress={handlePhoneSend}
        >
          {phoneLoading ? (
            <ActivityIndicator color="#6366F1" />
          ) : (
            <Text className="text-center font-medium text-brand">Send OTP</Text>
          )}
        </Pressable>

        {verificationId ? (
          <>
            <TextInput
              className="mt-3 rounded-xl border border-slate-200 px-3 py-3"
              placeholder="Enter OTP"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
            />
            <Pressable
              className="mt-3 rounded-xl bg-slate-900 px-4 py-3"
              disabled={phoneLoading}
              onPress={handlePhoneVerify}
            >
              {phoneLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center font-medium text-white">Verify OTP</Text>
              )}
            </Pressable>
          </>
        ) : null}

        {error ? <Text className="mt-3 text-sm text-red-600">{error}</Text> : null}
      </View>
    </Screen>
  );
}
