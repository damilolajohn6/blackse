"use client"
import {
  DollarSign,
  Clock,
  Star,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";

const ServiceCard = ({
  service,
  viewMode = "grid",
  onEdit,
  onDelete,
  onView,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (action) => {
    setShowMenu(false);
    action();
  };

  if (viewMode === "list") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {service.images && service.images[0] && (
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {service.description}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />${service.price}{" "}
                  {service.pricingType === "hourly" ? "/hr" : ""}
                </div>
                {service.duration && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onView}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Service Image */}
      <div className="relative h-48 bg-gray-100">
        {service.images && service.images[0] ? (
          <img
            src={service.images[0]}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Menu Button */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => handleMenuClick(onView)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => handleMenuClick(onEdit)}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Service
                </button>
                <button
                  onClick={() => handleMenuClick(onDelete)}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Service
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Service Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {service.name}
          </h3>
          <span className="text-lg font-bold text-green-600">
            ${service.price}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {service.pricingType === "hourly" ? "Hourly" : "Fixed"}
            </div>
            {service.duration && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {service.duration}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span>5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;