"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import useInstructorStore from "@/store/instructorStore";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  LinearProgress,
  Chip,
  Autocomplete,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Add,
  Delete,
  VideoLibrary,
  DragHandle,
  ExpandMore,
  Save,
  CheckCircle,
  Warning,
} from "@mui/icons-material";
import { Editor } from "@tinymce/tinymce-react";
import debounce from "lodash/debounce";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const SortableLecture = ({
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
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: lecture.id,
    });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const key = `${sectionIndex}-${index}`;

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
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <DragHandle
          {...attributes}
          {...listeners}
          sx={{ cursor: "move", mr: 1 }}
        />
        <Typography variant="h6">
          Lecture {index + 1}: {lecture.title || "Untitled"}
        </Typography>
      </Box>
      <TextField
        fullWidth
        label="Lecture Title"
        {...control.register(
          `content[${sectionIndex}].lectures[${index}].title`,
          {
            required: "Lecture title is required",
            maxLength: {
              value: 100,
              message: "Title cannot exceed 100 characters",
            },
          }
        )}
        margin="normal"
        error={!!errors?.content?.[sectionIndex]?.lectures?.[index]?.title}
        helperText={
          errors?.content?.[sectionIndex]?.lectures?.[index]?.title?.message
        }
      />
      <TextField
        fullWidth
        label="Lecture Description"
        multiline
        rows={4}
        {...control.register(
          `content[${sectionIndex}].lectures[${index}].description`,
          {
            maxLength: {
              value: 1000,
              message: "Description cannot exceed 1000 characters",
            },
          }
        )}
        margin="normal"
        error={
          !!errors?.content?.[sectionIndex]?.lectures?.[index]?.description
        }
        helperText={
          errors?.content?.[sectionIndex]?.lectures?.[index]?.description
            ?.message
        }
      />
      <Tooltip title="Upload a lecture video (MP4 recommended, max 2GB)">
        <Button
          variant="outlined"
          startIcon={<VideoLibrary />}
          onClick={() => document.getElementById(`video-upload-${key}`).click()}
        >
          Upload Video
        </Button>
      </Tooltip>
      <input
        type="file"
        id={`video-upload-${key}`}
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 2 * 1024 * 1024 * 1024) {
              toast.error("Video file size cannot exceed 2GB");
              return;
            }
            setValue(
              `content[${sectionIndex}].lectures[${index}].videoFile`,
              file
            );
            setValue(
              `content[${sectionIndex}].lectures[${index}].videoUrl`,
              URL.createObjectURL(file)
            );
            onVideoUpload(sectionIndex, index, file);
          }
        }}
      />
      {watch(`content[${sectionIndex}].lectures[${index}].videoUrl`) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Video Preview:</Typography>
          <video
            src={watch(`content[${sectionIndex}].lectures[${index}].videoUrl`)}
            controls
            style={{ maxWidth: "100%", maxHeight: 200 }}
          />
        </Box>
      )}
      {uploadProgress[key] !== undefined && uploadProgress[key] < 100 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Uploading Video ({uploadProgress[key]}%)
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress[key]} />
        </Box>
      )}
      <Button
        variant="outlined"
        color="error"
        startIcon={<Delete />}
        onClick={() => removeLecture(index)}
        sx={{ mt: 1 }}
      >
        Delete Lecture
      </Button>
    </Box>
  );
};

const SortableSection = ({
  section,
  index,
  removeSection,
  control,
  setValue,
  watch,
  errors,
  onVideoUpload,
  uploadProgress,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: section.id,
    });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const {
    fields: lectures,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: `content[${index}].lectures`,
  });

  const handleLectureDragEnd = (event) => {
    const { active, over } = event;
    if (active.id && over?.id && active.id !== over.id) {
      const oldIndex = lectures.findIndex((item) => item.id === active.id);
      const newIndex = lectures.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  return (
    <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 1 }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        ref={setNodeRef}
        style={style}
        sx={{ bgcolor: "background.default" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <DragHandle
            {...attributes}
            {...listeners}
            sx={{ cursor: "move", mr: 1 }}
          />
          <Typography variant="h6">
            Section {index + 1}: {section.sectionTitle || "Untitled"}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <TextField
          fullWidth
          label="Section Title"
          {...control.register(`content[${index}].sectionTitle`, {
            required: "Section title is required",
            maxLength: {
              value: 100,
              message: "Title cannot exceed 100 characters",
            },
          })}
          margin="normal"
          error={!!errors?.content?.[index]?.sectionTitle}
          helperText={errors?.content?.[index]?.sectionTitle?.message}
        />
        <DndContext
          sensors={useSensors(
            useSensor(PointerSensor),
            useSensor(KeyboardSensor)
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
              />
            ))}
          </SortableContext>
        </DndContext>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            append({
              id: uuidv4(),
              title: "",
              description: "",
              videoFile: null,
              videoUrl: "",
              duration: 0,
            })
          }
          sx={{ mr: 2 }}
        >
          Add Lecture
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => removeSection(index)}
        >
          Delete Section
        </Button>
      </AccordionDetails>
    </Accordion>
  );
};

