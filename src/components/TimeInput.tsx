import { formattedStringToSeconds, secondsToFormattedString } from "../util/converters";

type TimeInputProps = {
    text: string;
    time: number;
    setTime: (time: number) => void;
    totalFrames: number;
    framerate: number;
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
        </section>
    );
}