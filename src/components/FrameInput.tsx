type FrameInputProps = {
    totalFrames: number;
    framerate: number;
    currentFrame: number;
    setCurrentFrame: (currentFrame: number) => void;
    seekToTime: (time: number) => void;
};

export default function FrameInput(props: FrameInputProps) {
    return (
        <input
            className="timestampInput"
            type={"number"}
            value={props.currentFrame}
            min={0}
            max={props.totalFrames}
            onChange={(e) => {
                const currentFrame = Number.parseInt(e.currentTarget.value)
                props.setCurrentFrame(currentFrame);
                props.seekToTime(currentFrame / props.framerate);
            }}
        />
    );
}