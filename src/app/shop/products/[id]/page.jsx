"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import useShopStore from "@/store/shopStore";
import useProductStore from "@/store/productStore";
import Link from "next/link";

// Icons (you can replace with your preferred icon library)
const PlayIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const HeartIcon = ({ filled = false }) => (
  <svg
    className="w-6 h-6"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 000-6.364A4.5 4.5 0 0012 4.318a4.5 4.5 0 00-7.682 2z"
    />
  </svg>
);

const ShareIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);

const ZoomIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
    />
  </svg>
);

const ProductDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const { seller, isSeller, sellerToken, checkAuth, loadShop } = useShopStore();
  const { product, isLoading, error, fetchSingleProduct } = useProductStore();

  // State management
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const modalRef = useRef(null);

  // Authentication effect
  useEffect(() => {
    const validateAuth = async () => {
      if (!isSeller || !sellerToken) {
        try {
          const { success } = await checkAuth();
          if (!success) {
            toast.error("Please log in to view product details", {
              toastId: "auth-error",
            });
            router.push("/shop/login");
            return;
          }
          await loadShop();
        } catch (err) {
          console.error("Auth check failed:", err);
          toast.error("Authentication failed. Please log in again.", {
            toastId: "auth-error",
          });
          router.push("/shop/login");
          return;
        }
      }
      setAuthChecked(true);
    };

    validateAuth();
  }, [isSeller, sellerToken, checkAuth, loadShop, router]);

  // Product fetching effect
  useEffect(() => {
    if (!authChecked) return;

    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      console.error("Invalid product ID", { productId });
      toast.error("Invalid product ID", { toastId: "fetch-error" });
      return;
    }

    const fetchProduct = async () => {
      try {
        await fetchSingleProduct(productId, sellerToken);
      } catch (error) {
        console.error("Fetch product error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          productId,
        });
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error("Session expired. Please log in again.", {
            toastId: "auth-error",
          });
          router.push("/shop/login");
        } else {
          toast.error(error.message || "Failed to load product details", {
            toastId: "fetch-error",
          });
        }
      }
    };

    fetchProduct();
  }, [authChecked, productId, sellerToken, fetchSingleProduct, router]);

  // Initialize selected media
  useEffect(() => {
    if (product) {
      if (product.images?.length > 0) {
        setSelectedMedia(product.images[0].url);
        setSelectedMediaType("image");
      } else if (product.videos?.length > 0) {
        setSelectedMedia(product.videos[0].url);
        setSelectedMediaType("video");
      }

      if (product.variations?.length > 0) {
        setSelectedVariation(product.variations[0]);
      }
    }
  }, [product]);

  // Helper functions
  const handleMediaSelect = (url, type) => {
    setSelectedMedia(url);
    setSelectedMediaType(type);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
      setShareMenuOpen(false);
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariation) {
      return selectedVariation.price;
    }
    return product.flashSale?.isActive && product.flashSale?.discountPrice
      ? product.flashSale.discountPrice
      : product.price;
  };

  const getOriginalPrice = () => {
    if (selectedVariation) {
      return selectedVariation.price;
    }
    return product.price;
  };

  const getCurrentStock = () => {
    if (selectedVariation) {
      return selectedVariation.stock;
    }
    return product.flashSale?.isActive
      ? product.flashSale.stockLimit
      : product.stock;
  };

  const getDiscountPercentage = () => {
    if (product.flashSale?.isActive && product.flashSale?.discountPrice) {
      return Math.round(
        ((product.price - product.flashSale.discountPrice) / product.price) *
          100
      );
    }
    return 0;
  };

  // Loading state
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Loading Product
              </h3>
              <p className="text-gray-600">
                Please wait while we fetch the details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/shop/products")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/shop/products")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Browse All Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm">
            <Link
              href="/shop/products"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Products
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Media Section */}
          <div className="space-y-4">
            {/* Main Media Display */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Discount Badge */}
              {getDiscountPercentage() > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {getDiscountPercentage()}% OFF
                </div>
              )}

              {/* Zoom Button */}
              {selectedMediaType === "image" && (
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200"
                >
                  <ZoomIcon />
                </button>
              )}

              <div className="aspect-square relative">
                {selectedMediaType === "video" ? (
                  <ReactPlayer
                    url={selectedMedia}
                    controls={true}
                    width="100%"
                    height="100%"
                    className="react-player"
                    config={{
                      youtube: { playerVars: { showinfo: 0 } },
                      file: {
                        attributes: {
                          controlsList: "nodownload",
                          preload: "metadata",
                        },
                      },
                    }}
                    onError={(e) => {
                      console.error("Video playback error:", e);
                      toast.error("Failed to play video");
                    }}
                  />
                ) : selectedMedia ? (
                  <Image
                    src={selectedMedia}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Media Thumbnails */}
            {(product.images?.length > 0 || product.videos?.length > 0) && (
              <div className="grid grid-cols-5 gap-3">
                {product.images?.map((image, index) => (
                  <button
                    key={`image-${index}`}
                    onClick={() => handleMediaSelect(image.url, "image")}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedMedia === image.url
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
                {product.videos?.map((video, index) => (
                  <button
                    key={`video-${index}`}
                    onClick={() => handleMediaSelect(video.url, "video")}
                    className={`relative aspect-square rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedMedia === video.url
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                  >
                    <video
                      src={video.url}
                      className="object-cover w-full h-full"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="text-white">
                        <PlayIcon />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <HeartIcon filled={isWishlisted} />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShareMenuOpen(!shareMenuOpen)}
                      className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <ShareIcon />
                    </button>
                    {shareMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 min-w-[120px] z-10">
                        <button
                          onClick={handleShare}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                        >
                          Share Product
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {product.categories?.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {category}
                  </span>
                ))}
                {product.tags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${getCurrentPrice().toFixed(2)}
                </span>
                {product.flashSale?.isActive && (
                  <span className="text-xl text-gray-500 line-through">
                    ${getOriginalPrice().toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    getCurrentStock() > 10
                      ? "bg-green-500"
                      : getCurrentStock() > 0
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {getCurrentStock() > 10
                    ? "In Stock"
                    : getCurrentStock() > 0
                    ? `Only ${getCurrentStock()} left`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Flash Sale Timer */}
              {product.flashSale?.isActive && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">
                    Flash Sale ends:{" "}
                    {new Date(product.flashSale.endDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Variations */}
            {product.variations?.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Choose Variation</h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.variations.map((variation, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariation(variation)}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        selectedVariation?.name === variation.name
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{variation.name}</p>
                          <p className="text-sm text-gray-600">
                            {variation.options.join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${variation.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock: {variation.stock}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push("/shop/products")}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Back to Products
                  </button>
                  {isSeller && (
                    <Link
                      href={`/shop/products/edit/${product._id}`}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-center"
                    >
                      Edit Product
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm">
              {/* Tab Navigation */}
              <div className="border-b">
                <nav className="flex">
                  {["description", "shipping", "details"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? "border-b-2 border-blue-500 text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Weight</h4>
                        <p className="text-gray-600">
                          {product.shipping?.weight
                            ? `${product.shipping.weight} kg`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Shipping Cost
                        </h4>
                        <p className="text-gray-600">
                          {product.shipping?.isFreeShipping
                            ? "Free Shipping"
                            : product.shipping?.cost
                            ? `$${product.shipping.cost.toFixed(2)}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    {product.shipping?.dimensions && (
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Dimensions (L×W×H)
                        </h4>
                        <p className="text-gray-600">
                          {product.shipping.dimensions.length} ×{" "}
                          {product.shipping.dimensions.width} ×{" "}
                          {product.shipping.dimensions.height} cm
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Sub-Category
                        </h4>
                        <p className="text-gray-600">
                          {product.subCategory || "N/A"}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Made in Canada
                        </h4>
                        <p className="text-gray-600">
                          {product.isMadeInCanada ? "Yes" : "No"}
                          {product.canadianCertification && (
                            <span className="block text-sm">
                              ({product.canadianCertification})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {product.culturalCategories?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Cultural Categories
                        </h4>
                        <p className="text-gray-600">
                          {product.culturalCategories.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedMediaType === "image" && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={selectedMedia}
              alt={product.name}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
