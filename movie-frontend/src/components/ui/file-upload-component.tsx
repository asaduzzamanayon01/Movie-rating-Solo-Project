import React from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

const FileUploadComponent = ({ handleFileChange, imagePreview, errors }) => {
  const onDrop = (acceptedFiles) => {
    handleFileChange({ target: { files: acceptedFiles, name: "image" } });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    multiple: false,
    maxSize: 5242880, // 5MB
  });

  return (
    <div className="w-full">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4"
      >
        <div
          {...getRootProps()}
          className={`flex flex-col items-center p-8 border-2 border-dashed rounded-lg ${
            isDragActive ? "border-gold-500 bg-gold-50" : "border-gray-300"
          } ${errors.image ? "border-red-500" : ""}`}
          role="button"
          aria-label="Upload image"
          tabIndex="0"
        >
          <input {...getInputProps()} name="image" aria-label="File input" />
          <Upload className="w-12 h-12 text-white" />
          <p className="mt-2 text-sm text-white">
            Drag & drop an image here, or click to select
          </p>
          <p className="mt-1 text-xs text-white">(Max file size: 5MB)</p>
        </div>
        {errors.image && (
          <p className="text-red-500 text-xs mt-1">{errors.image}</p>
        )}
      </motion.div>
      {imagePreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4"
        >
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-md"
          />
        </motion.div>
      )}
    </div>
  );
};

export default FileUploadComponent;
