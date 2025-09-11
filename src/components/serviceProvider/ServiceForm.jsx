"use client"
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Upload,
  DollarSign,
  Clock,
  Tag,
  FileText,
  Star,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
// import { Eye, Edit, Trash2, Zap, ShoppingCart } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ServiceForm = ({ formData, setFormData, onInputChange, onSubmit, isLoading }) => {
  const [imageUploading, setImageUploading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setContainerDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate the perimeter of the rectangle
  const perimeter = 2 * (containerDimensions.width + containerDimensions.height);
  const progressLength = (progress / 100) * perimeter;

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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    setProgress(0);

    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Update overall progress based on file completion
        const baseProgress = (i / files.length) * 100;
        const uploadedImage = await uploadToCloudinary(
          file,
          "services",
          "image",
          (percent) => {
            // Calculate overall progress: completed files + current file progress
            const currentFileProgress = (percent / 100) * (100 / files.length);
            const totalProgress = baseProgress + currentFileProgress;
            setProgress(Math.round(totalProgress));
          }
        );

        uploadedImages.push(uploadedImage);
      }

      const imageUrls = uploadedImages.map((img) => img.url);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));
      onInputChange("images", [...formData.images, ...imageUrls]);
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setImageUploading(false);
      setProgress(0); // Reset to 0 instead of 100
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    onInputChange("images", newImages);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      onInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    onInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addRequirement = () => {
    if (
      newRequirement.trim() &&
      !formData.requirements.includes(newRequirement.trim())
    ) {
      onInputChange("requirements", [
        ...formData.requirements,
        newRequirement.trim(),
      ]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index) => {
    onInputChange(
      "requirements",
      formData.requirements.filter((_, i) => i !== index)
    );
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      onInputChange("features", [...formData.features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    onInputChange(
      "features",
      formData.features.filter((_, i) => i !== index)
    );
  };

  return (
    <form onSubmit={(e) => formData.images ? onSubmit(e) : alert('Wait for image upload')} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="form-label my-2">Service Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              className="form-input"
              placeholder="e.g., Professional House Cleaning"
              required
            />
          </div>
          <div>
            <Label className="form-label my-2">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => onInputChange("category", value)}
              className="form-input"
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Label className="form-label my-2">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            className="form-input"
            rows={4}
            placeholder="Describe your service in detail..."
            required
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Pricing & Duration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="form-label my-2">Price</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => onInputChange("price", e.target.value)}
                className="form-input pl-8"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label className="form-label my-2">Pricing Type</Label>
            <Select
              value={formData.pricingType}
              onChange={(e) => onInputChange("pricingType", e.target.value)}
              className="form-input"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pricing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat Rate</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="form-label my-2">Duration (optional)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                value={formData.duration}
                onChange={(e) => onInputChange("duration", e.target.value)}
                className="form-input pl-8"
                placeholder="e.g., 2 hours"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Service Images
        </h3>

        <div className="space-y-4">
          {/* <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-sm text-gray-600">
              <Label htmlFor="images" className="cursor-pointer">
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  Click to upload
                </span>
                <span> or drag and drop</span>
              </Label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div> */}
          <div
            ref={containerRef}
            className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center overflow-hidden"
          >
            {/* Animated Progress Border */}
            {imageUploading && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}
              >
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <rect
                  x="2"
                  y="2"
                  width={containerDimensions.width-7}
                  height={containerDimensions.height-7}
                  rx="6"
                  ry="6"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="2"
                  strokeDasharray={perimeter}
                  strokeDashoffset={perimeter - progressLength}
                  style={{
                    transition: 'stroke-dashoffset 0.3s ease-in-out',
                    transform: 'rotate(0deg)',
                    transformOrigin: 'center',
                  }}
                />
              </svg>
            )}

            {/* Content */}
            <div className="relative z-10">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                />
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>

              {/* Progress Text */}
              {imageUploading && (
                <p className="absolute botton-5 left-0 right-0 text-xs text-indigo-600 font-medium">
                  Uploading... {progress}%
                </p>
              )}
            </div>
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
      </div>

      {/* Tags */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Tag className="h-5 w-5 mr-2" />
          Tags
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
              className="form-input flex-1"
              placeholder="Add a tag..."
            />
            <Button
              type="button"
              onClick={addTag}
              className="btn btn-outline btn-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
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
      </div>

      {/* Requirements */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Requirements (Optional)
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addRequirement())
              }
              className="form-input flex-1"
              placeholder="Add a requirement..."
            />
            <Button
              type="button"
              onClick={addRequirement}
              className="btn btn-outline btn-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.requirements.length > 0 && (
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
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
      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Service Features (Optional)
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addFeature())
              }
              className="form-input flex-1"
              placeholder="Add a feature..."
            />
            <Button
              type="button"
              onClick={addFeature}
              className="btn btn-outline btn-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.features.length > 0 && (
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          {isLoading ? "Creating Service..." : "Create Service"}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;