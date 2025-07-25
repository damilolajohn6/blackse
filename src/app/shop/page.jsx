"use client";
import styles from "@/styles/styles";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuthStore from "@/store/shopStore";
import { toast } from "react-toastify";
import Link from "next/link";
import axios from "axios";
import ProductCard from "@/components/shop/ProductCard";
import EventCard from "@/components/shop/EventCard";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const ShopHomepage = () => {
  const { seller, isSeller, sellerToken } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [active, setActive] = useState(1);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Define isOwner: true if the logged-in seller's id matches the shop id
  const isOwner = seller && seller._id && id && seller._id === id;

  useEffect(() => {
    if (!id || (!isSeller && isOwner)) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const headers = isOwner
          ? { Authorization: `Bearer ${sellerToken}` }
          : {};
        const [productsRes, eventsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/product/get-all-products-shop/${id}`, {
            headers,
            withCredentials: true,
          }),
          axios.get(`${API_BASE_URL}/event/get-all-events/${id}`, {
            headers,
            withCredentials: true,
          }),
        ]);
        setProducts(productsRes.data.products || []);
        setEvents(eventsRes.data.events || []);
      } catch (error) {
        console.error("Shop profile data error:", error);
        toast.error(
          error.response?.data?.message || "Failed to load shop data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, sellerToken, isSeller, isOwner]);

  const allReviews =
    products?.map((product) => product.reviews || []).flat() || [];

  useEffect(() => {
    if (!isSeller && !isLoading) {
      toast.error("Please login to your shop");
      router.push("/shop/login");
    }
  }, [isSeller, isLoading, router]);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!seller) {
    return null;
  }

  return (
    <div>
      <div className={`${styles.section} bg-[#f5f5f5]`}>
        <div className="w-full flex py-10 justify-between">
          <div className="w-[25%] bg-[#fff] rounded-[4px] shadow-sm overflow-y-scroll h-[90vh] sticky top-10 left-0 z-10">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-blue-600 mb-6">
                    Welcome, {seller?.name}
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                <p>
                  <strong>Email:</strong> {seller.email}
                </p>
                <p>
                  <strong>Address:</strong> {seller.address}, {seller.zipCode}
                </p>
                {seller.phone?.number && (
                  <p>
                    <strong>Phone:</strong> {seller.phone.countryCode}
                    {seller.phone.number}
                  </p>
                )}
                {seller.avatar?.url && (
                  <div>
                    <strong>Avatar:</strong>
                    <img
                      src={seller.avatar.url}
                      alt="Shop Avatar"
                      className="mt-2 h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push("/shop/settings/edit")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Edit Shop Settings
                </button>
              </div>
            </div>
          </div>
          <div className="w-[72%] rounded-[4px]">
            <div className="w-full">
              <div className="flex w-full items-center justify-between">
                <div className="w-full flex">
                  <div
                    className="flex items-center"
                    onClick={() => setActive(1)}
                  >
                    <h5
                      className={`font-[600] text-[20px] ${
                        active === 1 ? "text-red-500" : "text-[#333]"
                      } cursor-pointer pr-[20px]`}
                    >
                      Shop Products
                    </h5>
                  </div>
                  <div
                    className="flex items-center"
                    onClick={() => setActive(2)}
                  >
                    <h5
                      className={`font-[600] text-[20px] ${
                        active === 2 ? "text-red-500" : "text-[#333]"
                      } cursor-pointer pr-[20px]`}
                    >
                      Running Events
                    </h5>
                  </div>
                  <div
                    className="flex items-center"
                    onClick={() => setActive(3)}
                  >
                    <h5
                      className={`font-[600] text-[20px] ${
                        active === 3 ? "text-red-500" : "text-[#333]"
                      } cursor-pointer pr-[20px]`}
                    >
                      Shop Reviews
                    </h5>
                  </div>
                </div>
                {isOwner && (
                  <Link href="/shop/dashboard">
                    <div className="bg-blue-600 text-white rounded-[4px] h-[42px] flex items-center justify-center px-4">
                      <span>Go Dashboard</span>
                    </div>
                  </Link>
                )}
              </div>

              <div className="mt-6">
                {isLoading ? (
                  <div className="text-center py-12">Loading...</div>
                ) : (
                  <>
                    {/* Products Section */}
                    {active === 1 && (
                      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
                        {products.length > 0 ? (
                          products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                          ))
                        ) : (
                          <h5 className="w-full text-center py-5 text-[18px]">
                            No Products available for this shop!
                          </h5>
                        )}
                      </div>
                    )}

                    {/* Events Section */}
                    {active === 2 && (
                      <div className="w-full">
                        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
                          {events.length > 0 ? (
                            events.map((event) => (
                              <EventCard key={event._id} event={event} />
                            ))
                          ) : (
                            <h5 className="w-full text-center py-5 text-[18px]">
                              No Events available for this shop!
                            </h5>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reviews Section */}
                    {active === 3 && (
                      <div className="w-full">
                        {allReviews.length > 0 ? (
                          allReviews.map((review, index) => (
                            <div key={index} className="w-full flex my-4">
                              <img
                                src={
                                  review.user?.avatar?.url ||
                                  "/default-avatar.png"
                                }
                                className="w-[50px] h-[50px] rounded-full"
                                alt={review.user?.name || "User"}
                              />
                              <div className="pl-2">
                                <div className="flex w-full items-center">
                                  <h1 className="font-[600] pr-2">
                                    {review.user?.name || "Anonymous"}
                                  </h1>
                                  <span className="text-yellow-500">
                                    {review.rating || 0} ★
                                  </span>
                                </div>
                                <p className="font-[400] text-[#000000a7]">
                                  {review.comment || "No comment"}
                                </p>
                                <p className="text-[#000000a7] text-[14px]">
                                  {review.createdAt
                                    ? new Date(
                                        review.createdAt
                                      ).toLocaleDateString()
                                    : "Recently"}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <h5 className="w-full text-center py-5 text-[18px]">
                            No Reviews available for this shop!
                          </h5>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHomepage;
