import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState({});
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Check if user is authenticated
    const isAuthenticated = () => {
        const token = localStorage.getItem('access_token');
        return token && token !== 'null' && token !== 'undefined';
    };

    // Fetch cart data
    const fetchCart = async () => {
        if (!isAuthenticated()) {
            setCartItems({});
            setItemCount(0);
            setLoading(false);
            return;
        }
        try {
            const response = await api.get('cart/api/');
            const items = {};
            let count = 0;
            if (response.data.items) {
                response.data.items.forEach(item => {
                    items[item.product.id] = item.quantity;
                    count += item.quantity;
                });
            }
            setCartItems(items);
            setItemCount(count);
        } catch (error) {
            console.error("Error fetching cart", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Add item to cart
    const addToCart = async (productId) => {
        // Check if user is logged in
        if (!isAuthenticated()) {
            setShowLoginModal(true);
            return { success: false, requiresLogin: true };
        }

        try {
            await api.post(`cart/api/add/${productId}/`);
            setCartItems(prev => ({
                ...prev,
                [productId]: (prev[productId] || 0) + 1
            }));
            setItemCount(prev => prev + 1);
            return { success: true };
        } catch (error) {
            console.error("Error adding to cart", error);
            return { success: false, error: error.message };
        }
    };

    // Remove item from cart (decrease quantity)
    const removeFromCart = async (productId) => {
        if (!isAuthenticated()) {
            setShowLoginModal(true);
            return { success: false, requiresLogin: true };
        }

        try {
            await api.post(`cart/api/remove/${productId}/`);
            setCartItems(prev => {
                const newQuantity = (prev[productId] || 0) - 1;
                if (newQuantity <= 0) {
                    const { [productId]: _, ...rest } = prev;
                    return rest;
                }
                return { ...prev, [productId]: newQuantity };
            });
            setItemCount(prev => Math.max(0, prev - 1));
            return { success: true };
        } catch (error) {
            console.error("Error removing from cart", error);
            return { success: false, error: error.message };
        }
    };

    // Fully remove item from cart
    const fullRemoveFromCart = async (productId) => {
        if (!isAuthenticated()) {
            setShowLoginModal(true);
            return { success: false, requiresLogin: true };
        }

        try {
            const quantity = cartItems[productId] || 0;
            await api.delete(`cart/api/full_remove/${productId}/`);
            setCartItems(prev => {
                const { [productId]: _, ...rest } = prev;
                return rest;
            });
            setItemCount(prev => Math.max(0, prev - quantity));
            return { success: true };
        } catch (error) {
            console.error("Error fully removing from cart", error);
            return { success: false, error: error.message };
        }
    };

    // Close login modal
    const closeLoginModal = () => {
        setShowLoginModal(false);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            itemCount,
            loading,
            addToCart,
            removeFromCart,
            fullRemoveFromCart,
            fetchCart,
            isAuthenticated,
            showLoginModal,
            closeLoginModal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
