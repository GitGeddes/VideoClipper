import { useCallback, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { open } from "@tauri-apps/plugin-dialog";
import VideoPreview from "./components/VideoPreview";
import MinimumDistanceSlider, { minDistance } from "./components/MinimumDistanceSlider";
import TimeInput from "./components/TimeInput";
import CheckboxLabel from "./components/CheckboxLabel";
import FilenameInput from "./components/FilenameInput";

function App() {
    const playerRef = useRef<HTMLVideoElement | null>(null);

    const [duration, setDuration] = useState(0); // in seconds
    const [totalFrames, setTotalFrames] = useState(0);
    const [frameRate, setFrameRate] = useState(0);

    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [startFrame, setStartFrame] = useState(0);
    const [endFrame, setEndFrame] = useState(0);

    const [inputFileName, setInputFileName] = useState("");
    const [inputFilePath, setInputFilePath] = useState("");
    const [inputFolder, setInputFolder] = useState("");

    const [outputFileName, setOutputFileName] = useState("output");
    const [doMuteMicrophone, setDoMuteMicrophone] = useState(false);
    const [doOverwriteFile, setDoOverwriteFile] = useState(true);
    const [statusMsg, setStatusMsg] = useState("");

    const setPlayerRef = useCallback((player: HTMLVideoElement) => {
        if (!player) return;
        playerRef.current = player;
    }, []);

    const onLoadedMetadata = useCallback(async () => {
        if (!playerRef.current) return;
        let dur = Math.round(playerRef.current.duration);
        setDuration(dur);
        const framerate = Math.round(totalFrames / dur);
        setFrameRate(framerate);
        if (endTime === 0) {
            setEndTime(minDistance);
            setEndFrame(minDistance * framerate);
        }
    }, [totalFrames]);

    const seekToTime = useCallback((time: number) => {
        if (!playerRef.current) return;
        playerRef.current.currentTime = time;
    }, []);

    async function pickFile() {
        const file = await open({
            multiple: false,
            directory: false,
            filters: [{
                name: 'Video',
                extensions: ['mp4']
            }]
        });
        if (file) {
            setInputFilePath(file);
            const frame_count: number = await invoke("get_frame_count", { in_file: file });
            setTotalFrames(frame_count);
            let arr = file.split("\\");
            setInputFileName(arr.pop() || "");
            setInputFolder(arr.join("\\"));
        }
    }

    async function call_ffmpeg() {
        setStatusMsg("");
        if (inputFilePath.length === 0 || endTime === 0) {
            setStatusMsg("Select a file, start time and end time");
            return;
        }
        const ffmpegParams = {
            start: startFrame / frameRate,
            end: endFrame / frameRate,
            in_file: inputFilePath,
            in_folder: inputFolder,
            audio_stream_count: doMuteMicrophone ? 1 : 2,
            out_file: outputFileName + ".mp4",
            do_overwrite: doOverwriteFile ? "-y" : "-n"
        };
        await invoke<string>("call_ffmpeg", ffmpegParams)
        .then((msg) => {
            if (msg !== "exit code: 0") {
                setStatusMsg("Error! Only 1 audio track? Try muting mic track.");
            } else {
                setStatusMsg("Processing complete");
            }
        }).catch((e) => {
            console.debug("Error invoking call_ffmpeg:", e);
        });
    }

    return (
        <main className="container">
            <div className="videoPreview">
                <VideoPreview
                    setPlayerRef={setPlayerRef}
                    inputFilePath={inputFilePath}
                    onLoadedMetadata={onLoadedMetadata}
                />
            </div>
            {/* File picker button */}
            <button
                type="submit"
                onClick={(e) => {
                    e.preventDefault();
                    pickFile();
                }}
            >
                {inputFileName.length > 0 ? inputFileName : "Select Video"}
            </button>
            <div className='slider'>
                <MinimumDistanceSlider
                    disabled={inputFilePath.length === 0}
                    max={duration}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    setStartFrame={setStartFrame}
                    setEndFrame={setEndFrame}
                    seekToTime={seekToTime}
                    framerate={frameRate}
                />
            </div>
            <section className="row">
                {/* Start time input */}
                <TimeInput
                    text={"start"}
                    time={startTime}
                    setTime={setStartTime}
                    totalFrames={totalFrames}
                    framerate={frameRate}
                    currentFrame={startFrame}
                    setCurrentFrame={setStartFrame}
                    seekToTime={seekToTime}
                />
                {/* End time input */}
                <TimeInput
                    text={"end"}
                    time={endTime}
                    setTime={setEndTime}
                    totalFrames={totalFrames}
                    framerate={frameRate}
                    currentFrame={endFrame}
                    setCurrentFrame={setEndFrame}
                    seekToTime={seekToTime}
                />
            </section>
            <section className="row">
                <section className="column">
                    {/* Mute mic checkbox */}
                    <CheckboxLabel
                        text={"Mute mic track?"}
                        isValue={doMuteMicrophone}
                        setIsValue={setDoMuteMicrophone}
                    />
                    {/* Overwrite file checkbox */}
                    <CheckboxLabel
                        text={"Overwrite file?"}
                        isValue={doOverwriteFile}
                        setIsValue={setDoOverwriteFile}
                    />
                </section>
                <section className="column">
                    {/* Output filename text input */}
                    <FilenameInput
                        text={"Filename"}
                        filename={outputFileName}
                        setFilename={setOutputFileName}
                    />
                    <p>{statusMsg}</p>
                </section>
                {/* Call ffmpeg button */}
                <button
                    type="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        call_ffmpeg();
                    }}
                >
                    Process Video
                </button>
            </section>
        </main>
    );
}

export default App;
