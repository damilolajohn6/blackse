"use client";

import Link from "next/link";
import { Typography, Card, CardContent, CardMedia, Chip } from "@mui/material";

const EventCard = ({ event }) => {
  return (
    <Link href={`/shop/event/${event._id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        {event.images?.[0]?.url ? (
          <CardMedia
            component="img"
            height="200"
            image={event.images[0].url}
            alt={event.name}
            className="object-cover"
          />
        ) : (
          <div className="h-[200px] bg-gray-200 flex items-center justify-center">
            <Typography>No Image</Typography>
          </div>
        )}
        <CardContent>
          <Typography variant="h6" className="font-semibold truncate">
            {event.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {event.category}
          </Typography>
          <Typography variant="body1" className="font-medium">
            ${event.discountPrice.toFixed(2)}
            {event.originalPrice &&
              event.discountPrice < event.originalPrice && (
                <span className="text-gray-500 line-through ml-2">
                  ${event.originalPrice.toFixed(2)}
                </span>
              )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stock: {event.stock}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(event.start_Date).toLocaleDateString()} -{" "}
            {new Date(event.Finish_Date).toLocaleDateString()}
          </Typography>
          <Chip
            label={event.status}
            color={
              event.status === "Running"
                ? "success"
                : event.status === "Completed"
                ? "primary"
                : "error"
            }
            size="small"
            className="mt-2"
          />
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;
