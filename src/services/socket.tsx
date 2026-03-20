import { io } from 'socket.io-client';
import { BASE_URL } from './api';

const SOCKET_URL = BASE_URL;

class SocketService {
    socket = null;

    initialize() {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        this.socket.on('connect', () => {
            
            this.joinAdminRoom();
        });

        this.socket.on('disconnect', () => {
            
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
