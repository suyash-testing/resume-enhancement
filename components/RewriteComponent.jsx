"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { toast } from "react-toastify";
import LoadingComponent from "./LoadingComponent";
import { useDropzone } from "react-dropzone";

export default function RewriteComponent() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templateOption, setTemplateOption] = useState("1");
  const [modelOption, setModelOption] = useState("gemini");

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length) {
      setError(null);
      setFile(acceptedFiles[0]);
    } else {
      setError("Please select a valid PDF or DOC file.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please upload your resume file first.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("templateOption", templateOption);
    formData.append("modelOption", modelOption);

    try {
      const response = await fetch("/api/resume-rewrite", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to process the file.");
      }

      const result = await response.json();

      const base64Doc = result.file;
      const fileName = result.fileName;

      const blob = base64ToBlob(
        base64Doc,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Your rewritten resume has been downloaded!");
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.message || "An error occurred while processing your resume."
      );
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const base64ToBlob = (base64, contentType) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-2xl">
        <h2 className="text-4xl font-bold mb-6 text-center text-indigo-700">
          Resume Rewrite
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div>
            <Label
              htmlFor="file-upload"
              className="block text-gray-700 text-lg font-semibold mb-2"
            >
              Upload Your Resume
            </Label>
            <div
              {...getRootProps()}
              className={`border-2  border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <p className="text-gray-700">
                  Selected file: <strong>{file.name}</strong>
                </p>
              ) : isDragActive ? (
                <p className="text-indigo-700">Drop the files here...</p>
              ) : (
                <p className="text-gray-500">
                  Drag & drop your resume here, or click to select files
                </p>
              )}
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>

          <div>
            <Label className="block text-gray-700 text-lg font-semibold mb-2">
              Choose AI Model
            </Label>
            <RadioGroup value={modelOption}>
              <div className="flex items-center space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    id="gemini"
                    value="gemini"
                    checked={modelOption === "gemini"}
                    onChange={() => setModelOption("gemini")}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2 text-gray-700">Google Gemini</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    id="chatgpt"
                    value="chatgpt"
                    disabled={true}
                    checked={modelOption === "chatgpt"}
                    onChange={() => setModelOption("chatgpt")}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2 text-gray-400">ChatGPT</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-5 text-xl font-semibold rounded-xl transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? <LoadingComponent /> : "Rewrite My Resume"}
          </Button>
        </form>
      </div>
    </div>
  );
}
