"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  DollarSign,
  Clock,
  FileText,
  Tag,
} from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import ServiceForm from "@/components/serviceProvider/ServiceForm";
import ServicePreview from "@/components/serviceProvider/ServicePreview";
import useServiceProviderStore from "@/store/serviceStore";
import { toast } from "react-toastify";

const NewServicePage = () => {
  const router = useRouter();
  const { addService, isLoading } = useServiceProviderStore();
  const [activeTab, setActiveTab] = useState("form");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    pricingType: "flat",
    duration: "",
    category: "",
    tags: [],
    images: [],
    requirements: [],
    features: [],
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      await addService(serviceData);
      toast.success("Service created successfully!");
      router.push("/service-provider/services");
    } catch (error) {
      toast.error(error.message || "Failed to create service");
    }
  };

  const tabs = [
    { id: "form", label: "Service Details", icon: FileText },
    { id: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/service-provider/services"
                className="btn btn-outline btn-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Service
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a new service to your offerings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("preview")}
                className="btn btn-outline btn-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn btn-primary btn-sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Service"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "form" && (
              <ServiceForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            )}
            {activeTab === "preview" && <ServicePreview service={formData} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewServicePage;