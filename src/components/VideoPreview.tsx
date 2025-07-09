import { convertFileSrc } from "@tauri-apps/api/core";
import { useState } from "react";
import ReactPlayer from 'react-player';

type VideoPreviewProps = {
    setPlayerRef: (player: HTMLVideoElement) => void;
    inputFilePath: string;
    onLoadedMetadata: () => void;
};

export default function VideoPreview(props: VideoPreviewProps) {
    const [_startTime, _setStartTime] = useState("");
    const [_endTime, _setEndTime] = useState("");

    const onError = () => {
        console.error("error loading video!");
    };

    return (
        <ReactPlayer
            ref={props.setPlayerRef}
            src={convertFileSrc(props.inputFilePath)}
            controls={true}
            style={{
                width: "100%",
                height: "auto",
                aspectRatio: "16/9",
            }}
            onError={onError}
            onLoadedMetadata={props.onLoadedMetadata}
        />
    );
}