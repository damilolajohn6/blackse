"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useShopStore from "@/store/shopStore";
import useEventStore from "@/store/eventStore";
import { toast } from "react-toastify";
import { TextField, Button, MenuItem, CircularProgress } from "@mui/material";
import { AiOutlineUpload } from "react-icons/ai";

const categories = [
  "Concert",
  "Workshop",
  "Festival",
  "Seminar",
  "Sale",
  "Other",
];

const EditEvent = () => {
  const { seller, sellerToken, isSeller } = useShopStore();
  const { events, updateEvent, isLoading } = useEventStore();
  const router = useRouter();
  const { id } = useParams();

  const event = events.find((e) => e._id === id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    start_Date: "",
    Finish_Date: "",
    discountPrice: "",
    stock: "",
    tags: "",
    originalPrice: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in as a seller");
      router.push("/shop/login");
      return;
    }

    if (!event) {
      toast.error("Event not found");
      router.push("/shop/event");
      return;
    }

    setFormData({
      name: event.name,
      description: event.description,
      category: event.category,
      start_Date: new Date(event.start_Date).toISOString().slice(0, 16),
      Finish_Date: new Date(event.Finish_Date).toISOString().slice(0, 16),
      discountPrice: event.discountPrice,
      stock: event.stock,
      tags: event.tags.join(", "),
      originalPrice: event.originalPrice || "",
    });
    setImagePreviews(event.images.map((img) => img.url));
  }, [event, isSeller, seller, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);
        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSeller || !seller?._id) {
      toast.error("Please log in as a seller");
      router.push("/shop/login");
      return;
    }

    try {
      const eventData = {
        ...formData,
        shopId: seller._id,
        images: images.length > 0 ? images : undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim)
          : [],
        originalPrice: formData.originalPrice
          ? Number(formData.originalPrice)
          : undefined,
        discountPrice: Number(formData.discountPrice),
        stock: Number(formData.stock),
      };

      await updateEvent(id, eventData, sellerToken);
      router.push("/shop/event");
    } catch (error) {
      // Error handled by useEventStore
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8">
      <h3 className="text-2xl font-semibold text-gray-900 pb-4">Edit Event</h3>
      {event ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            fullWidth
            label="Event Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            multiline
            rows={4}
            variant="outlined"
          />
          <TextField
            fullWidth
            select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            variant="outlined"
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Start Date"
            name="start_Date"
            type="datetime-local"
            value={formData.start_Date}
            onChange={handleInputChange}
            required
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="End Date"
            name="Finish_Date"
            type="datetime-local"
            value={formData.Finish_Date}
            onChange={handleInputChange}
            required
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Discount Price"
            name="discountPrice"
            type="number"
            value={formData.discountPrice}
            onChange={handleInputChange}
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Original Price (Optional)"
            name="originalPrice"
            type="number"
            value={formData.originalPrice}
            onChange={handleInputChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleInputChange}
            required
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            variant="outlined"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Images (Max 5)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <AiOutlineUpload className="mr-2" />
                Upload New Images
              </label>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded"
                />
              ))}
            </div>
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? "Updating..." : "Update Event"}
          </Button>
        </form>
      ) : (
        <div className="text-center text-gray-600">Loading event...</div>
      )}
    </div>
  );
};

export default EditEvent;
