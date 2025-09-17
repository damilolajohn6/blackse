"use client";

import React from "react";
import { useParams } from "next/navigation";
import LiveClassRoom from "@/components/LiveClassRoom";

const LiveClassRoomPage = () => {
  const params = useParams();
  const liveClassId = params.id;

  if (!liveClassId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Live Class</h2>
          <p className="text-muted-foreground">
            No live class ID provided.
          </p>
        </div>
      </div>
    );
  }

  return <LiveClassRoom liveClassId={liveClassId} />;
};

export default LiveClassRoomPage;
