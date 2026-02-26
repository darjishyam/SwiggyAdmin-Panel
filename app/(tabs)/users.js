import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    TextInput,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { Search, Ban, CheckCircle, MoreVertical, User, Mail, Smartphone, Calendar } from 'lucide-react-native';
import { adminAPI } from '../../src/services/api';
import { useToast } from '../../src/context/ToastContext';

const { width } = Dimensions.get('window');

export default function UsersScreen() {
    const { showToast, showConfirm } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await adminAPI.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (user) => {
        const isSuspended = user.status === 'SUSPENDED';
        const action = isSuspended ? 'RE-ACTIVATE' : 'SUSPEND';

        const performToggle = async () => {
            try {
                const { data } = await adminAPI.updateUserStatus(user._id);
                setUsers(prev => prev.map(u => u._id === user._id ? data : u));
                showToast('success', `User ${user.name} ${isSuspended ? 'activated' : 'suspended'} successfully`);
            } catch (error) {
                const errorMsg = error?.response?.data?.message || error.message || 'Failed to update user';
                console.error("Failed to toggle status:", errorMsg);
                showToast('error', errorMsg);
            }
        };

        showConfirm(
            `${isSuspended ? '✅' : '⚠️'} Confirm Action`,
            `Are you sure you want to ${action.toLowerCase()} user "${user.name || 'this user'}"?`,
            performToggle,
            isSuspended ? 'info' : 'danger'
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Search size={20} color="#93959F" />
                    <TextInput
                        placeholder="Search users by name, email or phone..."
                        placeholderTextColor="#93959F"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
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
                        {filteredUsers.map((user) => (
                            <View key={user._id} style={styles.userCard}>
                                <View style={styles.cardTop}>
                                    <View style={styles.avatarContainer}>
                                        <View style={styles.avatar}>
                                            <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text>
                                        </View>
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>{user.name}</Text>
                                            <View style={styles.statusBadge}>
                                                <View style={[styles.statusDot, { backgroundColor: user.status === 'SUSPENDED' ? '#FF5252' : '#4ade80' }]} />
                                                <Text style={[styles.statusText, { color: user.status === 'SUSPENDED' ? '#FF5252' : '#4ade80' }]}>
                                                    {user.status || 'ACTIVE'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.moreBtn}>
                                        <MoreVertical size={20} color="#93959F" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailsGrid}>
                                    <View style={styles.detailItem}>
                                        <Mail size={14} color="#93959F" />
                                        <Text style={styles.detailText} numberOfLines={1}>{user.email || 'No email'}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Smartphone size={14} color="#93959F" />
                                        <Text style={styles.detailText}>{user.phone || 'No phone'}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.joinDate}>
                                        <Calendar size={12} color="#D4D5D9" />
                                        <Text style={styles.joinText}>Joined {new Date(user.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, user.status === 'SUSPENDED' && styles.actionBtnActive]}
                                            onPress={() => handleToggleStatus(user)}
                                        >
                                            {user.status === 'SUSPENDED' ? (
                                                <CheckCircle size={18} color="#4ade80" />
                                            ) : (
                                                <Ban size={18} color="#FF5252" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}

                        {filteredUsers.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <User size={64} color="#E9E9EB" />
                                <Text style={styles.emptyTitle}>NO USERS FOUND</Text>
                                <Text style={styles.emptySubtitle}>Try adjusting your search criteria</Text>
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
    header: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderWidth: 1.5,
        borderColor: '#E9E9EB',
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 60,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        color: '#282C3F',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
    },
    centerBox: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userCard: {
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
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(252, 128, 25, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(252, 128, 25, 0.2)',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FC8019',
    },
    userInfo: {
        marginLeft: 15,
    },
    userName: {
        fontSize: 16,
        fontWeight: '900',
        color: '#282C3F',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#4ade80',
        marginRight: 6,
    },
    statusText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#4ade80',
        letterSpacing: 0.5,
    },
    moreBtn: {
        padding: 5,
    },
    divider: {
        height: 1,
        backgroundColor: '#F2F2F3',
        marginVertical: 15,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 12,
        color: '#7E808C',
        fontWeight: '600',
        marginLeft: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    joinDate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    joinText: {
        fontSize: 10,
        color: '#93959F',
        fontWeight: '700',
        marginLeft: 6,
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFF5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFEAEA',
    },
    actionBtnActive: {
        backgroundColor: '#F0FDF4',
        borderColor: '#DCFCE7',
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
    }
});
