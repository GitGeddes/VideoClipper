import Checkbox from "./Checkbox";

type CheckboxLabelProps = {
    text: string;
    isValue: boolean;
    setIsValue: (bool: boolean) => void;
}

export default function CheckboxLabel(props: CheckboxLabelProps) {
    return (
        <div className="checkboxContainer">
            <p>{props.text}</p>
            <Checkbox
                value={props.isValue}
                setValue={props.setIsValue}
            />
        </div>
    );
}