import { useState, useEffect } from "react";
import {
  X,
  Save,
  DollarSign,
  Clock,
  Tag,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import useServiceProviderStore from "@/store/serviceStore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-toastify";

const ServiceModal = ({ service, onClose }) => {
  const { addService, updateService, isLoading } = useServiceProviderStore();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    pricingType: "flat",
    duration: "",
    category: "",
    tags: [],
    images: [],
    requirements: [],
    features: [],
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newFeature, setNewFeature] = useState("");

  const serviceCategories = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Cleaning",
    "Gardening",
    "HVAC",
    "Painting",
    "Appliance Repair",
    "Handyman",
    "Moving",
    "Pet Care",
    "Tutoring",
    "Personal Training",
    "Beauty Services",
    "Automotive",
    "Computer Repair",
    "Photography",
    "Catering",
    "Event Planning",
    "Other",
  ];

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        pricingType: service.pricingType || "flat",
        duration: service.duration || "",
        category: service.category || "",
        tags: service.tags || [],
        images: service.images || [],
        requirements: service.requirements || [],
        features: service.features || [],
      });
    }
  }, [service]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadToCloudinary(file, "services")
      );
      const uploadedImages = await Promise.all(uploadPromises);

      const imageUrls = uploadedImages.map((img) => img.url);
      handleInputChange("images", [...formData.images, ...imageUrls]);
      toast.success("Images uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange("images", newImages);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addRequirement = () => {
    if (
      newRequirement.trim() &&
      !formData.requirements.includes(newRequirement.trim())
    ) {
      handleInputChange("requirements", [
        ...formData.requirements,
        newRequirement.trim(),
      ]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index) => {
    handleInputChange(
      "requirements",
      formData.requirements.filter((_, i) => i !== index)
    );
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      handleInputChange("features", [...formData.features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    handleInputChange(
      "features",
      formData.features.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (service) {
        await updateService(service._id, serviceData);
        toast.success("Service updated successfully!");
      } else {
        await addService(serviceData);
        toast.success("Service created successfully!");
      }

      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save service");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative transform transition-all">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {service ? "Edit Service" : "Add New Service"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Service Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="form-input"
                    placeholder="e.g., Professional House Cleaning"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="form-input"
                    required
                  >
                    <option value="">Select a category</option>
                    {serviceCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="form-input"
                  rows={3}
                  placeholder="Describe your service in detail..."
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Pricing & Duration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Price *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      className="form-input pl-8"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Pricing Type *</label>
                  <select
                    value={formData.pricingType}
                    onChange={(e) =>
                      handleInputChange("pricingType", e.target.value)
                    }
                    className="form-input"
                  >
                    <option value="flat">Flat Rate</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Duration</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) =>
                        handleInputChange("duration", e.target.value)
                      }
                      className="form-input pl-8"
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Service Images
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="images" className="cursor-pointer">
                    <span className="font-medium text-indigo-600 hover:text-indigo-500">
                      Click to upload
                    </span>
                    <span> or drag and drop</span>
                  </label>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={imageUploading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Service image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tags</h3>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="form-input flex-1"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-indigo-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Service Features
              </h3>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                  className="form-input flex-1"
                  placeholder="Add a feature..."
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.features.length > 0 && (
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Requirements
              </h3>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addRequirement())
                  }
                  className="form-input flex-1"
                  placeholder="Add a requirement..."
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="btn btn-outline btn-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {formData.requirements.length > 0 && (
                <div className="space-y-2">
                  {formData.requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm">{requirement}</span>
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading
                  ? "Saving..."
                  : service
                  ? "Update Service"
                  : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
