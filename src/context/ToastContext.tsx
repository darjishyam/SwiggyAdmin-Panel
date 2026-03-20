import React, { createContext, useState, useContext } from 'react';
import { View } from 'react-native';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const [confirm, setConfirm] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: null
    });

    const showToast = (type, message) => {
        setToast({ type, message });
    };

    const hideToast = () => {
        setToast(null);
    };

    const showConfirm = (title, message, onConfirm, type = 'danger') => {
        
        setConfirm({
            visible: true,
            title,
            message,
            type,
            onConfirm: onConfirm // Store the raw function
        });
    };

    const handleActualConfirm = async () => {
        
        if (typeof confirm.onConfirm === 'function') {
            try {
                await confirm.onConfirm();
            } catch (err) {
                console.error("[ToastContext] Error in confirmation callback:", err);
            }
        }
        setConfirm(prev => ({ ...prev, visible: false, onConfirm: null }));
    };

    const hideConfirm = () => {
        setConfirm(prev => ({ ...prev, visible: false, onConfirm: null }));
    };

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            <View style={{ flex: 1 }}>
                {children}
                {toast && (
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        onHide={hideToast}
                    />
                )}
                <ConfirmModal
                    visible={confirm.visible}
                    title={confirm.title}
                    message={confirm.message}
                    type={confirm.type}
                    onConfirm={handleActualConfirm}
                    onCancel={hideConfirm}
                />
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
