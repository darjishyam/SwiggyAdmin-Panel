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
import {
    Users,
    Truck,
    Store,
    ShoppingBag,
    TrendingUp,
    Activity,
    Bell,
    ChevronRight,
    ArrowUpRight
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
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: '0',
        totalDrivers: '0',
        totalRestaurants: '0',
        totalOrders: '0',
        totalRevenue: '0',
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

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <StatCard
                    title="Global Revenue"
                    value={`₹${stats.totalRevenue}`}
                    icon={TrendingUp}
                    color="#FC8019"
                    trend="15"
                    full
                    loading={loading}
                />
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="#3498db"
                    trend="8"
                    loading={loading}
                />
                <StatCard
                    title="Active Logistics"
                    value={stats.totalDrivers}
                    icon={Truck}
                    color="#27ae60"
                    loading={loading}
                />
                <StatCard
                    title="Partner Outlets"
                    value={stats.totalRestaurants}
                    icon={Store}
                    color="#9b59b6"
                    trend="4"
                    loading={loading}
                />
                <StatCard
                    title="Live Transactions"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="#e91e63"
                    trend="24"
                    loading={loading}
                />
            </View>

            {/* System Status Card */}
            <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                    <View>
                        <Text style={styles.statusTitle}>SYSTEM PULSE</Text>
                        <Text style={styles.statusSubtitle}>Operational Node Status</Text>
                    </View>
                    <View style={styles.badgeOptimal}>
                        <View style={styles.badgeDot} />
                        <Text style={styles.badgeText}>OPTIMAL</Text>
                    </View>
                </View>

                <View style={styles.nodesList}>
                    {[
                        { name: 'Gateway Server', load: '12%', status: 'Healthy' },
                        { name: 'Payment Shard', load: '24%', status: 'Healthy' },
                        { name: 'Logistics Engine', load: '89%', status: 'Busy' }
                    ].map((node, i) => (
                        <View key={i} style={styles.nodeItem}>
                            <View style={styles.nodeLeft}>
                                <View style={styles.nodeIcon}>
                                    <Activity size={18} color="#93959F" />
                                </View>
                                <Text style={styles.nodeName}>{node.name}</Text>
                            </View>
                            <View style={styles.nodeRight}>
                                <Text style={styles.nodeLoad}>{node.load}</Text>
                                <ChevronRight size={14} color="#D4D5D9" />
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.diagBtn} activeOpacity={0.7}>
                    <Text style={styles.diagBtnText}>VIEW FULL DIAGNOSTICS</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

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
    }
});
