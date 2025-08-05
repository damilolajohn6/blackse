import { Calendar, Clock, User, MapPin } from "lucide-react";

const UpcomingBookings = () => {
  const bookings = [
    {
      id: 1,
      service: "House Cleaning",
      client: "Emily Davis",
      date: "2024-01-15",
      time: "10:00 AM",
      location: "123 Main St, Anytown",
      status: "confirmed",
    },
    {
      id: 2,
      service: "Plumbing Repair",
      client: "Robert Smith",
      date: "2024-01-16",
      time: "2:00 PM",
      location: "456 Oak Ave, Somewhere",
      status: "pending",
    },
    {
      id: 3,
      service: "Garden Maintenance",
      client: "Lisa Johnson",
      date: "2024-01-17",
      time: "9:00 AM",
      location: "789 Pine Rd, Elsewhere",
      status: "confirmed",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Upcoming Bookings
      </h3>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{booking.service}</h4>
                <div className="flex items-center space-x-4 my-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <p className="whitespace-nowrap">{booking.client}</p>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(booking.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <p className="whitespace-nowrap">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p className="whitespace-nowrap">{booking.location}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          View all bookings
        </button>
      </div>
    </div>
  );
};

export default UpcomingBookings;
