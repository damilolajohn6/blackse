"use client"
import React, { useState } from "react";
import Image from "next/image";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import Link from "next/link";

const Footer = () => {
  // State for email subscription form
  const [email, setEmail] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");

  // Footer links tailored for BlackAndSell
  const footerCompanyLinks = [
    { name: "About Us", link: "/about" },
    { name: "Careers", link: "/careers" },
    { name: "Blog", link: "/blog" },
    { name: "Press", link: "/press" },
  ];

  const footerProductLinks = [
    { name: "Marketplace", link: "/marketplace" },
    { name: "Social Hub", link: "/social" },
    { name: "Learning Portal", link: "/lms" },
    { name: "Services", link: "/services" },
  ];

  const footerSupportLinks = [
    { name: "Help Center", link: "/help" },
    { name: "Contact Us", link: "/contact" },
    { name: "FAQs", link: "/faqs" },
    { name: "Community Guidelines", link: "/guidelines" },
  ];

  // Handle email subscription form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus("submitting");
    setSubmissionMessage("Subscribing...");

    try {
      // Simulate API call for subscription
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Subscribed with email:", email);
      setSubmissionStatus("success");
      setSubmissionMessage("Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      console.error("Subscription error:", error);
      setSubmissionStatus("error");
      setSubmissionMessage("Oops! Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#1a1a1a] text-white">
      {/* Subscription Section */}
      <div className="md:flex md:justify-between md:items-center sm:px-12 px-4 bg-indigo-600 py-7">
        <h1 className="lg:text-4xl text-3xl md:mb-0 mb-6 lg:leading-normal font-semibold md:w-2/5">
          <span className="text-teal-400">Join</span> BlackAndSell <br />
          for exclusive updates & offers
        </h1>
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="text-gray-800 sm:w-72 w-full sm:mr-5 mr-1 lg:mb-0 mb-4 py-2.5 rounded px-2 focus:outline-none"
            />
            <button
              type="submit"
              className={`bg-teal-400 hover:bg-teal-500 duration-300 px-5 py-2.5 rounded-md text-white md:w-auto w-full ${
                submissionStatus === "submitting"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={submissionStatus === "submitting"}
            >
              {submissionStatus === "submitting"
                ? "Subscribing..."
                : "Subscribe"}
            </button>
          </form>
          {submissionMessage && (
            <p
              className={`mt-2 text-sm text-center ${
                submissionStatus === "success"
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {submissionMessage}
            </p>
          )}
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:px-8 px-5 py-16 sm:text-center">
        {/* Brand Section */}
        <ul className="px-5 text-center sm:text-start flex sm:block flex-col items-center">
          <Image
            src="/blacknsell.png"
            width={70}
            height={70}
            alt="BlackAndSell Logo"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <br />
          <p>
            BlackAndSell: Your all-in-one platform for marketplace, social
            networking, learning, and services.
          </p>
          <div className="flex items-center mt-[15px]">
            <a
              href="https://facebook.com/blackandsell"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AiFillFacebook
                size={25}
                className="cursor-pointer hover:text-teal-400"
              />
            </a>
            <a
              href="https://twitter.com/blackandsell"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AiOutlineTwitter
                size={25}
                style={{ marginLeft: "15px", cursor: "pointer" }}
                className="hover:text-teal-400"
              />
            </a>
            <a
              href="https://instagram.com/blackandsell"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AiFillInstagram
                size={25}
                style={{ marginLeft: "15px", cursor: "pointer" }}
                className="hover:text-teal-400"
              />
            </a>
            <a
              href="https://youtube.com/@blackandsell"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AiFillYoutube
                size={25}
                style={{ marginLeft: "15px", cursor: "pointer" }}
                className="hover:text-teal-400"
              />
            </a>
          </div>
        </ul>

        {/* Company Links */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">Company</h1>
          {footerCompanyLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6"
                href={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Product Links */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">Explore</h1>
          {footerProductLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6"
                href={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Support Links */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-1 font-semibold">Support</h1>
          {footerSupportLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm cursor-pointer leading-6"
                href={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center pt-2 text-gray-400 text-sm pb-8">
        <span>© 2025 BlackAndSell. All rights reserved.</span>
        <span>
          <Link href="/terms" className="hover:text-teal-400">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy-policy" className="hover:text-teal-400">
            Privacy Policy
          </Link>
        </span>
        <div className="sm:block flex items-center justify-center w-full">
          <img
            src="https://blacknsell.vercel.app/assets/payment-methods.png"
            alt="Accepted Payment Methods"
            className="h-10"
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
