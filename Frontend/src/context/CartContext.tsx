import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem, CartItem } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: MenuItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    totalAmount: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ NEW: LocalStorage key
const CART_STORAGE_KEY = 'canteen_cart';

// ✅ NEW: Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            return JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
    }
    return [];
};

// ✅ NEW: Save cart to localStorage
const saveCartToStorage = (cartItems: CartItem[]) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    // ✅ UPDATED: Initialize from localStorage
    const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage);

    // ✅ NEW: Save to localStorage whenever cart changes
    useEffect(() => {
        saveCartToStorage(cartItems);
    }, [cartItems]);

    // Add item to cart
    const addToCart = (item: MenuItem) => {
        setCartItems((prev) => {
            const existingItem = prev.find(
                (ci) => String(ci.menuItem.id) === String(item.id)
            );

            if (existingItem) {
                return prev.map((ci) =>
                    String(ci.menuItem.id) === String(item.id)
                        ? { ...ci, quantity: ci.quantity + 1 }
                        : ci
                );
            } else {
                const normalizedItem = {
                    ...item,
                    id: String(item.id)
                };
                return [...prev, { menuItem: normalizedItem, quantity: 1 }];
            }
        });
    };

    // Remove item from cart
    const removeFromCart = (itemId: string) => {
        setCartItems((prev) =>
            prev.filter((ci) => String(ci.menuItem.id) !== String(itemId))
        );
    };

    // Update item quantity
    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCartItems((prev) =>
            prev.map((ci) =>
                String(ci.menuItem.id) === String(itemId)
                    ? { ...ci, quantity }
                    : ci
            )
        );
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
        // ✅ NEW: Also clear localStorage
        localStorage.removeItem(CART_STORAGE_KEY);
    };

    // Calculate total amount
    const totalAmount = cartItems.reduce(
        (total, item) => total + item.menuItem.price * item.quantity,
        0
    );

    // Calculate total item count
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalAmount,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};