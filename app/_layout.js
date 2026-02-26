import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '../src/context/ToastContext';

export default function RootLayout() {
    return (
        <ToastProvider>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#F7F7F7' },
                }}
            />
        </ToastProvider>
    );
}
