type FilenameInputProps = {
    text: string;
    filename: string;
    setFilename: (filename: string) => void;
}

export default function FilenameInput(props: FilenameInputProps) {
    return (
        <section className="filenameContainer">
            <p className="filenameLabel">{props.text}</p>
            <input
                className="filenameInput"
                value={props.filename}
                onChange={(e) => props.setFilename(e.currentTarget.value)}
                onSubmit={(e) => props.setFilename(e.currentTarget.value)}
                placeholder="Enter a filename..."
            />
        </section>
    );
}