import { Drawer } from 'expo-router/drawer';
import { Home, Users, Truck, Store, ShoppingBag, Layout, TrendingUp, Tag, Menu, Layers } from 'lucide-react-native';
import { View, Platform, StyleSheet, Text } from 'react-native';

export default function TabLayout() {
    return (
        <Drawer screenOptions={{
            drawerActiveTintColor: '#FC8019',
            drawerInactiveTintColor: '#93959F',
            drawerLabelStyle: styles.drawerLabel,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTintColor: '#282C3F',
            headerTitleAlign: 'center',
            drawerType: 'front',
        }}>
            <Drawer.Screen
                name="index"
                options={{
                    title: 'Pulse',
                    drawerLabel: 'Pulse',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Home size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="categories"
                options={{
                    title: 'Inventory',
                    drawerLabel: 'Categories',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Layers size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="banners"
                options={{
                    title: 'Promotions',
                    drawerLabel: 'Promotions',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Layout size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="users"
                options={{
                    title: 'Users',
                    drawerLabel: 'Users',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Users size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="drivers"
                options={{
                    title: 'Logistics',
                    drawerLabel: 'Fleet',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Truck size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="restaurants"
                options={{
                    title: 'Partners',
                    drawerLabel: 'Restaurants',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Store size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="orders"
                options={{
                    title: 'Transactions',
                    drawerLabel: 'Live Traffic',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <ShoppingBag size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="revenue"
                options={{
                    title: 'Revenue',
                    drawerLabel: 'Revenue',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <TrendingUp size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Drawer.Screen
                name="coupons"
                options={{
                    title: 'Coupons',
                    drawerLabel: 'Coupons',
                    drawerIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Tag size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawerLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: -10, // Pulls the label tighter to the icon
    },
    header: {
        backgroundColor: '#FFFFFF',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F3',
        height: 100,
    },
    headerTitle: {
        color: '#282C3F',
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    iconContainer: {
        padding: 8,
        borderRadius: 12,
    },
    iconContainerActive: {
        backgroundColor: 'rgba(252, 128, 25, 0.08)',
    }
});
