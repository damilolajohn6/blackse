"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

const ClientOnlyEditor = ({
  editorState,
  onEditorStateChange,
  wrapperStyle,
  editorStyle,
  toolbarStyle,
  placeholder,
  ...props
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    return () => {};
  }, []);

  if (!isClient) return null;

  return (
    <div style={{ ...wrapperStyle, border: "1px solid #ccc" }}>
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        wrapperClassName="editor-wrapper"
        editorClassName="editor-content"
        toolbarClassName="editor-toolbar"
        placeholder={placeholder}
        editorStyle={{ minHeight: "150px", padding: "0 15px", ...editorStyle }}
        toolbarStyle={{ borderBottom: "1px solid #ccc", ...toolbarStyle }}
        toolbar={{
          options: [
            "inline",
            "blockType",
            "fontSize",
            "list",
            "textAlign",
            "link",
            "history",
          ],
          inline: { options: ["bold", "italic", "underline"] },
          list: { options: ["unordered", "ordered"] },
        }}
        {...props}
      />
    </div>
  );
};

export default ClientOnlyEditor;
