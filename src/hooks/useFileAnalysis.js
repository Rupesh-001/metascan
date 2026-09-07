import { useState } from "react";
import { analyzeFile } from "../services/metadataService";

export function useFileAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async (file) => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const analysisResult = await analyzeFile(file);

      setResult(analysisResult);

      return analysisResult;
    } catch (err) {
      console.error("File analysis failed:", err);

      setError(
        err.message ||
          "Unable to analyze the selected file."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
    setLoading(false);
  };

  return {
    result,
    loading,
    error,
    analyze,
    reset,
  };
}