import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../src/services/api';

const { width, height } = Dimensions.get('window');

// Professional Abstract Background
const BG_IMAGE = { uri: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" };

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            const { data } = await authAPI.login({ email, password });
            await AsyncStorage.setItem('adminToken', data.token);
            await AsyncStorage.setItem('adminUser', JSON.stringify(data));
            router.replace('/(tabs)');
        } catch (err) {
            alert(err.response?.data?.message || 'Authentication Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
            <StatusBar barStyle="light-content" />
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            {/* Logo Section */}
                            <View style={styles.logoContainer}>
                                <View style={styles.iconCircle}>
                                    <ShieldCheck size={40} color="#FC8019" strokeWidth={2.5} />
                                </View>
                                <Text style={styles.title}>SWIGGY <Text style={styles.highlight}>ADMIN</Text></Text>
                                <Text style={styles.subtitle}>Consolidated Ecosystem Control</Text>
                            </View>

                            {/* Form Section */}
                            <View style={styles.form}>
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Access Email</Text>
                                    <View style={styles.inputContainer}>
                                        <Mail size={20} color="#93959F" />
                                        <TextInput
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="admin@swiggy.com"
                                            placeholderTextColor="#93959F"
                                            style={styles.input}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Security Key</Text>
                                    <View style={styles.inputContainer}>
                                        <Lock size={20} color="#93959F" />
                                        <TextInput
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="••••••••"
                                            placeholderTextColor="#93959F"
                                            style={styles.input}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={20} color="#93959F" /> : <Eye size={20} color="#93959F" />}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && styles.buttonDisabled]}
                                    onPress={handleLogin}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>ACCESS CONSOLE</Text>
                                            <ArrowRight size={20} color="#fff" strokeWidth={3} />
                                        </>
                                    )}
                                </TouchableOpacity>

                                <Text style={styles.footerNote}>
                                    AUTHORIZED PERSONNEL ONLY • IP LOGGED
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.copyright}>
                            © 2024 Swiggy Infrastructure Lab
                        </Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        width: '100%',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
        width: width,
    },
    card: {
        width: Platform.OS === 'web' ? 420 : '90%',
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 35,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F2F2F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E9E9EB',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#282C3F',
        letterSpacing: -0.5,
    },
    highlight: {
        color: '#FC8019',
    },
    subtitle: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '700',
        marginTop: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    form: {
        width: '100%',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: '#7E808C',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderWidth: 1.5,
        borderColor: '#E9E9EB',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 60,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        color: '#282C3F',
        fontSize: 15,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#FC8019',
        height: 65,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#FC8019',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
        marginRight: 10,
    },
    footerNote: {
        textAlign: 'center',
        color: '#D4D5D9',
        fontSize: 9,
        fontWeight: 'bold',
        marginTop: 25,
        letterSpacing: 2,
    },
    copyright: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 30,
        letterSpacing: 1,
    }
});