const CourseCreationWizard = ({ courseId }) => {
  const router = useRouter();
  const {
    createCourse,
    updateCourse,
    uploadLectureVideo,
    publishCourse,
    autosaveDraft,
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
  const [restoreDraftDialog, setRestoreDraftDialog] = useState(false);
  const [draftVersions, setDraftVersions] = useState([]);
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
      title: { en: "", es: "", fr: "" },
      description: { en: "", es: "", fr: "" },
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
      content: [{ id: uuidv4(), sectionTitle: "", lectures: [] }],
    },
    mode: "onChange",
  });

  const {
    fields: content,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({ control, name: "content" });
  const {
    fields: learningObjectives,
    append: appendObjective,
    remove: removeObjective,
  } = useFieldArray({ control, name: "learningObjectives" });
  const {
    fields: prerequisites,
    append: appendPrerequisite,
    remove: removePrerequisite,
  } = useFieldArray({ control, name: "prerequisites" });
  const {
    fields: targetAudience,
    append: appendAudience,
    remove: removeAudience,
  } = useFieldArray({ control, name: "targetAudience" });
  const {
    fields: categories,
    append: appendCategory,
    remove: removeCategory,
  } = useFieldArray({ control, name: "categories" });
  const {
    fields: tags,
    append: appendTag,
    remove: removeTag,
  } = useFieldArray({ control, name: "tags" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isFree = watch("isFree");
  const formData = watch();

  useEffect(() => {
    if (isFree) setValue("price", 0);
  }, [isFree, setValue]);

  useEffect(() => {
    const loadSuggestions = async () => {
      const { categories, tags } = await fetchSuggestedCategoriesTags();
      setSuggestedCategories(categories || []);
      setSuggestedTags(tags || []);
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
            title: course.title || { en: "", es: "", fr: "" },
            description: course.description || { en: "", es: "", fr: "" },
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
            content: course.content?.map((section) => ({
              id: section._id || uuidv4(),
              sectionTitle: section.sectionTitle,
              lectures:
                section.lectures?.map((lecture) => ({
                  id: lecture._id || uuidv4(),
                  title: lecture.title,
                  description: lecture.description || "",
                  videoFile: null,
                  videoUrl: lecture.video?.url || "",
                  duration: lecture.video?.duration || 0,
                })) || [],
            })) || [{ id: uuidv4(), sectionTitle: "", lectures: [] }],
          });
          if (course.draftVersions?.length) {
            setDraftVersions(course.draftVersions);
            setRestoreDraftDialog(true);
          }
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

  useEffect(() => {
    const updateChecklist = () => {
      const totalDuration = formData.content.reduce((total, section) => {
        return (
          total +
          section.lectures.reduce(
            (sum, lecture) => sum + (lecture.duration || 0),
            0
          )
        );
      }, 0);
      setPublishChecklist({
        hasTitle: !!formData.title?.en?.trim(),
        hasDescription: !!formData.description?.en?.trim(),
        hasObjectives:
          formData.learningObjectives?.some((obj) => obj.text.trim()) || false,
        hasCategories:
          formData.categories?.some((cat) => cat.name.trim()) || false,
        hasThumbnail: !!formData.thumbnail?.url,
        hasContent:
          formData.content?.some(
            (section) => section.sectionTitle && section.lectures?.length > 0
          ) || false,
        hasDuration: totalDuration >= 60,
      });
    };
    updateChecklist();
  }, [formData]);

  const debouncedAutosave = useCallback(
    debounce((data) => {
      const sanitizedData = {
        ...data,
        thumbnail: { file: null, url: data.thumbnail.url },
        previewVideo: {
          file: null,
          url: data.previewVideo.url,
          duration: data.previewVideo.duration,
        },
        content: data.content.map((section) => ({
          ...section,
          lectures: section.lectures.map((lecture) => ({
            ...lecture,
            videoFile: null,
            videoUrl: lecture.videoUrl,
            duration: lecture.duration,
          })),
        })),
      };
      autosaveDraft(courseId, sanitizedData);
      toast.info("Draft autosaved", { autoClose: 1000 });
    }, 2000),
    [courseId, autosaveDraft]
  );

  useEffect(() => {
    const subscription = watch((value) => debouncedAutosave(value));
    return () => subscription.unsubscribe();
  }, [watch, debouncedAutosave]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id && over?.id && active.id !== over.id) {
      const oldIndex = content.findIndex((item) => item.id === active.id);
      const newIndex = content.findIndex((item) => item.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newContent = arrayMove(content, oldIndex, newIndex);
        setValue("content", newContent);
        trigger("content");
      }
    }
  };

  const uploadMedia = async (
    file,
    folder,
    resourceType,
    onProgress,
    options = {}
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );
    formData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    );
    formData.append("folder", folder);
    if (options.transformations) {
      formData.append(
        "transformation",
        JSON.stringify(options.transformations)
      );
    }

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      formData,
      { onUploadProgress: onProgress }
    );
    return res.data;
  };

  const handleThumbnailUpload = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail file size cannot exceed 5MB");
      return;
    }
    setUploadingMedia((prev) => ({ ...prev, thumbnail: true }));
    try {
      const result = await uploadMedia(file, "course_thumbnails", "image");
      setValue("thumbnail.url", result.secure_url);
      setValue("thumbnail.file", null);
      trigger("thumbnail");
      toast.success("Thumbnail uploaded");
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      toast.error("Failed to upload thumbnail");
    } finally {
      setUploadingMedia((prev) => ({ ...prev, thumbnail: false }));
    }
  };

  const handlePreviewVideoUpload = async (file) => {
    if (file.size > 200 * 1024 * 1024) {
      toast.error("Preview video file size cannot exceed 200MB");
      return;
    }
    setUploadingMedia((prev) => ({ ...prev, previewVideo: true }));
    try {
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
      toast.success("Preview video uploaded");
    } catch (error) {
      console.error("Preview video upload error:", error);
      toast.error("Failed to upload preview video");
    } finally {
      setUploadingMedia((prev) => ({ ...prev, previewVideo: false }));
    }
  };

  const handleVideoUpload = async (sectionIndex, lectureIndex, file) => {
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
      toast.success(`Lecture video uploaded`);
      return result;
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error(`Failed to upload lecture video`);
      throw error;
    } finally {
      setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
    }
  };

  const onSubmit = async (data) => {
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
          ? { url: data.previewVideo.url, duration: data.previewVideo.duration }
          : null,
        content: data.content.map((section) => ({
          sectionTitle: section.sectionTitle,
          lectures: section.lectures
            .filter((l) => l.title.trim() && l.videoUrl)
            .map((l) => ({
              title: l.title,
              description: l.description,
              videoUrl: l.videoUrl,
              duration: l.duration,
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
              });
            }
          }
        }
        toast.success(
          courseId
            ? "Course updated successfully"
            : "Course created successfully"
        );
        router.push("/instructor/courses");
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
  };

  const handlePublish = async () => {
    const canPublish = Object.values(publishChecklist).every((item) => item);
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
  };

  const handleRestoreDraft = (versionData) => {
    reset({
      ...versionData,
      content: versionData.content.map((section) => ({
        ...section,
        id: section.id || uuidv4(),
        lectures: section.lectures.map((lecture) => ({
          ...lecture,
          id: lecture.id || uuidv4(),
        })),
      })),
      learningObjectives: versionData.learningObjectives.map((obj) => ({
        id: obj.id || uuidv4(),
        text: obj.text,
      })),
      prerequisites: versionData.prerequisites.map((obj) => ({
        id: obj.id || uuidv4(),
        text: obj.text,
      })),
      targetAudience: versionData.targetAudience.map((obj) => ({
        id: obj.id || uuidv4(),
        text: obj.text,
      })),
      categories: versionData.categories.map((cat) => ({
        id: cat.id || uuidv4(),
        name: cat.name,
      })),
      tags: versionData.tags.map((tag) => ({
        id: tag.id || uuidv4(),
        name: tag.name,
      })),
    });
    setRestoreDraftDialog(false);
    toast.success("Draft restored successfully");
  };

  const steps = [
    {
      label: "Basic Information",
      content: (
        <Box sx={{ maxWidth: 800 }}>
          <Tooltip title="Enter the course title in English (required) and other languages (optional)">
            <TextField
              fullWidth
              label="English Title"
              {...register("title.en", {
                required: "English title is required",
                minLength: {
                  value: 5,
                  message: "Title must be at least 5 characters",
                },
                maxLength: {
                  value: 200,
                  message: "Title cannot exceed 200 characters",
                },
              })}
              margin="normal"
              error={!!errors.title?.en}
              helperText={errors.title?.en?.message}
            />
          </Tooltip>
          <TextField
            fullWidth
            label="Spanish Title (Optional)"
            {...register("title.es", {
              maxLength: {
                value: 200,
                message: "Title cannot exceed 200 characters",
              },
            })}
            margin="normal"
            error={!!errors.title?.es}
            helperText={errors.title?.es?.message}
          />
          <TextField
            fullWidth
            label="French Title (Optional)"
            {...register("title.fr", {
              maxLength: {
                value: 200,
                message: "Title cannot exceed 200 characters",
              },
            })}
            margin="normal"
            error={!!errors.title?.fr}
            helperText={errors.title?.fr?.message}
          />
          <Controller
            name="description.en"
            control={control}
            rules={{
              required: "English description is required",
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
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Course Description (English)
                </Typography>
                <Editor
                  apiKey="khsgpv7gbp874ds6d2u3pab16l0fareackakzba70jnyqedw"
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
                />
                {errors.description?.en && (
                  <Typography color="error" variant="caption">
                    {errors.description?.en.message}
                  </Typography>
                )}
              </Box>
            )}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Level</InputLabel>
            <Select {...register("level")} defaultValue="All Levels">
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
              <MenuItem value="All Levels">All Levels</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Language</InputLabel>
            <Select {...register("language")} defaultValue="English">
              <MenuItem value="English">English</MenuItem>
              <MenuItem value="Spanish">Spanish</MenuItem>
              <MenuItem value="French">French</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={<Checkbox {...register("isFree")} />}
            label="Free course"
          />
          {!isFree && (
            <TextField
              fullWidth
              label="Price (USD)"
              type="number"
              {...register("price", {
                required: "Price is required for paid courses",
                min: { value: 1, message: "Price must be greater than 0" },
              })}
              margin="normal"
              error={!!errors.price}
              helperText={errors.price?.message}
              inputProps={{ step: "0.01" }}
            />
          )}
        </Box>
      ),
    },
    {
      label: "Learning Objectives & Audience",
      content: (
        <Box sx={{ maxWidth: 800 }}>
          <Typography variant="h6" gutterBottom>
            Learning Objectives
          </Typography>
          {learningObjectives.map((objective, index) => (
            <Box
              key={objective.id}
              sx={{ display: "flex", mb: 2, alignItems: "center" }}
            >
              <TextField
                fullWidth
                label={`Objective ${index + 1}`}
                {...register(`learningObjectives[${index}].text`, {
                  required:
                    index === 0 ? "At least one objective required" : false,
                  maxLength: {
                    value: 200,
                    message: "Objective cannot exceed 200 characters",
                  },
                })}
                error={!!errors.learningObjectives?.[index]?.text}
                helperText={errors.learningObjectives?.[index]?.text?.message}
              />
              <IconButton
                onClick={() => removeObjective(index)}
                disabled={learningObjectives.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => appendObjective({ id: uuidv4(), text: "" })}
            sx={{ mb: 3 }}
          >
            Add Objective
          </Button>
          <Typography variant="h6" gutterBottom>
            Prerequisites
          </Typography>
          {prerequisites.map((prereq, index) => (
            <Box
              key={prereq.id}
              sx={{ display: "flex", mb: 2, alignItems: "center" }}
            >
              <TextField
                fullWidth
                label={`Prerequisite ${index + 1}`}
                {...register(`prerequisites[${index}].text`, {
                  maxLength: {
                    value: 200,
                    message: "Prerequisite cannot exceed 200 characters",
                  },
                })}
                error={!!errors.prerequisites?.[index]?.text}
                helperText={errors.prerequisites?.[index]?.text?.message}
              />
              <IconButton
                onClick={() => removePrerequisite(index)}
                disabled={prerequisites.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => appendPrerequisite({ id: uuidv4(), text: "" })}
            sx={{ mb: 3 }}
          >
            Add Prerequisite
          </Button>
          <Typography variant="h6" gutterBottom>
            Target Audience
          </Typography>
          {targetAudience.map((audience, index) => (
            <Box
              key={audience.id}
              sx={{ display: "flex", mb: 2, alignItems: "center" }}
            >
              <TextField
                fullWidth
                label={`Audience ${index + 1}`}
                {...register(`targetAudience[${index}].text`, {
                  maxLength: {
                    value: 200,
                    message: "Audience cannot exceed 200 characters",
                  },
                })}
                error={!!errors.targetAudience?.[index]?.text}
                helperText={errors.targetAudience?.[index]?.text?.message}
              />
              <IconButton
                onClick={() => removeAudience(index)}
                disabled={targetAudience.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => appendAudience({ id: uuidv4(), text: "" })}
          >
            Add Audience
          </Button>
        </Box>
      ),
    },
    {
      label: "Categories & Tags",
      content: (
        <Box sx={{ maxWidth: 800 }}>
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          {categories.map((category, index) => (
            <Box
              key={category.id}
              sx={{ display: "flex", mb: 2, alignItems: "center" }}
            >
              <Autocomplete
                fullWidth
                freeSolo
                options={suggestedCategories}
                value={category.name}
                onChange={(e, value) =>
                  setValue(`categories[${index}].name`, value || "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Category ${index + 1}`}
                    {...register(`categories[${index}].name`, {
                      required:
                        index === 0 ? "At least one category required" : false,
                      maxLength: {
                        value: 50,
                        message: "Category cannot exceed 50 characters",
                      },
                    })}
                    error={!!errors.categories?.[index]?.name}
                    helperText={errors.categories?.[index]?.name?.message}
                  />
                )}
              />
              <IconButton
                onClick={() => removeCategory(index)}
                disabled={categories.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => appendCategory({ id: uuidv4(), name: "" })}
            sx={{ mb: 3 }}
          >
            Add Category
          </Button>
          <Typography variant="h6" gutterBottom>
            Tags
          </Typography>
          {tags.map((tag, index) => (
            <Box
              key={tag.id}
              sx={{ display: "flex", mb: 2, alignItems: "center" }}
            >
              <Autocomplete
                fullWidth
                freeSolo
                options={suggestedTags}
                value={tag.name}
                onChange={(e, value) =>
                  setValue(`tags[${index}].name`, value || "")
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={`Tag ${index + 1}`}
                    {...register(`tags[${index}].name`, {
                      maxLength: {
                        value: 50,
                        message: "Tag cannot exceed 50 characters",
                      },
                    })}
                    error={!!errors.tags?.[index]?.name}
                    helperText={errors.tags?.[index]?.name?.message}
                  />
                )}
              />
              <IconButton
                onClick={() => removeTag(index)}
                disabled={tags.length === 1}
              >
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => appendTag({ id: uuidv4(), name: "" })}
          >
            Add Tag
          </Button>
        </Box>
      ),
    },
    {
      label: "Media",
      content: (
        <Box sx={{ maxWidth: 800 }}>
          <Tooltip title="Upload a thumbnail image (JPEG/PNG, max 5MB)">
            <Button
              variant="outlined"
              onClick={() =>
                document.getElementById("thumbnail-upload").click()
              }
              disabled={uploadingMedia.thumbnail}
              startIcon={
                uploadingMedia.thumbnail && <CircularProgress size={20} />
              }
            >
              Upload Thumbnail
            </Button>
          </Tooltip>
          <input
            type="file"
            id="thumbnail-upload"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleThumbnailUpload(file);
            }}
          />
          {watch("thumbnail.url") && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Thumbnail Preview:</Typography>
              <img
                src={watch("thumbnail.url")}
                alt="Thumbnail"
                style={{ maxWidth: "100%", maxHeight: 200 }}
              />
            </Box>
          )}
          <Tooltip title="Upload a preview video (MP4, max 200MB, 5 minutes)">
            <Button
              variant="outlined"
              onClick={() => document.getElementById("preview-video").click()}
              disabled={uploadingMedia.previewVideo}
              startIcon={
                uploadingMedia.previewVideo && <CircularProgress size={20} />
              }
              sx={{ mt: 2 }}
            >
              Upload Preview Video
            </Button>
          </Tooltip>
          <input
            type="file"
            id="preview-video"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handlePreviewVideoUpload(file);
            }}
          />
          {watch("previewVideo.url") && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Preview Video:</Typography>
              <video
                src={watch("previewVideo.url")}
                controls
                style={{ maxWidth: "100%", maxHeight: 200 }}
              />
            </Box>
          )}
        </Box>
      ),
    },
    {
      label: "Content",
      content: (
        <Box sx={{ maxWidth: 800 }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
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
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              appendSection({ id: uuidv4(), sectionTitle: "", lectures: [] })
            }
          >
            Add Section
          </Button>
        </Box>
      ),
    },
    {
      label: "Review & Publish",
      content: (
        <Box sx={{ maxWidth: 800 }}>
          <Typography variant="h6" gutterBottom>
            Publish Readiness Checklist
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Course Title (English)"
                secondary={publishChecklist.hasTitle ? "Completed" : "Missing"}
              />
              {publishChecklist.hasTitle ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Course Description (English)"
                secondary={
                  publishChecklist.hasDescription ? "Completed" : "Missing"
                }
              />
              {publishChecklist.hasDescription ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Learning Objectives"
                secondary={
                  publishChecklist.hasObjectives ? "Completed" : "Missing"
                }
              />
              {publishChecklist.hasObjectives ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Categories"
                secondary={
                  publishChecklist.hasCategories ? "Completed" : "Missing"
                }
              />
              {publishChecklist.hasCategories ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Thumbnail"
                secondary={
                  publishChecklist.hasThumbnail ? "Completed" : "Missing"
                }
              />
              {publishChecklist.hasThumbnail ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Content (At least one section with lectures)"
                secondary={
                  publishChecklist.hasContent ? "Completed" : "Missing"
                }
              />
              {publishChecklist.hasContent ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Total Duration (At least 1 minute)"
                secondary={
                  publishChecklist.hasDuration ? "Completed" : "Missing"
                }
              />
              {publishChecklist.hasDuration ? (
                <CheckCircle color="success" />
              ) : (
                <Warning color="warning" />
              )}
            </ListItem>
          </List>
        </Box>
      ),
    },
  ];

  const progress = Math.round((activeStep / (steps.length - 1)) * 100);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 4, px: { xs: 2, sm: 4 } }}>
      <Typography variant="h4" gutterBottom>
        {courseId ? "Edit Course" : "Create New Course"}
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="body2" gutterBottom>
          Progress: {progress}%
        </Typography>
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
                    variant="contained"
                    onClick={async () => {
                      const isStepValid = await trigger(
                        activeStep === 0
                          ? [
                              "title.en",
                              "description.en",
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
                          : ["content"]
                      );
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
                    <Button
                      type="submit"
                      variant="contained"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isLoading || isSubmitting}
                      startIcon={isSubmitting && <CircularProgress size={20} />}
                    >
                      {courseId ? "Update Course" : "Create Course"}
                    </Button>
                    {courseId && (
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handlePublish}
                        disabled={
                          !isValid ||
                          isSubmitting ||
                          !Object.values(publishChecklist).every((item) => item)
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
      <Dialog
        open={restoreDraftDialog}
        onClose={() => setRestoreDraftDialog(false)}
      >
        <DialogTitle>Restore Draft</DialogTitle>
        <DialogContent>
          <Typography>
            Previous draft versions found. Select one to restore:
          </Typography>
          <List>
            {draftVersions.map((version) => (
              <ListItem
                key={version.version}
                button
                onClick={() => handleRestoreDraft(version.data)}
              >
                <ListItemText
                  primary={`Version ${version.version}`}
                  secondary={new Date(version.savedAt).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDraftDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseCreationWizard;
