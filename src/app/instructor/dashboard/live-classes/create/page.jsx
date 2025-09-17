"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useInstructorStore from "@/store/instructorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Video, 
  Mic, 
  Settings,
  ArrowLeft,
  Save,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

const CreateLiveClassPage = () => {
  const router = useRouter();
  const { createLiveClass, isLoading, courses, fetchCourses } = useInstructorStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledAt: new Date(),
    duration: 60,
    maxParticipants: 100,
    isPublic: true,
    allowRecording: false,
    allowChat: true,
    allowScreenShare: true,
    allowFileShare: false,
    requirements: "",
    materials: "",
    tags: [],
  });

  const [errors, setErrors] = useState({});
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeValue, setTimeValue] = useState("14:00");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    await fetchCourses({ status: "published" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.courseId) {
      newErrors.courseId = "Please select a course";
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = "Scheduled date is required";
    } else if (formData.scheduledAt < new Date()) {
      newErrors.scheduledAt = "Scheduled date must be in the future";
    }

    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = "Duration must be between 15 and 480 minutes";
    }

    if (formData.maxParticipants < 1 || formData.maxParticipants > 1000) {
      newErrors.maxParticipants = "Max participants must be between 1 and 1000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Combine date and time
    const [hours, minutes] = timeValue.split(":").map(Number);
    const scheduledDateTime = new Date(formData.scheduledAt);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    const liveClassData = {
      ...formData,
      scheduledAt: scheduledDateTime,
      tags: formData.tags.filter(tag => tag.trim()),
    };

    const result = await createLiveClass(liveClassData, router);
    if (result.success) {
      toast.success("Live class created successfully!");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = (tag) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Live Class</h1>
          <p className="text-muted-foreground">
            Set up a new live class for your students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Provide the essential details for your live class
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter live class title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what students will learn in this live class"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => handleInputChange("courseId", value)}
              >
                <SelectTrigger className={errors.courseId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && (
                <p className="text-sm text-red-500">{errors.courseId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Add a tag and press Enter"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Schedule & Duration
            </CardTitle>
            <CardDescription>
              Set when your live class will take place
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduledAt && "text-muted-foreground",
                        errors.scheduledAt && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledAt ? (
                        format(formData.scheduledAt, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledAt}
                      onSelect={(date) => {
                        handleInputChange("scheduledAt", date);
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.scheduledAt && (
                  <p className="text-sm text-red-500">{errors.scheduledAt}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                  className={errors.duration ? "border-red-500" : ""}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value))}
                  className={errors.maxParticipants ? "border-red-500" : ""}
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-red-500">{errors.maxParticipants}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Class Settings
            </CardTitle>
            <CardDescription>
              Configure the features and permissions for your live class
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Class</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone to join
                    </p>
                  </div>
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Recording</Label>
                    <p className="text-sm text-muted-foreground">
                      Record the live class
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowRecording}
                    onCheckedChange={(checked) => handleInputChange("allowRecording", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Chat</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable chat during class
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowChat}
                    onCheckedChange={(checked) => handleInputChange("allowChat", checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Screen Share</Label>
                    <p className="text-sm text-muted-foreground">
                      Students can share their screen
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowScreenShare}
                    onCheckedChange={(checked) => handleInputChange("allowScreenShare", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow File Share</Label>
                    <p className="text-sm text-muted-foreground">
                      Students can share files
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowFileShare}
                    onCheckedChange={(checked) => handleInputChange("allowFileShare", checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Provide any additional details for your students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                placeholder="List any prerequisites or requirements for this live class"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materials">Materials</Label>
              <Textarea
                id="materials"
                value={formData.materials}
                onChange={(e) => handleInputChange("materials", e.target.value)}
                placeholder="List any materials or resources students should have ready"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Create Live Class
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateLiveClassPage;
