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
import { Poppins, Jost } from "next/font/google";
import { Button } from "@/components/ui/button";

import { addService } from "@/lib/proxyApiCall";

const poppins = Poppins(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)
const jost = Jost(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)

const NewServicePage = () => {
  const router = useRouter();
  const { addSer, isLoading } = useServiceProviderStore();
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
      // await addServices("POST", "/service-provider/add-service-offered", { body: serviceData });
      // toast.success("Service created successfully!");
      // router.push("/service-provider/services");
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
          <Link
            href="/service-provider/services"
            className="btn btn-outline btn-sm flex items-center test-sm mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <p className="text-sm">Back to Services</p>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Service
                </h1>
                <p className={"text-gray-600 " + jost.className}>
                  Add a new service to your offerings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setActiveTab("preview")}
                className="border-2 border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white flex items-center gap-2"
              >
                <Eye className="size-4" />
                Preview
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save className="size-4" />
                {isLoading ? "Creating..." : "Create Service"}
              </Button>
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
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
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