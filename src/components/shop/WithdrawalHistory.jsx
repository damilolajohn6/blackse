"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Pagination,
  Modal,
  Box,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Download, Visibility } from "@mui/icons-material";
import { format } from "date-fns";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const WithdrawalHistory = () => {
  const { seller, sellerToken, isSeller, isLoading } = useAuthStore();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [isFetching, setIsFetching] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const limit = 10;

  useEffect(() => {
    if (!isLoading && !isSeller) {
      toast.error("Please log in as a seller");
      router.push("/shop/login");
    }
  }, [isSeller, isLoading, router]);

  const fetchWithdrawals = async () => {
    if (!seller || !sellerToken) return;
    setIsFetching(true);
    try {
      const params = {
        page,
        limit,
        sortBy,
        order,
        ...filters,
      };
      const { data } = await axios.get(
        `${API_BASE_URL}/withdraw/get-my-withdrawals`,
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
          params,
          withCredentials: true,
        }
      );
      setWithdrawals(data.withdrawals || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch withdrawals";
      console.error("get-my-withdrawals error:", {
        message: errorMessage,
        status: error.response?.status,
      });
      toast.error(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [page, sortBy, order, filters, seller, sellerToken]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleSort = (field) => {
    setSortBy(field);
    setOrder(order === "desc" ? "asc" : "desc");
    setPage(1);
  };

  const handleExport = () => {
    const csvRows = [
      ["ID", "Amount", "Method", "Status", "Created At", "Processed At"],
      ...withdrawals.map((w) => [
        w._id,
        `$${w.amount.toFixed(2)}`,
        w.withdrawMethod.type,
        w.status,
        format(new Date(w.createdAt), "yyyy-MM-dd"),
        w.processedAt ? format(new Date(w.processedAt), "yyyy-MM-dd") : "",
      ]),
    ];
    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `withdrawal_history_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="w-full p-6 md:p-8">
      <Typography variant="h4" className="font-semibold mb-6">
        Withdrawal History
      </Typography>
      <Paper className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <FormControl className="w-full md:w-1/4">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Succeeded">Succeeded</MenuItem>
              <MenuItem value="Failed">Failed</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            className="w-full md:w-1/4"
          />
          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            className="w-full md:w-1/4"
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleExport}
            startIcon={<Download />}
            disabled={withdrawals.length === 0}
            className="w-full md:w-auto"
          >
            Export CSV
          </Button>
        </div>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort("id")}
                className="cursor-pointer"
              >
                ID {sortBy === "id" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                onClick={() => handleSort("amount")}
                className="cursor-pointer"
              >
                Amount {sortBy === "amount" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell>Method</TableCell>
              <TableCell
                onClick={() => handleSort("status")}
                className="cursor-pointer"
              >
                Status {sortBy === "status" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell
                onClick={() => handleSort("createdAt")}
                className="cursor-pointer"
              >
                Created At{" "}
                {sortBy === "createdAt" && (order === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell>Processed At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : withdrawals.length > 0 ? (
              withdrawals.map((withdraw) => (
                <TableRow key={withdraw._id}>
                  <TableCell>{withdraw._id}</TableCell>
                  <TableCell>${withdraw.amount.toFixed(2)}</TableCell>
                  <TableCell>{withdraw.withdrawMethod.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={withdraw.status}
                      color={
                        withdraw.status === "Succeeded"
                          ? "success"
                          : withdraw.status === "Failed" ||
                            withdraw.status === "Rejected"
                          ? "error"
                          : withdraw.status === "Approved"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(withdraw.createdAt), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell>
                    {withdraw.processedAt
                      ? format(
                          new Date(withdraw.processedAt),
                          "yyyy-MM-dd HH:mm"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => setSelectedWithdrawal(withdraw)}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No withdrawals found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      {pages > 1 && (
        <Pagination
          count={pages}
          page={page}
          onChange={(e, value) => setPage(value)}
          className="mt-4 flex justify-center"
        />
      )}
      <Modal
        open={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        aria-labelledby="withdrawal-details-modal"
      >
        <Box sx={modalStyle}>
          <Typography
            id="withdrawal-details-modal"
            variant="h6"
            className="mb-4"
          >
            Withdrawal Details
          </Typography>
          {selectedWithdrawal && (
            <div className="space-y-2">
              <Typography>
                <strong>ID:</strong> {selectedWithdrawal._id}
              </Typography>
              <Typography>
                <strong>Amount:</strong> ${selectedWithdrawal.amount.toFixed(2)}
              </Typography>
              <Typography>
                <strong>Method:</strong>{" "}
                {selectedWithdrawal.withdrawMethod.type}
              </Typography>
              <Typography>
                <strong>Method Details:</strong>{" "}
                {Object.entries(selectedWithdrawal.withdrawMethod.details)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(", ")}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selectedWithdrawal.status}
              </Typography>
              <Typography>
                <strong>Created At:</strong>{" "}
                {format(
                  new Date(selectedWithdrawal.createdAt),
                  "yyyy-MM-dd HH:mm"
                )}
              </Typography>
              <Typography>
                <strong>Processed At:</strong>{" "}
                {selectedWithdrawal.processedAt
                  ? format(
                      new Date(selectedWithdrawal.processedAt),
                      "yyyy-MM-dd HH:mm"
                    )
                  : "-"}
              </Typography>
              <Typography>
                <strong>Status History:</strong>
                <ul className="list-disc pl-5">
                  {selectedWithdrawal.statusHistory.map((entry, index) => (
                    <li key={index}>
                      {entry.status} on{" "}
                      {format(new Date(entry.updatedAt), "yyyy-MM-dd HH:mm")}
                      {entry.reason && ` - ${entry.reason}`}
                    </li>
                  ))}
                </ul>
              </Typography>
            </div>
          )}
          <Button
            variant="contained"
            onClick={() => setSelectedWithdrawal(null)}
            className="mt-4"
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default WithdrawalHistory;
