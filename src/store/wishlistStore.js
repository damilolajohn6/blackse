// store/wishlistStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],

      // Add to wishlist
      addToWishlist: (data) => {
        const currentWishlist = get().wishlist;
        if (currentWishlist.find((item) => item._id === data._id)) {
          toast.error("Item already in wishlist!");
          return;
        }
        set({ wishlist: [...currentWishlist, data] });
        toast.success("Added to wishlist!");
      },

      // Remove from wishlist
      removeFromWishlist: (data) => {
        set({
          wishlist: get().wishlist.filter((item) => item._id !== data._id),
        });
        toast.success("Removed from wishlist!");
      },
    }),
    {
      name: "wishlist-storage",
    }
  )
);

export default useWishlistStore;
