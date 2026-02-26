import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Platform,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Image,
    Modal
} from 'react-native';
import { Truck, Smartphone, MapPin, CheckCircle, Ban, Star, ShieldCheck, Activity, X, Clock3, AlertTriangle, ChevronRight, FileText, Phone } from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';
import { useToast } from '../../src/context/ToastContext';

const { width, height } = Dimensions.get('window');

const STATUS_FILTERS = ['ALL', 'onboarding', 'PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'BLOCKED'];

const STATUS_COLORS = {
    onboarding: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    PENDING: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    ACTIVE: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    REJECTED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    SUSPENDED: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    BLOCKED: { bg: '#45474b', text: '#ffffff', border: '#282c3f' },
};

export default function DriversScreen() {
    const { showToast, showConfirm } = useToast();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [actionLoading, setActionLoading] = useState(null);

    // Detail Modal State
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    const fetchDrivers = async () => {
        try {
            const { data } = await adminAPI.getDrivers();
            setDrivers(data);
        } catch (error) {
            console.error("Failed to fetch drivers:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleStatusChange = async (driver, newStatus) => {
        const actionLabel = {
            ACTIVE: 'activate',
            REJECTED: 'reject',
            SUSPENDED: 'suspend',
            BLOCKED: 'block',
            PENDING: 'set back to pending',
            onboarding: 'reset to onboarding'
        }[newStatus];

        const performStatusUpdate = async () => {
            setActionLoading(driver._id);
            try {
                console.log(`[Admin] Updating driver ${driver._id} status to ${newStatus}`);
                await adminAPI.updateDriverStatus(driver._id, newStatus);
                setDrivers(prev =>
                    prev.map(d => d._id === driver._id ? { ...d, status: newStatus } : d)
                );
                showToast('success', `Driver ${actionLabel === 'reset to onboarding' ? 'reset' : actionLabel + 'ed'} successfully`);
            } catch (error) {
                const errorMsg = error?.response?.data?.message || error.message || 'Failed to update status';
                console.error(`[Admin] Status update failed:`, errorMsg);
                showToast('error', errorMsg);
            } finally {
                setActionLoading(null);
            }
        };

        const confirmMessage = `Are you sure you want to ${actionLabel} "${driver.name || 'this driver'}"?`;
        const confirmType = newStatus === 'BLOCKED' ? 'danger' : 'info';

        showConfirm(
            `Confirm Action`,
            confirmMessage,
            performStatusUpdate,
            confirmType
        );
    };


    const viewDetails = (driver) => {
        setSelectedDriver(driver);
        setDetailModalVisible(true);
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDrivers();
    };

    const filteredDrivers = activeFilter === 'ALL'
        ? drivers
        : drivers.filter(d => (d.status || 'onboarding') === activeFilter);

    const counts = STATUS_FILTERS.slice(1).reduce((acc, s) => {
        acc[s] = drivers.filter(d => (d.status || 'onboarding') === s).length;
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
                            {filter.toUpperCase()}
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
                        {filteredDrivers.map((driver) => {
                            const status = driver.status || 'onboarding';
                            const statusColor = STATUS_COLORS[status] || STATUS_COLORS.onboarding;
                            const isLoading = actionLoading === driver._id;

                            return (
                                <View key={driver._id} style={styles.driverCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.driverLead}>
                                            <View style={styles.imageBox}>
                                                {driver.profilePhoto ? (
                                                    <Image source={{ uri: driver.profilePhoto }} style={styles.driverImage} />
                                                ) : (
                                                    <Truck size={24} color="#FC8019" />
                                                )}
                                            </View>
                                            <View style={styles.nameSection}>
                                                <Text style={styles.driverName}>{driver.name || 'New Candidate'}</Text>
                                                <View style={styles.phoneRow}>
                                                    <Smartphone size={10} color="#93959F" />
                                                    <Text style={styles.phoneText}>{driver.phone}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
                                            <Text style={[styles.statusText, { color: statusColor.text }]}>
                                                {status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.statsRow}>
                                        <View style={styles.statItem}>
                                            <Star size={14} color="#fbbf24" fill="#fbbf24" />
                                            <Text style={styles.statLabel}>{driver.rating?.toFixed(1) || '0.0'}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Activity size={14} color="#3498db" />
                                            <Text style={styles.statLabel}>{driver.totalOrders || 0} Del</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <MapPin size={14} color="#93959F" />
                                            <Text style={styles.statLabel}>{driver.city || 'Regional'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    {isLoading ? (
                                        <View style={styles.loadingRow}>
                                            <ActivityIndicator size="small" color="#FC8019" />
                                            <Text style={styles.loadingText}>Updating Partner...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.cardFooter}>
                                            <TouchableOpacity
                                                style={styles.viewDetailsBtn}
                                                onPress={() => viewDetails(driver)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Text style={styles.viewDetailsText}>VIEW DOSSIER</Text>
                                                <ChevronRight size={14} color="#93959F" />
                                            </TouchableOpacity>

                                            <View style={styles.actionGroup}>
                                                {/* Approve / Activate */}
                                                {status !== 'ACTIVE' && (
                                                    <TouchableOpacity
                                                        style={styles.approveBtn}
                                                        onPress={() => handleStatusChange(driver, 'ACTIVE')}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        <CheckCircle size={20} color="#16a34a" />
                                                    </TouchableOpacity>
                                                )}

                                                {/* Reject */}
                                                {(status === 'PENDING' || status === 'onboarding') && (
                                                    <TouchableOpacity
                                                        style={styles.rejectBtn}
                                                        onPress={() => handleStatusChange(driver, 'REJECTED')}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        <X size={20} color="#dc2626" />
                                                    </TouchableOpacity>
                                                )}

                                                {/* Suspend — show if ACTIVE */}
                                                {status === 'ACTIVE' && (
                                                    <TouchableOpacity
                                                        style={styles.suspendBtn}
                                                        onPress={() => handleStatusChange(driver, 'SUSPENDED')}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        <Ban size={20} color="#7c3aed" />
                                                    </TouchableOpacity>
                                                )}

                                                {/* Block — show if not already BLOCKED */}
                                                {status !== 'BLOCKED' && status !== 'REJECTED' && (
                                                    <TouchableOpacity
                                                        style={styles.blockBtn}
                                                        onPress={() => handleStatusChange(driver, 'BLOCKED')}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                    >
                                                        <AlertTriangle size={20} color="#dc2626" />
                                                    </TouchableOpacity>
                                                )}

                                                {/* Reset to Pending/Onboarding if rejected/suspended */}
                                                {(status === 'REJECTED' || status === 'SUSPENDED' || status === 'BLOCKED') && (
                                                    <TouchableOpacity
                                                        style={styles.pendingBtn}
                                                        onPress={() => handleStatusChange(driver, 'PENDING')}
                                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

                        {filteredDrivers.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Truck size={64} color="#E9E9EB" />
                                <Text style={styles.emptyTitle}>FLEET TERMINAL EMPTY</Text>
                                <Text style={styles.emptySubtitle}>
                                    {activeFilter === 'ALL'
                                        ? 'No delivery partners are currently registered'
                                        : `No partners found with status ${activeFilter}`
                                    }
                                </Text>
                            </View>
                        )}
                    </>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Driver Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={detailModalVisible}
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Driver Profile</Text>
                                <Text style={styles.modalSubtitle}>Dossier ID: {selectedDriver?._id?.substring(0, 10)}...</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setDetailModalVisible(false)}
                                style={styles.closeBtn}
                            >
                                <X size={24} color="#282C3F" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Personal Info */}
                            <View style={styles.modalSection}>
                                <Text style={styles.sectionHeader}>PERSONAL INFORMATION</Text>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>NAME</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.name || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>CITY</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.city || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>PHONE</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.phone || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>EMAIL</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.email || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Vehicle Info */}
                            <View style={styles.modalSection}>
                                <Text style={styles.sectionHeader}>VEHICLE DETAILS</Text>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>MODEL</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.vehicleModel || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>PLATE NUMBER</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.vehicleNumber || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>VEHICLE TYPE</Text>
                                    <Text style={styles.infoValue}>{selectedDriver?.vehicleType?.toUpperCase() || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Documents */}
                            <View style={styles.modalSection}>
                                <Text style={styles.sectionHeader}>KYC DOCUMENTS</Text>
                                <View style={styles.docGrid}>
                                    {selectedDriver?.documents?.drivingLicenseUrl ? (
                                        <View style={styles.docItem}>
                                            <Image source={{ uri: selectedDriver.documents.drivingLicenseUrl }} style={styles.docPreview} />
                                            <Text style={styles.docLabel}>Driving License</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.docEmpty}>
                                            <FileText size={24} color="#D4D5D9" />
                                            <Text style={styles.docLabel}>License Missing</Text>
                                        </View>
                                    )}
                                    {selectedDriver?.documents?.aadhaarFront ? (
                                        <View style={styles.docItem}>
                                            <Image source={{ uri: selectedDriver.documents.aadhaarFront }} style={styles.docPreview} />
                                            <Text style={styles.docLabel}>Aadhaar Front</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.docEmpty}>
                                            <FileText size={24} color="#D4D5D9" />
                                            <Text style={styles.docLabel}>Aadhaar Missing</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Bank Details */}
                            <View style={styles.modalSection}>
                                <Text style={styles.sectionHeader}>BANK INFORMATION</Text>
                                <View style={styles.infoBox}>
                                    <Text style={styles.infoLabel}>ACCOUNT NUMBER</Text>
                                    <Text style={styles.infoValue}>{selectedDriver?.bankDetails?.accountNumber || 'N/A'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>IFSC CODE</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.bankDetails?.ifscCode || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>BANK NAME</Text>
                                        <Text style={styles.infoValue}>{selectedDriver?.bankDetails?.bankName || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
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
    filterBar: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
        height: 60,
        flexGrow: 0,
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
        fontSize: 10,
        fontWeight: '900',
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
    driverCard: {
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
    driverLead: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    imageBox: {
        width: 55,
        height: 55,
        borderRadius: 18,
        backgroundColor: '#F9F9F9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    driverImage: {
        width: '100%',
        height: '100%',
    },
    nameSection: {
        marginLeft: 15,
        flex: 1,
    },
    driverName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#282C3F',
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    phoneText: {
        fontSize: 11,
        color: '#93959F',
        fontWeight: '700',
        marginLeft: 5,
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 18,
        backgroundColor: '#F9F9F9',
        padding: 12,
        borderRadius: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: '#282C3F',
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
        paddingVertical: 10,
        backgroundColor: '#fff7ed',
        borderRadius: 12,
    },
    loadingText: {
        fontSize: 12,
        color: '#FC8019',
        fontWeight: '800',
    },
    viewDetailsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 1.2,
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
        borderRadius: 13,
        backgroundColor: '#f5f3ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd6fe',
    },
    blockBtn: {
        width: 44,
        height: 44,
        borderRadius: 13,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    pendingBtn: {
        width: 44,
        height: 44,
        borderRadius: 13,
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
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: height * 0.85,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#282C3F',
    },
    modalSubtitle: {
        fontSize: 11,
        color: '#93959F',
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 4,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F2F2F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    docGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    docItem: {
        flex: 1,
    },
    docPreview: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        backgroundColor: '#F2F2F3',
        marginBottom: 8,
    },
    docLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#7E808C',
        textAlign: 'center',
    },
    docEmpty: {
        flex: 1,
        height: 120,
        borderRadius: 16,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#F2F2F3',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    }
});
