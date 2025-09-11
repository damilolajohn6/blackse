"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import useInstructorStore from "@/store/instructorStore"; 

import {
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  LinearProgress,
  Autocomplete,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import {
  Add,
  Delete,
  VideoLibrary,
  DragHandle,
  ExpandMore,
  Save,
  Warning,
} from "@mui/icons-material";

import { Editor } from "@tinymce/tinymce-react";
import debounce from "lodash/debounce";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Poppins, Jost } from "next/font/google";

import {
  Plus,
  Trash2,
  Upload,
  CheckCircle, 
  FileImage,
  Video,
  ChevronLeft,
  ChevronRight,
  // Save
  AlertTriangle,
} from "lucide-react"

const poppins = Poppins(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)
const jost = Jost(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const textStyles = {
  h4: {
    fontSize: { xs: "1.5rem", sm: "2rem" },
    fontWeight: 700,
    lineHeight: 1.2,
    mb: 2,
  },
  h6: {
    fontSize: { xs: "1rem", sm: "1.25rem" },
    fontWeight: 600,
    lineHeight: 1.4,
    mb: 1,
  },
  body2: {
    fontSize: { xs: "0.875rem", sm: "1rem" },
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.66 },
};

// Memoized SortableLecture component
const SortableLecture = React.memo(
  ({
    lecture,
    index,
    sectionIndex,
    removeLecture,
    control,
    setValue,
    watch,
    errors,
    onVideoUpload,
    uploadProgress,
    generateTimeline,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: lecture.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const key = `${sectionIndex}-${index}`;

    const handleVideoChange = useCallback(
      async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ["video/mp4", "video/mpeg", "video/webm"];
        if (!validTypes.includes(file.type)) {
          toast.error("Please upload a valid video file (MP4, MPEG, or WebM)");
          return;
        }
        if (file.size > 2 * 1024 * 1024 * 1024) {
          toast.error("Video file size cannot exceed 2GB");
          return;
        }

        const tempUrl = URL.createObjectURL(file);
        setValue(`content[${sectionIndex}].lectures[${index}].videoFile`, file);
        setValue(`content[${sectionIndex}].lectures[${index}].videoUrl`, tempUrl);

        try {
          const timeline = await generateTimeline(file);
          setValue(`content[${sectionIndex}].lectures[${index}].timeline`, timeline);
          await onVideoUpload(sectionIndex, index, file);
        } catch (error) {
          toast.error("Failed to process video timeline");
          console.error("Video timeline error:", error);
        } finally {
          URL.revokeObjectURL(tempUrl); // Clean up temporary URL
        }
      },
      [sectionIndex, index, setValue, onVideoUpload, generateTimeline]
    );

    return (
      <Box
        ref={setNodeRef}
        style={style}
        sx={{
          p: 2,
          mb: 2,
          border: "1px solid #ddd",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
        className="space-y-3"
        role="listitem"
        aria-label={`Lecture ${index + 1}`}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <DragHandle
            {...attributes}
            {...listeners}
            sx={{ cursor: "move", mr: 1 }}
            aria-label="Drag handle"
          />
          <Box component="h6" sx={{ ...textStyles.h6, display: "inline" }}>
            Lecture {index + 1}: {lecture.title || "Untitled"}
          </Box>
        </Box>
        <Controller className="space-y-3 py-3"
          name={`content[${sectionIndex}].lectures[${index}].title`}
          control={control}
          rules={{
            required: "Lecture title is required",
            maxLength: {
              value: 100,
              message: "Title cannot exceed 100 characters",
            },
          }}
          render={({ field }) => (
            <div className="">
              <Input
                {...field}
                label="Lecture Title"
                margin="normal"
                error={
                  !!errors?.content?.[sectionIndex]?.lectures?.[index]?.title
                }
                helperText={
                  errors?.content?.[sectionIndex]?.lectures?.[index]?.title
                    ?.message
                }
              />
            </div>
          )}
        />
        <Controller className="space-y-3"
          name={`content[${sectionIndex}].lectures[${index}].description`}
          control={control}
          rules={{
            maxLength: {
              value: 1000,
              message: "Description cannot exceed 1000 characters",
            },
          }}
          render={({ field }) => (
            <Textarea
              {...field} className={'min-h-40'} value={field.value} onChange={(content) => field.onChange(content)}
              label="Lecture Description"
              margin="normal"
              error={
                !!errors?.content?.[sectionIndex]?.lectures?.[index]
                  ?.description
              }
              helperText={
                errors?.content?.[sectionIndex]?.lectures?.[index]?.description
                  ?.message
              }
            />
          )}
        />
        <Tooltip title="Upload a lecture video (MP4, max 2GB)">
          <Button
            onClick={() =>
              document.getElementById(`video-upload-${key}`).click()
            }
            sx={{ mt: 1 }}
          >
            Upload Video
          </Button>
        </Tooltip>
        <input
          type="file"
          id={`video-upload-${key}`}
          accept="video/mp4,video/mpeg,video/webm"
          style={{ display: "none" }}
          onChange={handleVideoChange}
        />
        {watch(`content[${sectionIndex}].lectures[${index}].videoUrl`) && (
          <Box sx={{ mt: 2 }}>
            <Box component="p" sx={textStyles.body2}>
              Video Preview:
            </Box>
            <video
              className="w-full"
              src={watch(
                `content[${sectionIndex}].lectures[${index}].videoUrl`
              )}
              controls
              style={{ maxWidth: "100%", maxHeight: 300 }}
            />
          </Box>
        )}
        {watch(`content[${sectionIndex}].lectures[${index}].timeline`)?.length >
          0 && (
            <Box sx={{ mt: 2 }}>
              <Box component="p" sx={textStyles.body2}>
                Video Timeline:
              </Box>
              <List dense>
                {watch(
                  `content[${sectionIndex}].lectures[${index}].timeline`
                ).map((point, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={`${point.timestamp} - ${point.description}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
        )}
        {uploadProgress[key] !== undefined && uploadProgress[key] < 100 && (
          <Box sx={{ mt: 2 }}>
            <Box component="p" sx={textStyles.body2}>
              Uploading Video ({uploadProgress[key]}%)
            </Box>
            <LinearProgress variant="determinate" value={uploadProgress[key]} />
          </Box>
        )}
        <Button variant="destructive" color="error"
          onClick={() => removeLecture(index)}
          sx={{ mt: 1 }}>
          Delete Lecture
        </Button>
      </Box>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.lecture.id === nextProps.lecture.id &&
      prevProps.index === nextProps.index &&
      prevProps.sectionIndex === nextProps.sectionIndex &&
      prevProps.uploadProgress === nextProps.uploadProgress &&
      JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors)
    );
  }
);

// Memoized SortableSection component
const SortableSection = React.memo(
  ({
    section,
    index,
    removeSection,
    control,
    setValue,
    watch,
    errors,
    onVideoUpload,
    uploadProgress,
    generateTimeline,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: section.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const {
      fields: lectures,
      append,
      remove,
      move,
    } = useFieldArray({
      control,
      name: `content[${index}].lectures`,
      keyName: "fieldId",
    });

    const handleLectureDragEnd = useCallback(
      (event) => {
        const { active, over } = event;
        if (active.id && over?.id && active.id !== over.id) {
          const oldIndex = lectures.findIndex((item) => item.id === active.id);
          const newIndex = lectures.findIndex((item) => item.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1) {
            move(oldIndex, newIndex);
            lectures.forEach((_, idx) => {
              setValue(`content[${index}].lectures[${idx}].order`, idx + 1);
            });
          }
        }
      },
      [lectures, move, setValue, index]
    );

    const appendLecture = useCallback(() => {
      append({
        id: uuidv4(),
        title: "",
        description: "",
        videoFile: null,
        videoUrl: "",
        duration: 0,
        timeline: [],
        order: lectures.length + 1,
      });
    }, [append, lectures.length]);

    return (
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          ref={setNodeRef}
          style={style}
          sx={{ bgcolor: "background.default" }}
          aria-label={`Section ${index + 1}`}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <DragHandle
              {...attributes}
              {...listeners}
              sx={{ cursor: "move", mr: 1 }}
              aria-label="Drag handle"
            />
            <Box component="h6" sx={textStyles.h6}>
              Section {index + 1}: {section.sectionTitle || "Untitled"}
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Controller
            name={`content[${index}].sectionTitle`}
            control={control}
            rules={{
              required: "Section title is required",
              maxLength: {
                value: 100,
                message: "Title cannot exceed 100 characters",
              },
            }}
            render={({ field }) => (
              <div className="py-3">
                <Input
                  {...field}
                  label="Section Title"
                  error={!!errors?.content?.[index]?.sectionTitle}
                  helperText={errors?.content?.[index]?.sectionTitle?.message}
                />
              </div>
            )}
          />
          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor),
              useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
              })
            )}
            collisionDetection={closestCenter}
            onDragEnd={handleLectureDragEnd}
          >
            <SortableContext
              items={lectures.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              {lectures.map((lecture, lectureIndex) => (
                <SortableLecture
                  key={lecture.id}
                  lecture={lecture}
                  index={lectureIndex}
                  sectionIndex={index}
                  removeLecture={remove}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                  onVideoUpload={onVideoUpload}
                  uploadProgress={uploadProgress}
                  generateTimeline={generateTimeline}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex gap-3">
            <Button
              className='bg-green-500 hover:bg-green-600 text-white'
              onClick={appendLecture}
            >
              Add Lecture
            </Button>
            <Button
              variant="destructive"
              color="error"
              onClick={() => removeSection(index)}
            >
              Delete Section
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.section.id === nextProps.section.id &&
      prevProps.index === nextProps.index &&
      prevProps.uploadProgress === nextProps.uploadProgress &&
      JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors)
    );
  }
);

const CourseCreationWizard = ({ courseId }) => {
  const router = useRouter();
  const {
    createCourse,
    updateCourse,
    uploadLectureVideo,
    publishCourse,
    fetchSuggestedCategoriesTags,
    isLoading,
  } = useInstructorStore();
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadingMedia, setUploadingMedia] = useState({
    thumbnail: false,
    previewVideo: false,
  });
  const [submissionError, setSubmissionError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [publishChecklist, setPublishChecklist] = useState({
    hasTitle: false,
    hasDescription: false,
    hasObjectives: false,
    hasCategories: false,
    hasThumbnail: false,
    hasContent: false,
    hasDuration: false,
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      learningObjectives: [{ id: uuidv4(), text: "" }],
      prerequisites: [{ id: uuidv4(), text: "" }],
      targetAudience: [{ id: uuidv4(), text: "" }],
      price: 0,
      isFree: false,
      categories: [{ id: uuidv4(), name: "" }],
      tags: [{ id: uuidv4(), name: "" }],
      level: "All Levels",
      language: "English",
      thumbnail: { file: null, url: "" },
      previewVideo: { file: null, url: "", duration: 0 },
      content: [{ id: uuidv4(), sectionTitle: "", lectures: [], order: 1 }],
    },
    mode: "onChange",
  });

  const watchedValues = watch();


  const {
    fields: content,
    append: appendSection,
    remove: removeSection,
    move: moveSection,
  } = useFieldArray({
    control,
    name: "content",
    keyName: "fieldId",
  });

  const {
    fields: learningObjectives,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray({
    control,
    name: "learningObjectives",
    keyName: "fieldId",
  });

  const {
    fields: prerequisites,
    append: appendPrerequisite,
    remove: removePrerequisite,
  } = useFieldArray({
    control,
    name: "prerequisites",
    keyName: "fieldId",
  });

  const {
    fields: targetAudience,
    append: appendAudience,
    remove: removeAudience,
  } = useFieldArray({
    control,
    name: "targetAudience",
    keyName: "fieldId",
  });

  const {
    fields: categories,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({
    control,
    name: "categories",
    keyName: "fieldId",
  });

  const {
    fields: tags,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({
    control,
    name: "tags",
    keyName: "fieldId",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isFree = watch("isFree");

  const watchedFields = watch([
    "title",
    "description",
    "learningObjectives",
    "categories",
    "thumbnail.url",
    "content",
  ]);

  useEffect(() => {
    if (isFree) setValue("price", 0);
  }, [isFree, setValue]);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const { categories, tags } = await fetchSuggestedCategoriesTags();
        setSuggestedCategories(categories || []);
        setSuggestedTags(tags || []);
      } catch (error) {
        console.error("Failed to load suggested categories and tags:", error);
        toast.error("Failed to load suggested categories and tags");
      }
    };
    loadSuggestions();
  }, [fetchSuggestedCategoriesTags]);

  useEffect(() => {
    const loadCourse = async () => {
      if (courseId) {
        try {
          const { data } = await axios.get(
            `${API_BASE_URL}/course/get-course/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem(
                  "instructor_token"
                )}`,
              },
              withCredentials: true,
            }
          );
          const course = data.course;
          reset({
            title: course.title || "",
            description: course.description || "",
            learningObjectives: course.learningObjectives?.map((text) => ({
              id: uuidv4(),
              text,
            })) || [{ id: uuidv4(), text: "" }],
            prerequisites: course.prerequisites?.map((text) => ({
              id: uuidv4(),
              text,
            })) || [{ id: uuidv4(), text: "" }],
            targetAudience: course.targetAudience?.map((text) => ({
              id: uuidv4(),
              text,
            })) || [{ id: uuidv4(), text: "" }],
            price: course.price || 0,
            isFree: course.isFree || false,
            categories: course.categories?.map((name) => ({
              id: uuidv4(),
              name,
            })) || [{ id: uuidv4(), name: "" }],
            tags: course.tags?.map((name) => ({ id: uuidv4(), name })) || [
              { id: uuidv4(), name: "" },
            ],
            level: course.level || "All Levels",
            language: course.language || "English",
            thumbnail: { file: null, url: course.thumbnail?.url || "" },
            previewVideo: {
              file: null,
              url: course.previewVideo?.url || "",
              duration: course.previewVideo?.duration || 0,
            },
            content: course.content?.map((section, idx) => ({
              id: section._id || uuidv4(),
              sectionTitle: section.sectionTitle || "",
              order: section.order || idx + 1,
              lectures:
                section.lectures?.map((lecture, lecIdx) => ({
                  id: lecture._id || uuidv4(),
                  title: lecture.title || "",
                  description: lecture.description || "",
                  videoFile: null,
                  videoUrl: lecture.video?.url || "",
                  duration: lecture.video?.duration || 0,
                  timeline: lecture.timeline || [],
                  order: lecture.order || lecIdx + 1,
                })) || [],
            })) || [{ id: uuidv4(), sectionTitle: "", lectures: [], order: 1 }],
          });
        } catch (error) {
          console.error(
            "Load course error:",
            error.response?.data || error.message
          );
          toast.error("Failed to load course data");
        }
      }
    };
    loadCourse();
  }, [courseId, reset]);

  const updateChecklist = useCallback(() => {
    try {
      const content = watchedFields.content || [];
      const totalDuration = content.reduce((total, section) => {
        const lectures = Array.isArray(section?.lectures)
          ? section.lectures
          : [];
        const lecturesDuration = lectures.reduce(
          (sum, lecture) => sum + (Number(lecture?.duration) || 0),
          0
        );
        return total + lecturesDuration;
      }, 0);

      setPublishChecklist({
        hasTitle: !!watchedFields.title?.trim(),
        hasDescription: !!watchedFields.description?.trim(),
        hasObjectives: (watchedFields.learningObjectives || []).some((obj) =>
          obj?.text?.trim()
        ),
        hasCategories: (watchedFields.categories || []).some((cat) =>
          cat?.name?.trim()
        ),
        hasThumbnail: !!watchedFields.thumbnail?.url,
        hasContent: content.some(
          (section) =>
            section?.sectionTitle?.trim() &&
            Array.isArray(section?.lectures) &&
            section.lectures.length > 0
        ),
        hasDuration: totalDuration >= 60,
      });
    } catch (error) {
      console.error("Error updating publish checklist:", error);
      toast.error("Error updating course checklist");
    }
  }, [
    watchedFields.title,
    watchedFields.description,
    watchedFields.learningObjectives,
    watchedFields.categories,
    watchedFields.thumbnail?.url,
    watchedFields.content,
  ]);

  useEffect(() => {
    updateChecklist();
  }, [updateChecklist]);

  const generateTimeline = useCallback(async (file) => {
    try {
      const duration = await new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => reject(new Error("Failed to load video metadata"));
        video.src = URL.createObjectURL(file);
      });

      const timeline = [];
      const interval = duration / 4;
      for (let i = 0; i < 4; i++) {
        const timestamp = Math.round(interval * i);
        const minutes = Math.floor(timestamp / 60);
        const seconds = Math.round(timestamp % 60);
        timeline.push({
          timestamp: `${minutes}:${seconds.toString().padStart(2, "0")}`,
          description: `Key point ${i + 1} in the lecture`,
        });
      }
      return timeline;
    } catch (error) {
      console.error("Timeline generation error:", error);
      return [];
    }
  }, []);

  const uploadMedia = useCallback(
    async (file, folder, resourceType, onProgress, options = {}, retries = 2) => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        console.error("Cloudinary configuration missing:", {
          cloudName,
          uploadPreset,
        });
        throw new Error("Cloudinary configuration is missing. Please contact support.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("cloud_name", cloudName);
      formData.append("folder", folder);
      if (options.transformations) {
        formData.append("transformation", JSON.stringify(options.transformations));
      }

      let attempt = 0;
      while (attempt <= retries) {
        try {
          const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            formData,
            {
              onUploadProgress: onProgress,
              timeout: 60000, // Set timeout to 60 seconds
            }
          );
          return res.data;
        } catch (error) {
          attempt++;
          console.error(`Upload attempt ${attempt} failed:`, error);

          if (error.response) {
            // Handle specific Cloudinary errors
            if (error.response.status === 400) {
              throw new Error("Invalid file format or request. Please check the file and try again.");
            } else if (error.response.status === 429 || error.response.status === 503) {
              if (attempt <= retries) {
                console.warn(`Retrying upload... Attempt ${attempt + 1}`);
                await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                continue;
              }
            } else if (error.response.status === 401) {
              throw new Error("Authentication error with Cloudinary. Please contact support.");
            }
          } else if (error.code === "ECONNABORTED") {
            throw new Error("Upload timed out. Please check your network and try again.");
          } else if (error.code === "ERR_NETWORK") {
            throw new Error("Network error. Please check your internet connection and try again.");
          }

          if (attempt > retries) {
            throw new Error(
              error.response?.data?.message || `Failed to upload ${resourceType}. Please try again.`
            );
          }
        }
      }
    },
    []
  );

  const handleThumbnailUpload = useCallback(
    async (file) => {
      if (!file) return;

      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG or PNG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail file size cannot exceed 5MB");
        return;
      }

      setUploadingMedia((prev) => ({ ...prev, thumbnail: true }));
      try {
        const tempUrl = URL.createObjectURL(file);
        setValue("thumbnail.url", tempUrl);

        const result = await uploadMedia(file, "course_thumbnails", "image");
        setValue("thumbnail.url", result.secure_url);
        setValue("thumbnail.file", null);
        trigger("thumbnail");
        toast.success("Thumbnail uploaded successfully");
      } catch (error) {
        console.error("Thumbnail upload error:", error);
        toast.error(error.message || "Failed to upload thumbnail");
      } finally {
        setUploadingMedia((prev) => ({ ...prev, thumbnail: false }));
        if (watch("thumbnail.url").startsWith("blob:")) {
          URL.revokeObjectURL(watch("thumbnail.url"));
        }
      }
    },
    [setValue, trigger, uploadMedia, watch]
  );

  const handlePreviewVideoUpload = useCallback(
    async (file) => {
      if (!file) return;

      // Validate file type and size
      const validTypes = ["video/mp4", "video/mpeg", "video/webm"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid video file (MP4, MPEG, or WebM)");
        return;
      }
      if (file.size > 200 * 1024 * 1024) {
        toast.error("Preview video file size cannot exceed 200MB");
        return;
      }

      setUploadingMedia((prev) => ({ ...prev, previewVideo: true }));
      try {
        const tempUrl = URL.createObjectURL(file);
        setValue("previewVideo.url", tempUrl);

        const result = await uploadMedia(
          file,
          "course_preview_videos",
          "video",
          null,
          { transformations: [{ duration: 300, quality: "auto" }] }
        );

        if (result.duration > 300) {
          toast.error("Preview video cannot exceed 5 minutes");
          return;
        }

        setValue("previewVideo.url", result.secure_url);
        setValue("previewVideo.duration", result.duration);
        setValue("previewVideo.file", null);
        trigger("previewVideo");
        toast.success("Preview video uploaded successfully");
      } catch (error) {
        console.error("Preview video upload error:", error);
        toast.error(error.message || "Failed to upload preview video");
      } finally {
        setUploadingMedia((prev) => ({ ...prev, previewVideo: false }));
        if (watch("previewVideo.url").startsWith("blob:")) {
          URL.revokeObjectURL(watch("previewVideo.url"));
        }
      }
    },
    [setValue, trigger, uploadMedia, watch]
  );

  const handleVideoUpload = useCallback(
    async (sectionIndex, lectureIndex, file) => {
      if (!file) return;

      // Validate file type and size
      const validTypes = ["video/mp4", "video/mpeg", "video/webm"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid video file (MP4, MPEG, or WebM)");
        return;
      }
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast.error("Lecture video file size cannot exceed 2GB");
        return;
      }

      const key = `${sectionIndex}-${lectureIndex}`;
      setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
      try {
        const folder = courseId
          ? `courses/${courseId}/lectures`
          : `courses/temp/lectures`;
        const result = await uploadMedia(
          file,
          folder,
          "video",
          (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({ ...prev, [key]: percent }));
          },
          { transformations: [{ quality: "auto:low", fetch_format: "mp4" }] }
        );

        setValue(
          `content[${sectionIndex}].lectures[${lectureIndex}].videoUrl`,
          result.secure_url
        );
        setValue(
          `content[${sectionIndex}].lectures[${lectureIndex}].duration`,
          result.duration
        );
        setValue(
          `content[${sectionIndex}].lectures[${lectureIndex}].videoFile`,
          null
        );
        toast.success("Lecture video uploaded successfully");
        return result;
      } catch (error) {
        console.error("Video upload error:", error);
        toast.error(error.message || "Failed to upload lecture video");
        throw error;
      } finally {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[key]; // Clean up progress state
          return newProgress;
        });
        const videoUrl = watch(
          `content[${sectionIndex}].lectures[${lectureIndex}].videoUrl`
        );
        if (videoUrl && videoUrl.startsWith("blob:")) {
          URL.revokeObjectURL(videoUrl);
        }
      }
    },
    [courseId, setValue, uploadMedia, watch]
  );

  const handleSectionDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (active.id && over?.id && active.id !== over.id) {
        const oldIndex = content.findIndex((item) => item.id === active.id);
        const newIndex = content.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          moveSection(oldIndex, newIndex);
          content.forEach((_, idx) => {
            setValue(`content[${idx}].order`, idx + 1);
          });
        }
      }
    },
    [content, moveSection, setValue]
  );

  const onSubmit = useCallback(
    async (data) => {
      setIsSubmitting(true);
      setSubmissionError(null);
      try {
        const formattedData = {
          title: data.title,
          description: data.description,
          learningObjectives: data.learningObjectives
            .map((obj) => obj.text)
            .filter((t) => t.trim()),
          prerequisites: data.prerequisites
            .map((obj) => obj.text)
            .filter((t) => t.trim()),
          targetAudience: data.targetAudience
            .map((obj) => obj.text)
            .filter((t) => t.trim()),
          price: Number(data.price),
          isFree: data.isFree,
          categories: data.categories
            .map((cat) => cat.name)
            .filter((n) => n.trim()),
          tags: data.tags.map((tag) => tag.name).filter((n) => n.trim()),
          level: data.level,
          language: data.language,
          thumbnail: { url: data.thumbnail.url },
          previewVideo: data.previewVideo.url
            ? {
              url: data.previewVideo.url,
              duration: data.previewVideo.duration,
            }
            : null,
          content: data.content.map((section, secIdx) => ({
            sectionTitle: section.sectionTitle,
            order: section.order || secIdx + 1,
            lectures: section.lectures
              .filter((l) => l.title.trim() && l.videoUrl)
              .map((l, lecIdx) => ({
                title: l.title,
                description: l.description,
                videoUrl: l.videoUrl,
                duration: l.duration,
                timeline: l.timeline || [],
                order: l.order || lecIdx + 1,
              })),
          })),
        };

        let result;
        if (courseId) {
          result = await updateCourse(courseId, formattedData);
        } else {
          result = await createCourse(formattedData, router);
        }

        if (result.success) {
          const newCourseId = courseId || result.course._id;
          for (let i = 0; i < formattedData.content.length; i++) {
            const section = formattedData.content[i];
            const sectionId = result.course.content[i]?._id;
            for (let j = 0; j < section.lectures.length; j++) {
              const lecture = section.lectures[j];
              if (lecture.videoUrl?.includes("courses/temp/lectures")) {
                await uploadLectureVideo(newCourseId, sectionId, {
                  title: lecture.title,
                  description: lecture.description,
                  videoUrl: lecture.videoUrl,
                  duration: lecture.duration,
                  timeline: lecture.timeline,
                  order: lecture.order,
                });
              }
            }
          }
          toast.success(
            courseId
              ? "Course updated successfully"
              : "Course created successfully"
          );
          router.push("/instructor/dashboard/courses");
        }
      } catch (error) {
        console.error("Submit error:", error.response?.data || error.message);
        setSubmissionError(
          error.response?.data?.message || "Failed to save course"
        );
        toast.error(error.response?.data?.message || "Failed to save course");
      } finally {
        setIsSubmitting(false);
      }
    },
    [courseId, createCourse, updateCourse, uploadLectureVideo, router]
  );

  const PUBLISHCHECKLIST = useMemo(() => {
    const checklist = {
      hasTitle: !!watchedValues.title,
      hasDescription: !!watchedValues.description,
      hasObjectives: watchedValues.learningObjectives?.some(obj => obj.text?.trim()),
      hasCategories: watchedValues.categories?.some(cat => cat.name?.trim()),
      hasThumbnail: !!watchedValues.thumbnail?.url,
      hasContent: watchedValues.content?.length > 0 && 
                  watchedValues.content.some(section => 
                    section.sectionTitle?.trim() && section.lectures?.length > 0
                  ),
      hasDuration: true // Assuming duration calculation
    }
    // Debug logging to see which items are false
    // console.log('Publish checklist:', checklist)
    // console.log('Watched values:', {
    //   title: watchedValues.title,
    //   description: watchedValues.description,
    //   learningObjectives: watchedValues.learningObjectives,
    //   categories: watchedValues.categories,
    //   thumbnail: watchedValues.thumbnail,
    //   content: watchedValues.content
    // })
    return checklist
  }, [watchedValues]);

  const handlePublish = useCallback(async () => {
    const canPublish = Object.values(PUBLISHCHECKLIST).every((item) => item);

    if (!canPublish) {
      toast.error("Please complete all required fields before publishing");
      return;
    }

    try {
      await trigger();
      if (!isValid) {
        toast.error("Please fix form errors before publishing");
        return;
      }
      const result = await publishCourse(courseId, router);
      if (result.success) {
        toast.success("Course submitted for review");
      }
    } catch (error) {
      console.error("Publish error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to submit course for review"
      );
    }
  }, [courseId, publishCourse, router, trigger, isValid, publishChecklist]);

  const appendObjectiveStable = useCallback(
    () => appendObjective({ id: uuidv4(), text: "" }),
    [appendObjective]
  );

  const appendPrerequisiteStable = useCallback(
    () => appendPrerequisite({ id: uuidv4(), text: "" }),
    [appendPrerequisite]
  );

  const appendAudienceStable = useCallback(
    () => appendAudience({ id: uuidv4(), text: "" }),
    [appendAudience]
  );

  const appendCategoryStable = useCallback(
    () => appendCategory({ id: uuidv4(), name: "" }),
    [appendCategory]
  );

  const appendTagStable = useCallback(
    () => appendTag({ id: uuidv4(), name: "" }),
    [appendTag]
  );

  const appendSectionStable = useCallback(
    () =>
      appendSection({
        id: uuidv4(),
        sectionTitle: "",
        lectures: [],
        order: content.length + 1,
      }),
    [appendSection, content.length]
  );

  const steps = useMemo(
    () => [
      {
        label: "Basic Information",
        content: (
          <Box className='space-y-4'>
            <Tooltip className={jost.className} style={{ fontFamily: 'poppins' }} title="Enter the course title">
              <Controller
                name="title"
                control={control}
                rules={{
                  required: "Title is required",
                  minLength: {
                    value: 5,
                    message: "Title must be at least 5 characters",
                  },
                  maxLength: {
                    value: 200,
                    message: "Title cannot exceed 200 characters",
                  },
                }}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      {...field}
                      id="title"
                      placeholder="Enter course title"
                      className={errors.title ? "border-destructive" : ""}
                    />
                  </div>
                )}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </Tooltip>
            <Controller
              name="description"
              control={control}
              rules={{
                required: "Description is required",
                minLength: {
                  value: 50,
                  message: "Description must be at least 50 characters",
                },
                maxLength: {
                  value: 5000,
                  message: "Description cannot exceed 5000 characters",
                },
              }}
              render={({ field }) => (
                <Box className="space-y-2" sx={{ mt: 2 }}>
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea {...field} className={'min-h-40'} value={field.value} onChange={(content) => field.onChange(content)}></Textarea>
                  {/* <Editor
                    apiKey={
                      process.env.NEXT_PUBLIC_TINYMCE_API_KEY ||
                      "khsgpv7gbp874ds6d2u3pab16l0fareackakzba70jnyqedw"
                    }
                    value={field.value}
                    onEditorChange={(content) => field.onChange(content)}
                    init={{
                      height: 300,
                      menubar: false,
                      plugins: ["advlist", "lists", "link", "image", "code"],
                      toolbar:
                        "undo redo | formatselect | bold italic | bullist numlist | removeformat",
                      content_style:
                        "body { font-family: Arial, sans-serif; font-size: 14px }",
                    }}
                    onInit={(evt, editor) => {
                      if (!editor) {
                        toast.error("Failed to initialize text editor");
                      }
                    }}
                  /> */}
                  {errors.description && (
                    <Box
                      component="span"
                      sx={{ ...textStyles.caption, color: "error.main" }}
                    >
                      {errors.description.message}
                    </Box>
                  )}
                </Box>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Controller
                name="isFree"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="isFree"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isFree">This is a free course</Label>
            </div>
            {!isFree && (
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      className={errors.price ? "border-destructive" : ""}
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
            )}
          </Box>
        ),
      },
      {
        label: "Learning Objectives & Audience",
        content: (
          <Box>
            <Box component="h6" sx={{ ...textStyles.h6, mb: 2 }}>
              Learning Objectives
            </Box>
            {/* {learningObjectives.map((objective, index) => (
              <Box
                key={objective.fieldId}
                sx={{ display: "flex", mb: 2, alignItems: "center" }}
              >
                <Controller
                  name={`learningObjectives[${index}].text`}
                  control={control}
                  rules={{
                    required:
                      index === 0 ? "At least one objective required" : false,
                    maxLength: {
                      value: 200,
                      message: "Objective cannot exceed 200 characters",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={`Objective ${index + 1}`}
                      error={!!errors.learningObjectives?.[index]?.text}
                      helperText={
                        errors.learningObjectives?.[index]?.text?.message
                      }
                    />
                  )}
                />
                <IconButton
                  onClick={() => removeObjective(index)}
                  disabled={learningObjectives.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))} */}
            {learningObjectives.map((field, index) => (
              <div key={field.id} className="flex gap-2 space-y-3">
                <Controller
                  name={`learningObjectives.${index}.text`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={`Learning objective ${index + 1}`}
                      className="flex-1"
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeObjective(index)}
                  disabled={learningObjectives.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={appendObjectiveStable}
              sx={{ mb: 3 }}
            >
              Add Objective
            </Button>
            {/* <div className="py-3">
              <Box component="h6" sx={{ ...textStyles.h6, mb: 2 }}>
                Prerequisites
              </Box>
              {prerequisites.map((prereq, index) => (
                <Box
                  key={prereq.fieldId}
                  sx={{ display: "flex", mb: 2, alignItems: "center" }}
                >
                  <Controller
                    name={`prerequisites[${index}].text`}
                    control={control}
                    rules={{
                      maxLength: {
                        value: 200,
                        message: "Prerequisite cannot exceed 200 characters",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={`Prerequisite ${index + 1}`}
                        error={!!errors.prerequisites?.[index]?.text}
                        helperText={errors.prerequisites?.[index]?.text?.message}
                      />
                    )}
                  />
                  <IconButton
                    onClick={() => removePrerequisite(index)}
                    disabled={prerequisites.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </div> */}
            {/* Prerequisites */}
            <div className="space-y-2 py-3">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Prerequisites</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPrerequisite({ text: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prerequisite
                </Button>
              </div>
              {prerequisites.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Controller
                    name={`prerequisites.${index}.text`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={`Prerequisite ${index + 1}`}
                        className="flex-1"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePrerequisite(index)}
                    disabled={prerequisites.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Separator />
            </div>
            {/* <Button
              onClick={appendPrerequisiteStable}
              sx={{ mb: 3 }}
            >
              Add Prerequisite
            </Button> */}
            <div className="py-3">
              <Box component="h6" sx={{ ...textStyles.h6, mb: 2 }}>
                Target Audience
              </Box>
              {/* {targetAudience.map((audience, index) => (
                <Box key={audience.fieldId} sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                  <Controller
                    name={`targetAudience[${index}].text`}
                    control={control}
                    rules={{
                      maxLength: {
                        value: 200,
                        message: "Audience cannot exceed 200 characters",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={`Audience ${index + 1}`}
                        error={!!errors.targetAudience?.[index]?.text}
                        helperText={errors.targetAudience?.[index]?.text?.message}
                      />
                    )}
                  />
                  <IconButton
                    onClick={() => removeAudience(index)}
                    disabled={targetAudience.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))} */}
              {targetAudience.map((field, index) => (
                <div key={field.id} className="flex gap-2 space-y-3">
                  <Controller
                    name={`targetAudience.${index}.text`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={`Target audience ${index + 1}`}
                        className="flex-1"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeAudience(index)}
                    disabled={targetAudience.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={appendAudienceStable}>
                Add Audience
              </Button>
            </div>
          </Box>
        ),
      },
      {
        label: "Categories & Tags",
        content: (
          // <Box sx={{ maxWidth: 800 }}>
          //   <Box component="h6" sx={{ ...textStyles.h6, mb: 2 }}>
          //     Categories
          //   </Box>
          //   {categories.map((category, index) => (
          //     <Box
          //       key={category.fieldId}
          //       sx={{ display: "flex", mb: 2, alignItems: "center" }}
          //     >
          //       <Controller
          //         name={`categories[${index}].name`}
          //         control={control}
          //         rules={{
          //           required:
          //             index === 0 ? "At least one category required" : false,
          //           maxLength: {
          //             value: 50,
          //             message: "Category cannot exceed 50 characters",
          //           },
          //         }}
          //         render={({ field }) => (
          //           <Autocomplete
          //             freeSolo
          //             options={suggestedCategories}
          //             value={field.value}
          //             onChange={(e, value) => field.onChange(value || "")}
          //             renderInput={(params) => (
          //               <TextField
          //                 {...params}
          //                 label={`Category ${index + 1}`}
          //                 error={!!errors.categories?.[index]?.name}
          //                 helperText={errors.categories?.[index]?.name?.message}
          //               />
          //             )}
          //           />
          //         )}
          //       />
          //       <IconButton
          //         onClick={() => removeCategory(index)}
          //         disabled={categories.length === 1}
          //       >
          //         <Delete />
          //       </IconButton>
          //     </Box>
          //   ))}
          //   <Button
          //     variant="outlined"
          //     onClick={appendCategoryStable}
          //     sx={{ mb: 3 }}
          //   >
          //     Add Category
          //   </Button>
          //   <Box component="h6" sx={{ ...textStyles.h6, mb: 2 }}>
          //     Tags
          //   </Box>
          //   {tags.map((tag, index) => (
          //     <Box
          //       key={tag.fieldId}
          //       sx={{ display: "flex", mb: 2, alignItems: "center" }}
          //     >
          //       <Controller
          //         name={`tags[${index}].name`}
          //         control={control}
          //         rules={{
          //           maxLength: {
          //             value: 50,
          //             message: "Tag cannot exceed 50 characters",
          //           },
          //         }}
          //         render={({ field }) => (
          //           <Autocomplete
          //             freeSolo
          //             options={suggestedTags}
          //             value={field.value}
          //             onChange={(e, value) => field.onChange(value || "")}
          //             renderInput={(params) => (
          //               <TextField
          //                 {...params}
          //                 label={`Tag ${index + 1}`}
          //                 error={!!errors.tags?.[index]?.name}
          //                 helperText={errors.tags?.[index]?.name?.message}
          //               />
          //             )}
          //           />
          //         )}
          //       />
          //       <IconButton
          //         onClick={() => removeTag(index)}
          //         disabled={tags.length === 1}
          //       >
          //         <Delete />
          //       </IconButton>
          //     </Box>
          //   ))}
          //   <Button
          //     variant="outlined"
          //     onClick={appendTagStable}
          //   >
          //     Add Tag
          //   </Button>
          // </Box>
          <div className="">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Categories</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCategory({ name: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Suggested: {suggestedCategories.slice(0, 5).join(", ")}
            </div>
            {categories.map((field, index) => (
              <div key={field.id} className="flex gap-2 space-y-3">
                <Controller
                  name={`categories.${index}.name`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={`Category ${index + 1}`}
                      className="flex-1"
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeCategory(index)}
                  disabled={categories.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ),
      },
      {
        label: "Media",
        content: (
          <Box>
            <Tooltip title="Upload a thumbnail image (JPEG/PNG, max 5MB)">
              <Button
                variant="outlined"
                onClick={() =>
                  document.getElementById("thumbnail-upload").click()
                }
                disabled={uploadingMedia.thumbnail}
              >
                Upload Thumbnail (max 5MB) {uploadingMedia.thumbnail && <CircularProgress size={10} />}
              </Button>
            </Tooltip>
            <input
              type="file"
              id="thumbnail-upload"
              accept="image/jpeg,image/png"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleThumbnailUpload(file);
              }}
            />
            {watchedFields.thumbnail?.url && (
              <Box sx={{ mt: 2 }}>
                <Box component="p" sx={textStyles.body2}>
                  Thumbnail Preview:
                </Box>
                <img
                  src={watchedFields.thumbnail.url}
                  alt="Thumbnail"
                  style={{ maxWidth: "100%", maxHeight: 300 }}
                />
              </Box>
            )}
            <Tooltip title="Upload a preview video (MP4, max 200MB, 5 minutes)">
              <Button
                variant="outlined"
                onClick={() => document.getElementById("preview-video").click()}
                disabled={uploadingMedia.previewVideo}
                sx={{ mt: 2 }}
              >
                Upload Preview Video (max 200MB, 5 min) {uploadingMedia.previewVideo && <CircularProgress size={10} />}
              </Button>
            </Tooltip>
            <input
              type="file"
              id="preview-video"
              accept="video/mp4,video/mpeg,video/webm"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handlePreviewVideoUpload(file);
              }}
            />
            {watch("previewVideo.url") && (
              <Box sx={{ mt: 2 }}>
                <Box component="p" sx={textStyles.body2}>
                  Preview Video:
                </Box>
                <video
                  src={watch("previewVideo.url")}
                  controls
                  className="w-full"
                  style={{ maxWidth: "100%", maxHeight: 300 }}
                />
              </Box>
            )}
          </Box>
        ),
      },
      {
        label: "Content",
        content: (
          <Box sx={{ boxShadow: 0 }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={content.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {content.map((section, index) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    index={index}
                    removeSection={removeSection}
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    onVideoUpload={handleVideoUpload}
                    uploadProgress={uploadProgress}
                    generateTimeline={generateTimeline}
                  />
                ))}
              </SortableContext>
            </DndContext>
            <Button
              onClick={appendSectionStable}
            >
              Add Section
            </Button>
          </Box>
        ),
      },
      {
        label: "Review & Publish",
        content: (
          // <Box sx={{ maxWidth: 800 }}>
          //   <Box component="h6" sx={{ ...textStyles.h6, mb: 2 }}>
          //     Publish Readiness Checklist
          //   </Box>
          //   <List>
          //     <ListItem>
          //       <ListItemText
          //         primary="Course Title"
          //         secondary={
          //           publishChecklist.hasTitle ? "Completed" : "Missing"
          //         }
          //       />
          //       {publishChecklist.hasTitle ? (
          //         <CheckCircle color="success" />
          //       ) : (
          //         <Warning color="warning" />
          //       )}
          //     </ListItem>
          //     <ListItem>
          //       <ListItemText
          //         primary="Course Description"
          //         secondary={
          //           publishChecklist.hasDescription ? "Completed" : "Missing"
          //         }
          //       />
          //       {publishChecklist.hasDescription ? (
          //         <CheckCircle color="success" />
          //       ) : (
          //         <Warning color="warning" />
          //       )}
          //     </ListItem>
          //     <ListItem>
          //       <ListItemText
          //         primary="Learning Objectives"
          //         secondary={
          //           publishChecklist.hasObjectives ? "Completed" : "Missing"
          //         }
          //       />
          //       {publishChecklist.hasObjectives ? (
          //         <CheckCircle color="success" />
          //       ) : (
          //         <Warning color="warning" />
          //       )}
          //     </ListItem>
          //     <ListItem>
          //       <ListItemText
          //         primary="Categories"
          //         secondary={
          //           publishChecklist.hasCategories ? "Completed" : "Missing"
          //         }
          //       />
          //       {publishChecklist.hasCategories ? (
          //         <CheckCircle color="success" />
          //       ) : (
          //         <Warning color="warning" />
          //       )}
          //     </ListItem>
          //     <ListItem>
          //       <ListItemText
          //         primary="Thumbnail"
          //         secondary={
          //           publishChecklist.hasThumbnail ? "Completed" : "Missing"
          //         }
          //       />
          //       {publishChecklist.hasThumbnail ? (
          //         <CheckCircle color="success" />
          //       ) : (
          //         <Warning color="warning" />
          //       )}
          //     </ListItem>
          //     <ListItem>
          //       <ListItemText
          //         primary="Content (At least one section with lectures)"
          //         secondary={
          //           publishChecklist.hasContent ? "Completed" : "Missing"
          //         }
          //       />
          //       {publishChecklist.hasContent ? (
          //         <CheckCircle color="success" />
          //       ) : (
          //         <Warning color="warning" />
          //       )}
          //     </ListItem>
          //     <ListItem>
          //       <ListItemText
          //         primary="Total Duration (At least 1 minute)"
          //         secondary={
          //           publishChecklist.hasDuration ? "Completed" : "Missing"
          //         }
          //       />
          //       {publishChecklist.hasDuration ? (
          //         <CheckCircle color="success" />
          //       ) : (
          //         <Warning color="warning" />
          //       )}
          //     </ListItem>
          //   </List>
          // </Box>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Publish Readiness Checklist</h3>
              <div className="space-y-3">
                {Object.entries(PUBLISHCHECKLIST).map(([key, completed]) => {
                  const labels = {
                    hasTitle: "Course Title",
                    hasDescription: "Course Description",
                    hasObjectives: "Learning Objectives",
                    hasCategories: "Categories",
                    hasThumbnail: "Thumbnail",
                    hasContent: "Course Content",
                    hasDuration: "Total Duration"
                  }

                  return (
                    <div key={key} className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2">
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        )}
                        <span className={completed ? "text-foreground" : "text-muted-foreground"}>
                          {labels[key]}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {completed ? "Completed" : "Missing"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {Object.values(PUBLISHCHECKLIST).every(Boolean) ? (
              <Alert className={'flex items-center gap-1'}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your course is ready to publish! All required fields are complete.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please complete all required fields before publishing your course.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ),
      },
    ],
    [
      appendSectionStable,
      appendObjectiveStable,
      appendPrerequisiteStable,
      appendAudienceStable,
      appendCategoryStable,
      appendTagStable,
      control,
      errors.title,
      errors.description,
      errors.learningObjectives,
      errors.prerequisites,
      errors.targetAudience,
      errors.categories,
      errors.tags,
      errors.content,
      handleSectionDragEnd,
      handleVideoUpload,
      isFree,
      learningObjectives.length,
      prerequisites.length,
      targetAudience.length,
      categories.length,
      tags.length,
      removeSection,
      removeObjective,
      removePrerequisite,
      removeAudience,
      removeCategory,
      removeTag,
      setValue,
      suggestedCategories,
      suggestedTags,
      uploadProgress,
      watch,
      generateTimeline,
    ]
  );

  const progress = Math.round((activeStep / (steps.length - 1)) * 100);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 4, px: { xs: 2, sm: 4 } }}>
      <Box component="h4" sx={textStyles.h4}>
        {courseId ? "Edit Course" : "Create New Course"}
      </Box>
      <Box sx={{ mb: 4 }}>
        <Box style={{ fontFamily: 'poppins' }} component="p" sx={{ ...textStyles.body2, mb: 1 }}>
          Progress: {progress}%
        </Box>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      {submissionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submissionError}
        </Alert>
      )}
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                {activeStep > 0 && (
                  <Button onClick={() => setActiveStep(index - 1)}>Back</Button>
                )}
                {activeStep < steps.length - 1 && (
                  <Button
                    onClick={async () => {
                      const fieldsToValidate =
                        activeStep === 0
                          ? [
                            "title",
                            "description",
                            "level",
                            "language",
                            "price",
                            "isFree",
                          ]
                          : activeStep === 1
                            ? [
                              "learningObjectives",
                              "prerequisites",
                              "targetAudience",
                            ]
                            : activeStep === 2
                              ? ["categories", "tags"]
                              : activeStep === 3
                                ? ["thumbnail", "previewVideo"]
                                : ["content"];
                      const isStepValid = await trigger(fieldsToValidate);
                      if (isStepValid) setActiveStep(index + 1);
                      else toast.error("Please complete all required fields");
                    }}
                    disabled={isSubmitting || isLoading}
                  >
                    Next
                  </Button>
                )}
                {activeStep === steps.length - 1 && (
                  <>
                    {isSubmitting && <CircularProgress size={20} />}
                    <Button
                      type="submit"
                      variant={courseId ? "primary" : "secondary"}
                      onClick={handleSubmit(onSubmit)}
                      disabled={isLoading || isSubmitting}
                      className={courseId ? "bg-indigo-500 text-white" : ""}>
                      {courseId ? "Update Course" : "Create Course"}
                    </Button>
                    {courseId && (
                      <Button
                        variant="contained"
                        onClick={handlePublish}
                        disabled={
                          !isValid ||
                          isSubmitting ||
                          !Object.values(PUBLISHCHECKLIST).every((item) => item)
                        }
                      >
                        Submit for Review
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default CourseCreationWizard;