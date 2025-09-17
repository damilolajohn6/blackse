"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useInstructorStore from "@/store/instructorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Play, 
  Edit, 
  Trash2, 
  Eye,
  BarChart3,
  MessageSquare,
  Download,
  Share2,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";

const LiveClassDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const liveClassId = params.id;

  const {
    getLiveClassById,
    deleteLiveClass,
    startLiveClass,
    endLiveClass,
    getLiveClassAnalytics,
    getLiveClassParticipants,
    isLoading
  } = useInstructorStore();

  const [liveClass, setLiveClass] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (liveClassId) {
      loadLiveClass();
      loadAnalytics();
      loadParticipants();
    }
  }, [liveClassId]);

  const loadLiveClass = async () => {
    try {
      const result = await getLiveClassById(liveClassId);
      if (result.success) {
        setLiveClass(result.liveClass);
      } else {
        toast.error(result.message || "Failed to load live class");
        router.push("/instructor/dashboard/live-classes");
      }
    } catch (err) {
      console.error("Failed to load live class:", err);
      toast.error("Failed to load live class");
      router.push("/instructor/dashboard/live-classes");
    }
  };

  const loadAnalytics = async () => {
    try {
      const result = await getLiveClassAnalytics(liveClassId);
      if (result.success) {
        setAnalytics(result.analytics);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  const loadParticipants = async () => {
    try {
      const result = await getLiveClassParticipants(liveClassId);
      if (result.success) {
        setParticipants(result.participants);
      }
    } catch (err) {
      console.error("Failed to load participants:", err);
    }
  };

  const handleStartClass = async () => {
    const result = await startLiveClass(liveClassId);
    if (result.success) {
      router.push(`/instructor/dashboard/live-classes/${liveClassId}/live`);
    }
  };

  const handleEndClass = async () => {
    const result = await endLiveClass(liveClassId);
    if (result.success) {
      loadLiveClass();
    }
  };

  const handleDeleteClass = async () => {
    if (window.confirm("Are you sure you want to delete this live class?")) {
      const result = await deleteLiveClass(liveClassId);
      if (result.success) {
        router.push("/instructor/dashboard/live-classes");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { variant: "secondary", label: "Scheduled" },
      live: { variant: "destructive", label: "Live" },
      ended: { variant: "outline", label: "Ended" },
      cancelled: { variant: "secondary", label: "Cancelled" },
    };
    
    const config = statusConfig[status] || statusConfig.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!liveClass) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading live class...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{liveClass.title}</h1>
            {getStatusBadge(liveClass.status)}
          </div>
          <p className="text-muted-foreground text-lg">{liveClass.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {liveClass.status === "scheduled" && (
            <Button onClick={handleStartClass} disabled={isLoading}>
              <Play className="w-4 h-4 mr-2" />
              Start Class
            </Button>
          )}
          
          {liveClass.status === "live" && (
            <Button variant="destructive" onClick={handleEndClass} disabled={isLoading}>
              <Video className="w-4 h-4 mr-2" />
              End Class
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => router.push(`/instructor/dashboard/live-classes/edit/${liveClassId}`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          <Button variant="outline" onClick={handleDeleteClass} disabled={isLoading}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {format(new Date(liveClass.scheduledAt), "MMM dd")}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(liveClass.scheduledAt), "HH:mm")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveClass.duration}</div>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveClass.maxParticipants}</div>
            <p className="text-xs text-muted-foreground">students</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Participants</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">joined</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Details */}
            <Card>
              <CardHeader>
                <CardTitle>Class Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Description</h4>
                  <p className="text-muted-foreground">{liveClass.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Requirements</h4>
                  <p className="text-muted-foreground">
                    {liveClass.requirements || "No specific requirements"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Materials</h4>
                  <p className="text-muted-foreground">
                    {liveClass.materials || "No materials required"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {liveClass.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Class Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Visibility</h4>
                  <p className="text-muted-foreground">
                    {liveClass.isPublic ? "Public" : "Private"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Recording: {liveClass.allowRecording ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-sm">
                      Chat: {liveClass.allowChat ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-sm">
                      Screen Share: {liveClass.allowScreenShare ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-sm">
                      File Share: {liveClass.allowFileShare ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participants ({participants.length})</CardTitle>
              <CardDescription>
                Students who have joined or are scheduled to join this live class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {participants.length > 0 ? (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                          {participant.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={participant.isOnline ? "default" : "secondary"}>
                          {participant.isOnline ? "Online" : "Offline"}
                        </Badge>
                        {participant.joinedAt && (
                          <p className="text-sm text-muted-foreground">
                            Joined {format(new Date(participant.joinedAt), "MMM dd, HH:mm")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
                  <p className="text-muted-foreground">
                    Students will appear here once they join the live class.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights for this live class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{analytics.totalParticipants || 0}</div>
                      <p className="text-sm text-muted-foreground">Total Participants</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{analytics.averageDuration || 0}</div>
                      <p className="text-sm text-muted-foreground">Avg Duration (min)</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{analytics.completionRate || 0}%</div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No analytics available</h3>
                  <p className="text-muted-foreground">
                    Analytics will be available after the live class ends.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Settings</CardTitle>
              <CardDescription>
                Manage your live class configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Settings Panel</h3>
                <p className="text-muted-foreground">
                  Advanced settings and configuration options will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveClassDetailsPage;
