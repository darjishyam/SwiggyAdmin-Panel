import { io } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.1.6:5000';

class SocketService {
    socket = null;

    initialize() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Socket Server');
            this.joinAdminRoom();
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from Socket Server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket Connection Error:', error);
        });
    }

    joinAdminRoom() {
        if (this.socket) {
            this.socket.emit('joinAdminRoom');
        }
    }

    onNewOrder(callback) {
        if (!this.socket) return;
        this.socket.on('adminNewOrder', callback);
    }

    onOrderUpdate(callback) {
        if (!this.socket) return;
        this.socket.on('adminOrderUpdate', callback);
    }

    onDriverLocationUpdate(callback) {
        if (!this.socket) return;
        this.socket.on('driverLocationUpdated', callback);
    }

    removeListeners() {
        if (!this.socket) return;
        this.socket.off('adminNewOrder');
        this.socket.off('adminOrderUpdate');
        this.socket.off('driverLocationUpdated');
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
