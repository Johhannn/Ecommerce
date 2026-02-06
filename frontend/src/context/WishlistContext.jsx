import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const isLoggedIn = () => {
        const token = localStorage.getItem('access_token');
        return token && token !== 'null' && token !== 'undefined';
    };

    useEffect(() => {
        if (isLoggedIn()) {
            fetchWishlistIds();
        }
    }, []);

    const fetchWishlistIds = async () => {
        if (!isLoggedIn()) return;

        try {
            const response = await api.get('shop/api/wishlist/product-ids/');
            setWishlistItems(new Set(response.data.product_ids));
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const addToWishlist = async (productId) => {
        if (!isLoggedIn()) {
            alert('Please login to add items to wishlist');
            return false;
        }

        setLoading(true);
        try {
            await api.post(`shop/api/wishlist/add/${productId}/`);
            setWishlistItems(prev => new Set([...prev, productId]));
            return true;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!isLoggedIn()) return false;

        setLoading(true);
        try {
            await api.delete(`shop/api/wishlist/remove/${productId}/`);
            setWishlistItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (productId) => {
        if (wishlistItems.has(productId)) {
            return await removeFromWishlist(productId);
        } else {
            return await addToWishlist(productId);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.has(productId);
    };

    const refreshWishlist = () => {
        if (isLoggedIn()) {
            fetchWishlistIds();
        } else {
            setWishlistItems(new Set());
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            wishlistCount: wishlistItems.size,
            loading,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist,
            refreshWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export default WishlistContext;
