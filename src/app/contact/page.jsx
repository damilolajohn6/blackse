"use client";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Footer";
import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  MessageSquare,
  User,
  AtSign,
  BookOpen,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submissionStatus, setSubmissionStatus] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus("submitting");
    setSubmissionMessage("Sending your message...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form Data Submitted:", formData);
      setSubmissionStatus("success");
      setSubmissionMessage(
        "Thank you for your message! Our team at BlackAndSell will get back to you soon."
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmissionStatus("error");
      setSubmissionMessage(
        "Oops! Something went wrong. Please try again later."
      );
    }
  };

  const faqData = [
    {
      question: "What are BlackAndSell's support hours?",
      answer:
        "Our support team is available Monday to Friday, 9:00 AM - 5:00 PM Eastern Time (ET, Canada).",
    },
    {
      question: "How long does it take to get a response?",
      answer: "We aim to respond to all inquiries within 24-48 business hours.",
    },
    {
      question: "Can I contact support for marketplace or LMS issues?",
      answer:
        "Yes! Our team can assist with marketplace transactions, social media features, LMS queries, or service provider bookings.",
    },
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-inter">
        <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-xl p-6 sm:p-8 lg:p-12 border border-gray-200">
          {/* Hero Section */}
          <div className="text-center mb-12 py-8 bg-indigo-600 text-white rounded-lg shadow-xl">
            <MessageSquare className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 tracking-tight">
              Connect with BlackAndSell!
            </h1>
            <p className="text-lg sm:text-xl font-light max-w-2xl mx-auto opacity-90">
              Have questions about our marketplace, social platform, LMS, or
              services? We're here to help you succeed!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <User className="inline-block w-4 h-4 mr-2 text-indigo-500" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <AtSign className="inline-block w-4 h-4 mr-2 text-indigo-500" />
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <BookOpen className="inline-block w-4 h-4 mr-2 text-indigo-500" />
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-200 ease-in-out"
                    placeholder="E.g., Marketplace Inquiry"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <MessageSquare className="inline-block w-4 h-4 mr-2 text-indigo-500" />
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y transition duration-200 ease-in-out"
                    placeholder="How can we assist you with BlackAndSell?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white transition duration-300 ease-in-out
                  ${
                    submissionStatus === "submitting"
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  }`}
                  disabled={submissionStatus === "submitting"}
                >
                  {submissionStatus === "submitting"
                    ? "Sending..."
                    : "Send Message"}
                </button>
                {submissionMessage && (
                  <p
                    className={`mt-4 text-center text-sm font-medium ${
                      submissionStatus === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {submissionMessage}
                  </p>
                )}
              </form>
            </div>

            {/* Contact Information & Map Section */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                  Get in Touch
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-6 h-6 mr-3 text-blue-600" />
                    <div>
                      <span className="font-semibold">Email:</span>{" "}
                      <a
                        href="mailto:blackandsell@gmail.com"
                        className="text-blue-600 hover:underline"
                      >
                        blackandsell@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-6 h-6 mr-3 text-green-600" />
                    <div>
                      <span className="font-semibold">Phone:</span>{" "}
                      <a
                        href="tel:+234123456789"
                        className="text-green-600 hover:underline"
                      >
                        +234 123 456 789
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Business Hours: Monday - Friday, 9:00 AM - 5:00 PM WAT
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-start text-gray-700">
                    <MapPin className="w-6 h-6 mr-3 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <span className="font-semibold">Address:</span>
                      <br />
                      <address className="not-italic">
                        BlackAndSell
                        <br />
                        123 Innovation Drive
                        <br />
                        Lagos, Lagos State 100001
                        <br />
                        Nigeria
                      </address>
                    </div>
                  </div> */}
                  <div className="flex items-center text-gray-700">
                    <Globe className="w-6 h-6 mr-3 text-yellow-600" />
                    <div>
                      <span className="font-semibold">Website:</span>{" "}
                      <a
                        href="https://blacknsell.vercel.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-600 hover:underline"
                      >
                        blacknsell.vercel.app
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqData.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="flex justify-between items-center w-full p-4 text-left font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 focus:outline-none transition duration-200 ease-in-out"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{item.question}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${
                        openFaqIndex === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {openFaqIndex === index && (
                    <div className="p-4 bg-white text-gray-600 border-t border-gray-200">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Closing Remark */}
          <p className="text-gray-700 text-center leading-relaxed mt-12">
            At BlackAndSell, your feedback drives our marketplace, social
            platform, LMS, and services forward. Let's grow together!
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
