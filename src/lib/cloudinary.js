// export const uploadToCloudinary = async (
//   file,
//   folder = "service-providers",
//   resourceType = "image",
//   onProgress,
// ) => {
//   if (!file) throw new Error("No file provided");

//   // Validate file type
//   const allowedTypes = {
//     image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
//     video: ["video/mp4", "video/mov", "video/avi", "video/wmv"],
//   };

//   if (!allowedTypes[resourceType].includes(file.type)) {
//     throw new Error(
//       `Invalid file type. Allowed types: ${allowedTypes[resourceType].join(
//         ", "
//       )}`
//     );
//   }

//   // Validate file size (max 10MB for images, 50MB for videos)
//   const maxSize =
//     resourceType === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
//   if (file.size > maxSize) {
//     throw new Error(
//       `File size too large. Max size: ${maxSize / (1024 * 1024)}MB`
//     );
//   }

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append(
//     "upload_preset",
//     process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
//   );
//   formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
//   formData.append("folder", folder);
//   formData.append("resource_type", resourceType);

//   try {
//     const response = await fetch(
//       `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
//       {
//         method: "POST",
//         body: formData,
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error?.message || "Upload failed");
//     }

//     if (!data.secure_url) {
//       throw new Error("Upload failed - no URL returned");
//     }

//     return {
//       url: data.secure_url,
//       public_id: data.public_id,
//       resource_type: data.resource_type,
//       format: data.format,
//       width: data.width,
//       height: data.height,
//       bytes: data.bytes,
//     };
//   } catch (error) {
//     console.error("Cloudinary upload error:", error);
//     throw error;
//   }
// };

export const uploadToCloudinary = (
  file,
  folder = "service-providers",
  resourceType = "image",
  onProgress
) => {
  if (!file) throw new Error("No file provided");

  // Validate file type
  const allowedTypes = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/mov", "video/avi", "video/wmv"],
  };

  if (!allowedTypes[resourceType].includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes[resourceType].join(", ")}`
    );
  }

  // Validate file size (max 10MB for images, 50MB for videos)
  const maxSize = resourceType === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(
      `File size too large. Max size: ${maxSize / (1024 * 1024)}MB`
    );
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`
    );

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && typeof onProgress === "function") {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          
          const result = {
            url: data.secure_url,
            public_id: data.public_id,
            resource_type: data.resource_type,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
          };

          // If it's a video, add thumbnail URL
          if (data.resource_type === "video") {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            result.thumbnail = `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${data.public_id}.jpg`;
          }

          resolve(result);
        } catch (parseError) {
          console.log(parseError);
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timeout"));

    // Set timeout (optional)
    xhr.timeout = 60000; // 60 seconds

    xhr.send(formData);
  });
};

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};
