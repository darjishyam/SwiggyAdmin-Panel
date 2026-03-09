import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, Modal, TextInput } from 'react-native';
import { TrendingUp, Award, Zap, Shield, ChevronRight, DollarSign, Settings, Edit2, X } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../src/services/api';

const { width } = Dimensions.get('window');

export default function RevenueDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Tier Management State
    const [tiers, setTiers] = useState([]);
    const [tierModalVisible, setTierModalVisible] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [tierForm, setTierForm] = useState({ price: '', durationDays: '', benefits: '' });
    const [tierSaving, setTierSaving] = useState(false);

    const fetchStats = async () => {
        try {
            const token = await AsyncStorage.getItem('adminToken');
            const response = await axios.get(`${API_BASE_URL}/admin/banners/revenue/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error("Fetch revenue stats error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchTiers = async () => {
        try {
            const token = await AsyncStorage.getItem('adminToken');
            const { data } = await axios.get(`${API_BASE_URL}/admin/banners/tiers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTiers(data);
        } catch (error) {
            console.error("Fetch tiers error:", error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchTiers();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchStats();
        fetchTiers();
    }, []);

    const openEditTier = (tier) => {
        setEditingTier(tier);
        setTierForm({
            price: tier.price.toString(),
            durationDays: tier.durationDays.toString(),
            benefits: tier.benefits || ''
        });
        setTierModalVisible(true);
    };

    const handleSaveTier = async () => {
        if (!tierForm.price || !tierForm.durationDays) return;
        setTierSaving(true);
        try {
            const token = await AsyncStorage.getItem('adminToken');
            await axios.put(`${API_BASE_URL}/admin/banners/tiers/${editingTier._id}`, {
                price: parseInt(tierForm.price),
                durationDays: parseInt(tierForm.durationDays),
                benefits: tierForm.benefits
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTierModalVisible(false);
            setEditingTier(null);
            fetchTiers();
            fetchStats();
        } catch (error) {
            console.error("Save tier error:", error);
        } finally {
            setTierSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FC8019" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FC8019']} />}
            >
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={styles.headerSubtitle}>Promotion Earnings</Text>
                        <TouchableOpacity style={styles.settingsBtn} onPress={() => setTierModalVisible(true)}>
                            <Settings size={18} color="#93959F" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.totalRevenueCard}>
                        <View>
                            <Text style={styles.totalRevenueLabel}>Total Revenue</Text>
                            <Text style={styles.totalRevenueValue}>₹{stats?.totalRevenue || 0}</Text>
                        </View>
                        <View style={styles.revenueIconBadge}>
                            <TrendingUp color="#fff" size={24} />
                        </View>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Avg. per Banner</Text>
                        <Text style={styles.statValue}>₹{stats?.averageRevenue || 0}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Paid</Text>
                        <Text style={styles.statValue}>{stats?.totalCompleted || 0}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Tier-wise Revenue</Text>

                <View style={styles.tierSection}>
                    {tiers.map(tier => (
                        <TierCard
                            key={tier._id}
                            title={tier.name.toUpperCase()}
                            amount={stats?.tierBreakdown[tier.key] || 0}
                            icon={
                                tier.key === 'elite' ? <Award size={20} color={tier.color} /> :
                                    tier.key === 'pro' ? <Zap size={20} color={tier.color} /> :
                                        <Shield size={20} color={tier.color} />
                            }
                            color={tier.color}
                            percentage={stats?.totalRevenue ? Math.round(((stats.tierBreakdown[tier.key] || 0) / stats.totalRevenue) * 100) : 0}
                            onEdit={() => openEditTier(tier)}
                        />
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <TrendingUp size={16} color="#FC8019" />
                    <Text style={styles.infoText}>Revenue is calculated from all approved paid promotion requests.</Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal
                visible={tierModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setTierModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Manage Plans</Text>
                            <TouchableOpacity onPress={() => { setTierModalVisible(false); setEditingTier(null); }}>
                                <X size={24} color="#282C3F" />
                            </TouchableOpacity>
                        </View>

                        {editingTier ? (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.editTierTitle}>Editing {editingTier.name}</Text>

                                <Text style={styles.inputLabel}>PRICE (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={tierForm.price}
                                    onChangeText={(t) => setTierForm({ ...tierForm, price: t.replace(/[^0-9]/g, '') })}
                                    keyboardType="numeric"
                                />

                                <Text style={styles.inputLabel}>DURATION (DAYS)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={tierForm.durationDays}
                                    onChangeText={(t) => setTierForm({ ...tierForm, durationDays: t.replace(/[^0-9]/g, '') })}
                                    keyboardType="numeric"
                                />

                                <Text style={styles.inputLabel}>BENEFITS TEXT</Text>
                                <TextInput
                                    style={styles.input}
                                    value={tierForm.benefits}
                                    onChangeText={(t) => setTierForm({ ...tierForm, benefits: t })}
                                    placeholder="e.g. 7 Days • Medium Boost"
                                />

                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={handleSaveTier}
                                    disabled={tierSaving}
                                >
                                    {tierSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setEditingTier(null)}
                                >
                                    <Text style={styles.cancelBtnText}>Back to List</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {tiers.map(t => (
                                    <TouchableOpacity key={t._id} style={styles.tierListItem} onPress={() => openEditTier(t)}>
                                        <View style={[styles.tierColorDot, { backgroundColor: t.color }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.tierListName}>{t.name}</Text>
                                            <Text style={styles.tierListSub}>{t.price === 0 ? 'Free' : `₹${t.price}`} • {t.durationDays} Days</Text>
                                        </View>
                                        <Edit2 size={16} color="#FC8019" />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const TierCard = ({ title, amount, icon, color, percentage, onEdit }) => (
    <View style={styles.tierCard}>
        <TouchableOpacity style={[styles.tierIconBox, { backgroundColor: color + '15' }]} onPress={onEdit}>
            {icon}
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.tierTitle}>{title}</Text>
            </View>
            <Text style={styles.tierAmount}>₹{amount}</Text>
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: 16 }}>
            <Text style={[styles.tierPercent, { color }]}>{percentage}%</Text>
            <TouchableOpacity onPress={onEdit} style={{ marginTop: 4 }}>
                <Settings size={12} color="#93959F" />
            </TouchableOpacity>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F2F3' },
    headerSubtitle: { fontSize: 12, fontWeight: '800', color: '#93959F', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 },
    totalRevenueCard: {
        backgroundColor: '#161616',
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalRevenueLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
    totalRevenueValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 },
    revenueIconBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

    statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F2F2F3' },
    statLabel: { fontSize: 12, color: '#93959F', fontWeight: 'bold', marginBottom: 8 },
    statValue: { fontSize: 20, fontWeight: '900', color: '#282C3F' },

    sectionTitle: { fontSize: 14, fontWeight: '900', color: '#282C3F', marginHorizontal: 20, marginTop: 12, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },

    tierSection: { paddingHorizontal: 16 },
    tierCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F2F2F3'
    },
    tierIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    tierTitle: { fontSize: 11, fontWeight: '900', color: '#93959F', letterSpacing: 1 },
    tierAmount: { fontSize: 18, fontWeight: '900', color: '#282C3F', marginVertical: 2 },
    progressBarBg: { height: 4, backgroundColor: '#F2F2F3', borderRadius: 2, marginTop: 6, width: '100%' },
    progressBarFill: { height: 4, borderRadius: 2 },
    tierPercent: { fontSize: 14, fontWeight: '900', marginLeft: 16 },

    infoBox: { flexDirection: 'row', alignItems: 'center', margin: 20, padding: 16, backgroundColor: 'rgba(252, 128, 25, 0.05)', borderRadius: 12, gap: 10 },
    infoText: { fontSize: 12, color: '#FC8019', fontWeight: '600', flex: 1 },

    // Modal & Tier Management Styles
    settingsBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F9FAFB' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: '#282C3F' },
    editTierTitle: { fontSize: 16, fontWeight: '800', color: '#FC8019', marginBottom: 20 },

    tierListItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F3' },
    tierColorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    tierListName: { fontSize: 15, fontWeight: '800', color: '#282C3F' },
    tierListSub: { fontSize: 12, color: '#93959F', marginTop: 2 },

    inputLabel: { fontSize: 11, fontWeight: '900', color: '#93959F', marginTop: 16, marginBottom: 8, letterSpacing: 1 },
    input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, fontSize: 14, fontWeight: '600', color: '#282C3F' },
    saveBtn: { backgroundColor: '#FC8019', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 32 },
    saveBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
    cancelBtn: { padding: 16, alignItems: 'center', marginTop: 8 },
    cancelBtnText: { color: '#93959F', fontWeight: '800', fontSize: 14 },
});
