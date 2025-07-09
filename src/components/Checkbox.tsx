export default function Checkbox(props: { value: boolean; setValue: (arg0: boolean) => void; }) {
	return <input type="checkbox" checked={props.value} onChange={() => {props.setValue(!props.value)}}/>
}