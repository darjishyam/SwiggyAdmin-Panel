import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Platform,
    Alert
} from 'react-native';
import { ShoppingBag, Clock, MapPin, User, ChevronRight, Hash, CreditCard, Activity, X, Navigation, Phone, ShieldCheck, Filter, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';
import { socketService } from '../../src/services/socket';
import { Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const params = useLocalSearchParams();

    // Filter State
    const [activeFilter, setActiveFilter] = useState('ALL');
    const FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'ON ROUTE', 'COMPLETED', 'CANCELLED'];

    // Tracking State
    const [trackingModalVisible, setTrackingModalVisible] = useState(false);
    const [trackedOrder, setTrackedOrder] = useState(null);
    const [liveLocation, setLiveLocation] = useState(null);

    // Details Modal State
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const { data } = await adminAPI.getOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Initialize Real-time Monitor
        socketService.initialize();

        // Listen for new orders
        socketService.onNewOrder((newOrder) => {
            
            setOrders(prev => [newOrder, ...prev]);
            // Optional: Show a toast or notification
        });

        // Listen for status updates
        socketService.onOrderUpdate((updatedOrder) => {
            
            setOrders(prev => prev.map(order =>
                order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order
            ));
        });

        // Listen for live driver location updates
        socketService.onDriverLocationUpdate((data) => {
            // data: { driverId, latitude, longitude, timestamp }
            setOrders(prevOrders => {
                const currentTrackedOrder = prevOrders.find(o => o.driver?._id === data.driverId || o.driver === data.driverId);
                if (currentTrackedOrder) {
                    setLiveLocation(prev => {
                        // Only update if it's the driver we are currently tracking in the modal
                        return data;
                    });
                }
                return prevOrders;
            });
        });

        return () => {
            socketService.removeListeners();
        };
    }, []);

    // Set filter from params
    useEffect(() => {
        if (params.filter) {
            const filterMap = {
                pending: 'PENDING',
                processing: 'PROCESSING',
                onRoute: 'ON ROUTE',
                completed: 'COMPLETED',
                cancelled: 'CANCELLED'
            };
            const mappedFilter = filterMap[params.filter];
            if (mappedFilter) {
                setActiveFilter(mappedFilter);
            }
        }
    }, [params.filter]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        Alert.alert(
            "Update Status",
            `Are you sure you want to change this order status to ${newStatus.toUpperCase()}? This will notify all parties.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    style: newStatus === 'Cancelled' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            const { data } = await adminAPI.updateOrderStatus(orderId, newStatus);
                            // Update local state
                            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
                            if (selectedOrder?._id === orderId) {
                                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
                            }
                            Alert.alert("Success", `Order status updated to ${newStatus}`);
                        } catch (error) {
                            console.error("Status update error:", error);
                            Alert.alert("Error", error.response?.data?.message || "Failed to update status");
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#22c55e';
            case 'Order Placed': return '#FC8019';
            case 'Confirmed':
            case 'Preparing': return '#3498db';
            case 'Ready':
            case 'Out for Delivery': return '#9b59b6';
            case 'Cancelled': return '#FF5252';
            default: return '#93959F';
        }
    };

    const filterOrders = (ordersList) => {
        if (activeFilter === 'ALL') return ordersList;

        return ordersList.filter(order => {
            const status = order.status;
            switch (activeFilter) {
                case 'PENDING':
                    return status === 'Order Placed';
                case 'PROCESSING':
                    return ['Confirmed', 'Preparing'].includes(status);
                case 'ON ROUTE':
                    return ['Ready', 'Out for Delivery'].includes(status);
                case 'COMPLETED':
                    return status === 'Delivered';
                case 'CANCELLED':
                    return status === 'Cancelled';
                default:
                    return true;
            }
        });
    };

    const displayOrders = filterOrders(orders);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FC8019" />}
            >
                {/* Filter Bar */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterBar}
                    contentContainerStyle={styles.filterContent}
                >
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
                            onPress={() => setActiveFilter(f)}
                        >
                            <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {loading && !refreshing ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#FC8019" />
                    </View>
                ) : (
                    <>
                        {displayOrders.map((order) => (
                            <TouchableOpacity
                                key={order._id}
                                style={styles.orderCard}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setSelectedOrder(order);
                                    setDetailsModalVisible(true);
                                }}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.orderMeta}>
                                        <View style={styles.iconBox}>
                                            <ShoppingBag size={20} color="#FC8019" />
                                        </View>
                                        <View style={styles.metaInfo}>
                                            <Text style={styles.orderIdText}>ORDER #{order._id.substring(order._id.length - 6).toUpperCase()}</Text>
                                            <Text style={styles.orderTimeText}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}15` }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status?.toUpperCase()}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.participantSection}>
                                    <View style={styles.participant}>
                                        <User size={14} color="#93959F" />
                                        <Text style={styles.participantName}>{order.user?.name || 'Guest User'}</Text>
                                    </View>
                                    <ChevronRight size={14} color="#D4D5D9" />
                                    <View style={styles.participant}>
                                        <ShoppingBag size={14} color="#93959F" />
                                        <Text style={styles.participantName}>{order.restaurant?.name || 'Partner Outlet'}</Text>
                                    </View>
                                </View>

                                <View style={styles.orderItems}>
                                    {order.items?.map((item, idx) => (
                                        <View key={idx} style={styles.itemRow}>
                                            <Text style={styles.itemQty}>{item.quantity}x</Text>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemPrice}>₹{item.price}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.footerRow}>
                                    <View style={styles.paymentMethod}>
                                        <CreditCard size={14} color="#93959F" />
                                        <Text style={styles.paymentText}>{order.paymentDetails?.method || 'N/A'}</Text>
                                    </View>
                                    <Text style={styles.grandTotal}>₹{order.totalAmount}</Text>
                                </View>

                                <TouchableOpacity
                                    style={[styles.trackBtn, order.status !== 'Out for Delivery' && { opacity: 0.5 }]}
                                    onPress={() => {
                                        if (order.status === 'Out for Delivery') {
                                            setTrackedOrder(order);
                                            setTrackingModalVisible(true);
                                        } else {
                                            setSelectedOrder(order);
                                            setDetailsModalVisible(true);
                                        }
                                    }}
                                >
                                    <Text style={styles.trackBtnText}>
                                        {order.status === 'Out for Delivery' ? 'TRACK REAL-TIME' : 'VIEW FULL DETAILS'}
                                    </Text>
                                    {order.status === 'Out for Delivery' ? (
                                        <Activity size={14} color="#FC8019" />
                                    ) : (
                                        <ChevronRight size={14} color="#93959F" />
                                    )}
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}

                        {orders.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <ShoppingBag size={64} color="#E9E9EB" />
                                <Text style={styles.emptyTitle}>NO ACTIVE TRANSACTIONS</Text>
                                <Text style={styles.emptySubtitle}>Platform traffic is currently quiet</Text>
                            </View>
                        )}
                    </>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Tracking Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={trackingModalVisible}
                onRequestClose={() => setTrackingModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.trackingContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Live Order Tracker</Text>
                                <Text style={styles.modalSubtitle}>ID: {trackedOrder?._id?.substring(0, 8).toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setTrackingModalVisible(false);
                                    setLiveLocation(null);
                                }}
                                style={styles.closeBtn}
                            >
                                <X size={24} color="#28282F" />
                            </TouchableOpacity>
                        </View>

                        {/* Status Bar */}
                        <View style={styles.progressSection}>
                            <View style={styles.progressInfo}>
                                <View style={styles.pulseContainer}>
                                    <View style={styles.pulseDot} />
                                    <View style={styles.pulseRing} />
                                </View>
                                <Text style={styles.liveStatusText}>
                                    {liveLocation ? 'DRIVER IS MOVING' : 'WAITING FOR GPS...'}
                                </Text>
                            </View>
                            <Text style={styles.lastUpdateText}>
                                {liveLocation ? `Last updated: ${new Date(liveLocation.timestamp).toLocaleTimeString()}` : 'Establishing link...'}
                            </Text>
                        </View>

                        {/* Visualization Area */}
                        <View style={styles.mapBuffer}>
                            <View style={styles.pathGraphic}>
                                <View style={[styles.node, styles.startNode]}>
                                    <ShoppingBag size={20} color="#fff" />
                                    <Text style={styles.nodeLabel}>Kitchen</Text>
                                </View>
                                <View style={styles.dashedLine} />
                                <View style={[styles.node, styles.endNode]}>
                                    <User size={20} color="#fff" />
                                    <Text style={styles.nodeLabel}>Customer</Text>
                                </View>

                                {/* Live Marker */}
                                <View style={[
                                    styles.liveMarker,
                                    { left: liveLocation ? '60%' : '15%' } // Simulation of progress if no real map
                                ]}>
                                    <Navigation size={24} color="#FC8019" fill="#FC8019" />
                                </View>
                            </View>
                        </View>

                        {/* Info Footer */}
                        <View style={styles.trackingDetails}>
                            <View style={styles.detailRow}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>DELIVERY PARTNER</Text>
                                    <Text style={styles.detailValue}>{trackedOrder?.driver?.name || 'Assigned Partner'}</Text>
                                </View>
                                <TouchableOpacity style={styles.callBtn}>
                                    <Phone size={18} color="#25bb64" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.coordsBox}>
                                <View style={styles.coordItem}>
                                    <Text style={styles.coordLabel}>LATITUDE</Text>
                                    <Text style={styles.coordValue}>{liveLocation?.latitude?.toFixed(6) || '---'}</Text>
                                </View>
                                <View style={styles.coordItem}>
                                    <Text style={styles.coordLabel}>LONGITUDE</Text>
                                    <Text style={styles.coordValue}>{liveLocation?.longitude?.toFixed(6) || '---'}</Text>
                                </View>
                            </View>

                            <View style={styles.addressBox}>
                                <MapPin size={16} color="#93959F" />
                                <Text style={styles.addressValue} numberOfLines={1}>
                                    {trackedOrder?.deliveryAddress?.street}, {trackedOrder?.deliveryAddress?.city}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Order Details Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={detailsModalVisible}
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.detailsContainer}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Order Details</Text>
                                <Text style={styles.modalSubtitle}>ID: {selectedOrder?._id?.toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setDetailsModalVisible(false)}
                                style={styles.closeBtn}
                            >
                                <X size={24} color="#28282F" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.detailsScroll}>
                            {/* Status Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Activity size={16} color="#FC8019" />
                                    <Text style={styles.sectionTitle}>STATUS & TIMING</Text>
                                </View>
                                <View style={styles.detailCard}>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Current Status</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(selectedOrder?.status)}15` }]}>
                                            <Text style={[styles.statusText, { color: getStatusColor(selectedOrder?.status) }]}>{selectedOrder?.status?.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Placed At</Text>
                                        <Text style={styles.value}>{new Date(selectedOrder?.createdAt).toLocaleString()}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Items Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <ShoppingBag size={16} color="#FC8019" />
                                    <Text style={styles.sectionTitle}>ITEMS ORDERED</Text>
                                </View>
                                <View style={styles.detailCard}>
                                    {selectedOrder?.items?.map((item, idx) => (
                                        <View key={idx} style={styles.fullItemRow}>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.itemNameText}>{item.name}</Text>
                                                <Text style={styles.itemMetaText}>Quantity: {item.quantity} • ₹{item.price} per unit</Text>
                                            </View>
                                            <Text style={styles.itemTotalText}>₹{item.price * item.quantity}</Text>
                                        </View>
                                    ))}
                                    <View style={styles.modalDivider} />
                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Grand Total</Text>
                                        <Text style={styles.totalValue}>₹{selectedOrder?.totalAmount}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Customer Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <User size={16} color="#FC8019" />
                                    <Text style={styles.sectionTitle}>CUSTOMER DETAILS</Text>
                                </View>
                                <View style={styles.detailCard}>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Name</Text>
                                        <Text style={styles.value}>{selectedOrder?.user?.name || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Phone</Text>
                                        <Text style={styles.value}>{selectedOrder?.user?.phone || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.column}>
                                        <Text style={styles.label}>Delivery Address</Text>
                                        <Text style={styles.addressText}>{selectedOrder?.deliveryAddress?.street}, {selectedOrder?.deliveryAddress?.city}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Restaurant Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <MapPin size={16} color="#FC8019" />
                                    <Text style={styles.sectionTitle}>RESTAURANT INFO</Text>
                                </View>
                                <View style={styles.detailCard}>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Name</Text>
                                        <Text style={styles.value}>{selectedOrder?.restaurant?.name || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Location</Text>
                                        <Text style={styles.value}>{selectedOrder?.restaurant?.location || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Driver Section (If assigned) */}
                            {selectedOrder?.driver && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeader}>
                                        <Navigation size={16} color="#FC8019" />
                                        <Text style={styles.sectionTitle}>DELIVERY PARTNER</Text>
                                    </View>
                                    <View style={styles.detailCard}>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>Name</Text>
                                            <Text style={styles.value}>{selectedOrder?.driver?.name || 'N/A'}</Text>
                                        </View>
                                        <View style={styles.row}>
                                            <Text style={styles.label}>Phone</Text>
                                            <Text style={styles.value}>{selectedOrder?.driver?.phone || 'N/A'}</Text>
                                        </View>
                                        {selectedOrder.status === 'Out for Delivery' && (
                                            <TouchableOpacity
                                                style={styles.modalTrackBtn}
                                                onPress={() => {
                                                    setDetailsModalVisible(false);
                                                    setTrackedOrder(selectedOrder);
                                                    setTrackingModalVisible(true);
                                                }}
                                            >
                                                <Text style={styles.modalTrackBtnText}>OPEN REAL-TIME TRACKER</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Management Section */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <ShieldCheck size={16} color="#FC8019" />
                                    <Text style={styles.sectionTitle}>MANAGE ORDER (ADMIN OVERRIDE)</Text>
                                </View>
                                <View style={[styles.detailCard, { backgroundColor: '#FFF5F5', borderColor: '#FFE8E8' }]}>
                                    <Text style={styles.managementWarning}>Only use these buttons if the order is "stuck" or if manual intervention is required.</Text>

                                    <View style={styles.managementButtons}>
                                        {selectedOrder?.status !== 'Cancelled' && selectedOrder?.status !== 'Delivered' && (
                                            <TouchableOpacity
                                                style={[styles.manageBtn, styles.cancelBtn]}
                                                onPress={() => handleUpdateStatus(selectedOrder._id, 'Cancelled')}
                                            >
                                                <AlertTriangle size={16} color="#fff" />
                                                <Text style={styles.manageBtnText}>CANCEL ORDER</Text>
                                            </TouchableOpacity>
                                        )}

                                        {selectedOrder?.status !== 'Delivered' && selectedOrder?.status !== 'Cancelled' && (
                                            <TouchableOpacity
                                                style={[styles.manageBtn, styles.completeBtn]}
                                                onPress={() => handleUpdateStatus(selectedOrder._id, 'Delivered')}
                                            >
                                                <CheckCircle size={16} color="#fff" />
                                                <Text style={styles.manageBtnText}>MARK DELIVERED</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    scrollContent: {
        padding: 20,
        paddingTop: 10,
    },
    // Filter Bar Styles
    filterBar: {
        marginBottom: 15,
        height: 45,
    },
    filterContent: {
        alignItems: 'center',
        paddingRight: 20,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E9E9EB',
    },
    filterTabActive: {
        backgroundColor: '#FC8019',
        borderColor: '#FC8019',
    },
    filterTabText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#7E808C',
    },
    filterTabTextActive: {
        color: '#fff',
    },
    centerBox: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
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
        alignItems: 'center',
    },
    orderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#FFF5E9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFE8CC',
    },
    metaInfo: {
        marginLeft: 12,
    },
    orderIdText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#282C3F',
        letterSpacing: 0.5,
    },
    orderTimeText: {
        fontSize: 10,
        color: '#93959F',
        fontWeight: '700',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F3',
        marginVertical: 15,
    },
    participantSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 12,
    },
    participant: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    participantName: {
        fontSize: 12,
        fontWeight: '700',
        color: '#282C3F',
        marginLeft: 8,
    },
    orderItems: {
        marginTop: 15,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemQty: {
        fontSize: 11,
        fontWeight: '900',
        color: '#FC8019',
        width: 25,
    },
    itemName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#282C3F',
        flex: 1,
    },
    itemPrice: {
        fontSize: 12,
        fontWeight: '700',
        color: '#282C3F',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#93959F',
        marginLeft: 6,
    },
    grandTotal: {
        fontSize: 18,
        fontWeight: '900',
        color: '#282C3F',
    },
    trackBtn: {
        marginTop: 15,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#F2F2F3',
        padding: 12,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackBtnText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FC8019',
        letterSpacing: 1,
        marginRight: 8,
    },
    modalTrackBtnText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FC8019',
        letterSpacing: 1,
    },
    // Management Section Styles
    managementWarning: {
        fontSize: 10,
        color: '#D32F2F',
        fontWeight: '700',
        marginBottom: 16,
        lineHeight: 14,
        textAlign: 'center',
    },
    managementButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    manageBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    cancelBtn: {
        backgroundColor: '#D32F2F',
    },
    completeBtn: {
        backgroundColor: '#2E7D32',
    },
    manageBtnText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        marginLeft: 8,
        letterSpacing: 0.5,
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackingContainer: {
        width: Platform.OS === 'web' ? 450 : width * 0.9,
        backgroundColor: '#fff',
        borderRadius: 32,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    modalTitle: {
        fontSize: 20,
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
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressSection: {
        padding: 20,
        backgroundColor: '#F9F9F9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveStatusText: {
        fontSize: 13,
        fontWeight: '900',
        color: '#282C3F',
        marginLeft: 12,
    },
    lastUpdateText: {
        fontSize: 10,
        color: '#93959F',
        fontWeight: '700',
    },
    pulseContainer: {
        width: 12,
        height: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#25bb64',
    },
    pulseRing: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#25bb64',
        opacity: 0.4,
    },
    mapBuffer: {
        height: 180,
        backgroundColor: '#FFF5E9',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    pathGraphic: {
        width: '100%',
        height: 4,
        backgroundColor: '#FFE8CC',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
    },
    node: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    startNode: {
        left: -24,
        backgroundColor: '#FC8019',
    },
    endNode: {
        right: -24,
        backgroundColor: '#282C3F',
    },
    nodeLabel: {
        position: 'absolute',
        bottom: -22,
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        width: 60,
        textAlign: 'center',
    },
    dashedLine: {
        flex: 1,
        height: 0,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#FC8019',
        borderRadius: 1,
    },
    liveMarker: {
        position: 'absolute',
        top: -30,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackingDetails: {
        padding: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#282C3F',
    },
    callBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#DEFBE6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    coordsBox: {
        flexDirection: 'row',
        backgroundColor: '#F7F7F7',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    coordItem: {
        flex: 1,
    },
    coordLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#93959F',
        marginBottom: 4,
    },
    coordValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#282C3F',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    addressValue: {
        fontSize: 13,
        color: '#686B78',
        fontWeight: '600',
        marginLeft: 8,
        flex: 1,
    },
    // New Details Modal Styles
    detailsContainer: {
        width: Platform.OS === 'web' ? 600 : width * 0.95,
        height: '85%',
        backgroundColor: '#fff',
        borderRadius: 32,
        overflow: 'hidden',
    },
    detailsScroll: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1.5,
        marginLeft: 10,
    },
    detailCard: {
        backgroundColor: '#F9F9F9',
        borderRadius: 18,
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    column: {
        marginTop: 4,
    },
    label: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
    },
    value: {
        fontSize: 13,
        color: '#282C3F',
        fontWeight: '700',
    },
    addressText: {
        fontSize: 13,
        color: '#282C3F',
        fontWeight: '600',
        marginTop: 6,
        lineHeight: 18,
    },
    fullItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    itemNameText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#282C3F',
    },
    itemMetaText: {
        fontSize: 11,
        color: '#93959F',
        marginTop: 2,
    },
    itemTotalText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#282C3F',
    },
    modalDivider: {
        height: 1,
        backgroundColor: '#E8E8E8',
        marginVertical: 15,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '900',
        color: '#282C3F',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FC8019',
    },
    modalTrackBtn: {
        backgroundColor: '#FC8019',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    modalTrackBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    }
});
