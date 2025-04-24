// store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // Add to cart
      addToCart: (data) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item._id === data._id);

        if (existingItem) {
          if (existingItem.qty + data.qty > data.stock) {
            toast.error("Product stock limited!");
            return;
          }
          set({
            cart: currentCart.map((item) =>
              item._id === data._id
                ? { ...item, qty: item.qty + data.qty }
                : item
            ),
          });
        } else {
          if (data.qty > data.stock) {
            toast.error("Product stock limited!");
            return;
          }
          set({ cart: [...currentCart, data] });
        }
        toast.success("Added to cart!");
      },

      // Remove from cart
      removeFromCart: (data) => {
        set({
          cart: get().cart.filter((item) => item._id !== data._id),
        });
        toast.success("Removed from cart!");
      },

      // Update quantity
      updateQuantity: (data) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item._id === data._id);

        if (!existingItem) return;

        if (data.qty > existingItem.stock) {
          toast.error("Product stock limited!");
          return;
        }

        if (data.qty < 1) {
          set({
            cart: currentCart.filter((item) => item._id !== data._id),
          });
          toast.success("Removed from cart!");
        } else {
          set({
            cart: currentCart.map((item) =>
              item._id === data._id ? { ...item, qty: data.qty } : item
            ),
          });
        }
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

export default useCartStore;
