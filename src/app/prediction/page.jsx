// Prediction Page

// Author: Naveen Duhan

// import dependencies

// src/app/prediction/page.jsx
"use client";

import { useState } from "react";
import { useRouter as useNavigation } from "next/navigation";
import { motion } from "framer-motion";

// Import components
import PredictionHeader from "@/app/prediction/component/PredictionHeader";
import AccessionInput from "@/app/prediction/component/AccessionInput";
import FastaFileInput from "@/app/prediction/component/FastaFileInput";
import FastaSequenceInput from "@/app/prediction/component/FastaSequenceInput";
import PredictionSettings from "@/app/prediction/component/PredictionSettings";
import ActionButtons from "@/app/prediction/component/ActionButtons";
import ErrorModal from "@/app/prediction/component/ErrorModal";
import IntermediateState from "@/app/prediction/component/IntermediateState";

 // Get basePath from Next.js config
 const basePath = process.env.NODE_ENV === "production" ? "/prgminer" : "";

// Prediction Page Component
const PredictionPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    accessionId: "",
    accType: "ncbi", // ncbi or uniprot
    fastaSequence: "",
    fastaFile: null,
    predictionPhase: "Phase2", // Phase1 or Phase2
    phase1Checked: true, // Phase 1 checkbox state
    phase2Checked: true, // Phase 2 checkbox state
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [showIntermediate, setShowIntermediate] = useState(false);

  const navigation = useNavigation();

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      accessionId: "",
      accType: "ncbi",
      fastaSequence: "",
      fastaFile: null,
      predictionPhase: "Phase2",
      phase1Checked: true,
      phase2Checked: true,
    });
    setError("");
    setShowErrorModal(false);
    setSubmissionUrl("");
  };

  // Handle phase selection
  const handlePhaseChange = (phase) => {
    if (phase === "Phase1") {
      setFormData((prev) => ({
        ...prev,
        phase1Checked: true,
        phase2Checked: false,
        predictionPhase: "Phase1",
      }));
    } else if (phase === "Phase2") {
      setFormData((prev) => ({
        ...prev,
        phase1Checked: true,
        phase2Checked: !prev.phase2Checked,
        predictionPhase: !prev.phase2Checked ? "Phase2" : "Phase1",
      }));
    }
  };

  // Load demo data
  const loadDemoData = async () => {
    try {
      // Get basePath from Next.js config
      const basePath = process.env.NODE_ENV === "production" ? "/prgminer" : "";
      const response = await fetch(`${basePath}/demo.fa`);
      const demoData = await response.text();

      setFormData((prev) => ({
        ...prev,
        typeSeq: "text",
        fastaSequence: demoData,
        phase1Checked: true,
        phase2Checked: true,
        predictionPhase: "Phase2",
        accessionId: "",
        fastaFile: null,
      }));

      // Clear file input if it exists
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error loading demo data:", error);
      setError("Failed to load demo data. Please try again.");
      setShowErrorModal(true);
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const { accessionId, fastaFile, fastaSequence } = formData;

    // Check if exactly one input method is used
    const inputCount = [
      Boolean(accessionId),
      Boolean(fastaFile),
      Boolean(fastaSequence),
    ].filter(Boolean).length;

    if (inputCount === 0) {
      setError(
        "Please provide one input method: Accession Number, FASTA file, or FASTA sequence"
      );
      setShowErrorModal(true);
      return false;
    }

    if (inputCount > 1) {
      setError(
        "Please select only one input method. Remove data from other input fields before submitting."
      );
      setShowErrorModal(true);
      return false;
    }

    // Additional validation for each input type
    if (accessionId && accessionId.trim().length < 3) {
      setError("Please enter a valid accession ID");
      setShowErrorModal(true);
      return false;
    }

    if (fastaSequence && !fastaSequence.trim().startsWith(">")) {
      setError("Invalid FASTA sequence format. Sequence must start with '>'");
      setShowErrorModal(true);
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const submissionData = new FormData();
    const namer = new Date().valueOf();

    // Append form data
    if (formData.accessionId) {
      submissionData.append("typeSeq", "Acc");
      submissionData.append("sequence", formData.accessionId);
    } else if (formData.fastaFile) {
      submissionData.append("typeSeq", "File");
      submissionData.append("sequence", formData.fastaFile);
    } else {
      submissionData.append("typeSeq", "text");
      submissionData.append("sequence", formData.fastaSequence);
    }

    submissionData.append("db", formData.accType);
    submissionData.append("level", formData.predictionPhase);
    submissionData.append("namer", namer);

    try {
     

      // Validate FASTA - Include basePath
      const validationResponse = await fetch(`${basePath}/api/fasta-check`, {
        method: "POST",
        body: submissionData,
      });

      const validationResult = await validationResponse.json();

      if (validationResult.status === "fastaerror") {
        if (validationResult.code === 1) {
          setError(
            "Please provide one of these: Accession Number, a valid FASTA file OR valid FASTA sequence!"
          );
        } else if (validationResult.code === 6) {
          setError(
            "PRGminer accepts only 10000 sequences at a time. For more sequences contact us."
          );
        }

        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      if (validationResult.status === "proceed") {
        setShowIntermediate(true);

        // Submit the job - Include basePath
        const jobResponse = await fetch(`${basePath}/api/run-task`, {
          method: "POST",
          body: submissionData,
        });
        const jobData = await jobResponse.json();
        // Construct the result URL with phase information using underscore format
        const resultUrl = `/results?id=${encodeURIComponent(
          namer
        )}_${encodeURIComponent(formData.predictionPhase)}`;

        // For user-facing URL, we need to consider the full path including origin and basePath
        setSubmissionUrl(
          window.location.origin + (basePath ? basePath : "") + resultUrl
        );

        if (jobData.status === "success") {
          // Let Next.js handle navigation with basePath
          navigation.push(resultUrl);
        } else {
          if (jobData.error === "PREDICTION_FAILED") {
            setError(
              "The prediction process failed. Please contact our support team for assistance."
            );
            setShowErrorModal(true);
            setShowIntermediate(false);
          } else {
            setError(jobData.message || "Failed to submit job");
            setShowErrorModal(true);
            setShowIntermediate(false);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred. Please try again later.");
      setShowErrorModal(true);
      setShowIntermediate(false);
    } finally {
      setLoading(false);
    }
  };

  // Check if multiple input methods are being used
  const hasMultipleInputsAccession =
    formData.accessionId && (formData.fastaFile || formData.fastaSequence);
  const hasMultipleInputsFile =
    formData.fastaFile && (formData.accessionId || formData.fastaSequence);
  const hasMultipleInputsSequence =
    formData.fastaSequence && (formData.accessionId || formData.fastaFile);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <PredictionHeader />

        <form
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl border border-green-100/50"
          onSubmit={(e) => e.preventDefault()}
          // initial={{ opacity: 0, y: 20 }}
          // animate={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.6 }}
        >
          {/* Form Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Upload your protein sequence for prediction
            </h1>
            <p className="text-gray-600">
              Choose your input method and configure prediction settings
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Input Methods */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Input Methods
                </h2>
                <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-xl">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span className="text-sm text-yellow-700 font-medium">
                    Select only one method
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <AccessionInput
                  formData={formData}
                  setFormData={setFormData}
                  hasMultipleInputs={hasMultipleInputsAccession}
                />

                <FastaFileInput
                  formData={formData}
                  setFormData={setFormData}
                  hasMultipleInputs={hasMultipleInputsFile}
                />

                <FastaSequenceInput
                  formData={formData}
                  setFormData={setFormData}
                  hasMultipleInputs={hasMultipleInputsSequence}
                  loadDemoData={loadDemoData}
                />
              </div>
            </div>

            {/* Right Column - Settings */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Prediction Settings
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Configure options
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>

              <motion.div
                className="bg-gradient-to-br from-white to-blue-50/70 hover:from-blue-50/70 hover:to-purple-50/50 rounded-2xl p-8 transition-all duration-300 shadow-md hover:shadow-lg"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-blue-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Sequence Type
                    </h3>
                    <p className="text-rose-500 text-md font-medium mt-1">
                      Currently, only protein sequences are supported.
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-6">
                <PredictionSettings
                  formData={formData}
                  handlePhaseChange={handlePhaseChange}
                  setShowErrorModal={setShowErrorModal}
                />

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <ActionButtons
                    loading={loading}
                    handleSubmit={handleSubmit}
                    resetForm={resetForm}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <ErrorModal
          show={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          error={error}
        />

        <IntermediateState
          show={showIntermediate}
          submissionUrl={submissionUrl}
          navigation={navigation}
        />
      </div>
    </main>
  );
};

export default PredictionPage;
