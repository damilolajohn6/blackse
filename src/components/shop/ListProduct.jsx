"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import useShopStore from "@/store/shopStore";
import useProductStore from "@/store/productStore";
import { FaPlus, FaEdit, FaTrash, FaEye, FaBolt } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Zap, Star, ShoppingCart } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Jost } from "next/font/google";

const jost = Jost(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)

const ListProducts = () => {
  const router = useRouter();
  const { seller, isSeller, sellerToken } = useShopStore();
  const {
    shopProducts,
    categories,
    isLoading,
    error,
    fetchShopProducts,
    fetchCategories,
    fetchProductsByCategory,
    categoryProducts,
    addFlashSale,
    removeFlashSale,
  } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [flashSaleForm, setFlashSaleForm] = useState({
    productId: "",
    discountPrice: "",
    startDate: "",
    endDate: "",
    stockLimit: "",
  });

  useEffect(() => {
    if (!isSeller) {
      toast.error("Please log in to view your products", {
        toastId: "auth-error",
      });
      router.push("/shop/login");
      return;
    }

    const loadData = async () => {
      try {
        if (isSeller && seller?._id && sellerToken) {
          await fetchShopProducts(seller._id, sellerToken);
        }
        await fetchCategories();
      } catch (err) {
        console.error("Load data error:", err);
        toast.error(err.message || "Failed to load data", {
          toastId: "fetch-error",
        });
      }
    };

    loadData();
  }, [
    isSeller,
    seller?._id,
    sellerToken,
    fetchShopProducts,
    fetchCategories,
    router,
  ]);

  const handleDelete = async (productId) => {
    if (!productId) {
      toast.error("Product ID is missing", { toastId: "delete-error" });
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error("Invalid product ID", { toastId: "delete-error" });
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { deleteProduct } = useProductStore.getState();
      await deleteProduct(productId, sellerToken);
      toast.success("Product deleted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.status === 403
          ? "You are not authorized to delete this product"
          : error.response?.status === 404
            ? "Product not found"
            : error.message || "Failed to delete product";
      toast.error(errorMessage, { toastId: "delete-error" });
    }
  };

  const handleCategoryChange = async (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category) {
      try {
        await fetchProductsByCategory(seller._id, category, sellerToken);
      } catch (error) {
        toast.error(error.message || "Failed to load category products", {
          toastId: "category-error",
        });
      }
    } else {
      useProductStore.setState({ categoryProducts: [] });
    }
  };

  const handleFlashSaleSubmit = async (e) => {
    e.preventDefault();
    const { productId, discountPrice, startDate, endDate, stockLimit } =
      flashSaleForm;

    if (!productId || !discountPrice || !startDate || !endDate || !stockLimit) {
      toast.error("Please fill all flash sale fields", {
        toastId: "flashsale-error",
      });
      return;
    }

    try {
      await addFlashSale(
        productId,
        {
          discountPrice: Number(discountPrice),
          startDate,
          endDate,
          stockLimit: Number(stockLimit),
        },
        sellerToken
      );
      toast.success("Flash sale added successfully!");
      setFlashSaleForm({
        productId: "",
        discountPrice: "",
        startDate: "",
        endDate: "",
        stockLimit: "",
      });
      if (seller?._id && sellerToken) {
        await fetchShopProducts(seller._id, sellerToken);
      }
    } catch (error) {
      toast.error(error.message || "Failed to add flash sale", {
        toastId: "flashsale-error",
      });
    }
  };

  const handleRemoveFlashSale = async (productId) => {
    if (!confirm("Are you sure you want to remove this flash sale?")) return;

    try {
      await removeFlashSale(productId, sellerToken);
      toast.success("Flash sale removed successfully!");
      if (seller?._id && sellerToken) {
        await fetchShopProducts(seller._id, sellerToken);
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove flash sale", {
        toastId: "flashsale-error",
      });
    }
  };

  const displayedProducts = selectedCategory ? categoryProducts : shopProducts;

  return (
    <div className="">
      <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
        <h1 className="text-2xl font-normal text-gray-900 text-center sm:text-left">
          {isSeller ? "Your Products" : "Browse Products"}
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
          {isSeller && (
            <Link
              href="/shop/products/create"
              className="px-3 flex items-center space-x-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <FaPlus className="" />
              <span className="whitespace-nowrap text-sm">Create Product</span>
            </Link>
          )}
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Primary</SelectLabel>
                {categories.primary?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Cultural</SelectLabel>
                {categories.cultural?.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
                    (Cultural)
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isSeller && (
        <div className="mb-6 bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Add Flash Sale
          </h2>
          <form
            onSubmit={handleFlashSaleSubmit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Product
              </Label>
              <Select
                value={flashSaleForm.productId}
                onValueChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    productId: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {shopProducts.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Discount Price ($)
              </Label>
              <Input
                type="number"
                value={flashSaleForm.discountPrice}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    discountPrice: e.target.value,
                  })
                }
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Stock Limit
              </Label>
              <Input
                type="number"
                value={flashSaleForm.stockLimit}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    stockLimit: e.target.value,
                  })
                }
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                Start Date
              </Label>
              <Input
                type="datetime-local"
                value={flashSaleForm.startDate}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    startDate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700">
                End Date
              </Label>
              <Input
                type="datetime-local"
                value={flashSaleForm.endDate}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    endDate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Flash Sale
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() =>
              selectedCategory
                ? fetchProductsByCategory(
                  seller._id,
                  selectedCategory,
                  sellerToken
                )
                : seller?._id && sellerToken
                  ? fetchShopProducts(seller._id, sellerToken)
                  : null
            }
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : displayedProducts.length === 0 ? (
        <p className="text-center text-gray-600">
          {selectedCategory
            ? `No products found in ${selectedCategory}`
            : "No products found. Create one to get started!"}
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative w-full h-48 sm:h-52 md:h-56">
                {product.images && product.images[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                {product.flashSale?.isActive && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs">
                    Flash Sale
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div className="space-y-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    <div className={jost.className}>Primary</div> 
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map((c, i)=> <Badge variant="secondary" key={i}>{c}</Badge>) || "N/A"}
                    </div>
                  </p>
                  <p className="text-sm text-gray-600">
                    <div className={jost.className}>Cultural</div> 
                    <Badge variant="secondary">{product.culturalCategories?.[0] || "N/A"}</Badge>
                  </p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {product.flashSale?.isActive &&
                    product.flashSale?.discountPrice
                      ? `$${product.flashSale.discountPrice.toFixed(2)}`
                      : `$${product.price.toFixed(2)}`}
                    {product.flashSale?.isActive && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Stock:{" "}
                    {product.flashSale?.isActive
                      ? product.flashSale.stockLimit
                      : product.stock}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Link
                    href={`/shop/products/${product._id}`}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <FaEye className="h-5 w-5" />
                  </Link>
                  {isSeller && (
                    <>
                      <Link
                        href={`/shop/products/edit/${product._id}`}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <FaEdit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                      {product.flashSale?.isActive ? (
                        <button
                          onClick={() => handleRemoveFlashSale(product._id)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Remove Flash Sale"
                        >
                          <FaBolt className="h-5 w-5" />
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>

            // <Card className="group relative overflow-hidden bg-gradient-card shadow-card hover:shadow-glow transition-smooth hover:scale-[1.02] animate-float">
            //   {/* Flash Sale Badge */}
            //   {product.flashSale?.isActive && (
            //     <div className="absolute top-3 left-3 z-10">
            //       <Badge className="bg-gradient-primary text-primary-foreground shadow-glow animate-pulse-glow">
            //         <Zap className="w-3 h-3 mr-1" />
            //         Flash Sale {discountPercentage}% OFF
            //       </Badge>
            //     </div>
            //   )}

            //   {/* Low Stock Badge */}
            //   {product.stock === 0 && (
            //     <div className="absolute top-3 right-3 z-10">
            //       <Badge variant="destructive" className="shadow-md">
            //         Low Stock
            //       </Badge>
            //     </div>
            //   )}

            //   {/* Product Image */}
            //   <div className="relative aspect-[4/3] overflow-hidden">
            //     {product.images && product.images[0]?.url ? (
            //       <img
            //         src={product.images[0].url}
            //         alt={product.name}
            //         className="w-full h-full object-cover transition-smooth group-hover:scale-110"
            //       />
            //     ) : (
            //       <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            //         <div className="text-center text-muted-foreground">
            //           <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            //           <span className="text-sm">No Image</span>
            //         </div>
            //       </div>
            //     )}

            //     {/* Overlay Gradient */}
            //     <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-smooth" />

            //     {/* Action Buttons Overlay */}
            //     <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
            //       <Button
            //         variant="glow"
            //         size="icon"
            //         className="backdrop-blur-sm"
            //       >
            //         <Eye className="w-4 h-4" />
            //       </Button>

            //       {isSeller && (
            //         <>
            //           <Button
            //             variant="success"
            //             size="icon"
            //             className="backdrop-blur-sm"
            //           >
            //             <Edit className="w-4 h-4" />
            //           </Button>

            //           <Button
            //             variant="destructive"
            //             size="icon"
            //             className="backdrop-blur-sm"
            //           >
            //             <Trash2 className="w-4 h-4" />
            //           </Button>

            //           {product.flashSale?.isActive && (
            //             <Button
            //               variant="warning"
            //               size="icon"
            //               className="backdrop-blur-sm"
            //             >
            //               <Zap className="w-4 h-4" />
            //             </Button>
            //           )}
            //         </>
            //       )}
            //     </div>
            //   </div>

            //   <CardContent className="p-4 space-y-3">
            //     {/* Product Name */}
            //     <h3 className="font-semibold text-lg text-card-foreground line-clamp-2 leading-tight">
            //       {product.name}
            //     </h3>

            //     {/* Rating */}
            //     {product.rating && (
            //       <div className="flex items-center gap-1">
            //         <div className="flex">
            //           {[...Array(5)].map((_, i) => (
            //             <Star
            //               key={i}
            //               className={`w-4 h-4 ${i < Math.floor(product.rating)
            //                 ? 'text-warning fill-warning'
            //                 : 'text-muted-foreground'
            //                 }`}
            //             />
            //           ))}
            //         </div>
            //         <span className="text-sm text-muted-foreground">
            //           ({product.reviews || 0})
            //         </span>
            //       </div>
            //     )}

            //     {/* Categories */}
            //     <div className="space-y-2">
            //       {product.categories.length > 0 && (
            //         <div>
            //           <p className="text-xs font-medium text-muted-foreground mb-1">Categories</p>
            //           <div className="flex flex-wrap gap-1">
            //             {product.categories.slice(0, 3).map((category, index) => (
            //               <Badge key={index} variant="secondary" className="text-xs">
            //                 {category}
            //               </Badge>
            //             ))}
            //             {product.categories.length > 3 && (
            //               <Badge variant="outline" className="text-xs">
            //                 +{product.categories.length - 3}
            //               </Badge>
            //             )}
            //           </div>
            //         </div>
            //       )}

            //       {product.culturalCategories && product.culturalCategories[0] && (
            //         <div>
            //           <p className="text-xs font-medium text-muted-foreground mb-1">Cultural</p>
            //           <Badge variant="outline" className="text-xs">
            //             {product.culturalCategories[0]}
            //           </Badge>
            //         </div>
            //       )}
            //     </div>

            //     {/* Pricing */}
            //     <div className="flex items-baseline gap-2">
            //       <span className="text-2xl font-bold text-primary">
            //         ${product.price.toFixed(2)}
            //       </span>
            //       {product.flashSale?.isActive && (
            //         <span className="text-sm text-muted-foreground line-through">
            //           ${product.price.toFixed(2)}
            //         </span>
            //       )}
            //     </div>

            //     {/* Stock Information */}
            //     <div className="flex items-center justify-between text-sm">
            //       <span className={`font-medium ${product.flashSale?.isActive ? 'text-destructive' : 'text-muted-foreground'}`}>
            //         Stock:
            //         {product.flashSale?.isActive? product.flashSale.stockLimit : product.stock}
            //       </span>
            //       {!isSeller && (
            //         <Button
            //           size="sm"
            //           variant="outline"
            //           onClick={() => onAddToCart?.(product._id)}
            //           className="ml-auto"
            //         >
            //           <ShoppingCart className="w-4 h-4 mr-1" />
            //           Add to Cart
            //         </Button>
            //       )}
            //     </div>
            //   </CardContent>
            // </Card>

          ))}
        </div>
      )}
    </div>
  );
};

export default ListProducts;
