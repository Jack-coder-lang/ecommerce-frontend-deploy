// frontend/src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      fetchCart: async () => {
        // Simulation du chargement du panier
        const mockCart = {
          items: [
            { id: 1, productId: 1, quantity: 2, name: 'iPhone 14', price: 450000 },
            { id: 2, productId: 2, quantity: 1, name: 'AirPods', price: 120000 }
          ]
        };
        
        set({ 
          items: mockCart.items,
          itemCount: mockCart.items.reduce((sum, item) => sum + item.quantity, 0)
        });
      },

      addToCart: async (productId, quantity = 1) => {
        try {
          const { items } = get();
          const existingItem = items.find(item => item.productId === productId);
          
          if (existingItem) {
            const updatedItems = items.map(item =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
            
            set({ 
              items: updatedItems,
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
            });
          } else {
            const newItem = {
              productId,
              quantity,
              name: `Produit ${productId}`,
              price: Math.floor(Math.random() * 100000) + 10000,
              image: null
            };
            
            const updatedItems = [...items, newItem];
            set({ 
              items: updatedItems,
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
            });
          }
          
          return { success: true };
        } catch (error) {
          console.error('Error adding to cart:', error);
          return { success: false, error: 'Failed to add to cart' };
        }
      },

      removeFromCart: (productId) => {
        const { items } = get();
        const updatedItems = items.filter(item => item.productId !== productId);
        
        set({
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0 });
      }
    }),
    {
      name: 'cart-storage',
      getStorage: () => localStorage,
    }
  )
);