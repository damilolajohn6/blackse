"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebRTC } from "@/hooks/useWebRTC";
import useInstructorStore from "@/store/instructorStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Users, 
  Settings,
  MoreHorizontal,
  Volume2,
  VolumeX,
  UserX,
  MessageSquare,
  Share2,
  Clock,
  Eye
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

const LiveClassRoom = ({ liveClassId }) => {
  const router = useRouter();
  const { 
    activeLiveClass, 
    getLiveClassById, 
    endLiveClass,
    getLiveClassParticipants 
  } = useInstructorStore();

  const {
    isConnected,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    participants,
    localVideoRef,
    connectionState,
    error,
    initializeWebRTC,
    toggleMicrophone,
    toggleVideo,
    toggleScreenShare,
    muteParticipantAudio,
    removeParticipantFromClass,
    leaveClass,
    loadParticipants
  } = useWebRTC(liveClassId);

  const [liveClass, setLiveClass] = useState(null);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLiveClass();
  }, [liveClassId]);

  useEffect(() => {
    if (liveClass) {
      initializeWebRTC();
    }
  }, [liveClass, initializeWebRTC]);

  useEffect(() => {
    // Refresh participants every 10 seconds
    const interval = setInterval(() => {
      if (isConnected) {
        loadParticipants();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isConnected, loadParticipants]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndClass = async () => {
    if (window.confirm("Are you sure you want to end this live class?")) {
      try {
        await endLiveClass(liveClassId);
        toast.success("Live class ended successfully");
        router.push("/instructor/dashboard/live-classes");
      } catch (err) {
        console.error("Failed to end live class:", err);
        toast.error("Failed to end live class");
      }
    }
  };

  const handleLeaveClass = async () => {
    if (window.confirm("Are you sure you want to leave this live class?")) {
      await leaveClass();
      router.push("/instructor/dashboard/live-classes");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading live class...</p>
        </div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Live Class Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The live class you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/instructor/dashboard/live-classes")}>
            Back to Live Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">{liveClass.title}</h1>
            <p className="text-sm text-gray-400">
              {format(new Date(liveClass.scheduledAt), "MMM dd, yyyy 'at' HH:mm")}
            </p>
          </div>
          <Badge variant="destructive" className="animate-pulse">
            LIVE
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users className="w-4 h-4 mr-2" />
            {participants.length}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Video */}
          <div className="flex-1 relative bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Connection Status */}
            <div className="absolute top-4 left-4">
              <Badge 
                variant={connectionState === 'connected' ? 'default' : 'secondary'}
                className="bg-opacity-80"
              >
                {connectionState === 'connected' ? 'Connected' : 'Connecting...'}
              </Badge>
            </div>

            {/* Error Message */}
            {error && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-2 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-800">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              onClick={toggleMicrophone}
              className="rounded-full w-12 h-12"
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={!isVideoEnabled ? "destructive" : "outline"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-12 h-12"
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? "default" : "outline"}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-12 h-12"
            >
              <Monitor className="w-6 h-6" />
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndClass}
              className="rounded-full w-12 h-12"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Participants */}
            {showParticipants && (
              <div className="flex-1 p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants ({participants.length})
                </h3>
                
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant._id}
                      className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>
                            {participant.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{participant.name}</p>
                          <p className="text-xs text-gray-400">
                            {participant.isMuted ? 'Muted' : 'Speaking'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => muteParticipantAudio(participant._id)}
                        >
                          {participant.isMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipantFromClass(participant._id)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            {showChat && (
              <div className="flex-1 p-4 border-t border-gray-700">
                <h3 className="font-semibold mb-4">Chat</h3>
                <div className="space-y-2 mb-4 h-64 overflow-y-auto">
                  {/* Chat messages would go here */}
                  <div className="text-center text-gray-400 text-sm">
                    Chat feature coming soon
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-sm"
                    disabled
                  />
                  <Button size="sm" disabled>
                    Send
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClassRoom;
