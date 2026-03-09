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
    Alert,
    Platform
} from 'react-native';
import {
    Layers,
    Plus,
    Trash2,
    Edit2,
    Image as ImageIcon,
    X,
    Type,
    Save,
    Tag,
    Info
} from 'lucide-react-native';
import { categoryAPI } from '../../src/services/api';
import { useToast } from '../../src/context/ToastContext';

const { width } = Dimensions.get('window');

export default function CategoriesScreen() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showToast } = useToast();

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        type: 'Food',
        description: ''
    });

    const fetchCategories = async () => {
        try {
            const { data } = await categoryAPI.getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            showToast("Failed to load categories", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCategories();
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                image: category.image,
                type: category.type || 'Food',
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                image: '',
                type: 'Food',
                description: ''
            });
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.image) {
            showToast("Name and Image URL are required", "warning");
            return;
        }

        setFormLoading(true);
        try {
            if (editingCategory) {
                await categoryAPI.updateCategory(editingCategory._id, formData);
                showToast("Category updated successfully");
            } else {
                await categoryAPI.createCategory(formData);
                showToast("Category created successfully");
            }
            setModalVisible(false);
            fetchCategories();
        } catch (error) {
            showToast(error.response?.data?.message || "Operation failed", "error");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        Alert.alert(
            "Delete Category",
            "Are you sure you want to delete this category?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await categoryAPI.deleteCategory(id);
                            showToast("Category deleted successfully");
                            fetchCategories();
                        } catch (error) {
                            showToast(error.response?.data?.message || "Failed to delete category", "error");
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
                            <Text style={styles.headerTitle}>Categories</Text>
                            <Text style={styles.headerSubtitle}>Manage menu & grocery categories</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => handleOpenModal()}
                            activeOpacity={0.8}
                        >
                            <Plus size={16} color="#fff" strokeWidth={3} />
                            <Text style={styles.addBtnText}>NEW CATEGORY</Text>
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
                    <View style={styles.grid}>
                        {categories.map((category) => (
                            <View key={category._id} style={styles.card}>
                                <Image source={{ uri: category.image }} style={styles.cardImage} />
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{category.name}</Text>
                                        <View style={[styles.typeBadge, { backgroundColor: category.type === 'Grocery' ? '#EBF8FF' : '#FFF5F5' }]}>
                                            <Text style={[styles.typeText, { color: category.type === 'Grocery' ? '#3182CE' : '#E53E3E' }]}>
                                                {category.type.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => handleOpenModal(category)}
                                        >
                                            <Edit2 size={18} color="#007AFF" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { marginLeft: 15 }]}
                                            onPress={() => handleDelete(category._id)}
                                        >
                                            <Trash2 size={18} color="#FF5252" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {categories.length === 0 && !loading && (
                    <View style={styles.emptyContainer}>
                        <Layers size={64} color="#E9E9EB" />
                        <Text style={styles.emptyTitle}>NO CATEGORIES FOUND</Text>
                        <Text style={styles.emptySubtitle}>Create your first category to get started</Text>
                    </View>
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
                            <Text style={styles.modalTitle}>{editingCategory ? 'Edit Category' : 'Create Category'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <X size={24} color="#282C3F" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.formScroll}>
                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>CATEGORY NAME</Text>
                                <View style={styles.inputContainer}>
                                    <Type size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Pizza, Biryani, Munchies"
                                        value={formData.name}
                                        onChangeText={(t) => setFormData({ ...formData, name: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>TYPE</Text>
                                <View style={styles.typeSelector}>
                                    {['Food', 'Grocery', 'Other'].map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.typeChip,
                                                formData.type === type && styles.typeChipActive
                                            ]}
                                            onPress={() => setFormData({ ...formData, type: type })}
                                        >
                                            <Text style={[
                                                styles.typeChipText,
                                                formData.type === type && styles.typeChipTextActive
                                            ]}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>IMAGE URL</Text>
                                <View style={styles.inputContainer}>
                                    <ImageIcon size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="URL of the category icon/image"
                                        value={formData.image}
                                        onChangeText={(t) => setFormData({ ...formData, image: t })}
                                    />
                                </View>
                                {formData.image ? (
                                    <Image source={{ uri: formData.image }} style={styles.previewImage} />
                                ) : null}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.inputLabel}>DESCRIPTION (OPTIONAL)</Text>
                                <View style={styles.inputContainer}>
                                    <Info size={18} color="#93959F" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Short description"
                                        value={formData.description}
                                        onChangeText={(t) => setFormData({ ...formData, description: t })}
                                    />
                                </View>
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
                                        <Text style={styles.saveBtnText}>{editingCategory ? 'UPDATE CATEGORY' : 'CREATE CATEGORY'}</Text>
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
        width: '100%',
        maxWidth: 1200,
        alignSelf: 'center',
    },
    centerBox: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: width > 900 ? (1200 - 80) / 4 : (width > 600 ? (width - 60) / 2 : (width - 40)),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    cardImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#f1f5f9',
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#282C3F',
        flex: 1,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f1',
        paddingTop: 12,
    },
    actionBtn: {
        padding: 4,
    },
    emptyContainer: {
        height: 400,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#282C3F',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#93959F',
        marginTop: 8,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: Platform.OS === 'web' ? 500 : '90%',
        maxHeight: '90%',
        borderRadius: 30,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#282C3F',
    },
    closeBtn: {
        padding: 4,
    },
    formScroll: {
        padding: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#7E808C',
        letterSpacing: 1,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 14,
        color: '#282C3F',
        fontWeight: '600',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#F2F2F3',
    },
    typeChipActive: {
        backgroundColor: '#FC801910',
        borderColor: '#FC8019',
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7E808C',
    },
    typeChipTextActive: {
        color: '#FC8019',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 16,
        marginTop: 12,
        backgroundColor: '#F9F9F9',
    },
    saveBtn: {
        backgroundColor: '#FC8019',
        height: 56,
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FC8019',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
        marginTop: 10,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 12,
        letterSpacing: 1,
    },
});
