import { formattedStringToSeconds, secondsToFormattedString } from "../util/converters";
import FrameInput from "./FrameInput";

type TimeInputProps = {
    text: string;
    time: number;
    setTime: (time: number) => void;
    currentFrame: number;
    setCurrentFrame: (currentFrame: number) => void;
    totalFrames: number;
    framerate: number;
    seekToTime: (time: number) => void;
}

export default function TimeInput(props: TimeInputProps) {
    return (
        <section className="timestampContainer">
            <p className="timestampLabel">{props.text}</p>
            <input
                className="timestampInput"
                value={secondsToFormattedString(props.time)}
                onChange={(e) => props.setTime(formattedStringToSeconds(e.currentTarget.value))}
                onSubmit={(e) => props.setTime(formattedStringToSeconds(e.currentTarget.value))}
                placeholder="Enter a timestamp..."
            />
            <FrameInput
                totalFrames={props.totalFrames}
                framerate={props.framerate}
                currentFrame={props.currentFrame}
                setCurrentFrame={props.setCurrentFrame}
                seekToTime={props.seekToTime}
            />
        </section>
    );
}