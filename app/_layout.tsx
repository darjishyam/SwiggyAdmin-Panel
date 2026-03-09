import "react-native-gesture-handler";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '../src/context/ToastContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

// ─── Global JS Error Catcher (native only) ──────────────────────────────────
// ErrorUtils is undefined on web — guard it to avoid crash.
if (Platform.OS !== 'web' && typeof ErrorUtils !== 'undefined') {
    const prevHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
        Alert.alert(
            '🚨 Crash Report',
            `${isFatal ? '[FATAL] ' : ''}${error?.message || String(error)}\n\n${error?.stack?.substring(0, 400) || ''}`,
            [{ text: 'OK' }]
        );
        if (prevHandler) prevHandler(error, isFatal);
    });
}
// ────────────────────────────────────────────────────────────────────────────

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ToastProvider>
                <StatusBar style="dark" />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#F7F7F7' },
                    }}
                >
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </ToastProvider>
        </GestureHandlerRootView>
    );
}
