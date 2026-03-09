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
    Modal,
    TextInput,
    Image,
    Switch,
    Alert,
    Platform
} from 'react-native';
import {
    Layout,
    Plus,
    Trash2,
    Edit2,
    Image as ImageIcon,
    ChevronRight,
    ExternalLink,
    X,
    Type,
    Link,
    Hash,
    Save,
    Check,
    MessageSquare,
    AlertCircle,
    Store
} from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';
import { useToast } from '../../src/context/ToastContext';

const { width } = Dimensions.get('window');

export default function BannersScreen() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showToast } = useToast();
    const [view, setView] = useState('active'); // 'active' | 'requests'
    const [requests, setRequests] = useState([]);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        linkType: 'None',
        linkId: '',
        isActive: true,
        priority: 0
    });

    const fetchBanners = async () => {
        try {
            const { data } = await adminAPI.getBanners();
            setBanners(data);
        } catch (error) {
            console.error("Failed to fetch banners:", error);
            showToast("Failed to load banners", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const { data } = await adminAPI.getBannerRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch banner requests:", error);
            showToast("Failed to load requests", "error");
        }
    };

    useEffect(() => {
        if (view === 'active') fetchBanners();
        else fetchRequests();
    }, [view]);

    const onRefresh = () => {
        setRefreshing(true);
        if (view === 'active') fetchBanners();
        else fetchRequests();
    };

    const handleOpenModal = (banner = null) => {
        if (banner) {
            setEditingBanner(banner);
            setFormData({
                title: banner.title,
                description: banner.description || '',
                image: banner.image,
                linkType: banner.linkType || 'None',
                linkId: banner.linkId || '',
                isActive: banner.isActive,
                priority: banner.priority || 0
            });
        } else {
            setEditingBanner(null);
            setFormData({
                title: '',
                description: '',
                image: '',
                linkType: 'None',
                linkId: '',
                isActive: true,
                priority: 0
            });
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.image) {
            showToast("Title and Image URL are required", "warning");
            return;
        }

        setFormLoading(true);
        try {
            if (editingBanner) {
                await adminAPI.updateBanner(editingBanner._id, formData);
                showToast("Banner updated successfully");
            } else {
                await adminAPI.createBanner(formData);
                showToast("Banner created successfully");
            }
            setModalVisible(false);
            fetchBanners();
        } catch (error) {
            showToast(error.response?.data?.message || "Operation failed", "error");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Banner",
            "Are you sure you want to delete this banner?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await adminAPI.deleteBanner(id);
                            showToast("Banner deleted successfully");
                            fetchBanners();
                        } catch (error) {
                            showToast(error.response?.data?.message || "Failed to delete banner", "error");
                        }
                    }
                }
            ]
        );
    };

    const handleApprove = async (id) => {
        Alert.alert(
            "Approve Request",
            "Are you sure you want to approve this banner? It will be immediately visible to customers.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        try {
                            await adminAPI.updateBannerRequestStatus(id, { status: 'approved' });
                            showToast("Banner approved!");
                            fetchRequests();
                        } catch (error) {
                            showToast("Failed to approve request", "error");
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (id) => {
        // Simple prompt for rejection reason
        // In a real app, this would be a modal with a text input
        Alert.prompt(
            "Reject Request",
            "Enter reason for rejection:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async (reason) => {
                        try {
                            await adminAPI.updateBannerRequestStatus(id, {
                                status: 'rejected',
                                rejectionReason: reason || "Does not meet quality standards"
                            });
                            showToast("Banner rejected");
                            fetchRequests();
                        } catch (error) {
                            showToast("Failed to reject request", "error");
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <View style={styles.headerMain}>
                    <View style={styles.titleRow}>
                        <View>
                            <Text style={styles.headerTitle}>Promotions</Text>
                            <Text style={styles.headerSubtitle}>Manage your app banners</Text>
                        </View>
                        {view === 'active' && (
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => handleOpenModal()}
                                activeOpacity={0.8}
                            >
                                <Plus size={16} color="#fff" strokeWidth={3} />
                                <Text style={styles.addBtnText}>NEW BANNER</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, view === 'active' && styles.tabActive]}
                            onPress={() => setView('active')}
                        >
                            <Text style={[styles.tabText, view === 'active' && styles.tabTextActive]}>ACTIVE BANNERS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, view === 'requests' && styles.tabActive]}
                            onPress={() => setView('requests')}
                        >
                            <Text style={[styles.tabText, view === 'requests' && styles.tabTextActive]}>PARTNER REQUESTS</Text>
                            {requests.filter(r => r.status === 'pending').length > 0 && (
                                <View style={styles.tabBadge}>
                                    <Text style={styles.tabBadgeText}>{requests.filter(r => r.status === 'pending').length}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FC8019" />}
            >
                {loading && !refreshing ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#FC8019" />
                    </View>
                ) : (
                    <>
                        {view === 'active' ? (
                            <>
                                {banners.map((banner) => (
                                    <View key={banner._id} style={styles.bannerCard}>
                                        <Image source={{ uri: banner.image }} style={styles.bannerImage} />
                                        <View style={styles.bannerInfo}>
                                            <View style={styles.infoRow}>
                                                <View style={styles.textStack}>
                                                    <Text style={styles.bannerTitleText}>{banner.title}</Text>
                                                    <Text style={styles.bannerDescText} numberOfLines={1}>{banner.description || 'No description provided'}</Text>
                                                </View>
                                                <View style={[styles.statusBadge, { backgroundColor: banner.isActive ? '#E6F7ED' : '#FEEAEB' }]}>
                                                    <Text style={[styles.statusText, { color: banner.isActive ? '#25bb64' : '#FF5252' }]}>
                                                        {banner.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.divider} />

                                            <View style={styles.performanceRow}>
                                                <View style={styles.perfItem}>
                                                    <Text style={styles.perfLabel}>VIEWS</Text>
                                                    <Text style={styles.perfValue}>{banner.views || 0}</Text>
                                                </View>
                                                <View style={styles.perfItem}>
                                                    <Text style={styles.perfLabel}>CLICKS</Text>
                                                    <Text style={styles.perfValue}>{banner.clicks || 0}</Text>
                                                </View>
                                                <View style={styles.perfItem}>
                                                    <Text style={styles.perfLabel}>CTR</Text>
                                                    <Text style={[styles.perfValue, { color: '#FC8019' }]}>
                                                        {banner.views ? ((banner.clicks / banner.views) * 100).toFixed(1) : '0.0'}%
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.divider} />

                                            <View style={styles.footerRow}>
                                                <View style={styles.linkInfo}>
                                                    <Link size={14} color="#93959F" />
                                                    <Text style={styles.linkText}>{banner.linkType}: {banner.linkId || 'None'}</Text>
                                                </View>
                                                <View style={styles.actions}>
                                                    <TouchableOpacity
                                                        style={styles.actionBtn}
                                                        onPress={() => handleOpenModal(banner)}
                                                    >
                                                        <Edit2 size={18} color="#007AFF" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={[styles.actionBtn, { marginLeft: 15 }]}
                                                        onPress={() => handleDelete(banner._id)}
                                                    >
                                                        <Trash2 size={18} color="#FF5252" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}

                                {banners.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <ImageIcon size={64} color="#E9E9EB" />
                                        <Text style={styles.emptyTitle}>NO BANNERS CONFIGURED</Text>
                                        <Text style={styles.emptySubtitle}>Start by creating your first promotional asset</Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <>
                                {requests.map((request) => (
                                    <View key={request._id} style={styles.bannerCard}>
                                        <Image source={{ uri: request.image }} style={styles.bannerImage} />

                                        {/* Discount Badge Overlay */}
                                        {request.discountType && request.discountType !== 'none' && (
                                            <View style={styles.discountOverlay}>
                                                <Text style={styles.discountOverlayText}>
                                                    {request.discountType === 'percentage' ? `${request.discountValue}% OFF` :
                                                        request.discountType === 'flat' ? `₹${request.discountValue} OFF` : 'FREE ITEM'}
                                                </Text>
                                            </View>
                                        )}

                                        <View style={styles.bannerInfo}>
                                            <View style={styles.infoRow}>
                                                <View style={styles.textStack}>
                                                    <Text style={styles.bannerTitleText}>{request.title}</Text>
                                                    <View style={styles.storeTag}>
                                                        <Store size={12} color="#93959F" />
                                                        <Text style={styles.storeText}>{request.restaurantId?.name || 'Unknown Partner'}</Text>
                                                    </View>
                                                </View>
                                                <View style={[styles.statusBadge, {
                                                    backgroundColor: request.status === 'approved' ? '#E6F7ED' : request.status === 'rejected' ? '#FEEAEB' : '#FFF3E0'
                                                }]}>
                                                    <Text style={[styles.statusText, {
                                                        color: request.status === 'approved' ? '#25bb64' : request.status === 'rejected' ? '#FF5252' : '#FF9800'
                                                    }]}>
                                                        {request.status.toUpperCase()}
                                                    </Text>
                                                </View>
                                            </View>

                                            {request.description && (
                                                <Text style={styles.requestDescText}>{request.description}</Text>
                                            )}

                                            {/* Discount Details Panel */}
                                            {request.discountType && request.discountType !== 'none' && (
                                                <View style={styles.discountPanel}>
                                                    <Text style={styles.discountPanelTitle}>DISCOUNT DETAILS</Text>
                                                    <View style={styles.discountRow}>
                                                        <Text style={styles.discountKey}>Type</Text>
                                                        <Text style={styles.discountVal}>
                                                            {request.discountType === 'percentage' ? 'Percentage Off' :
                                                                request.discountType === 'flat' ? 'Flat Amount Off' : 'Free Item'}
                                                        </Text>
                                                    </View>
                                                    {request.discountType !== 'free_item' && (
                                                        <View style={styles.discountRow}>
                                                            <Text style={styles.discountKey}>Value</Text>
                                                            <Text style={[styles.discountVal, { color: '#FC8019', fontWeight: '900' }]}>
                                                                {request.discountType === 'percentage' ? `${request.discountValue}%` : `₹${request.discountValue}`}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <View style={styles.discountRow}>
                                                        <Text style={styles.discountKey}>On</Text>
                                                        <Text style={styles.discountVal}>{request.discountOn || 'All Items'}</Text>
                                                    </View>
                                                    {request.minOrderAmount > 0 && (
                                                        <View style={styles.discountRow}>
                                                            <Text style={styles.discountKey}>Min Order</Text>
                                                            <Text style={styles.discountVal}>₹{request.minOrderAmount}</Text>
                                                        </View>
                                                    )}
                                                    {request.validUntil && (
                                                        <View style={styles.discountRow}>
                                                            <Text style={styles.discountKey}>Valid Until</Text>
                                                            <Text style={styles.discountVal}>{new Date(request.validUntil).toLocaleDateString()}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            {/* Promotion Details Panel */}
                                            <View style={[styles.discountPanel, { backgroundColor: '#F0F4F8', borderColor: '#D1D9E0' }]}>
                                                <Text style={[styles.discountPanelTitle, { color: '#444' }]}>PROMOTION DETAILS</Text>
                                                <View style={styles.discountRow}>
                                                    <Text style={styles.discountKey}>Tier</Text>
                                                    <View style={[styles.tierBadge, {
                                                        backgroundColor: request.promotionTier === 'elite' ? '#7B1FA2' :
                                                            request.promotionTier === 'pro' ? '#FC8019' : '#888'
                                                    }]}>
                                                        <Text style={styles.tierBadgeText}>{request.promotionTier?.toUpperCase() || 'BASIC'}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.discountRow}>
                                                    <Text style={styles.discountKey}>Payment</Text>
                                                    <Text style={[styles.discountVal, {
                                                        color: request.paymentStatus === 'completed' ? '#25bb64' : '#FF9800'
                                                    }]}>
                                                        {request.paymentStatus === 'completed' ? `PAID (${request.paymentMethod?.toUpperCase() || 'UPI'})` : 'PENDING'}
                                                    </Text>
                                                </View>
                                                <View style={styles.discountRow}>
                                                    <Text style={styles.discountKey}>Duration</Text>
                                                    <Text style={styles.discountVal}>{request.durationDays || 3} Days</Text>
                                                </View>
                                            </View>

                                            {request.status === 'rejected' && (
                                                <View style={styles.rejectionBox}>
                                                    <AlertCircle size={14} color="#FF5252" />
                                                    <Text style={styles.rejectionText}>Reason: {request.rejectionReason}</Text>
                                                </View>
                                            )}

                                            <View style={styles.divider} />

                                            <View style={styles.footerRow}>
                                                <View style={styles.linkInfo}>
                                                    <Link size={14} color="#93959F" />
                                                    <Text style={styles.linkText}>Link: {request.linkType}</Text>
                                                </View>

                                                {request.status === 'pending' && (
                                                    <View style={styles.actions}>
                                                        <TouchableOpacity
                                                            style={[styles.actionBtnCircle, { backgroundColor: '#E6F7ED' }]}
                                                            onPress={() => handleApprove(request._id)}
                                                        >
                                                            <Check size={20} color="#25bb64" />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={[styles.actionBtnCircle, { backgroundColor: '#FEEAEB', marginLeft: 12 }]}
                                                            onPress={() => handleReject(request._id)}
                                                        >
                                                            <X size={20} color="#FF5252" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                ))}

                                {requests.length === 0 && (
                                    <View style={styles.emptyContainer}>
                                        <MessageSquare size={64} color="#E9E9EB" />
                                        <Text style={styles.emptyTitle}>NO PENDING REQUESTS</Text>
                                        <Text style={styles.emptySubtitle}>All partner banner requests have been processed</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <X size={24} color="#282C3F" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>BANNER TITLE</Text>
                                <View style={styles.inputContainer}>
                                    <Type size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter headline (e.g., Summer Special)"
                                        value={formData.title}
                                        onChangeText={(t) => setFormData({ ...formData, title: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>DESCRIPTION (OPTIONAL)</Text>
                                <View style={styles.inputContainer}>
                                    <Layout size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Short description of the offer"
                                        value={formData.description}
                                        onChangeText={(t) => setFormData({ ...formData, description: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>IMAGE URL</Text>
                                <View style={styles.inputContainer}>
                                    <ImageIcon size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Paste image URL here"
                                        value={formData.image}
                                        onChangeText={(t) => setFormData({ ...formData, image: t })}
                                    />
                                </View>
                                {formData.image ? (
                                    <Image source={{ uri: formData.image }} style={styles.previewImage} />
                                ) : null}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>LINK TYPE</Text>
                                <View style={styles.typeSelector}>
                                    {['None', 'Restaurant', 'Category', 'Web'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeChip,
                                                formData.linkType === type && styles.typeChipActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, linkType: type })}
                                        >
                                            <Text style={[
                                                styles.typeChipText,
                                                formData.linkType === type && styles.typeChipTextActive
                                            ]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={[styles.formGroup]}>
                                <Text style={styles.inputLabel}>PRIORITY</Text>
                                <View style={styles.inputContainer}>
                                    <Hash size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Sort order (e.g., 10)"
                                        keyboardType="numeric"
                                        value={formData.priority.toString()}
                                        onChangeText={(t) => setFormData({ ...formData, priority: parseInt(t) || 0 })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>LINK ID / URL</Text>
                                <View style={styles.inputContainer}>
                                    <Link size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Restaurant ID or Web URL"
                                        value={formData.linkId}
                                        onChangeText={(t) => setFormData({ ...formData, linkId: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.toggleRow}>
                                <View>
                                    <Text style={styles.toggleTitle}>Visible to Customers</Text>
                                    <Text style={styles.toggleSubtitle}>Show this banner in the app carousel</Text>
                                </View>
                                <Switch
                                    value={formData.isActive}
                                    onValueChange={(v) => setFormData({ ...formData, isActive: v })}
                                    trackColor={{ false: "#D4D5D9", true: "#FC8019" }}
                                    thumbColor={formData.isActive ? "#fff" : "#f4f3f4"}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleSave}
                                disabled={formLoading}
                            >
                                {formLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Save size={20} color="#fff" strokeWidth={3} />
                                        <Text style={styles.saveBtnText}>{editingBanner ? 'UPDATE PROMOTION' : 'LAUNCH PROMOTION'}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
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
    headerBox: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'web' ? 24 : 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f1',
    },
    headerMain: {
        width: '100%',
        maxWidth: 1200,
        alignSelf: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#282C3F',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        marginTop: 12,
        backgroundColor: '#F7F7F7',
        padding: 4,
        borderRadius: 10,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 0.5,
    },
    tabTextActive: {
        color: '#FC8019',
    },
    tabBadge: {
        backgroundColor: '#FF5252',
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
        paddingHorizontal: 4,
    },
    tabBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '900',
    },
    addBtn: {
        backgroundColor: '#FC8019',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#FC8019',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 12,
        marginLeft: 8,
        letterSpacing: 0.5,
    },
    scrollContent: {
        padding: 20,
    },
    centerBox: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f0f0f1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    },
    bannerImage: {
        width: '100%',
        height: Platform.OS === 'web' ? 400 : 200,
        backgroundColor: '#f1f5f9',
        resizeMode: 'cover',
    },
    bannerInfo: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    textStack: {
        flex: 1,
        marginRight: 10,
    },
    bannerTitleText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#282C3F',
    },
    bannerDescText: {
        fontSize: 13,
        color: '#7e808c',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f1',
        marginVertical: 12,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    linkInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    linkText: {
        fontSize: 10,
        color: '#93959F',
        fontWeight: '700',
        marginLeft: 6,
    },
    performanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    perfItem: {
        alignItems: 'center',
        flex: 1,
    },
    perfLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: '#93959F',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    perfValue: {
        fontSize: 16,
        fontWeight: '900',
        color: '#282C3F',
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
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
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        height: '85%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#282C3F',
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F7F7F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#93959F',
        marginBottom: 8,
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#f0f0f1',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 14,
        fontWeight: '700',
        color: '#282C3F',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    previewImage: {
        width: '100%',
        height: Platform.OS === 'web' ? 400 : 200,
        borderRadius: 12,
        marginTop: 12,
        backgroundColor: '#f1f5f9',
        resizeMode: 'cover',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    toggleTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#282C3F',
    },
    toggleSubtitle: {
        fontSize: 11,
        color: '#93959F',
        fontWeight: '600',
        marginTop: 2,
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#f0f0f1',
    },
    typeChipActive: {
        backgroundColor: '#FC8019',
        borderColor: '#FC8019',
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7e808c',
    },
    typeChipTextActive: {
        color: '#fff',
    },
    saveBtn: {
        backgroundColor: '#FC8019',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 10,
        letterSpacing: 1,
    },
    // New styles for requests
    storeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    storeText: {
        fontSize: 11,
        color: '#93959F',
        fontWeight: '700',
        marginLeft: 4,
    },
    requestDescText: {
        fontSize: 13,
        color: '#7e808c',
        marginTop: 8,
        lineHeight: 18,
    },
    rejectionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEEAEB',
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
    },
    rejectionText: {
        fontSize: 11,
        color: '#FF5252',
        fontWeight: '700',
        marginLeft: 8,
        flex: 1,
    },
    actionBtnCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Discount styles
    discountOverlay: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#FC8019',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        zIndex: 1,
    },
    discountOverlayText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    discountPanel: {
        backgroundColor: '#FFF8F3',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#FFE0C3',
    },
    discountPanelTitle: {
        fontSize: 9,
        fontWeight: '900',
        color: '#FC8019',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    discountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    discountKey: {
        fontSize: 12,
        color: '#93959F',
        fontWeight: '600',
    },
    discountVal: {
        fontSize: 12,
        color: '#282C3F',
        fontWeight: '700',
    },
    tierBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    tierBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
});
