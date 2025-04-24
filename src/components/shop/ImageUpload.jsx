"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

const ImageUpload = ({ images, onAddImage, onRemoveImage }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = (result) => {
    if (result.event === "success") {
      onAddImage({
        url: result.info.secure_url,
        public_id: result.info.public_id,
      });
    }
    setIsUploading(false);
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.map((img, index) => (
          <div key={img.url} className="relative group">
            <Image
              src={img.url}
              alt={`Preview ${index}`}
              width={200}
              height={200}
              className="w-full h-32 object-cover rounded-md border border-gray-200"
            />
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <CldUploadWidget
        uploadPreset="gdmugccy"
        onOpen={() => setIsUploading(true)}
        onUpload={onUpload}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => {
              if (images.length >= 5) {
                alert("Maximum 5 images allowed");
                return;
              }
              open();
            }}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
