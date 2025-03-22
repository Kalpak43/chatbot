import { useEffect, useState } from "react";
import AudioRecorder from "./AudioRecorder";
import { transcribeAudio } from "../utils";

function Recorder() {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [start, setStart] = useState(false);

  function handleStopRecording(recordedData: {
    duration: number;
    audioBlob: Blob;
  }) {
    setRecordedBlob(recordedData.audioBlob);
    setStart(false);
  }

  useEffect(() => {
    console.log(recordedBlob);
    if (recordedBlob) console.log(transcribeAudio(recordedBlob));
  }, [recordedBlob]);

  return (
    <div>
      <AudioRecorder
        onStart={() => {
          setStart(true);
        }}
        onStop={handleStopRecording}
      >
        <span>{start ? "Stop" : "Record"}</span>
      </AudioRecorder>
    </div>
  );
}

export default Recorder;
