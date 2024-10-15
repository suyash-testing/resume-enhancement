"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ATSCheckerPage = () => {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jd, setJd] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file.");
        setFile(null);
        event.target.value = null;
      } else {
        setError(null);
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!file || !jd.length > 0) {
      setError("Please fill all the fields");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jd", jd);

    try {
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/ats`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process the file.");
      }

      const result = await response.json();
      setJsonData(result.data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "An error occurred while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white bg-opacity-90 p-10 rounded-3xl shadow-xl">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-gray-900">
            ATS Resume Checker
          </h2>
          <p className="mt-2 text-center text-lg text-gray-600">
            Upload your resume and job description to see how well you match!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="message"
              className="text-xl font-semibold text-gray-700"
            >
              Your Job Description
            </Label>
            <Textarea
              placeholder="Paste your job description here."
              id="message"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
          </div>
          <div>
            <Label
              htmlFor="file-upload"
              className="text-xl font-semibold text-gray-700"
            >
              Upload PDF Resume
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              className={`mt-2 block w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 ${
                loading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            />
          </div>
          {error && <div className="text-red-600 text-md">{error}</div>}
          <Button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-xl font-bold rounded-xl transition duration-300 ${
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
              "Check My Resume"
            )}
          </Button>
        </form>
        {jsonData && (
          <div className="mt-12">
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">
                ATS Analysis Result for{" "}
                <span className="underline text-blue-600">
                  {jsonData?.name}
                </span>
              </h3>
              {jsonData?.jobDescriptionMatch && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-indigo-600 mb-4">
                    Job Description Match
                  </h4>
                  <p className="text-gray-700 text-lg">
                    {jsonData.jobDescriptionMatch}
                  </p>
                </div>
              )}
              {jsonData?.candidateSummary && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-indigo-600 mb-4">
                    Candidate Summary
                  </h4>
                  <p className="text-gray-700 text-lg">
                    {jsonData.candidateSummary}
                  </p>
                </div>
              )}
              {jsonData?.experienceAssessment && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-indigo-600 mb-4">
                    Experience Assessment
                  </h4>
                  <p className="text-gray-700 text-lg">
                    {jsonData.experienceAssessment}
                  </p>
                </div>
              )}
              {jsonData?.missingKeywords?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-red-600 mb-4">
                    Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {jsonData.missingKeywords.map((item) => (
                      <span
                        key={item}
                        className="inline-block bg-red-100 text-red-800 text-md px-4 py-2 rounded-full shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {jsonData?.matchingKeyword?.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold text-green-600 mb-4">
                    Matching Keywords
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {jsonData.matchingKeyword.map((item) => (
                      <span
                        key={item}
                        className="inline-block bg-green-100 text-green-800 text-md px-4 py-2 rounded-full shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSCheckerPage;
