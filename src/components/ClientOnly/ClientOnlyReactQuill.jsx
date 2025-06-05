"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const ClientOnlyReactQuill = ({
  value,
  onChange,
  wrapperStyle,
  editorStyle,
  toolbarStyle,
  ...props
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    return () => {};
  }, []);

  if (!isClient) return null;

  return (
    <div style={wrapperStyle}>
      <ReactQuill
        value={value}
        onChange={onChange}
        theme="snow"
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
          ],
        }}
        style={editorStyle}
        {...props}
      />
    </div>
  );
};

export default ClientOnlyReactQuill;
