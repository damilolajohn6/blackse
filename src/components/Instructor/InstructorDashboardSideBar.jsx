"use client";

import React from "react";
import Link from "next/link";
import {
  FaChalkboardTeacher,
  FaBook,
  FaPlus,
  FaSignOutAlt,
  FaUser,
  FaBullhorn,
  FaQuestionCircle,
  FaChartBar,
  FaCertificate,
  FaStar,
  FaComments,
  FaTags,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { CiMoneyBill } from "react-icons/ci";
import useInstructorStore from "@/store/instructorStore";
import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const InstructorDashboardSideBar = ({ active, onClose }) => {
  const { logoutInstructor } = useInstructorStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutInstructor(router);
    if (onClose) onClose();
  };

  const menuItems = [
    {
      href: "/instructor/dashboard",
      icon: <FaChalkboardTeacher size={20} />,
      label: "Dashboard",
      id: 1,
    },
    {
      href: "/instructor/courses",
      icon: <FaBook size={20} />,
      label: "Courses",
      id: 2,
    },
    {
      href: "/instructor/courses/create",
      icon: <FaPlus size={20} />,
      label: "Create Course",
      id: 3,
    },
    {
      href: "/instructor/withdrawals",
      icon: <CiMoneyBill size={20} />,
      label: "Withdrawals",
      id: 4,
    },
    {
      href: "/instructor/questions",
      icon: <FaQuestionCircle size={20} />,
      label: "Questions",
      id: 5,
    },
    {
      href: "/instructor/analytics",
      icon: <FaChartBar size={20} />,
      label: "Analytics",
      id: 6,
    },
    {
      href: "/instructor/announcements",
      icon: <FaBullhorn size={20} />,
      label: "Announcements",
      id: 7,
    },
    {
      href: "/instructor/certificates",
      icon: <FaCertificate size={20} />,
      label: "Certificates",
      id: 8,
    },
    {
      href: "/instructor/reviews",
      icon: <FaStar size={20} />,
      label: "Reviews",
      id: 9,
    },
    {
      href: "/instructor/discussions",
      icon: <FaComments size={20} />,
      label: "Discussions",
      id: 10,
    },
    {
      href: "/instructor/coupons",
      icon: <FaTags size={20} />,
      label: "Coupons",
      id: 11,
    },
    {
      href: "/instructor/profile",
      icon: <FaUser size={20} />,
      label: "Profile",
      id: 12,
    },
    {
      icon: <FaSignOutAlt size={20} />,
      label: "Logout",
      id: 13,
      onClick: handleLogout,
    },
  ];

  return (
    <Box sx={{ width: { xs: 240, md: 200 }, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
        {onClose && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <nav>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={active === item.id}
            onClick={item.onClick}
            onClose={onClose}
          />
        ))}
      </nav>
    </Box>
  );
};

const SidebarItem = ({ href, icon, label, active, onClick, onClose }) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onClose) onClose();
  };

  return (
    <div className="w-full flex items-center p-3 hover:bg-gray-100 transition-colors">
      {href ? (
        <Link
          href={href}
          className="w-full flex items-center"
          onClick={handleClick}
        >
          {React.cloneElement(icon, {
            color: active ? "crimson" : "#555",
          })}
          <span
            className={`pl-3 text-sm font-medium ${
              active ? "text-[crimson]" : "text-[#555]"
            }`}
          >
            {label}
          </span>
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className="w-full flex items-center focus:outline-none text-left"
        >
          {React.cloneElement(icon, {
            color: active ? "crimson" : "#555",
          })}
          <span
            className={`pl-3 text-sm font-medium ${
              active ? "text-[crimson]" : "text-[#555]"
            }`}
          >
            {label}
          </span>
        </button>
      )}
    </div>
  );
};

export default InstructorDashboardSideBar;
