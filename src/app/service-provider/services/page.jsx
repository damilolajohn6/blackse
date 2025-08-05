"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  Star,
  MoreVertical,
  SortAsc,
  SortDesc,
  Grid,
  List,
} from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import ServiceCard from "@/components/serviceProvider/ServiceCard";
import ServiceModal from "@/components/serviceProvider/ServiceModal";
import DeleteConfirmModal from "@/components/serviceProvider/common/DeleteConfirmModal";
import useServiceProviderStore from "@/store/serviceStore";
import { toast } from "react-toastify";

import { Poppins } from "next/font/google";
const poppins = Poppins(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)

const ServicesPage = () => {
  const router = useRouter();
  const {
    servicesOffered,
    serviceStats,
    fetchServicesOffered,
    deleteService,
    isLoading,
    error,
  } = useServiceProviderStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedService, setSelectedService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  useEffect(() => {
    fetchServicesOffered();
  }, [fetchServicesOffered]);

  // Filter and sort services
  const filteredAndSortedServices = servicesOffered
    .filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterBy === "all" || service.pricingType === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleEditService = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (serviceToDelete) {
      try {
        await deleteService(serviceToDelete._id);
        toast.success("Service deleted successfully");
        setShowDeleteModal(false);
        setServiceToDelete(null);
      } catch (error) {
        toast.error("Failed to delete service");
      }
    }
  };

  const handleViewService = (service) => {
    router.push(`/service-provider/services/${service._id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600 mt-1">
                Manage your service offerings and pricing
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <Link
                href="/service-provider/services/new"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Grid className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {serviceStats.totalServices}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {servicesOffered.length > 0
                    ? (
                        servicesOffered.reduce(
                          (sum, service) => sum + service.price,
                          0
                        ) / servicesOffered.length
                      ).toFixed(0)
                    : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Popular Service
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {servicesOffered.length > 0
                    ? servicesOffered[0].name
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="form-input"
              >
                <option value="all">All Types</option>
                <option value="flat">Flat Rate</option>
                <option value="hourly">Hourly Rate</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="pricingType">Type</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="btn btn-outline"
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${
                    viewMode === "list"
                      ? "bg-indigo-100 text-indigo-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredAndSortedServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Get started by adding your first service"}
              </p>
              <Link
                href="/service-provider/services/new"
                className="btn btn-primary flex flex-col items-center gap-2"
              >
                <Plus className="size-8" />
                <p className={`${poppins.className}`}>Add Service</p>
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredAndSortedServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  viewMode={viewMode}
                  onEdit={() => handleEditService(service)}
                  onDelete={() => handleDeleteService(service)}
                  onView={() => handleViewService(service)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Service Modal */}
        {showServiceModal && (
          <ServiceModal
            service={selectedService}
            onClose={() => {
              setShowServiceModal(false);
              setSelectedService(null);
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Delete Service"
            message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ServicesPage;
