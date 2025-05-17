"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuthStore from "@/store/authStore";
import useOrderStore from "@/store/orderStore";
import useProductStore from "@/store/productStore";
import { toast } from "react-toastify";
import {
  AiOutlineArrowRight,
  AiOutlineMoneyCollect,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { MdPendingActions } from "react-icons/md";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FaChartLine } from "react-icons/fa";

const ShopDashboardHero = () => {
  const { seller, isSeller, sellerToken } = useAuthStore();
  const { orders, stats, isLoading, error, fetchSellerOrders, fetchShopStats } =
    useOrderStore();
  const { products, fetchShopProducts } = useProductStore();
  const router = useRouter();

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchSellerOrders(seller._id, sellerToken, { page: 1, limit: 5 }),
        fetchShopProducts(seller._id, sellerToken),
        fetchShopStats(seller._id, sellerToken),
      ]);
    } catch (error) {
      console.error("Dashboard data error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.message || "Failed to load dashboard data", {
        toastId: "fetch-error",
      });
    }
  };

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in to view dashboard", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    fetchData();
  }, [
    seller?._id,
    isSeller,
    sellerToken,
    router,
    fetchSellerOrders,
    fetchShopProducts,
    fetchShopStats,
  ]);

  const availableBalance = seller?.availableBalance?.toFixed(2) || "0.00";
  const totalSales = stats.totalSales.toFixed(2);
  const pendingOrders = stats.pendingOrders;
  const totalOrders = stats.totalOrders;
  const recentOrders = stats.recentOrders;

  const columns = [
    { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },
    {
      field: "status",
      headerName: "Status",
      minWidth: 130,
      flex: 0.7,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "Delivered"
              ? "bg-green-100 text-green-600"
              : params.value === "Pending" ||
                params.value === "Confirmed" ||
                params.value === "Shipped"
              ? "bg-yellow-100 text-yellow-600"
              : params.value === "Refunded"
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "itemsQty",
      headerName: "Items Qty",
      type: "number",
      minWidth: 100,
      flex: 0.5,
    },
    {
      field: "total",
      headerName: "Total",
      type: "string",
      minWidth: 130,
      flex: 0.6,
    },
    {
      field: "actions",
      headerName: "",
      sortable: false,
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <Link href={`/shop/orders/${params.row.id}`}>
          <Button variant="text" color="primary">
            <AiOutlineArrowRight size={20} />
          </Button>
        </Link>
      ),
    },
  ];

  const rows =
    orders?.map((item) => ({
      id: item._id,
      itemsQty: Array.isArray(item.items)
        ? item.items.reduce((acc, cur) => acc + (cur.quantity || 0), 0)
        : 0,
      total: `US$ ${item.totalAmount?.toFixed(2) || "0.00"}`,
      status: item.status,
    })) || [];

  return (
    <div className="w-full p-6 md:p-8">
      <h3 className="text-2xl font-semibold text-gray-900 pb-4">
        Shop Dashboard
      </h3>
      {isLoading ? (
        <div className="text-center text-gray-600 flex items-center justify-center h-64">
          <AiOutlineShoppingCart className="animate-spin h-8 w-8 mr-2 text-blue-600" />
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Account Balance */}
            <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <AiOutlineMoneyCollect
                  size={30}
                  className="mr-2 text-gray-600"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Account Balance
                  </h3>
                  <span className="text-sm text-gray-500">
                    (with 10% service charge)
                  </span>
                </div>
              </div>
              <h5 className="mt-2 text-2xl font-semibold text-gray-900">
                ${availableBalance}
              </h5>
              <Link
                href="/shop/withdraw-money"
                className="text-blue-600 mt-2 block hover:underline"
              >
                Withdraw Money
              </Link>
            </div>

            {/* Total Sales */}
            <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <FaChartLine size={30} className="mr-2 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-700">
                  Total Sales
                </h3>
              </div>
              <h5 className="mt-2 text-2xl font-semibold text-gray-900">
                ${totalSales}
              </h5>
              <Link
                href="/shop/orders"
                className="text-blue-600 mt-2 block hover:underline"
              >
                View Orders
              </Link>
            </div>

            {/* Pending Orders */}
            <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <MdPendingActions size={30} className="mr-2 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-700">
                  Pending Orders
                </h3>
              </div>
              <h5 className="mt-2 text-2xl font-semibold text-gray-900">
                {pendingOrders}
              </h5>
              <Link
                href="/shop/orders?status=Pending"
                className="text-blue-600 mt-2 block hover:underline"
              >
                Manage Orders
              </Link>
            </div>

            {/* All Products */}
            <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <AiOutlineShoppingCart
                  size={30}
                  className="mr-2 text-gray-600"
                />
                <h3 className="text-lg font-medium text-gray-700">
                  All Products
                </h3>
              </div>
              <h5 className="mt-2 text-2xl font-semibold text-gray-900">
                {products.length}
              </h5>
              <Link
                href="/shop/products"
                className="text-blue-600 mt-2 block hover:underline"
              >
                View Products
              </Link>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Latest Orders
            </h3>
            <Link
              href="/shop/orders"
              className="text-blue-600 hover:underline text-sm"
            >
              View All Orders
            </Link>
          </div>
          <div className="w-full bg-white p-4 rounded-lg shadow">
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10, 20]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5, page: 0 },
                },
              }}
              disableRowSelectionOnClick
              autoHeight
              className="border-0"
            />
          </div>

          {/* Recent Order Trend */}
          <div className="mt-8 bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Trend
            </h3>
            <p className="text-sm text-gray-600">
              Orders in the last 30 days:{" "}
              <span className="font-semibold">{recentOrders}</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {recentOrders > 0
                ? `You're averaging ${(recentOrders / 30).toFixed(
                    1
                  )} orders per day this month.`
                : "No orders in the last 30 days. Promote your shop to boost sales!"}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ShopDashboardHero;
