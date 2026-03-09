import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { couponAPI } from '../../src/services/api';
import { Plus, Trash2, Edit2, X, Tag } from 'lucide-react-native';

const CouponsScreen = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [form, setForm] = useState({
        code: '',
        description: '',
        discountType: 'FLAT',
        discountValue: '',
        maxDiscount: '',
        minOrderValue: '',
        expiresAt: '',
        usageLimit: '',
        perUserLimit: '1',
        isActive: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await couponAPI.getCoupons();
            setCoupons(response.data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            Alert.alert("Error", "Failed to fetch coupons");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.code || !form.description || !form.discountValue || !form.minOrderValue || !form.expiresAt) {
            return Alert.alert("Error", "Please fill in all required fields (Code, Desc, Value, Min Order, Expiry)");
        }

        try {
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                minOrderValue: Number(form.minOrderValue),
                maxDiscount: form.discountType === 'PERCENTAGE' && form.maxDiscount ? Number(form.maxDiscount) : undefined,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                perUserLimit: Number(form.perUserLimit) || 1
            };

            if (editingCoupon) {
                await couponAPI.updateCoupon(editingCoupon._id, payload);
                Alert.alert("Success", "Coupon updated successfully");
            } else {
                await couponAPI.createCoupon(payload);
                Alert.alert("Success", "Coupon created successfully");
            }

            setModalVisible(false);
            fetchCoupons();
        } catch (error) {
            console.error("Error saving coupon:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to save coupon");
        }
    };

    const handleDelete = async (id) => {
        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to delete this coupon?")) {
                try {
                    await couponAPI.deleteCoupon(id);
                    fetchCoupons();
                } catch (error) {
                    Alert.alert("Error", "Failed to delete coupon");
                }
            }
        } else {
            Alert.alert("Delete Coupon", "Are you sure you want to delete this coupon?", [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            await couponAPI.deleteCoupon(id);
                            fetchCoupons();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete coupon");
                        }
                    }
                }
            ]);
        }
    };

    const toggleStatus = async (coupon) => {
        try {
            await couponAPI.updateCoupon(coupon._id, { isActive: !coupon.isActive });
            fetchCoupons();
        } catch (error) {
            Alert.alert("Error", "Failed to toggle status");
        }
    };

    const openCreateModal = () => {
        setEditingCoupon(null);
        setForm({
            code: '', description: '', discountType: 'FLAT', discountValue: '', maxDiscount: '',
            minOrderValue: '', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
            usageLimit: '', perUserLimit: '1', isActive: true
        });
        setModalVisible(true);
    };

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon);
        setForm({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: String(coupon.discountValue),
            maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
            minOrderValue: String(coupon.minOrderValue),
            expiresAt: new Date(coupon.expiresAt).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
            perUserLimit: String(coupon.perUserLimit || 1),
            isActive: coupon.isActive
        });
        setModalVisible(true);
    };

    const renderCoupon = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                    <Tag size={16} color="#4F46E5" />
                    <Text style={styles.codeText}>{item.code}</Text>
                </View>
                <View style={styles.actions}>
                    <Switch
                        value={item.isActive}
                        onValueChange={() => toggleStatus(item)}
                        trackColor={{ false: "#D1D5DB", true: "#34D399" }}
                        thumbColor={item.isActive ? "#10B981" : "#9CA3AF"}
                        style={{ marginRight: 10 }}
                    />
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                        <Edit2 size={18} color="#4F46E5" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
                        <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.description}>{item.description}</Text>

            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Offer</Text>
                    <Text style={styles.statValue}>
                        {item.discountType === 'FLAT' ? `₹${item.discountValue} OFF` : `${item.discountValue}% OFF`}
                    </Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Min Order</Text>
                    <Text style={styles.statValue}>₹{item.minOrderValue}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Usage</Text>
                    <Text style={styles.statValue}>{item.usedCount} /{item.usageLimit || '∞'}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Expires</Text>
                    <Text style={styles.statValue}>{new Date(item.expiresAt).toLocaleDateString()}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Coupons Management</Text>
                <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                    <Plus size={20} color="white" />
                    <Text style={styles.addButtonText}>New Coupon</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={coupons}
                    keyExtractor={item => item._id}
                    renderItem={renderCoupon}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={<Text style={styles.emptyText}>No coupons found.</Text>}
                />
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            <Text style={styles.label}>Coupon Code *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.code}
                                onChangeText={t => setForm({ ...form, code: t.toUpperCase().replace(/\s/g, '') })}
                                placeholder="e.g. SAVE50"
                                autoCapitalize="characters"
                            />

                            <Text style={styles.label}>Description *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.description}
                                onChangeText={t => setForm({ ...form, description: t })}
                                placeholder="e.g. Get ₹50 off on orders above ₹200"
                            />

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Discount Type *</Text>
                                    <View style={styles.typeSelector}>
                                        <TouchableOpacity
                                            style={[styles.typeBtn, form.discountType === 'FLAT' && styles.typeBtnActive]}
                                            onPress={() => setForm({ ...form, discountType: 'FLAT' })}
                                        >
                                            <Text style={form.discountType === 'FLAT' ? styles.typeTextActive : styles.typeText}>FLAT</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.typeBtn, form.discountType === 'PERCENTAGE' && styles.typeBtnActive]}
                                            onPress={() => setForm({ ...form, discountType: 'PERCENTAGE' })}
                                        >
                                            <Text style={form.discountType === 'PERCENTAGE' ? styles.typeTextActive : styles.typeText}>%</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Value * ({form.discountType === 'FLAT' ? '₹' : '%'})</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.discountValue}
                                        onChangeText={t => setForm({ ...form, discountValue: t })}
                                        keyboardType="numeric"
                                        placeholder="e.g. 50"
                                    />
                                </View>
                            </View>

                            {form.discountType === 'PERCENTAGE' && (
                                <>
                                    <Text style={styles.label}>Max Discount (₹) - Optional</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.maxDiscount}
                                        onChangeText={t => setForm({ ...form, maxDiscount: t })}
                                        keyboardType="numeric"
                                        placeholder="No limit"
                                    />
                                </>
                            )}

                            <Text style={styles.label}>Min Order Value (₹) *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.minOrderValue}
                                onChangeText={t => setForm({ ...form, minOrderValue: t })}
                                keyboardType="numeric"
                                placeholder="e.g. 200"
                            />

                            <Text style={styles.label}>Expiry Date * (YYYY-MM-DD)</Text>
                            <TextInput
                                style={styles.input}
                                value={form.expiresAt}
                                onChangeText={t => setForm({ ...form, expiresAt: t })}
                                placeholder="YYYY-MM-DD"
                            />

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Total Uses (Optional)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.usageLimit}
                                        onChangeText={t => setForm({ ...form, usageLimit: t })}
                                        keyboardType="numeric"
                                        placeholder="e.g. 100"
                                    />
                                </View>
                                <View style={styles.half}>
                                    <Text style={styles.label}>Uses Per User</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form.perUserLimit}
                                        onChangeText={t => setForm({ ...form, perUserLimit: t })}
                                        keyboardType="numeric"
                                        placeholder="e.g. 1"
                                    />
                                </View>
                            </View>

                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveText}>Save Coupon</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#e5e7eb' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
    addButton: { flexDirection: 'row', backgroundColor: '#4F46E5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    addButtonText: { color: 'white', fontWeight: '600', marginLeft: 8 },
    listContainer: { padding: 16, gap: 16 },
    emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40, fontSize: 16 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#4F46E5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    codeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 6 },
    codeText: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5', letterSpacing: 1 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { padding: 6, marginLeft: 4 },
    description: { fontSize: 14, color: '#4B5563', marginBottom: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
    statBox: { minWidth: '45%' },
    statLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
    statValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 16, width: '100%', maxWidth: 500, maxHeight: '90%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    formScroll: { padding: 20 },
    row: { flexDirection: 'row', gap: 12 },
    half: { flex: 1 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 12 },
    input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: '#F9FAFB', color: '#111827' },
    typeSelector: { flexDirection: 'row', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, overflow: 'hidden' },
    typeBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#F9FAFB' },
    typeBtnActive: { backgroundColor: '#4F46E5' },
    typeText: { color: '#6B7280', fontWeight: '600' },
    typeTextActive: { color: 'white', fontWeight: '600' },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 12 },
    cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#F3F4F6' },
    cancelText: { color: '#4B5563', fontWeight: '600' },
    saveBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#4F46E5' },
    saveText: { color: 'white', fontWeight: '600' },
});

export default CouponsScreen;
