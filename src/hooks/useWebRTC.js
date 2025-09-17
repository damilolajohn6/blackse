import { useState, useEffect, useRef, useCallback } from 'react';
import useInstructorStore from '@/store/instructorStore';
import { toast } from 'react-toastify';

export const useWebRTC = (liveClassId) => {
  const { 
    activeLiveClass, 
    joinLiveClass, 
    leaveLiveClass,
    muteParticipant,
    removeParticipant,
    getLiveClassParticipants 
  } = useInstructorStore();

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const peerConnections = useRef(new Map());
  const socketRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Initialize WebRTC connection
  const initializeWebRTC = useCallback(async () => {
    try {
      setConnectionState('connecting');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      mediaStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Join the live class
      const result = await joinLiveClass(liveClassId);
      if (result.success) {
        setIsConnected(true);
        setConnectionState('connected');
        
        // Initialize Socket.IO connection for signaling
        initializeSocketConnection(result.webrtcConfig);
        
        // Load participants
        loadParticipants();
      } else {
        throw new Error(result.message || 'Failed to join live class');
      }
    } catch (err) {
      console.error('WebRTC initialization error:', err);
      setError(err.message);
      setConnectionState('error');
      toast.error('Failed to initialize WebRTC connection');
    }
  }, [liveClassId, joinLiveClass]);

  // Initialize Socket.IO connection
  const initializeSocketConnection = useCallback((config) => {
    // This would connect to your Socket.IO server
    // For now, we'll simulate the connection
    console.log('Socket connection initialized with config:', config);
    
    // In a real implementation, you would:
    // 1. Connect to Socket.IO server
    // 2. Join the live class room
    // 3. Listen for WebRTC signaling events
    // 4. Handle peer connections
  }, []);

  // Load participants
  const loadParticipants = useCallback(async () => {
    try {
      const result = await getLiveClassParticipants(liveClassId);
      if (result.success) {
        setParticipants(result.participants);
      }
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  }, [liveClassId, getLiveClassParticipants]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [localStream, isVideoEnabled]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        const videoTracks = localStream.getVideoTracks();
        videoTracks.forEach(track => track.stop());
        
        // Get camera stream back
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        mediaStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnections.current.values().next().value?.getSenders()
          .find(s => s.track && s.track.kind === 'video');
        
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        setLocalStream(stream);
        mediaStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share end
        videoTrack.onended = () => {
          toggleScreenShare();
        };
      }
    } catch (err) {
      console.error('Screen share error:', err);
      toast.error('Failed to toggle screen sharing');
    }
  }, [isScreenSharing, localStream]);

  // Mute a participant
  const muteParticipantAudio = useCallback(async (participantId) => {
    try {
      await muteParticipant(liveClassId, participantId, true);
      toast.success('Participant muted');
    } catch (err) {
      console.error('Failed to mute participant:', err);
      toast.error('Failed to mute participant');
    }
  }, [liveClassId, muteParticipant]);

  // Remove a participant
  const removeParticipantFromClass = useCallback(async (participantId) => {
    try {
      await removeParticipant(liveClassId, participantId);
      toast.success('Participant removed');
    } catch (err) {
      console.error('Failed to remove participant:', err);
      toast.error('Failed to remove participant');
    }
  }, [liveClassId, removeParticipant]);

  // Leave the live class
  const leaveClass = useCallback(async () => {
    try {
      setConnectionState('disconnecting');
      
      // Stop local stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      
      // Leave the live class
      await leaveLiveClass(liveClassId);
      
      setIsConnected(false);
      setConnectionState('disconnected');
      setLocalStream(null);
      setRemoteStreams(new Map());
      setParticipants([]);
      
      toast.success('Left live class');
    } catch (err) {
      console.error('Failed to leave live class:', err);
      toast.error('Failed to leave live class');
    }
  }, [liveClassId, leaveLiveClass]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    // State
    isConnected,
    isMuted,
    isVideoEnabled,
    isScreenSharing,
    participants,
    localStream,
    remoteStreams,
    connectionState,
    error,
    
    // Refs
    localVideoRef,
    remoteVideoRefs,
    
    // Actions
    initializeWebRTC,
    toggleMicrophone,
    toggleVideo,
    toggleScreenShare,
    muteParticipantAudio,
    removeParticipantFromClass,
    leaveClass,
    loadParticipants,
  };
};

export default useWebRTC;
