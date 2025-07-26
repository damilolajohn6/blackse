"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import useShopStore from "@/store/shopStore";
import useOrderStore from "@/store/orderStore";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { AiOutlineShoppingCart, AiOutlineArrowRight } from "react-icons/ai";
import { FaExchangeAlt } from "react-icons/fa";

const TransactionsPage = () => {
  const { seller, isSeller, sellerToken, checkAuth, loadShop } = useShopStore();
  const {
    transactions,
    availableBalance,
    transactionTotal,
    transactionPage,
    transactionPages,
    isLoading,
    error,
    filters,
    setFilters,
    setTransactionPage,
    fetchShopTransactions,
  } = useOrderStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    transactionType: filters.transactionType || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
    status: filters.status || searchParams.get("status") || "",
  });

  // Validate authentication
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
          toast.error("Please log in to view transactions", {
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

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!authChecked || !seller?._id || !sellerToken) {
      console.warn(
        "fetchTransactions: Skipping fetch due to missing prerequisites",
        {
          authChecked,
          hasSellerId: !!seller?._id,
          hasToken: !!sellerToken,
        }
      );
      return;
    }

    try {
      console.debug("fetchTransactions: Fetching transactions", {
        shopId: seller._id,
        token: sellerToken.substring(0, 20) + "...",
        filters: localFilters,
        page: transactionPage,
      });

      // Validate and clean filters
      const cleanedFilters = {
        page: transactionPage,
        limit: 20,
      };

      if (
        localFilters.transactionType &&
        localFilters.transactionType.trim() !== ""
      ) {
        cleanedFilters.type = localFilters.transactionType;
      }

      if (localFilters.startDate && localFilters.startDate.trim() !== "") {
        cleanedFilters.startDate = localFilters.startDate;
      }

      if (localFilters.endDate && localFilters.endDate.trim() !== "") {
        cleanedFilters.endDate = localFilters.endDate;
      }

      if (localFilters.status && localFilters.status.trim() !== "") {
        cleanedFilters.status = localFilters.status;
      }

      const result = await fetchShopTransactions(seller._id, cleanedFilters);

      if (!result.success) {
        console.error("fetchTransactions: Failed to fetch transactions", {
          message: result.message,
        });
        toast.error(result.message, { toastId: "fetch-error" });
      }
    } catch (error) {
      console.error("fetchTransactions: Unexpected error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      if (error.response?.status === 400) {
        toast.error("Invalid request parameters. Please check your filters.", {
          toastId: "fetch-error",
        });
      } else {
        toast.error(error.message || "Failed to load transactions", {
          toastId: "fetch-error",
        });
      }
    }
  }, [
    authChecked,
    seller?._id,
    sellerToken,
    transactionPage,
    localFilters,
    fetchShopTransactions,
  ]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters and reset to page 1
  const applyFilters = () => {
    setFilters({
      ...filters,
      transactionType: localFilters.transactionType,
      startDate: localFilters.startDate,
      endDate: localFilters.endDate,
      status: localFilters.status,
    });
    setTransactionPage(1);
    fetchTransactions();
  };

  // Clear filters
  const clearFilters = () => {
    setLocalFilters({
      transactionType: "",
      startDate: "",
      endDate: "",
      status: "",
    });
    setFilters({
      ...filters,
      transactionType: "",
      startDate: "",
      endDate: "",
      status: "",
    });
    setTransactionPage(1);
    fetchTransactions();
  };

  // Handle query params on mount
  useEffect(() => {
    const status = searchParams.get("status");
    if (status) {
      setLocalFilters((prev) => ({ ...prev, status }));
      setFilters((prev) => ({ ...prev, status }));
    }
  }, [searchParams, setFilters]);

  // Initial auth validation
  useEffect(() => {
    console.debug("useEffect: Running validateAuth");
    validateAuth();
  }, [validateAuth]);

  // Fetch transactions after auth is checked or filters change
  useEffect(() => {
    if (authChecked && seller?._id && sellerToken) {
      console.debug("useEffect: Running fetchTransactions");
      fetchTransactions();
    }
  }, [authChecked, seller, sellerToken, fetchTransactions]);

  if (!authChecked) {
    return (
      <div className="text-center text-gray-600 flex items-center justify-center h-64">
        <AiOutlineShoppingCart className="animate-spin h-8 w-8 mr-2 text-blue-600" />
        Checking authentication...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-600 flex items-center justify-center h-64">
        <AiOutlineShoppingCart className="animate-spin h-8 w-8 mr-2 text-blue-600" />
        Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchTransactions}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const columns = [
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
      renderCell: (params) =>
        params.value ? (
          <Link
            href={`/shop/orders/${params.value}`}
            className="text-blue-600 hover:underline"
          >
            {params.value}
          </Link>
        ) : (
          "N/A"
        ),
    },
    {
      field: "note",
      headerName: "Note",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => params.value || "N/A",
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
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
  ];

  const rows =
    transactions?.map((item, index) => ({
      id: `${item.createdAt}-${index}`,
      type: item.type,
      status: item.status || "N/A",
      amount: item.amount,
      orderId: item.orderId,
      note: item.note,
      createdAt: item.createdAt,
    })) || [];

  return (
    <div className="w-full p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-900">
          Transaction History
        </h3>
        <Link
          href="/shop/dashboard"
          className="text-blue-600 hover:underline text-sm"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h4 className="text-lg font-medium text-gray-700 mb-4">
          Available Balance: ${availableBalance.toFixed(2)}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormControl fullWidth className="mb-4">
            <InputLabel id="transaction-type-label">
              Transaction Type
            </InputLabel>
            <Select
              labelId="transaction-type-label"
              name="transactionType"
              value={localFilters.transactionType}
              onChange={handleFilterChange}
              label="Transaction Type"
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="Deposit">Deposit</MenuItem>
              <MenuItem value="Withdrawal">Withdrawal</MenuItem>
              <MenuItem value="Refund">Refund</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth className="mb-4">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={localFilters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Succeeded">Succeeded</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="startDate"
            label="Start Date"
            type="date"
            value={localFilters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            className="mb-4"
          />
          <TextField
            name="endDate"
            label="End Date"
            type="date"
            value={localFilters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
            className="mb-4"
          />
          <div className="flex space-x-2">
            <Button
              variant="contained"
              color="primary"
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={clearFilters}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full bg-white p-4 rounded-lg shadow">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          pagination
          paginationMode="server"
          rowCount={transactionTotal}
          paginationModel={{
            page: transactionPage - 1,
            pageSize: 10,
          }}
          onPaginationModelChange={(model) => {
            setTransactionPage(model.page + 1);
            fetchTransactions();
          }}
          disableRowSelectionOnClick
          autoHeight
          className="border-0"
        />
      </div>
    </div>
  );
};

export default TransactionsPage;
