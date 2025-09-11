'use client'
import React, { useState, useCallback, useRef } from "react";
import {
  BookOpen,
  DollarSign,
  Globe,
  Tag,
  GraduationCap,
  Upload,
  Trash2,
  Video,
  Check,
  X,
  AlertCircle,
  Plus,
  Image as ImageIcon
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useInstructorStore from "@/store/instructorStore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Jost } from "next/font/google";
const jost = Jost(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)

const CATEGORIES = [
  "Programming", "OS", "Design", "Business", "Marketing", "Data Science",
  "Photography", "Music", "Language", "Health", "Personal Development"
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Other"
];

const LEVELS = [
  "All Levels", "Beginner", "Intermediate", "Advanced"
];

const CreateCoursePage = () => {
  const router = useRouter();
  const { createCourse } = useInstructorStore();
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadState, setUploadState] = useState({
    isDragging: false,
    isUploading: false,
    progress: 0,
    error: null
  });

  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!uploadState.isUploading) {
      setUploadState(prev => ({ ...prev, isDragging: true }));
    }
  }, [uploadState.isUploading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragging: false }));

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));

    if (videoFile) {
      handleFileUpload(videoFile);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file.type.startsWith('video/')) {
      setUploadState(prev => ({ ...prev, error: 'Please select a valid video file' }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null
    }));

    try {
      const uploaded = await uploadToCloudinary(
        file,
        "course-videos",
        "video",
        (progress) => setUploadState(prev => ({ ...prev, progress }))
      );

      console.log('uploaded', uploaded)
      updateFormData("previewVideo", { url: uploaded.url });
      updateFormData("thumbnail", { url: uploaded.thumbnail });

      setUploadState(prev => ({ ...prev, isUploading: false }));
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Upload failed. Please try again.'
      }));
    }
  };

  const removeVideo = () => {
    updateFormData("previewVideo", { url: "" });
    updateFormData("thumbnail", { url: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    learningObjectives: [],
    prerequisites: [],
    targetAudience: [],
    price: 0,
    isFree: false,
    categories: [],
    tags: [],
    level: "All Levels",
    language: "English",
    thumbnail: { url: "" },
    previewVideo: { url: "" },
    content: [{
      sectionTitle: "",
      order: 0,
      lectures: [{ 
        title: "", 
        description: "", 
        videoUrl: "", 
        duration: 0, 
        order: 0,
        isUploading: false,
        uploadProgress: 0,
        uploadError: null,
        isDragging: false
      }]
    }],
  });

  const resetVideo = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: { url: "" },
      previewVideo: { url: "" }
    }));
  };

  // Input states
  const [objectiveInput, setObjectiveInput] = useState("");
  const [targetAudienceInput, setTargetAudienceInput] = useState("");
  const [prerequisiteInput, setPrerequisiteInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  // Validation function - matches backend validation requirements
  const validateForm = () => {
    const newErrors = {};

    // Title validation (10-200 characters, specific pattern)
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title cannot exceed 200 characters";
    } else if (!/^[a-zA-Z0-9\s\-_.,!?()]+$/.test(formData.title)) {
      newErrors.title = "Title contains invalid characters";
    }

    // Description validation (50-5000 characters)
    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    } else if (formData.description.trim().length > 5000) {
      newErrors.description = "Description cannot exceed 5000 characters";
    }

    // Learning objectives validation (1-10 objectives, each 10-200 characters)
    if (formData.learningObjectives.length === 0) {
      newErrors.learningObjectives = "At least one learning objective is required";
    } else if (formData.learningObjectives.length > 10) {
      newErrors.learningObjectives = "Maximum 10 learning objectives allowed";
    } else {
      formData.learningObjectives.forEach((objective, index) => {
        if (objective.trim().length < 10) {
          newErrors[`objective_${index}`] = "Each learning objective must be at least 10 characters";
        } else if (objective.trim().length > 200) {
          newErrors[`objective_${index}`] = "Each learning objective cannot exceed 200 characters";
        }
      });
    }

    // Categories validation (1-5 categories, each 2-50 characters)
    if (formData.categories.length === 0) {
      newErrors.categories = "At least one category is required";
    } else if (formData.categories.length > 5) {
      newErrors.categories = "Maximum 5 categories allowed";
    } else {
      formData.categories.forEach((category, index) => {
        if (category.trim().length < 2) {
          newErrors[`category_${index}`] = "Each category must be at least 2 characters";
        } else if (category.trim().length > 50) {
          newErrors[`category_${index}`] = "Each category cannot exceed 50 characters";
        }
      });
    }

    // Tags validation (max 10 tags, each 2-50 characters)
    if (formData.tags.length > 10) {
      newErrors.tags = "Maximum 10 tags allowed";
    } else {
      formData.tags.forEach((tag, index) => {
        if (tag.trim().length < 2) {
          newErrors[`tag_${index}`] = "Each tag must be at least 2 characters";
        } else if (tag.trim().length > 50) {
          newErrors[`tag_${index}`] = "Each tag cannot exceed 50 characters";
        }
      });
    }

    // Thumbnail validation (required URL)
    if (!formData.thumbnail.url || formData.thumbnail.url.trim().length === 0) {
      newErrors.thumbnail = "Thumbnail URL is required";
    } else {
      try {
        new URL(formData.thumbnail.url);
      } catch {
        newErrors.thumbnail = "Invalid thumbnail URL";
      }
    }

    // Price validation (0-1000)
    if (typeof formData.price !== 'number' || formData.price < 0) {
      newErrors.price = "Price must be a valid number (0 or greater)";
    } else if (formData.price > 1000) {
      newErrors.price = "Price cannot exceed $1000";
    }

    // Free course validation
    if (formData.isFree && formData.price !== 0) {
      newErrors.price = "Price must be 0 for free courses";
    }
    if (!formData.isFree && formData.price <= 0) {
      newErrors.price = "Price must be greater than 0 for paid courses";
    }

    // Level validation
    const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
    if (!validLevels.includes(formData.level)) {
      newErrors.level = "Invalid course level";
    }

    // Language validation
    const validLanguages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Other'];
    if (!validLanguages.includes(formData.language)) {
      newErrors.language = "Invalid language";
    }

    // Content validation (at least one section)
    if (formData.content.length === 0) {
      newErrors.content = "At least one section is required";
    }

    // Validate sections and lectures
    formData.content.forEach((section, sectionIndex) => {
      if (!section.sectionTitle || section.sectionTitle.trim().length === 0) {
        newErrors[`section_${sectionIndex}`] = "Section title is required";
      } else if (section.sectionTitle.trim().length < 5) {
        newErrors[`section_${sectionIndex}`] = "Section title must be at least 5 characters";
      } else if (section.sectionTitle.trim().length > 100) {
        newErrors[`section_${sectionIndex}`] = "Section title cannot exceed 100 characters";
      }

      // Lectures are optional but if present, validate them
      section.lectures.forEach((lecture, lectureIndex) => {
        if (lecture.title && lecture.title.trim().length > 0) {
          if (lecture.title.trim().length < 5) {
            newErrors[`lecture_${sectionIndex}_${lectureIndex}_title`] = "Lecture title must be at least 5 characters";
          } else if (lecture.title.trim().length > 100) {
            newErrors[`lecture_${sectionIndex}_${lectureIndex}_title`] = "Lecture title cannot exceed 100 characters";
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper functions
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addObjective = () => {
    if (objectiveInput.trim()) {
      updateFormData("learningObjectives", [...formData.learningObjectives, objectiveInput.trim()]);
      setObjectiveInput("");
    }
  };

  const removeObjective = (index) => {
    updateFormData("learningObjectives", formData.learningObjectives.filter((_, i) => i !== index));
  };

  const addPrerequisite = () => {
    if (prerequisiteInput.trim()) {
      updateFormData("prerequisites", [...formData.prerequisites, prerequisiteInput.trim()]);
      setPrerequisiteInput("");
    }
  };

  const removePrerequisite = (index) => {
    updateFormData("prerequisites", formData.prerequisites.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      updateFormData("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index) => {
    updateFormData("tags", formData.tags.filter((_, i) => i !== index));
  };

  const addCategory = (category) => {
    if (!formData.categories.includes(category)) {
      updateFormData("categories", [...formData.categories, category]);
    }
  };

  const removeCategory = (category) => {
    updateFormData("categories", formData.categories.filter(c => c !== category));
  };

  const addTargetAudience = () => {
    if (!targetAudienceInput.trim()) return;
    updateFormData("targetAudience", [...formData.targetAudience, targetAudienceInput.trim()]);
    setTargetAudienceInput("");
  };

  const removeTargetAudience = (index) => {
    updateFormData("targetAudience", formData.targetAudience.filter((_, i) => i !== index));
  };

  const addSection = () => {
    const newSection = {
      sectionTitle: "",
      order: formData.content.length,
      lectures: [{ 
        title: "", 
        description: "", 
        videoUrl: "", 
        duration: 0, 
        order: 0,
        isUploading: false,
        uploadProgress: 0,
        uploadError: null,
        isDragging: false
      }]
    };
    updateFormData("content", [...formData.content, newSection]);
  };

  const removeSection = (sectionIndex) => {
    if (formData.content.length > 1) {
      updateFormData("content", formData.content.filter((_, index) => index !== sectionIndex));
    }
  };

  const updateSection = (sectionIndex, field, value) => {
    const updatedContent = [...formData.content];
    updatedContent[sectionIndex][field] = value;
    updateFormData("content", updatedContent);
  };

  const addLecture = (sectionIndex) => {
    const updatedContent = [...formData.content];
    const newLecture = {
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      order: updatedContent[sectionIndex].lectures.length,
      isUploading: false,
      uploadProgress: 0,
      uploadError: null,
      isDragging: false
    };
    updatedContent[sectionIndex].lectures.push(newLecture);
    updateFormData("content", updatedContent);
  };

  const removeLecture = (sectionIndex, lectureIndex) => {
    if (formData.content[sectionIndex].lectures.length > 1) {
      const updatedContent = [...formData.content];
      updatedContent[sectionIndex].lectures = updatedContent[sectionIndex].lectures.filter((_, index) => index !== lectureIndex);
      updateFormData("content", updatedContent);
    }
  };

  const updateLecture = (sectionIndex, lectureIndex, field, value) => {
    const updatedContent = [...formData.content];
    updatedContent[sectionIndex].lectures[lectureIndex][field] = value;
    updateFormData("content", updatedContent);
  };

  const handleLectureVideoUpload = async (file, sectionIndex, lectureIndex) => {
    if (!file.type.startsWith('video/')) {
      updateLecture(sectionIndex, lectureIndex, "uploadError", 'Please select a valid video file');
      return;
    }

    // Update lecture with upload state
    updateLecture(sectionIndex, lectureIndex, "isUploading", true);
    updateLecture(sectionIndex, lectureIndex, "uploadProgress", 0);
    updateLecture(sectionIndex, lectureIndex, "uploadError", null);

    try {
      const uploaded = await uploadToCloudinary(
        file,
        "course-lectures",
        "video",
        (progress) => updateLecture(sectionIndex, lectureIndex, "uploadProgress", progress)
      );

      // Update lecture with video URL
      updateLecture(sectionIndex, lectureIndex, "videoUrl", uploaded.url);
      updateLecture(sectionIndex, lectureIndex, "isUploading", false);
      updateLecture(sectionIndex, lectureIndex, "uploadProgress", 100);
      
      console.log('Lecture video uploaded:', uploaded);
    } catch (error) {
      console.error('Lecture video upload error:', error);
      updateLecture(sectionIndex, lectureIndex, "isUploading", false);
      updateLecture(sectionIndex, lectureIndex, "uploadError", 'Upload failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Create payload matching the exact backend structure
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          learningObjectives: formData.learningObjectives.map(obj => obj.trim()),
          prerequisites: formData.prerequisites.map(prereq => prereq.trim()),
          targetAudience: formData.targetAudience.map(audience => audience.trim()),
          price: Number(formData.price),
          isFree: Boolean(formData.isFree),
          categories: formData.categories.map(cat => cat.trim()),
          tags: formData.tags.map(tag => tag.trim()),
          level: formData.level,
          language: formData.language,
          thumbnail: {
            url: formData.thumbnail.url.trim()
          },
          content: formData.content.map((section, index) => ({
            sectionTitle: section.sectionTitle.trim(),
            order: index,
            lectures: section.lectures
              .filter(lecture => lecture.title.trim().length > 0) // Only include lectures with titles
              .map((lecture, lectureIndex) => ({
                title: lecture.title.trim(),
                description: lecture.description.trim(),
                videoUrl: lecture.videoUrl.trim() || "",
                duration: Number(lecture.duration) || 0,
                order: lectureIndex
              }))
          }))
        };

        // Add preview video only if it exists
        if (formData.previewVideo.url && formData.previewVideo.url.trim().length > 0) {
          payload.previewVideo = {
            url: formData.previewVideo.url.trim()
          };
        }

        // Remove empty arrays to match backend expectations
        if (payload.prerequisites.length === 0) {
          delete payload.prerequisites;
        }
        if (payload.targetAudience.length === 0) {
          delete payload.targetAudience;
        }
        if (payload.tags.length === 0) {
          delete payload.tags;
        }

        console.log("Course payload:", payload);
        
        // Call the createCourse method from the store
        const result = await createCourse(payload, router);
        
        if (result.success) {
          console.log("Course created successfully:", result.course);
        } else {
          console.error("Course creation failed:", result.message);
        }
      } catch (error) {
        console.error("Error creating course:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("Validation failed. Please fix the errors before submitting.");
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            Create a New Course
          </h1>
          <p className={"text-gray-600 text-base " + jost.className}>
            Share your knowledge and inspire learners worldwide
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Course Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Complete Web Development Bootcamp"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Course Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Describe what students will learn and why this course is valuable..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <Label className="block text-sm font-medium mb-2">Target Audience (Optional)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={targetAudienceInput}
                    onChange={(e) => setTargetAudienceInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetAudience())}
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Who is this course designed for?"
                  />
                  <Button
                    type="button"
                    onClick={addTargetAudience}
                    className="px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.targetAudience.map((audience, index) => (
                    <span
                      key={index}
                      onClick={() => removeTargetAudience(index)}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                    >
                      {audience} ×
                    </span>
                  ))}
                </div>
                {errors.targetAudience && (
                  <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>
                )}
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Learning Objectives</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                value={objectiveInput}
                onChange={(e) => setObjectiveInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a learning objective..."
              />
              <Button
                type="button"
                onClick={addObjective}
                className="px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex flex-col">
                  <span
                    onClick={() => removeObjective(index)}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-green-200 ${
                      errors[`objective_${index}`] 
                        ? "bg-red-100 text-red-800 border border-red-300" 
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {objective} ×
                  </span>
                  {errors[`objective_${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`objective_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>
            {errors.learningObjectives && (
              <p className="text-red-500 text-sm mt-1">{errors.learningObjectives}</p>
            )}
          </div>

          {/* Prerequisites */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Prerequisites (Optional)</h2>

            <div className="flex gap-2 mb-4">
              <Input
                value={prerequisiteInput}
                onChange={(e) => setPrerequisiteInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a prerequisite..."
              />
              <Button
                type="button"
                onClick={addPrerequisite}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.prerequisites.map((prerequisite, index) => (
                <span
                  key={index}
                  onClick={() => removePrerequisite(index)}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-gray-200 border"
                >
                  {prerequisite} ×
                </span>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Pricing</h2>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
              <div>
                <div className="font-medium">Free Course</div>
                <div className="text-sm text-gray-600">Make this course available for free</div>
              </div>
              <Label className="relative inline-flex items-center cursor-pointer">
                <Input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => {
                    const isFree = e.target.checked;
                    updateFormData("isFree", isFree);
                    if (isFree) {
                      updateFormData("price", 0);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </Label>
            </div>

            {!formData.isFree &&
              <div>
                <Label className="block text-sm font-medium mb-2">Price (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => updateFormData("price", parseFloat(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0 for free, or enter price"
                  min="0"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Enter 0 for free courses, or set your course price
                </p>
              </div>}
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-semibold">Categories</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    formData.categories.includes(category)
                      ? removeCategory(category)
                      : addCategory(category)
                  }
                  className={`p-2 rounded-md text-sm font-medium transition-colors ${formData.categories.includes(category)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {errors.categories && (
              <p className="text-red-500 text-sm">{errors.categories}</p>
            )}
            {formData.categories.map((category, index) => (
              errors[`category_${index}`] && (
                <p key={index} className="text-red-500 text-xs mt-1">{errors[`category_${index}`]}</p>
              )
            ))}

            {/* Tags */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Tags</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add custom tags..."
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex flex-col">
                    <span
                      onClick={() => removeTag(index)}
                      className={`px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-orange-200 border ${
                        errors[`tag_${index}`] 
                          ? "bg-red-100 text-red-800 border-red-300" 
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {tag} ×
                    </span>
                    {errors[`tag_${index}`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`tag_${index}`]}</p>
                    )}
                  </div>
                ))}
              </div>
              {errors.tags && (
                <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
              )}
            </div>
          </div>

          {/* Course Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-semibold">Course Details</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Difficulty Level</Label>
                <select
                  value={formData.level}
                  onChange={(e) => updateFormData("level", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.level && (
                  <p className="text-red-500 text-sm mt-1">{errors.level}</p>
                )}
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Language</Label>
                <select
                  value={formData.language}
                  onChange={(e) => updateFormData("language", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {LANGUAGES.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <p className="text-red-500 text-sm mt-1">{errors.language}</p>
                )}
              </div>
            </div>
          </div>

          <Card className="bg-gradient-upload border-upload-border shadow-soft">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Course Media</h2>
                  <p className="text-sm text-muted-foreground">Upload your course thumbnail and preview video</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Thumbnail URL Input */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="h-4 w-4" />
                    Thumbnail Image URL
                  </Label>
                  <Input
                    value={formData.thumbnail.url}
                    onChange={(e) => updateFormData("thumbnail", { url: e.target.value })}
                    className="transition-smooth focus:ring-2 focus:ring-primary/20"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                  {errors.thumbnail && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.thumbnail}
                    </div>
                  )}
                </div>

                {/* Video Upload Section */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Video className="h-4 w-4" />
                    Preview Video
                  </Label>

                  {!formData.previewVideo.url ? (
                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-lg transition-all duration-300",
                        uploadState.isDragging
                          ? "border-upload-active bg-upload-hover scale-[1.02]"
                          : "border-upload-border bg-upload-bg hover:bg-upload-hover",
                        uploadState.isUploading && "pointer-events-none"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="p-8 text-center">
                        {uploadState.isUploading ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 animate-upload-pulse">
                              <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Uploading video...</p>
                              <Progress value={uploadState.progress} className="w-full max-w-xs mx-auto" />
                              <p className="text-xs text-muted-foreground">{Math.round(uploadState.progress)}% complete</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10 transition-bounce">
                              <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-base font-medium">
                                {uploadState.isDragging ? "Drop your video here" : "Drag & drop your video"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                or{" "}
                                <Button
                                  variant="link"
                                  className="p-0 h-auto font-medium text-primary"
                                  onClick={() => fileInputRef.current?.click()}
                                >
                                  browse files
                                </Button>
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                MP4, MOV, AVI up to 100MB
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadState.isUploading}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4 animate-slide-up">
                      <div className="relative rounded-lg overflow-hidden border border-upload-border shadow-soft">
                        <video
                          controls
                          className="w-full h-auto max-h-64 bg-muted"
                          src={formData.previewVideo.url}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                          onClick={removeVideo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                        <Check className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success-foreground">
                          Video uploaded successfully!
                        </span>
                      </div>
                    </div>
                  )}

                  {uploadState.error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive">{uploadState.error}</span>
                    </div>
                  )}

                  {errors.previewVideo && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.previewVideo}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Course Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Video className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold">Course Content</h2>
            </div>

            {formData.content.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">Section {sectionIndex + 1}</h4>
                  {formData.content.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <Label className="block text-sm font-medium mb-2">Section Title</Label>
                  <Input
                    value={section.sectionTitle}
                    onChange={(e) => updateSection(sectionIndex, "sectionTitle", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Introduction to React"
                  />
                  {errors[`section_${sectionIndex}`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`section_${sectionIndex}`]}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Lectures</span>
                    <button
                      type="button"
                      onClick={() => addLecture(sectionIndex)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3" />
                      Add Lecture
                    </button>
                  </div>

                  {section.lectures.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className="border rounded p-3 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Lecture {lectureIndex + 1}</span>
                        {section.lectures.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLecture(sectionIndex, lectureIndex)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label className="block text-xs font-medium mb-1">Lecture Title</Label>
                          <Input
                            value={lecture.title}
                            onChange={(e) => updateLecture(sectionIndex, lectureIndex, "title", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Lecture title"
                          />
                          {errors[`lecture_${sectionIndex}_${lectureIndex}_title`] && (
                            <p className="text-red-500 text-xs mt-1">{errors[`lecture_${sectionIndex}_${lectureIndex}_title`]}</p>
                          )}
                        </div>
                        <div>
                          <Label className="block text-xs font-medium mb-1">Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={lecture.duration}
                            onChange={(e) => updateLecture(sectionIndex, lectureIndex, "duration", parseInt(e.target.value) || 0)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="30"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <Label className="block text-xs font-medium mb-1">Description</Label>
                        <Textarea
                          value={lecture.description}
                          onChange={(e) => updateLecture(sectionIndex, lectureIndex, "description", e.target.value)}
                          rows={2}
                          className="w-full p-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe what students will learn..."
                        />
                        {errors[`lecture_${sectionIndex}_${lectureIndex}_description`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`lecture_${sectionIndex}_${lectureIndex}_description`]}</p>
                        )}
                      </div>
                      <div>
                        <Label className="block text-xs font-medium mb-1">Lecture Video</Label>
                        {lecture.videoUrl ? (
                          <div className="space-y-2">
                            <div className="relative rounded-lg overflow-hidden border border-gray-300">
                              <video
                                controls
                                className="w-full h-auto max-h-32 bg-gray-100"
                                src={lecture.videoUrl}
                              />
                              <Button
                                variant="secondary"
                                size="sm"
                                className="absolute top-2 right-2 h-6 w-6 p-0 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                                onClick={() => updateLecture(sectionIndex, lectureIndex, "videoUrl", "")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
                              <Check className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-medium text-green-700">
                                Video uploaded successfully!
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`relative border-2 border-dashed rounded-lg transition-all duration-300 ${
                              lecture.isUploading
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                            }`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (!lecture.isUploading) {
                                updateLecture(sectionIndex, lectureIndex, "isDragging", true);
                              }
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              updateLecture(sectionIndex, lectureIndex, "isDragging", false);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              updateLecture(sectionIndex, lectureIndex, "isDragging", false);
                              const files = Array.from(e.dataTransfer.files);
                              const videoFile = files.find(file => file.type.startsWith('video/'));
                              if (videoFile) {
                                handleLectureVideoUpload(videoFile, sectionIndex, lectureIndex);
                              }
                            }}
                          >
                            <div className="p-4 text-center">
                              {lecture.isUploading ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-blue-100">
                                    <Upload className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium">Uploading video...</p>
                                    <Progress value={lecture.uploadProgress || 0} className="w-full max-w-xs mx-auto h-1" />
                                    <p className="text-xs text-gray-600">{Math.round(lecture.uploadProgress || 0)}% complete</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-full bg-gray-100">
                                    <Video className="h-4 w-4 text-gray-600" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium">
                                      {lecture.isDragging ? "Drop your video here" : "Drag & drop your video"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      or{" "}
                                      <Button
                                        variant="link"
                                        className="p-0 h-auto font-medium text-blue-600 text-xs"
                                        onClick={() => {
                                          const input = document.createElement('input');
                                          input.type = 'file';
                                          input.accept = 'video/*';
                                          input.onchange = (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleLectureVideoUpload(file, sectionIndex, lectureIndex);
                                          };
                                          input.click();
                                        }}
                                      >
                                        browse files
                                      </Button>
                                    </p>
                                    <Badge variant="secondary" className="text-xs">
                                      MP4, MOV, AVI up to 50MB
                                    </Badge>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {lecture.uploadError && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 mt-2">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span className="text-xs text-red-700">{lecture.uploadError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addSection}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">{errors.content}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCoursePage;