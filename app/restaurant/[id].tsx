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
    StatusBar,
    FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ChevronLeft,
    Store,
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
    CreditCard,
    TrendingUp,
    ShoppingBag,
    Users,
    ChevronRight,
    ShoppingBasket
} from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';
import { useToast } from '../../src/context/ToastContext';

const { width } = Dimensions.get('window');

const TABS = ['OVERVIEW', 'MENU', 'HISTORY', 'DOCUMENTS'];

export default function RestaurantDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [resData, setResData] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuLoading, setMenuLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyTotal, setHistoryTotal] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getRestaurantStats(id);
            setResData(data);
        } catch (error) {
            console.error("Failed to fetch restaurant details:", error);
            showToast('error', 'Failed to load restaurant dossier');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async () => {
        if (menu.length > 0) return;
        setMenuLoading(true);
        try {
            const { data } = await adminAPI.getRestaurantMenu(id);
            setMenu(data);
        } catch (error) {
            console.error("Failed to fetch menu:", error);
        } finally {
            setMenuLoading(false);
        }
    };

    const fetchHistory = async (page = 1) => {
        setHistoryLoading(true);
        try {
            const { data } = await adminAPI.getRestaurantOrderHistory(id, page);
            if (page === 1) {
                setHistory(data.orders);
            } else {
                setHistory(prev => [...prev, ...data.orders]);
            }
            setHistoryTotal(data.total);
            setHistoryPage(page);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'MENU') fetchMenu();
        if (activeTab === 'HISTORY') fetchHistory(1);
    }, [activeTab]);

    const getStatusStyle = (status) => {
        const s = (status || 'PENDING').toUpperCase();
        if (s === 'APPROVED') return { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' };
        if (s === 'REJECTED' || s === 'SUSPENDED') return { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' };
        return { bg: '#fffbeb', text: '#d97706', dot: '#fbbf24' };
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#FC8019" />
                <Text style={styles.loaderText}>Retrieving Partner Intelligence...</Text>
            </View>
        );
    }

    const restaurant = resData?.restaurant;
    const stats = resData?.stats;
    const sStyle = getStatusStyle(restaurant?.status);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#282C3F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Partner Dossier</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Sticky Tabs */}
            <View style={styles.tabBar}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                    >
                        <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {activeTab === 'OVERVIEW' && (
                    <>
                        {/* Profile Overview */}
                        <View style={styles.profileCard}>
                            <View style={styles.profileMain}>
                                <View style={styles.avatarContainer}>
                                    {restaurant?.image ? (
                                        <Image source={{ uri: restaurant.image }} style={styles.avatar} />
                                    ) : (
                                        <Store size={40} color="#FC8019" />
                                    )}
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.resName}>{restaurant?.name || 'Partner Name'}</Text>
                                    <View style={styles.statusBadgeRow}>
                                        <View style={[styles.statusDot, { backgroundColor: sStyle.dot }]} />
                                        <Text style={[styles.statusLabel, { color: sStyle.text }]}>
                                            {(restaurant?.status || 'PENDING').toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.ownerSubtext}>Owned by {restaurant?.ownerName || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Revenue & Growth Dashboard */}
                        <View style={styles.dashboardSection}>
                            <View style={styles.revenueMainCard}>
                                <View style={styles.revHeader}>
                                    <TrendingUp size={16} color="#fff" />
                                    <Text style={styles.revTitle}>TOTAL REVENUE</Text>
                                </View>
                                <Text style={styles.revValue}>₹{stats?.totalRevenue?.toLocaleString() || '0'}</Text>
                                <View style={styles.commissionBox}>
                                    <Text style={styles.commLabel}>Admin Commission ({restaurant?.commissionRate || 20}%)</Text>
                                    <Text style={styles.commValue}>₹{stats?.totalCommission?.toLocaleString() || '0'}</Text>
                                </View>
                            </View>

                            <View style={styles.statsGrid}>
                                <View style={styles.miniStatCard}>
                                    <ShoppingBag size={18} color="#FC8019" />
                                    <Text style={styles.miniStatVal}>{stats?.deliveredCount || 0}</Text>
                                    <Text style={styles.miniStatLab}>Delivered</Text>
                                </View>
                                <View style={styles.miniStatCard}>
                                    <Users size={18} color="#0284c7" />
                                    <Text style={styles.miniStatVal}>{stats?.successRate || 0}%</Text>
                                    <Text style={styles.miniStatLab}>Success Rate</Text>
                                </View>
                                <View style={styles.miniStatCard}>
                                    <Activity size={18} color="#16a34a" />
                                    <Text style={styles.miniStatVal}>{restaurant?.rating || 'New'}</Text>
                                    <Text style={styles.miniStatLab}>Rating</Text>
                                </View>
                            </View>
                        </View>

                        {/* Popular Items */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>MOST POPULAR ITEMS</Text>
                            <View style={styles.popularList}>
                                {resData?.popularItems?.map((item, idx) => (
                                    <View key={idx} style={styles.popItemRow}>
                                        <View style={styles.popItemLeft}>
                                            <View style={styles.rankCircle}>
                                                <Text style={styles.rankText}>{idx + 1}</Text>
                                            </View>
                                            <Text style={styles.popItemName}>{item.name}</Text>
                                        </View>
                                        <Text style={styles.popItemCount}>{item.count} orders</Text>
                                    </View>
                                ))}
                                {(!resData?.popularItems || resData.popularItems.length === 0) && (
                                    <Text style={styles.emptyText}>No delivery patterns recorded yet</Text>
                                )}
                            </View>
                        </View>

                        {/* Business Contact */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>BUSINESS CONTACT</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <Phone size={18} color="#93959F" />
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoLabel}>PHONE</Text>
                                        <Text style={styles.infoValue}>{restaurant?.phone || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <Mail size={18} color="#93959F" />
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoLabel}>EMAIL</Text>
                                        <Text style={styles.infoValue}>{restaurant?.email || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <MapPin size={18} color="#93959F" />
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoLabel}>ADDRESS</Text>
                                        <Text style={styles.infoValue}>
                                            {restaurant?.address?.street ?
                                                `${restaurant.address.street}, ${restaurant.address.city}` :
                                                'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {activeTab === 'MENU' && (
                    <View style={styles.menuSection}>
                        <Text style={styles.sectionTitle}>ACTIVE MENU ITEMS</Text>
                        {menuLoading ? (
                            <ActivityIndicator color="#FC8019" style={{ marginTop: 20 }} />
                        ) : (
                            <View style={styles.menuGrid}>
                                {menu.map(item => (
                                    <View key={item._id} style={styles.menuItem}>
                                        <Image source={{ uri: item.image }} style={styles.menuImage} />
                                        <View style={styles.menuInfo}>
                                            <View style={styles.menuHeader}>
                                                <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                                                <View style={[styles.vegBadge, { borderColor: item.isVeg ? '#22c55e' : '#FF5252' }]}>
                                                    <View style={[styles.vegCircle, { backgroundColor: item.isVeg ? '#22c55e' : '#FF5252' }]} />
                                                </View>
                                            </View>
                                            <Text style={styles.menuCat}>{item.category}</Text>
                                            <Text style={styles.menuPrice}>₹{item.price}</Text>
                                        </View>
                                    </View>
                                ))}
                                {menu.length === 0 && (
                                    <View style={styles.emptyMenuBox}>
                                        <ShoppingBasket size={40} color="#D4D5D9" />
                                        <Text style={styles.emptyText}>No menu items found</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {activeTab === 'HISTORY' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ORDER HISTORY ({historyTotal} total)</Text>
                        {historyLoading && history.length === 0 ? (
                            <ActivityIndicator color="#FC8019" style={{ marginTop: 20 }} />
                        ) : history.length === 0 ? (
                            <View style={styles.emptyMenuBox}>
                                <ShoppingBag size={40} color="#D4D5D9" />
                                <Text style={styles.emptyText}>No orders found for this restaurant</Text>
                            </View>
                        ) : (
                            <>
                                {history.map((order) => {
                                    const statusColor = {
                                        Delivered: { bg: '#f0fdf4', text: '#16a34a' },
                                        Cancelled: { bg: '#fef2f2', text: '#dc2626' },
                                        Preparing: { bg: '#fffbeb', text: '#d97706' },
                                        'Out for Delivery': { bg: '#eff6ff', text: '#2563eb' },
                                    }[order.status] || { bg: '#f7f7f7', text: '#93959F' };
                                    return (
                                        <View key={order._id} style={styles.historyCard}>
                                            <View style={styles.historyCardTop}>
                                                <View>
                                                    <Text style={styles.historyOrderId}>#{order.orderId}</Text>
                                                    <Text style={styles.historyItems} numberOfLines={1}>{order.items}</Text>
                                                </View>
                                                <View style={[styles.historyBadge, { backgroundColor: statusColor.bg }]}>
                                                    <Text style={[styles.historyBadgeText, { color: statusColor.text }]}>{order.status}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.historyCardBottom}>
                                                <View style={styles.historyMeta}>
                                                    <Text style={styles.historyMetaLabel}>TOTAL</Text>
                                                    <Text style={styles.historyMetaValue}>₹{order.grandTotal}</Text>
                                                </View>
                                                <View style={styles.historyMeta}>
                                                    <Text style={styles.historyMetaLabel}>ITEMS</Text>
                                                    <Text style={styles.historyMetaValue}>{order.itemsCount}</Text>
                                                </View>
                                                <View style={styles.historyMeta}>
                                                    <Text style={styles.historyMetaLabel}>DRIVER</Text>
                                                    <Text style={styles.historyMetaValue} numberOfLines={1}>{order.driver}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.historyDate}>
                                                {new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    );
                                })}
                                {history.length < historyTotal && (
                                    <TouchableOpacity
                                        style={styles.loadMoreBtn}
                                        onPress={() => fetchHistory(historyPage + 1)}
                                        disabled={historyLoading}
                                    >
                                        {historyLoading ? (
                                            <ActivityIndicator color="#FC8019" size="small" />
                                        ) : (
                                            <Text style={styles.loadMoreText}>Load More Orders</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                )}

                {activeTab === 'DOCUMENTS' && (
                    <>
                        {/* Statutory Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>LEGAL & TAXATION</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.infoRow}>
                                    <FileText size={18} color="#93959F" />
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoLabel}>FSSAI LICENSE</Text>
                                        <Text style={styles.infoValue}>{restaurant?.fssaiLicense || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <CreditCard size={18} color="#93959F" />
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoLabel}>GSTIN / PAN</Text>
                                        <Text style={styles.infoValue}>{restaurant?.gstNumber || 'N/A'} • {restaurant?.panNumber || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Document Gallery */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>VERIFICATION DOCUMENTS</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.docGallery}>
                                {restaurant?.documentImages?.fssai && (
                                    <View style={styles.docCard}>
                                        <Image source={{ uri: restaurant.documentImages.fssai }} style={styles.docImg} />
                                        <Text style={styles.docTag}>FSSAI</Text>
                                    </View>
                                )}
                                {restaurant?.documentImages?.pan && (
                                    <View style={styles.docCard}>
                                        <Image source={{ uri: restaurant.documentImages.pan }} style={styles.docImg} />
                                        <Text style={styles.docTag}>PAN</Text>
                                    </View>
                                )}
                                {restaurant?.documentImages?.cancelledCheque && (
                                    <View style={styles.docCard}>
                                        <Image source={{ uri: restaurant.documentImages.cancelledCheque }} style={styles.docImg} />
                                        <Text style={styles.docTag}>CHEQUE</Text>
                                    </View>
                                )}
                                {!restaurant?.documentImages && (
                                    <View style={styles.noDocBoxLarge}>
                                        <FileText size={40} color="#D4D5D9" />
                                        <Text style={styles.emptyText}>No document scans uploaded</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        {/* Bank Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>BANKING INFORMATION</Text>
                            <View style={styles.infoCard}>
                                <View style={styles.bankRow}>
                                    <View style={styles.bankColumn}>
                                        <Text style={styles.infoLabel}>ACCOUNT HOLDER</Text>
                                        <Text style={styles.infoValue}>{restaurant?.bankDetails?.accountHolderName || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.bankRow}>
                                    <View style={styles.bankColumn}>
                                        <Text style={styles.infoLabel}>ACCOUNT NUMBER</Text>
                                        <Text style={styles.infoValue}>{restaurant?.bankDetails?.accountNumber || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.bankColumn}>
                                        <Text style={styles.infoLabel}>IFSC</Text>
                                        <Text style={styles.infoValue}>{restaurant?.bankDetails?.ifscCode || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </>
                )}

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
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    tab: {
        paddingVertical: 14,
        marginRight: 24,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#FC8019',
    },
    tabText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#93959F',
        letterSpacing: 0.5,
    },
    activeTabText: {
        color: '#FC8019',
    },
    scrollContent: {
        padding: 20,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
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
        width: 70,
        height: 70,
        borderRadius: 24,
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
        marginLeft: 16,
        flex: 1,
    },
    resName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#282C3F',
    },
    statusBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    ownerSubtext: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 4,
    },
    dashboardSection: {
        marginBottom: 24,
    },
    revenueMainCard: {
        backgroundColor: '#FC8019',
        borderRadius: 28,
        padding: 24,
        marginBottom: 16,
    },
    revHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: 0.9,
    },
    revTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    revValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        marginTop: 10,
    },
    commissionBox: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 16,
        padding: 12,
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    commLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#fff',
    },
    commValue: {
        fontSize: 13,
        fontWeight: '900',
        color: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    miniStatCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    miniStatVal: {
        fontSize: 15,
        fontWeight: '900',
        color: '#282C3F',
        marginTop: 8,
    },
    miniStatLab: {
        fontSize: 9,
        fontWeight: '800',
        color: '#93959F',
        marginTop: 2,
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
    popularList: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    popItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
    },
    popItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rankCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#d97706',
    },
    popItemName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#282C3F',
    },
    popItemCount: {
        fontSize: 12,
        fontWeight: '800',
        color: '#16a34a',
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 16,
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
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    menuItem: {
        width: (width - 52) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    menuImage: {
        width: '100%',
        height: 100,
        backgroundColor: '#F9F9F9',
    },
    menuInfo: {
        padding: 12,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuName: {
        fontSize: 13,
        fontWeight: '800',
        color: '#282C3F',
        flex: 1,
        marginRight: 4,
    },
    vegBadge: {
        width: 14,
        height: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vegCircle: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    menuCat: {
        fontSize: 10,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 2,
    },
    menuPrice: {
        fontSize: 14,
        fontWeight: '900',
        color: '#282C3F',
        marginTop: 6,
    },
    docGallery: {
        flexDirection: 'row',
    },
    docCard: {
        width: 140,
        height: 180,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    docImg: {
        width: '100%',
        height: 140,
    },
    docTag: {
        fontSize: 10,
        fontWeight: '900',
        color: '#282C3F',
        textAlign: 'center',
        paddingVertical: 8,
    },
    bankRow: {
        flexDirection: 'row',
        gap: 20,
        paddingVertical: 10,
    },
    bankColumn: {
        flex: 1,
    },
    emptyMenuBox: {
        flex: 1,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDocBoxLarge: {
        width: width - 40,
        height: 120,
        backgroundColor: '#F9F9F9',
        borderRadius: 24,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#D4D5D9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 10,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F2F2F3',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    historyCardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    historyOrderId: {
        fontSize: 15,
        fontWeight: '900',
        color: '#282C3F',
    },
    historyItems: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 2,
        maxWidth: 200,
    },
    historyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    historyBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
    historyCardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F9F9F9',
        paddingTop: 12,
        marginBottom: 8,
    },
    historyMeta: {
        alignItems: 'center',
        flex: 1,
    },
    historyMetaLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1,
        marginBottom: 4,
    },
    historyMetaValue: {
        fontSize: 13,
        fontWeight: '800',
        color: '#282C3F',
        textAlign: 'center',
    },
    historyDate: {
        fontSize: 11,
        color: '#D4D5D9',
        fontWeight: '600',
        textAlign: 'right',
    },
    loadMoreBtn: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FC8019',
        marginTop: 4,
        marginBottom: 12,
    },
    loadMoreText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FC8019',
    },

});
