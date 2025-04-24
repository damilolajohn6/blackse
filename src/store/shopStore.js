// store/shopStore.js
import { create } from "zustand";
import axios from "axios";

const useShopStore = create((set) => ({
  shop: null,
  products: [],
  fetchShop: async (userId) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/shops/${userId}`,
        {
          withCredentials: true,
        }
      );
      set({ shop: res.data.shop, products: res.data.products });
    } catch (error) {
      console.error("Failed to fetch shop:", error);
    }
  },
  clearShop: () => set({ shop: null, products: [] }),
}));

export default useShopStore;
