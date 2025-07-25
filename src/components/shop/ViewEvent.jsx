"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import useShopStore from "@/store/shopStore";
import useEventStore from "@/store/eventStore";
import { toast } from "react-toastify";
import {
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";

const ViewEvent = () => {
  const { seller, isSeller, sellerToken } = useShopStore();
  const { currentEvent, isLoading, error, fetchEvent, deleteEvent } =
    useEventStore();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in as a seller", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    const fetchData = async () => {
      try {
        await fetchEvent(id, sellerToken);
      } catch (err) {
        // Error handled by useEventStore
      }
    };

    fetchData();
  }, [id, isSeller, seller, sellerToken, fetchEvent, router]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id, sellerToken);
        router.push("/shop/event");
      } catch (err) {
        // Error handled by useEventStore
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress size={30} className="mr-2" />
        <Typography>Loading event...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <Typography variant="h6">{error}</Typography>
        <Button
          onClick={() => fetchEvent(id, sellerToken)}
          variant="contained"
          color="primary"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="text-center text-gray-600">
        <Typography variant="h6">Event not found</Typography>
        <Link href="/shop/event">
          <Button variant="contained" color="primary" className="mt-4">
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-semibold text-gray-900">
          {currentEvent.name}
        </Typography>
        <div className="space-x-2">
          <Link href={`/shop/event/edit-event/${id}`}>
            <Button variant="outlined" startIcon={<AiOutlineEdit />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="outlined"
            color="error"
            startIcon={<AiOutlineDelete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Link href="/shop/event">
            <Button variant="contained" color="primary">
              Back to Events
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Event Details
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong> {currentEvent.description}
              </Typography>
              <Typography variant="body1">
                <strong>Category:</strong> {currentEvent.category}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={currentEvent.status}
                  color={
                    currentEvent.status === "Running"
                      ? "success"
                      : currentEvent.status === "Completed"
                      ? "primary"
                      : "error"
                  }
                  size="small"
                />
              </Typography>
              <Typography variant="body1">
                <strong>Start Date:</strong>{" "}
                {new Date(currentEvent.start_Date).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>End Date:</strong>{" "}
                {new Date(currentEvent.Finish_Date).toLocaleString()}
              </Typography>
              <Typography variant="body1">
                <strong>Price:</strong> ${currentEvent.discountPrice.toFixed(2)}
                {currentEvent.originalPrice && (
                  <span className="text-gray-500 line-through ml-2">
                    ${currentEvent.originalPrice.toFixed(2)}
                  </span>
                )}
              </Typography>
              <Typography variant="body1">
                <strong>Stock:</strong> {currentEvent.stock}
              </Typography>
              <Typography variant="body1">
                <strong>Sold:</strong> {currentEvent.sold_out}
              </Typography>
              <Typography variant="body1">
                <strong>Tags:</strong>{" "}
                {currentEvent.tags.length > 0
                  ? currentEvent.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        className="mr-1"
                      />
                    ))
                  : "None"}
              </Typography>
              <Typography variant="body1">
                <strong>Shop:</strong> {currentEvent.shop.name} (
                {currentEvent.shop.email})
              </Typography>
              <Typography variant="body1">
                <strong>Created At:</strong>{" "}
                {new Date(currentEvent.createdAt).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                {currentEvent.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`Event image ${index + 1}`}
                    className="w-full h-40 object-cover rounded"
                  />
                ))}
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewEvent;
