"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useShopStore from "@/store/shopStore";
import useEventStore from "@/store/eventStore";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { Button, CircularProgress } from "@mui/material";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineEye } from "react-icons/ai";
import { MdPublish } from "react-icons/md";

const EventList = () => {
  const { seller, isSeller, sellerToken } = useShopStore();
  const { events, isLoading, error, fetchShopEvents, deleteEvent, publishEvent } =
    useEventStore();
  const router = useRouter();

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in to view events", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    const fetchData = async () => {
      try {
        await fetchShopEvents(seller._id, sellerToken);
      } catch (err) {
        // Error handled by useEventStore
      }
    };

    fetchData();
  }, [seller?._id, isSeller, sellerToken, router, fetchShopEvents]);

  const handleDelete = async (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId, sellerToken);
      } catch (err) {
        // Error handled by useEventStore
      }
    }
  };

  const handlePublish = async (eventId) => {
    if (confirm("Are you sure you want to publish this event? Once published, it will be visible to the public.")) {
      try {
        await publishEvent(eventId, sellerToken);
        // Refresh the events list to show updated status
        await fetchShopEvents(seller._id, sellerToken);
      } catch (err) {
        // Error handled by useEventStore
      }
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Event Name",
      minWidth: 200,
      flex: 1,
      renderCell: (params) => (
        <Link
          href={`/shop/event/${params.id}`}
          className="text-blue-600 hover:underline"
        >
          {params.value || "Untitled Event"}
        </Link>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      minWidth: 120,
      flex: 0.5,
      renderCell: (params) => params.value || "N/A",
    },
    {
      field: "start_Date",
      headerName: "Start Date",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => {
        if (!params.value) return "N/A";
        try {
          return new Date(params.value).toLocaleString();
        } catch (error) {
          return "Invalid Date";
        }
      },
    },
    {
      field: "Finish_Date",
      headerName: "End Date",
      minWidth: 150,
      flex: 0.7,
      renderCell: (params) => {
        if (!params.value) return "N/A";
        try {
          return new Date(params.value).toLocaleString();
        } catch (error) {
          return "Invalid Date";
        }
      },
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      flex: 0.5,
      renderCell: (params) => {
        const status = params.value || "Draft";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === "Running" || status === "Published"
                ? "bg-green-100 text-green-600"
                : status === "Completed"
                ? "bg-blue-100 text-blue-600"
                : status === "Cancelled"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      field: "price",
      headerName: "Price",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => {
        if (params.value === null || params.value === undefined) return "N/A";
        try {
          return `$${Number(params.value).toFixed(2)}`;
        } catch (error) {
          return "N/A";
        }
      },
    },
    {
      field: "stock",
      headerName: "Stock",
      minWidth: 100,
      flex: 0.5,
      renderCell: (params) => {
        if (params.value === null || params.value === undefined) return "N/A";
        return params.value;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => {
        const eventStatus = params.row.status || "Draft";
        const canPublish = eventStatus === "Draft";
        
        return (
          <div className="flex space-x-2">
            <Link href={`/shop/event/${params.id}`}>
              <Button 
                variant="outlined" 
                size="small"
                title="View Event"
              >
                <AiOutlineEye size={20} />
              </Button>
            </Link>
            <Link href={`/shop/event/edit-event/${params.id}`}>
              <Button 
                variant="outlined" 
                size="small"
                title="Edit Event"
              >
                <AiOutlineEdit size={20} />
              </Button>
            </Link>
            {canPublish && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handlePublish(params.id)}
                title="Publish Event"
              >
                <MdPublish size={20} />
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDelete(params.id)}
              title="Delete Event"
            >
              <AiOutlineDelete size={20} />
            </Button>
          </div>
        );
      },
    },
  ];

  const rows = (events || []).map((event) => {
    // Debug logging to help identify data structure issues
    if (process.env.NODE_ENV === 'development') {
      console.log('Event data:', event);
    }
    
    return {
      id: event._id,
      name: event.name || "Untitled Event",
      category: event.category || "N/A",
      start_Date: event.start_Date,
      Finish_Date: event.Finish_Date,
      status: event.status || "Draft",
      price: event.discountPrice || event.originalPrice || 0,
      stock: event.stock || 0,
    };
  });

  return (
    <div className="w-full p-6 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-900">Shop Events</h3>
        <Link
          href="/shop/event/create"
          className="text-blue-600 hover:underline text-sm"
        >
          Create New Event
        </Link>
      </div>
      {isLoading ? (
        <div className="text-center text-gray-600 flex items-center justify-center h-64">
          <CircularProgress size={30} className="mr-2" />
          Loading events...
        </div>
      ) : error ? (
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button
            onClick={() => fetchShopEvents(seller._id, sellerToken)}
            variant="contained"
            color="primary"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No events found. Create your first event!</p>
          <Link href="/shop/event/create">
            <Button variant="contained" color="primary" className="mt-4">
              Create Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 20, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            disableRowSelectionOnClick
            autoHeight
            className="border-0"
          />
        </div>
      )}
    </div>
  );
};

export default EventList;
