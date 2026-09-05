import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import InputScreen from "./screens/InputScreen";
import ItineraryBoard from "./screens/ItineraryBoard";
import useTripActions from "./hooks/useTripActions";

export default function App() {
  const [status, setStatus] = useState("idle");
  const [prompt, setPrompt] = useState("");
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [lastPreferences, setLastPreferences] = useState({});

  const { generateTrip, cancelRequest } = useTripActions({
    setStatus,
    setTrip,
    setError,
  });

  function handleGenerate(userPrompt, preferences = {}) {
    setLastPreferences(preferences);
    generateTrip(userPrompt, preferences);
  }

  function handleRetry() {
    if (!prompt.trim()) return;
    setError(null);
    generateTrip(prompt, lastPreferences);
  }

  function handleCancel() {
    cancelRequest();
    setError(null);
    setStatus("idle");
  }

  function handleStartOver() {
    setPrompt("");
    setError(null);
    setTrip(null);
    setLastPreferences({});
    setStatus("idle");
  }


  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="board"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <ItineraryBoard trip={trip} onStartOver={handleStartOver} />
        </motion.div>
      ) : (
        <motion.div
          key="input"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <InputScreen
            prompt={prompt}
            setPrompt={setPrompt}
            status={status}
            error={error}
            onGenerate={handleGenerate}
            onRetry={handleRetry}
            onCancel={handleCancel}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}