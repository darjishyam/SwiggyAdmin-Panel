import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { CheckCircle, XCircle, Info } from 'lucide-react-native';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

const Toast = ({ type = 'success', message, onHide }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        console.log(`[Toast] Rendering toast: ${message}`);
        Animated.sequence([
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: Platform.OS === 'ios' ? 50 : Constants.statusBarHeight + 10,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(2500),
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            console.log(`[Toast] Hiding toast`);
            if (onHide) onHide();
        });
    }, []);

    const getStyles = () => {
        switch (type) {
            case 'success':
                return { bg: '#10B981', icon: <CheckCircle color="#fff" size={24} /> };
            case 'error':
                return { bg: '#F43F5E', icon: <XCircle color="#fff" size={24} /> };
            case 'info':
                return { bg: '#3B82F6', icon: <Info color="#fff" size={24} /> };
            default:
                return { bg: '#3B82F6', icon: null };
        }
    };

    const { bg, icon } = getStyles();

    return (
        <Animated.View style={[
            styles.container,
            {
                backgroundColor: bg,
                opacity,
                transform: [{ translateY }]
            }
        ]}>
            <View style={styles.content}>
                {icon}
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 99999,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10, // Increased elevation for Android
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    text: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
    },
});

export default Toast;
