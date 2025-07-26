"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useShopStore from "@/store/shopStore";
import useOrderStore from "@/store/orderStore";
import useProductStore from "@/store/productStore";
import { toast } from "react-toastify";
import {
  AiOutlineArrowRight,
  AiOutlineClockCircle,
  AiOutlineDollar,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { MdPendingActions } from "react-icons/md";
import { Button, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FaChartLine, FaExchangeAlt } from "react-icons/fa";

const ShopDashboardHero = () => {
  const { seller, isSeller, sellerToken, checkAuth, loadShop, refreshToken } =
    useShopStore();
  const {
    orders,
    stats,
    transactions,
    availableBalance,
    transactionTotal,
    isLoading: ordersLoading,
    error: ordersError,
    fetchSellerOrders,
    fetchShopStats,
    fetchShopTransactions,
  } = useOrderStore();
  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    fetchShopProducts,
  } = useProductStore();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Validate authentication and load shop data
  const validateAuth = useCallback(async () => {
    if (!isSeller || !seller?._id || !sellerToken) {
      try {
        console.debug("validateAuth: Checking authentication", {
          isSeller,
          hasSellerId: !!seller?._id,
          hasToken: !!sellerToken,
        });
        const { success } = await checkAuth();
        if (!success) {
          console.warn("validateAuth: Authentication check failed");
          toast.error("Please log in to view dashboard", {
            toastId: "auth-error",
          });
          router.push("/shop/login");
          return false;
        }
        const shopResult = await loadShop();
        if (!shopResult.success) {
          console.warn("validateAuth: Failed to load shop data", {
            message: shopResult.message,
          });
          toast.error("Failed to load shop data. Please log in again.", {
            toastId: "shop-load-error",
          });
          router.push("/shop/login");
          return false;
        }
      } catch (err) {
        console.error("validateAuth: Auth check failed:", {
          message: err.message,
          stack: err.stack,
          sellerToken: sellerToken ? "present" : "missing",
        });
        toast.error("Authentication failed. Please log in again.", {
          toastId: "auth-error",
        });
        router.push("/shop/login");
        return false;
      }
    }
    console.info("validateAuth: Authentication successful", {
      shopId: seller?._id,
    });
    setAuthChecked(true);
    return true;
  }, [isSeller, seller, sellerToken, checkAuth, loadShop, router]);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!authChecked || !seller?._id || !sellerToken || isFetching) {
      console.warn("fetchData: Skipping fetch due to missing prerequisites", {
        authChecked,
        hasSellerId: !!seller?._id,
        hasToken: !!sellerToken,
        isFetching,
      });
      return;
    }

    setIsFetching(true);
    try {
      console.debug("fetchData: Fetching dashboard data", {
        shopId: seller._id,
        token: sellerToken.substring(0, 20) + "...",
      });
      const results = await Promise.all([
        fetchSellerOrders(seller._id, sellerToken, { page: 1, limit: 5 }).catch(
          (err) => ({ success: false, error: err })
        ),
        fetchShopProducts(seller._id, sellerToken).catch((err) => ({
          success: false,
          error: err,
        })),
        fetchShopStats(seller._id, sellerToken).catch((err) => ({
          success: false,
          error: err,
        })),
        fetchShopTransactions(seller._id, { page: 1, limit: 5 }).catch(
          (err) => ({
            success: false,
            error: err,
          })
        ),
      ]);

      const errors = results.filter((result) => !result.success);
      if (errors.length > 0) {
        const firstError = errors[0].error;
        console.error("fetchData: One or more API calls failed", {
          errors: errors.map((e) => ({
            message: e.message,
            status: e.error.response?.status,
            data: e.error.response?.data,
          })),
        });

        if (
          errors.some(
            (e) =>
              e.error.response?.status === 401 ||
              e.error.response?.status === 403
          )
        ) {
          console.debug("fetchData: Attempting token refresh");
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            console.info("fetchData: Token refreshed, retrying data fetch", {
              newToken: refreshResult.newToken.substring(0, 20) + "...",
            });
            await Promise.all([
              fetchSellerOrders(seller._id, refreshResult.newToken, {
                page: 1,
                limit: 5,
              }),
              fetchShopProducts(seller._id, refreshResult.newToken),
              fetchShopStats(seller._id, refreshResult.newToken),
              fetchShopTransactions(seller._id, {
                page: 1,
                limit: 5,
              }),
            ]);
          } else {
            console.error("fetchData: Token refresh failed", {
              message: refreshResult.message,
            });
            toast.error("Session expired. Please log in again.", {
              toastId: "auth-error",
            });
            router.push("/shop/login");
          }
        } else {
          toast.error(firstError.message || "Failed to load dashboard data", {
            toastId: "fetch-error",
          });
        }
      }
    } catch (error) {
      console.error("fetchData: Unexpected error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.message || "Failed to load dashboard data", {
        toastId: "fetch-error",
      });
    } finally {
      setIsFetching(false);
    }
  }, [
    authChecked,
    seller?._id,
    sellerToken,
    fetchSellerOrders,
    fetchShopProducts,
    fetchShopStats,
    fetchShopTransactions,
    router,
    refreshToken,
  ]);

  // Initial auth validation
  useEffect(() => {
    console.debug("useEffect: Running validateAuth");
    validateAuth();
  }, [validateAuth]);

  // Fetch data after auth is checked
  useEffect(() => {
    if (authChecked && seller?._id && sellerToken) {
      console.debug("useEffect: Running fetchData");
      fetchData();
    }
  }, [authChecked, seller, sellerToken, fetchData]);

  if (!authChecked) {
    return (
      <div className="text-center text-gray-600 flex items-center justify-center h-64">
        <AiOutlineShoppingCart className="animate-spin h-8 w-8 mr-2 text-blue-600" />
        Checking authentication...
      </div>
    );
  }

  if (ordersLoading || productsLoading || isFetching) {
    return (
      <div className="text-center text-gray-600 flex items-center justify-center h-64">
        <AiOutlineShoppingCart className="animate-spin h-8 w-8 mr-2 text-blue-600" />
        Loading dashboard...
      </div>
    );
  }

  if (ordersError || productsError) {
    return (
      <div className="text-center text-red-600">
        <p>{ordersError || productsError}</p>
        <button
          onClick={fetchData}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const pendingFunds =
    (stats.totalSales - availableBalance)?.toFixed(2) || "0.00";
  const totalSales = stats.totalSales?.toFixed(2) || "0.00";
  const pendingOrders = stats.pendingOrders || 0;
  const totalOrders = stats.totalOrders || 0;
  const recentOrders = stats.recentOrders || 0;
  const pendingBalance = seller?.pendingBalance?.toFixed(2) || "0.00";

  const orderColumns = [
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

  const transactionColumns = [
    { field: "id", headerName: "Transaction ID", minWidth: 150, flex: 0.7 },
    {
      field: "type",
      headerName: "Type",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "Deposit"
              ? "bg-green-100 text-green-600"
              : params.value === "Withdrawal" &&
                params.row.status === "Processing"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      type: "string",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: "orderId",
      headerName: "Order ID",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "note",
      headerName: "Note",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.6,
      renderCell: (params) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            params.value === "Processing"
              ? "bg-yellow-100 text-yellow-600"
              : params.value === "Approved" || params.value === "Succeeded"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) =>
        new Date(params.value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
  ];

  const orderRows =
    orders?.map((item) => ({
      id: item._id,
      itemsQty: Array.isArray(item.items)
        ? item.items.reduce((acc, cur) => acc + (cur.quantity || 0), 0)
        : 0,
      total: `US$ ${item.totalAmount?.toFixed(2) || "0.00"}`,
      status: item.status,
    })) || [];

  const transactionRows =
    transactions?.map((item, index) => ({
      id: `${item.createdAt}-${index}`,
      type: item.type,
      amount: item.amount,
      orderId: item.orderId,
      note: item.note,
      status: item.status,
      createdAt: item.createdAt,
    })) || [];

  return (
    <div className="w-full p-6 md:p-8">
      <h3 className="text-2xl font-semibold text-gray-900 pb-4">
        Shop Dashboard
      </h3>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <AiOutlineDollar size={40} className="mr-2 text-gray-600" />
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
            ${availableBalance.toFixed(2)}
          </h5>
          <Link
            href="/shop/withdraw-money"
            className="text-blue-600 mt-2 block hover:underline"
          >
            Withdraw Money
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <FaChartLine size={30} className="mr-2 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-700">Total Sales</h3>
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

        <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <AiOutlineShoppingCart size={30} className="mr-2 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-700">All Products</h3>
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

        <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <AiOutlineClockCircle size={40} className="mr-2 text-gray-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-700">
                Pending Funds
              </h3>
              <span className="text-sm text-gray-500">
                (awaiting delivery confirmation)
              </span>
            </div>
          </div>
          <h5 className="mt-2 text-2xl font-semibold text-gray-900">
            ${pendingFunds}
          </h5>
          <Link
            href="/shop/transactions?status=Shipped"
            className="text-blue-600 mt-2 block hover:underline"
          >
            View Transaction History
          </Link>
        </div>

        <Tooltip
          title="Funds from withdrawal requests awaiting admin approval"
          placement="top"
        >
          <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <FaExchangeAlt size={30} className="mr-2 text-gray-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  Pending Withdrawals
                </h3>
                <span className="text-sm text-gray-500">
                  (awaiting admin approval)
                </span>
              </div>
            </div>
            <h5 className="mt-2 text-2xl font-semibold text-gray-900">
              ${pendingBalance}
            </h5>
            <Link
              href="/shop/transactions?status=Processing"
              className="text-blue-600 mt-2 block hover:underline"
            >
              View Pending Withdrawals
            </Link>
          </div>
        </Tooltip>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Latest Orders</h3>
        <Link
          href="/shop/orders"
          className="text-blue-600 hover:underline text-sm"
        >
          View All Orders
        </Link>
      </div>
      <div className="w-full bg-white p-4 rounded-lg shadow mb-8">
        <DataGrid
          rows={orderRows}
          columns={orderColumns}
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

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Recent Transactions
        </h3>
        <Link
          href="/shop/transactions"
          className="text-blue-600 hover:underline text-sm"
        >
          View All Transactions
        </Link>
      </div>
      <div className="w-full bg-white p-4 rounded-lg shadow">
        <DataGrid
          rows={transactionRows}
          columns={transactionColumns}
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
    </div>
  );
};

export default ShopDashboardHero;
