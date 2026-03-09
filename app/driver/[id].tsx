import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Truck,
    Smartphone,
    MapPin,
    CheckCircle,
    Activity,
    FileText,
    Star,
    Wallet,
    Calendar,
    Phone,
    Mail,
    CreditCard
} from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';
import { useToast } from '../../src/context/ToastContext';

const { width } = Dimensions.get('window');

export default function DriverDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [driver, setDriver] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // We'll use the stats endpoint as it returns both profile and analytics
            const { data } = await adminAPI.getDriverStats(id);
            setDriver(data.driver);
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch driver details:", error);
            showToast('error', 'Failed to load driver dossier');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const getStatusStyle = (status) => {
        const lower = (status || 'unknown').toLowerCase();
        if (lower === 'delivered' || lower === 'active') return { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' };
        if (lower === 'cancelled' || lower === 'blocked' || lower === 'rejected') return { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' };
        return { bg: '#f9fafb', text: '#374151', dot: '#9ca3af' };
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FC8019" />
                <Text style={styles.loaderText}>Retrieving Fleet Dossier...</Text>
            </View>
        );
    }

    const sStyle = getStatusStyle(driver?.status || 'Active');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#282C3F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Driver Dossier</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Profile Overview */}
                <View style={styles.profileCard}>
                    <View style={styles.profileMain}>
                        <View style={styles.avatarContainer}>
                            {driver?.profilePhoto ? (
                                <Image source={{ uri: driver.profilePhoto }} style={styles.avatar} />
                            ) : (
                                <Truck size={40} color="#FC8019" />
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.driverName}>{driver?.name || 'Partner Name'}</Text>
                            <View style={styles.statusBadgeRow}>
                                <View style={[styles.statusDot, { backgroundColor: sStyle.dot }]} />
                                <Text style={[styles.statusLabel, { color: sStyle.text }]}>
                                    {(driver?.status || 'Active').toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.ratingRow}>
                                <Star size={14} color="#fbbf24" fill="#fbbf24" />
                                <Text style={styles.ratingText}>{driver?.rating?.toFixed(1) || '0.0'}</Text>
                                <Text style={styles.totalOrdersText}> • {driver?.totalOrders || 0} Deliveries</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Performance Analytics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PERFORMANCE ANALYTICS</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statBox}>
                            <View style={[styles.iconCircle, { backgroundColor: '#f0f9ff' }]}>
                                <Activity size={20} color="#0284c7" />
                            </View>
                            <Text style={styles.statValue}>{stats?.stats?.accuracy || 0}%</Text>
                            <Text style={styles.statLabel}>Accuracy</Text>
                        </View>
                        <View style={styles.statBox}>
                            <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                                <Wallet size={20} color="#16a34a" />
                            </View>
                            <Text style={styles.statValue}>₹{driver?.walletBalance || 0}</Text>
                            <Text style={styles.statLabel}>Wallet</Text>
                        </View>
                        <View style={styles.statBox}>
                            <View style={[styles.iconCircle, { backgroundColor: '#fff7ed' }]}>
                                <Smartphone size={20} color="#c2410c" />
                            </View>
                            <Text style={styles.statValue}>₹{driver?.lifetimeEarnings || 0}</Text>
                            <Text style={styles.statLabel}>Lifetime</Text>
                        </View>
                    </View>
                </View>

                {/* Personal & Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PARTNER INFORMATION</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Phone size={18} color="#93959F" />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>PHONE NUMBER</Text>
                                <Text style={styles.infoValue}>{driver?.phone || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Mail size={18} color="#93959F" />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                                <Text style={styles.infoValue}>{driver?.email || 'N/A'}</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <MapPin size={18} color="#93959F" />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>LOCATION / CITY</Text>
                                <Text style={styles.infoValue}>{driver?.city || 'Regional'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Vehicle Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>VEHICLE LOGISTICS</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <Truck size={18} color="#93959F" />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>MODEL & TYPE</Text>
                                <Text style={styles.infoValue}>{driver?.vehicleModel || 'N/A'} ({driver?.vehicleType?.toUpperCase() || 'N/A'})</Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <View style={styles.iconBox}>
                                <CreditCard size={18} color="#93959F" />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>PLATE NUMBER</Text>
                                <Text style={styles.infoValue}>{driver?.vehicleNumber || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionTitle}>RECENT ACTIVITY LOG</Text>
                    <View style={styles.activityCard}>
                        {stats?.lastOrders?.map((order) => {
                            const os = getStatusStyle(order.status);
                            return (
                                <View key={order.id} style={styles.orderItem}>
                                    <View style={styles.orderLead}>
                                        <View style={[styles.orderIcon, { backgroundColor: os.bg }]}>
                                            <Calendar size={16} color={os.text} />
                                        </View>
                                        <View>
                                            <Text style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</Text>
                                            <Text style={styles.orderTime}>{new Date(order.date).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.orderRight}>
                                        <Text style={styles.orderEarnings}>+₹{order.fee || 0}</Text>
                                        <Text style={[styles.orderStatus, { color: os.text }]}>{order.status}</Text>
                                    </View>
                                </View>
                            );
                        })}
                        {(!stats?.lastOrders || stats.lastOrders.length === 0) && (
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No recent delivery activity recorded</Text>
                            </View>
                        )}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#93959F',
        fontWeight: '700',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#282C3F',
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    profileMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 28,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileInfo: {
        marginLeft: 20,
        flex: 1,
    },
    driverName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#282C3F',
    },
    statusBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#282C3F',
        marginLeft: 4,
    },
    totalOrdersText: {
        fontSize: 13,
        color: '#93959F',
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#282C3F',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#93959F',
        marginTop: 2,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#282C3F',
    },
    activityCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    orderLead: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    orderIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    orderId: {
        fontSize: 13,
        fontWeight: '800',
        color: '#282C3F',
    },
    orderTime: {
        fontSize: 11,
        color: '#93959F',
        fontWeight: '600',
    },
    orderRight: {
        alignItems: 'flex-end',
    },
    orderEarnings: {
        fontSize: 14,
        fontWeight: '900',
        color: '#16a34a',
    },
    orderStatus: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    emptyBox: {
        padding: 30,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
    }
});
