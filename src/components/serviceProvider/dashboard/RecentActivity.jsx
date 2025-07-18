import { Clock, CheckCircle, XCircle, MessageSquare, Star } from "lucide-react";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "booking",
      title: "New booking received",
      description: "House cleaning service booked by John Doe",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      id: 2,
      type: "message",
      title: "New message",
      description: "Message from Sarah Johnson about plumbing service",
      time: "4 hours ago",
      icon: MessageSquare,
      color: "text-blue-500",
    },
    {
      id: 3,
      type: "review",
      title: "New review received",
      description: "5-star review from Mike Wilson",
      time: "1 day ago",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      id: 4,
      type: "booking",
      title: "Booking completed",
      description: "Garden maintenance service completed",
      time: "2 days ago",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      id: 5,
      type: "booking",
      title: "Booking cancelled",
      description: "Carpet cleaning service cancelled by client",
      time: "3 days ago",
      icon: XCircle,
      color: "text-red-500",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-1 rounded-full ${activity.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
