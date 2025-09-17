"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useInstructorStore from "@/store/instructorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Calendar, 
  Clock, 
  Users, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Search,
  Filter,
  Video,
  Mic,
  MicOff,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";

const LiveClassesPage = () => {
  const router = useRouter();
  const {
    liveClasses,
    totalLiveClasses,
    isLoading,
    fetchLiveClasses,
    deleteLiveClass,
    startLiveClass,
    endLiveClass,
    getLiveClassStats,
    liveClassStats
  } = useInstructorStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [liveClassToDelete, setLiveClassToDelete] = useState(null);

  useEffect(() => {
    loadLiveClasses();
    loadStats();
  }, []);

  const loadLiveClasses = async () => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy,
    };
    await fetchLiveClasses(params);
  };

  const loadStats = async () => {
    await getLiveClassStats();
  };

  useEffect(() => {
    loadLiveClasses();
  }, [currentPage, searchTerm, statusFilter, sortBy]);

  const handleDeleteLiveClass = async () => {
    if (!liveClassToDelete) return;
    
    const result = await deleteLiveClass(liveClassToDelete._id);
    if (result.success) {
      setDeleteDialogOpen(false);
      setLiveClassToDelete(null);
      loadLiveClasses();
    }
  };

  const handleStartLiveClass = async (liveClass) => {
    const result = await startLiveClass(liveClass._id);
    if (result.success) {
      router.push(`/instructor/dashboard/live-classes/${liveClass._id}/live`);
    }
  };

  const handleEndLiveClass = async (liveClass) => {
    const result = await endLiveClass(liveClass._id);
    if (result.success) {
      loadLiveClasses();
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

  const filteredLiveClasses = liveClasses.filter((liveClass) => {
    const matchesSearch = liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liveClass.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || liveClass.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalLiveClasses / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Classes</h1>
          <p className="text-muted-foreground">
            Manage your live classes and interact with students in real-time
          </p>
        </div>
        <Button onClick={() => router.push("/instructor/dashboard/live-classes/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Live Class
        </Button>
      </div>

      {/* Stats Cards */}
      {liveClassStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveClassStats.totalLiveClasses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveClassStats.activeLiveClasses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveClassStats.totalParticipants}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveClassStats.averageParticipants}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search live classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="scheduledAt">Scheduled Date</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="participantCount">Participants</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Live Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLiveClasses.map((liveClass) => (
          <Card key={liveClass._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{liveClass.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {liveClass.description}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(liveClass.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(liveClass.scheduledAt), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(liveClass.scheduledAt), "HH:mm")}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {liveClass.participantCount || 0} participants
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {liveClass.duration || 60} min
                </div>
              </div>
              
              <div className="flex gap-2">
                {liveClass.status === "scheduled" && (
                  <Button 
                    size="sm" 
                    onClick={() => handleStartLiveClass(liveClass)}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                
                {liveClass.status === "live" && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleEndLiveClass(liveClass)}
                    className="flex-1"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    End
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/instructor/dashboard/live-classes/${liveClass._id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/instructor/dashboard/live-classes/edit/${liveClass._id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setLiveClassToDelete(liveClass)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Live Class</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{liveClass.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteLiveClass}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLiveClasses.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No live classes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Create your first live class to start teaching in real-time."
              }
            </p>
            <Button onClick={() => router.push("/instructor/dashboard/live-classes/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Live Class
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveClassesPage;
