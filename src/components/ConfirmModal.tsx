import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { AlertTriangle, HelpCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconSection}>
                        <View style={[styles.iconCircle, { backgroundColor: type === 'danger' ? '#fef2f2' : '#eff6ff' }]}>
                            {type === 'danger' ? (
                                <AlertTriangle color="#dc2626" size={32} />
                            ) : (
                                <HelpCircle color="#2563eb" size={32} />
                            )}
                        </View>
                    </View>

                    <View style={styles.textSection}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => {
                                console.log("[ConfirmModal] Cancel pressed");
                                onCancel();
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: type === 'danger' ? '#dc2626' : '#2563eb' }]}
                            onPress={() => {
                                console.log("[ConfirmModal] Confirm pressed");
                                onConfirm();
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.confirmBtnText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    modalContainer: {
        width: Platform.OS === 'web' ? 400 : width * 0.85,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    iconSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        color: '#282C3F',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        color: '#7E808C',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#F2F2F3',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    cancelBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#7E808C',
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#fff',
    },
});

export default ConfirmModal;
