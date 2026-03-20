import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Platform,
    Modal,
    Alert,
    Clipboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Store, Star, CheckCircle, Ban, ChevronRight, Phone, Clock, X, ShoppingBasket, AlertTriangle, Clock3, ShieldCheck, FileText, MapPin, Activity, Smartphone } from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';
import { useToast } from '../../src/context/ToastContext';

const { width, height } = Dimensions.get('window');

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

const STATUS_COLORS = {
    PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    APPROVED: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    REJECTED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    SUSPENDED: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
};

export default function RestaurantsScreen() {
    const { showToast, showConfirm } = useToast();
    const router = useRouter();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState(null); // restaurantId being updated

    const fetchRestaurants = async () => {
        try {
            const { data } = await adminAPI.getRestaurants();
            setRestaurants(data);
        } catch (error) {
            console.error("Failed to fetch restaurants:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleViewDetails = (restaurant) => {
        router.push(`/restaurant/${restaurant._id}`);
    };

    const handleStatusChange = async (restaurant, newStatus) => {
        const actionLabel = {
            APPROVED: 'approve',
            REJECTED: 'reject',
            SUSPENDED: 'suspend',
            PENDING: 'set back to pending',
        }[newStatus];

        const performStatusUpdate = async () => {
            setActionLoading(restaurant._id);
            try {
                
                await adminAPI.updateRestaurantStatus(restaurant._id, newStatus);
                setRestaurants(prev =>
                    prev.map(r => r._id === restaurant._id ? { ...r, status: newStatus } : r)
                );
                showToast('success', `Restaurant ${actionLabel === 'set back to pending' ? 'is now pending' : actionLabel + 'ed'} successfully`);
            } catch (error) {
                const errorMsg = error?.response?.data?.message || error.message || 'Failed to update status';
                console.error(`[Admin] Restaurant update failed:`, errorMsg);
                showToast('error', errorMsg);
            } finally {
                setActionLoading(null);
            }
        };

        const confirmMessage = `Are you sure you want to ${actionLabel} "${restaurant.name}"?`;
        const confirmType = (newStatus === 'REJECTED' || newStatus === 'SUSPENDED') ? 'danger' : 'info';

        showConfirm(
            `${newStatus === 'APPROVED' ? '✅' : newStatus === 'REJECTED' ? '❌' : '⚠️'} Confirm Action`,
            `Are you sure you want to ${actionLabel} "${restaurant.name || 'this partner'}"?`,
            performStatusUpdate,
            confirmType
        );
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const copyToClipboard = (id, label) => {
        Clipboard.setString(id);
        showToast('success', `${label} ID copied to clipboard!`);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchRestaurants();
    };

    const filteredRestaurants = activeFilter === 'ALL'
        ? restaurants
        : restaurants.filter(r => r.status === activeFilter);

    const counts = STATUS_FILTERS.slice(1).reduce((acc, s) => {
        acc[s] = restaurants.filter(r => r.status === s).length;
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterBar}
                contentContainerStyle={styles.filterContent}
            >
                {STATUS_FILTERS.map(filter => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterTab,
                            activeFilter === filter && styles.filterTabActive
                        ]}
                        onPress={() => setActiveFilter(filter)}
                    >
                        <Text style={[
                            styles.filterTabText,
                            activeFilter === filter && styles.filterTabTextActive
                        ]}>
                            {filter}
                            {filter !== 'ALL' && counts[filter] > 0 ? ` (${counts[filter]})` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.mainScroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FC8019" />}
            >
                {loading && !refreshing ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#FC8019" />
                    </View>
                ) : (
                    <>
                        {filteredRestaurants.map((res) => {
                            const statusColor = STATUS_COLORS[res.status] || STATUS_COLORS.PENDING;
                            const isLoading = actionLoading === res._id;

                            return (
                                <View key={res._id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.resIdentity}>
                                            <View style={styles.imageBox}>
                                                {res.image ? (
                                                    <Image source={{ uri: res.image }} style={styles.resImage} />
                                                ) : (
                                                    <Store size={24} color="#FC8019" />
                                                )}
                                            </View>
                                            <View style={styles.resInfo}>
                                                <Text style={styles.resName}>{res.name}</Text>
                                                <Text style={styles.ownerText}>👤 {res.ownerName || 'Owner'}</Text>
                                                <View style={styles.ratingRow}>
                                                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                                                    <Text style={styles.ratingText}>{res.rating || 'New'}</Text>
                                                    <Text style={styles.locationText}>• {res.storeType || 'RESTAURANT'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
                                            <Text style={[styles.statusText, { color: statusColor.text }]}>
                                                {res.status || 'PENDING'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* ID Section for Banners */}
                                    <View style={styles.idContainer}>
                                        <Text style={styles.idText}>ID: {res._id}</Text>
                                        <TouchableOpacity onPress={() => copyToClipboard(res._id, res.name)}>
                                            <Text style={styles.copyText}>COPY ID</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.metaRow}>
                                        <View style={styles.metaItem}>
                                            <Clock size={12} color="#93959F" />
                                            <Text style={styles.metaText}>{res.deliveryTime || '30-40 mins'}</Text>
                                        </View>
                                        <View style={styles.metaItem}>
                                            <Phone size={12} color="#93959F" />
                                            <Text style={styles.metaText}>{res.phone || 'Not listed'}</Text>
                                        </View>
                                        {res.email && (
                                            <View style={styles.metaItem}>
                                                <Text style={styles.metaText}>✉️ {res.email}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.divider} />

                                    {isLoading ? (
                                        <View style={styles.loadingRow}>
                                            <ActivityIndicator size="small" color="#FC8019" />
                                            <Text style={styles.loadingText}>Updating...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.cardFooter}>
                                            <TouchableOpacity
                                                style={styles.viewDossierBtn}
                                                onPress={() => handleViewDetails(res)}
                                            >
                                                <Text style={styles.viewDossierText}>VIEW DASHBOARD</Text>
                                                <ShieldCheck size={14} color="#FC8019" />
                                            </TouchableOpacity>

                                            <View style={styles.actionGroup}>
                                                {/* Approve — only show if not already APPROVED */}
                                                {res.status !== 'APPROVED' && (
                                                    <TouchableOpacity
                                                        style={styles.approveBtn}
                                                        onPress={() => handleStatusChange(res, 'APPROVED')}
                                                    >
                                                        <CheckCircle size={20} color="#16a34a" />
                                                    </TouchableOpacity>
                                                )}
                                                {/* Reject — show if PENDING or APPROVED */}
                                                {(res.status === 'PENDING' || res.status === 'APPROVED') && (
                                                    <TouchableOpacity
                                                        style={styles.rejectBtn}
                                                        onPress={() => handleStatusChange(res, 'REJECTED')}
                                                    >
                                                        <X size={20} color="#dc2626" />
                                                    </TouchableOpacity>
                                                )}
                                                {/* Suspend — show if APPROVED */}
                                                {res.status === 'APPROVED' && (
                                                    <TouchableOpacity
                                                        style={styles.suspendBtn}
                                                        onPress={() => handleStatusChange(res, 'SUSPENDED')}
                                                    >
                                                        <Ban size={20} color="#7c3aed" />
                                                    </TouchableOpacity>
                                                )}
                                                {/* Restore — show if REJECTED or SUSPENDED */}
                                                {(res.status === 'REJECTED' || res.status === 'SUSPENDED') && (
                                                    <TouchableOpacity
                                                        style={styles.pendingBtn}
                                                        onPress={() => handleStatusChange(res, 'PENDING')}
                                                    >
                                                        <Clock3 size={20} color="#d97706" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        {filteredRestaurants.length === 0 && !loading && (
                            <View style={styles.emptyContainer}>
                                <Store size={64} color="#E9E9EB" />
                                <Text style={styles.emptyTitle}>NO PARTNERS</Text>
                                <Text style={styles.emptySubtitle}>
                                    {activeFilter === 'ALL'
                                        ? 'No restaurants registered yet'
                                        : `No ${activeFilter.toLowerCase()} restaurants`}
                                </Text>
                            </View>
                        )}
                    </>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    // Filter Bar
    filterBar: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
        height: 60,
        flexGrow: 0, // Prevent it from being crushed by the main content
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        alignItems: 'center',
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F2F2F3',
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: '#FC8019',
    },
    filterTabText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#7E808C',
        letterSpacing: 0.5,
    },
    filterTabTextActive: {
        color: '#fff',
    },
    mainScroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    centerBox: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 22,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    resIdentity: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    imageBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    resImage: {
        width: '100%',
        height: '100%',
    },
    resInfo: {
        marginLeft: 15,
        flex: 1,
    },
    resName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#282C3F',
    },
    ownerText: {
        fontSize: 11,
        color: '#7E808C',
        fontWeight: '600',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#282C3F',
        marginLeft: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
        marginLeft: 6,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    idContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    idText: {
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: '#64748b',
    },
    copyText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FC8019',
    },
    metaRow: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 8,
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
    },
    metaText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#7E808C',
        marginLeft: 6,
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F3',
        marginVertical: 18,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    loadingText: {
        fontSize: 13,
        color: '#FC8019',
        fontWeight: '700',
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1.5,
    },
    viewDossierBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#fff7ed',
        gap: 6,
    },
    viewDossierText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FC8019',
        letterSpacing: 1,
    },
    actionGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    approveBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    rejectBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    suspendBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#f5f3ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd6fe',
    },
    pendingBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#fffbeb',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    emptyContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#282C3F',
        marginTop: 20,
        letterSpacing: 2,
    },
    emptySubtitle: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: height * 0.8,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#282C3F',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '700',
        marginTop: 4,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuList: {
        paddingBottom: 40,
    },
    menuItem: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    menuItemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
    },
    menuItemInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    menuItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 14,
        fontWeight: '900',
        color: '#282C3F',
        flex: 1,
    },
    vegBadge: {
        width: 14,
        height: 14,
        borderWidth: 1,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    vegCircle: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    itemCategory: {
        fontSize: 11,
        color: '#93959F',
        fontWeight: '700',
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '900',
        color: '#282C3F',
        marginTop: 6,
    },
    emptyMenu: {
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.5,
    },
    emptyMenuText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#93959F',
        marginTop: 15,
    },
    // Dossier Specific Styles
    modalSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    infoLabel: {
        fontSize: 9,
        color: '#93959F',
        fontWeight: '800',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 13,
        color: '#282C3F',
        fontWeight: '700',
    },
    docScroll: {
        flexDirection: 'row',
        gap: 12,
    },
    docPreviewCard: {
        width: 200,
        height: 150,
        borderRadius: 16,
        backgroundColor: '#F2F2F3',
        marginRight: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E9E9EB',
    },
    docFullImage: {
        width: '100%',
        height: '100%',
    },
    docTag: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    noDocBox: {
        width: 200,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F2F2F3',
        borderStyle: 'dashed',
    },
    noDocText: {
        fontSize: 11,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 10,
    }
});
