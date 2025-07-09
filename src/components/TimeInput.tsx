type TimeInputProps = {
    text: string;
    time: string;
    setTime: (time: string) => void;
}

export default function TimeInput(props: TimeInputProps) {
    return (
        <section className="timestampContainer">
            <p className="timestampLabel">{props.text}</p>
            <input
                className="timestampInput"
                value={props.time}
                onChange={(e) => props.setTime(e.currentTarget.value)}
                onSubmit={(e) => props.setTime(e.currentTarget.value)}
                placeholder="Enter a timestamp..."
            />
        </section>
    );
}