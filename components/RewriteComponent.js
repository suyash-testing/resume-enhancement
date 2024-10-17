"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";

export default function RewriteComponent() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [templateOption, setTemplateOption] = useState("1");
  const [modelOption, setModelOption] = useState("gemini");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setError(null);
      setFile(selectedFile);
    } else {
      setError("Please select a PDF or doc file.");
      setFile(null);
      event.target.value = null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a file first.");
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
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "An error occurred while processing the file.");
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
    <div className="flex flex-col items-center justify-center ">
      <div className="bg-white bg-opacity-80 shadow-2xl rounded-3xl p-10 w-full max-w-2xl">
        <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Resume Rewrite
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <Label
              htmlFor="file-upload"
              className="block text-gray-700 text-lg font-semibold"
            >
              Upload PDF File
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf, .doc, .docx"
              onChange={handleFileChange}
              disabled={loading}
              className={`w-full border border-gray-300 p-3 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            />
          </div>

          {/* <Label className="block text-gray-700 text-lg font-semibold mb-2">
              Choose a Template
            </Label> */}
          {/* <RadioGroup value={templateOption}>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    id="template1"
                    value="1"
                    checked={templateOption === "1"}
                    onChange={() => setTemplateOption("1")}
                    className="form-radio text-purple-600"
                  />
                  <span className="ml-2 text-gray-700">Template One</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    id="template2"
                    value="2"
                    checked={templateOption === "2"}
                    onChange={() => setTemplateOption("2")}
                    className="form-radio text-purple-600"
                  />
                  <span className="ml-2 text-gray-700">Template Two</span>
                </label>
              </div>
            </RadioGroup> */}

          <div className="mt-4">
            <Label className="block text-gray-700 text-lg font-semibold mb-2">
              Select AI Model
            </Label>
            <RadioGroup value={modelOption}>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    id="gemini"
                    value="gemini"
                    checked={modelOption === "gemini"}
                    onChange={() => setModelOption("gemini")}
                    className="form-radio text-purple-600"
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
                    className="form-radio text-purple-600"
                  />
                  <span className="ml-2 text-gray-200">ChatGPT</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-xl font-semibold rounded-xl transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-6 w-6 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Upload and Generate Docx"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
