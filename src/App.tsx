import { useCallback, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { open } from "@tauri-apps/plugin-dialog";
import VideoPreview from "./components/VideoPreview";
import MinimumDistanceSlider from "./components/MinimumDistanceSlider";
import TimeInput from "./components/TimeInput";
import CheckboxLabel from "./components/CheckboxLabel";
import FilenameInput from "./components/FilenameInput";
import { secondsToFormattedString } from "./util/converters";

function App() {
    const playerRef = useRef<HTMLVideoElement | null>(null);

    const [duration, setDuration] = useState(0); // in seconds
    const [totalFrames, setTotalFrames] = useState(0);
    const [frameRate, setFramerate] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);

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
        let dur = Math.floor(playerRef.current.duration);
        setDuration(dur);
        setFramerate(Math.floor(totalFrames / dur));
    }, []);

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
            setTotalFrames(await invoke("get_frame_count", { in_file: file }));
            let arr = file.split("\\");
            setInputFileName(arr.pop() || "");
            setInputFolder(arr.join("\\"));
        }
    }

    async function call_ffmpeg() {
        if (inputFilePath.length === 0 || startTime === 0 || endTime === 0) {
            setStatusMsg("Select a file, start time and end time");
            return;
        }
        await invoke<string>("call_ffmpeg",
        {
            start: secondsToFormattedString(startTime),
            end: secondsToFormattedString(endTime),
            in_file: inputFilePath,
            in_folder: inputFolder,
            audio_stream_count: doMuteMicrophone ? 1 : 2,
            out_file: outputFileName + ".mp4",
            do_overwrite: doOverwriteFile ? "-y" : "-n"
        }).then((msg) => {
            if (msg !== "exit code: 0") {
                setStatusMsg("Error! Only 1 audio track? Try muting mic track.")
            } else {
                setStatusMsg("Processing complete");
            }
        }).catch((e) => {
            console.debug("error!!", e);
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
                    seekToTime={seekToTime}
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
                />
                {/* End time input */}
                <TimeInput
                    text={"end"}
                    time={endTime}
                    setTime={setEndTime}
                    totalFrames={totalFrames}
                    framerate={frameRate}
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
