import React, { useEffect, useState, useRef } from "react";
import { Avatar, Typography } from "@material-tailwind/react";
import CountdownTimer from "@/widgets/countdowntimer/countdowntimer";
import axios from "axios";
import { ReactMic } from "react-mic";

export function Home() {
  let messagesRef = useRef([]);
  const [isloading, setIsloading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [countTime, setCountTime] = useState(30);
  const [response, setResponse] = useState("");
  const [isSummarized, setIsSummarized] = useState(false);

  useEffect(() => {
    if (countTime == 1) {
      setRecording(false);
    }
  }, [countTime]);

  useEffect(() => {
    setCountTime(30);
    if (response != "") {
      setIsSummarized(true);
    }
  }, [response]);

  const handleStartRecording = () => {
    if (countTime > 1) {
      setRecording((recording) => !recording);
    }
  };

  const onStop = (recordedBlob) => {
    const file = new File([recordedBlob.blob], "recording.wav", {
      type: "audio/wav",
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("messages", JSON.stringify(messagesRef.current));
    setIsloading(true);
    axios
      .post(`${import.meta.env.VITE_API_BASED_URL}/message`, formData)
      .then((res) => {
        setIsSummarized(true);
        let list = JSON.parse(res.data.data);

        messagesRef.current = [...list];
        setResponse(list[list.length - 1].content);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsloading(false);
      });
  };

  return (
    <>
      <div className="relative flex h-full min-h-[100vh] w-full flex-col items-center justify-center bg-[#191919] px-4 pt-10">
        {isloading && (
          <div className="absolute left-0 top-0 h-full w-full"></div>
        )}
        {response != "" && (
          <div className="w-full pb-[204px]">
            <Typography className="text-lg text-white">{response}</Typography>
          </div>
        )}
        <div
          className={`${
            response != "" &&
            "fixed bottom-0 left-0 bg-gradient-to-t from-[#191919] via-[#191919f6] pt-10"
          } flex h-[204px] w-full flex-col items-center justify-center`}
        >
          <div
            onClick={handleStartRecording}
            className={`flex cursor-pointer items-center justify-center rounded-3xl p-4 ${
              recording ? "bg-[#FFFFFF]" : "bg-[#FBBE81]"
            } ${response == "" ? "my-4 h-40 w-40" : "my-2 h-24 w-24"}`}
          >
            <Avatar src="/img/wave.svg" className="h-auto w-28 rounded-none" />
          </div>
          <CountdownTimer
            status={recording}
            isSummarized={isSummarized}
            setCountTime={setCountTime}
          />
        </div>
        <ReactMic record={recording} className="hidden" onStop={onStop} />
      </div>
    </>
  );
}

export default Home;
