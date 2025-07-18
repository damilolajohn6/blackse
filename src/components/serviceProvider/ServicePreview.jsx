import { DollarSign, Clock, Tag, Star, CheckCircle } from "lucide-react";

const ServicePreview = ({ service }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Service Images */}
        {service.images && service.images.length > 0 && (
          <div className="relative h-64 bg-gray-100">
            <img
              src={service.images[0]}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            {service.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                +{service.images.length - 1} more
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {service.name || "Service Name"}
              </h1>
              {service.category && (
                <p className="text-sm text-gray-600 mt-1">{service.category}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ${service.price || "0.00"}
              </div>
              <div className="text-sm text-gray-600">
                {service.pricingType === "hourly" ? "per hour" : "flat rate"}
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="flex items-center space-x-6 mb-6">
            {service.duration && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {service.duration}
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              {service.pricingType === "hourly" ? "Hourly Rate" : "Fixed Price"}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {service.description || "No description provided"}
            </p>
          </div>

          {/* Features */}
          {service.features && service.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What's Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {service.requirements && service.requirements.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Requirements
              </h3>
              <div className="space-y-2">
                {service.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  5.0 (Preview)
                </span>
              </div>
            </div>
            <button className="btn btn-primary">Book Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePreview;
