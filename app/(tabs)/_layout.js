import { Tabs } from 'expo-router';
import { Home, Users, Truck, Store, ShoppingBag } from 'lucide-react-native';
import { View, Platform, StyleSheet, Text } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#FC8019',
            tabBarInactiveTintColor: '#93959F',
            tabBarLabelStyle: styles.tabBarLabel,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            headerTintColor: '#282C3F',
            headerTitleAlign: 'center',
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Pulse',
                    tabBarLabel: 'PULSE',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Home size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: 'Users',
                    tabBarLabel: 'USERS',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Users size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="drivers"
                options={{
                    title: 'Logistics',
                    tabBarLabel: 'FLEET',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Truck size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="restaurants"
                options={{
                    title: 'Partners',
                    tabBarLabel: 'PARTNERS',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <Store size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Transactions',
                    tabBarLabel: 'LIVE',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                            <ShoppingBag size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F3',
        height: Platform.OS === 'ios' ? 95 : 75,
        paddingBottom: Platform.OS === 'ios' ? 35 : 15,
        paddingTop: 12,
        position: 'absolute',
        elevation: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
    },
    tabBarLabel: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 4,
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
