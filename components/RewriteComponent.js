"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { toast } from "react-toastify";

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
      toast.error("An error occurred please try again later.");
    } finally {
      setLoading(false);
      toast.success("File has been downloaded in your device.");
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
      <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-2xl ">
        <h2 className="text-3xl font-sans font-bold mb-4 text-center text-gray-700">
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
              className={`w-full border border-gray-300 p-3 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            />
          </div>

          <div className="mt-2">
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
                    className="form-radio text-indigo-500"
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
                    className="form-radio text-indigo-500"
                  />
                  <span className="ml-2 text-gray-400">ChatGPT</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-xl font-semibold rounded-xl transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
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
              "Generate Doc File"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
