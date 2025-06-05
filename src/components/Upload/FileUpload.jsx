"use client";

import { useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const FileUpload = ({ onChange, label, accept, error }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      onChange({ file });
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" gutterBottom>
        {label}
      </Typography>
      <Button
        variant="outlined"
        component="label"
        startIcon={
          loading ? <CircularProgress size={20} /> : <CloudUploadIcon />
        }
        sx={{ mb: 1 }}
        disabled={loading}
      >
        Upload File
        <input type="file" hidden accept={accept} onChange={handleFileChange} />
      </Button>
      {error && (
        <Typography color="error" variant="caption">
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;
