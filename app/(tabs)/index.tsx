import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    Dimensions,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    Users,
    Truck,
    Store,
    Bell,
    ChevronRight,
    ArrowUpRight,
    Layers,
    Ticket,
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    Layout,
    TrendingUp,
    ShoppingBag
} from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, icon: Icon, color, trend, full, loading }) => (
    <View style={[styles.statCard, { width: full ? '100%' : (width - 56) / 2 }]}>
        <View style={styles.statCardHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
                <Icon size={22} color={color} />
            </View>
            {trend && !loading && (
                <View style={styles.trendBadge}>
                    <ArrowUpRight size={10} color="#4ade80" />
                    <Text style={styles.trendText}>+{trend}%</Text>
                </View>
            )}
        </View>
        <Text style={styles.statLabel}>{title}</Text>
        {loading ? (
            <ActivityIndicator size="small" color={color} style={{ alignSelf: 'flex-start', marginTop: 10 }} />
        ) : (
            <Text style={styles.statValue}>{value}</Text>
        )}
    </View>
);

export default function Dashboard() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: '0',
        totalDrivers: '0',
        totalRestaurants: '0',
        totalOrders: '0',
        totalRevenue: '0',
        totalCategories: '0',
        totalOffers: '0',
        reports: {
            pending: 0,
            processing: 0,
            onRoute: 0,
            completed: 0,
            cancelled: 0
        }
    });

    const fetchStats = async () => {
        try {
            const { data } = await adminAPI.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FC8019" />}
        >
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>ECOSYSTEM LIVE</Text>
                    <Text style={styles.headerTitle}>DASHBOARD</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
                    <Bell size={22} color="#282C3F" />
                    <View style={styles.notifDot} />
                </TouchableOpacity>
            </View>

            {/* Quick Overview Tier */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Overview</Text>
            </View>
            <View style={styles.statsGrid}>
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalRevenue}`}
                    icon={TrendingUp}
                    color="#16a34a"
                    trend="12"
                    loading={loading}
                    full={width < 600}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="#2563eb"
                    trend="5"
                    loading={loading}
                />
                <StatCard
                    title="Live Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="#ea580c"
                    loading={loading}
                />
            </View>

            {/* Detailed Reports Tier */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Management & Status</Text>
            </View>

            <View style={styles.reportsGrid}>
                {/* Entities */}
                <ReportCard
                    title="Banners"
                    value="5"
                    icon={Layout}
                    loading={loading}
                />
                <ReportCard
                    title="Categories"
                    value={stats.totalCategories}
                    icon={Layers}
                    loading={loading}
                />
                <ReportCard
                    title="Delivery Partners"
                    value={stats.totalDrivers}
                    icon={Truck}
                    loading={loading}
                />
                <ReportCard
                    title="Restaurants"
                    value={stats.totalRestaurants}
                    icon={Store}
                    loading={loading}
                />
                <ReportCard
                    title="Active Offers"
                    value={stats.totalOffers}
                    icon={Ticket}
                    loading={loading}
                />

                {/* Status Breakdown */}
                <ReportCard
                    title="Pending"
                    value={stats.reports?.pending}
                    icon={Package}
                    loading={loading}
                    onPress={() => router.push({ pathname: '/(tabs)/orders', params: { filter: 'pending' } })}
                />
                <ReportCard
                    title="Processing"
                    value={stats.reports?.processing}
                    icon={Clock}
                    loading={loading}
                    onPress={() => router.push({ pathname: '/(tabs)/orders', params: { filter: 'processing' } })}
                />
                <ReportCard
                    title="On Route"
                    value={stats.reports?.onRoute}
                    icon={Truck}
                    loading={loading}
                    onPress={() => router.push({ pathname: '/(tabs)/orders', params: { filter: 'onRoute' } })}
                />
                <ReportCard
                    title="Completed"
                    value={stats.reports?.completed}
                    icon={CheckCircle2}
                    loading={loading}
                    onPress={() => router.push({ pathname: '/(tabs)/orders', params: { filter: 'completed' } })}
                />
                <ReportCard
                    title="Cancelled"
                    value={stats.reports?.cancelled}
                    icon={XCircle}
                    loading={loading}
                    onPress={() => router.push({ pathname: '/(tabs)/orders', params: { filter: 'cancelled' } })}
                />
            </View>

            <View style={{ height: 60 }} />
        </ScrollView>
    );
}

const ReportCard = ({ title, value, icon: Icon, color, full, loading, onPress }) => (
    <TouchableOpacity
        style={[styles.reportCard, full && { width: '100%', maxWidth: '100%' }]}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
    >
        <View style={styles.reportIconContainer}>
            <Icon size={18} color="#475569" />
        </View>
        <View style={styles.reportContent}>
            <Text style={styles.reportLabel}>{title}</Text>
            {loading ? (
                <ActivityIndicator size="small" color="#475569" style={{ alignSelf: 'flex-start' }} />
            ) : (
                <Text style={styles.reportValue}>{value}</Text>
            )}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FC8019',
        letterSpacing: 2,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#282C3F',
        letterSpacing: -1,
    },
    notificationBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    notifDot: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FC8019',
        borderWidth: 2,
        borderColor: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    statCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1fae5',
    },
    trendText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#10b981',
        marginLeft: 2,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#7E808C',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#282C3F',
        marginTop: 5,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 30,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#282C3F',
        letterSpacing: -0.5,
    },
    statusSubtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#93959F',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    badgeOptimal: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#22c55e',
        marginRight: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#16a34a',
    },
    nodesList: {
        marginBottom: 30,
    },
    nodeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    nodeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nodeIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    nodeName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#282C3F',
    },
    nodeRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nodeLoad: {
        fontSize: 11,
        fontWeight: '700',
        color: '#7E808C',
        marginRight: 10,
    },
    diagBtn: {
        backgroundColor: '#F9F9F9',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    diagBtnText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#7E808C',
        letterSpacing: 1,
    },
    // New Report Styles
    sectionHeader: {
        marginTop: 10,
        marginBottom: 15,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    reportsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    reportCard: {
        backgroundColor: '#fff',
        width: width > 900 ? (width - 100) / 4 : (width > 600 ? (width - 80) / 2 : (width - 52) / 2),
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
        marginBottom: 4,
    },
    reportIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reportContent: {
        flex: 1,
    },
    reportLabel: {
        fontSize: 12,
        color: '#718096',
        marginBottom: 2,
        fontWeight: '500',
    },
    reportValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a202c',
    }
});
