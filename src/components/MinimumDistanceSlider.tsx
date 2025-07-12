/*
    https://mui.com/material-ui/react-slider/#minimum-distance
*/
import { useState } from 'react';
import Slider, { SliderProps } from '@mui/material/Slider';
import { secondsToFormattedString } from '../util/converters';

function valuetext(value: number, _index: number) {
    return `${secondsToFormattedString(value)}`;
}

const minVal = 0;
const minDistance = 5;

type MinDistanceSliderProps = SliderProps & {
    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    seekToTime: (time: number) => void;
};

export default function MinimumDistanceSlider(props: MinDistanceSliderProps) {
    const [values, setValues] = useState<number[]>([0, minDistance]);

    const handleChange = (_event: Event, newValue: number | number[], activeThumb: number) => {
        if (typeof newValue === "number") return;
        if (newValue[1] - newValue[0] < minDistance) {
            if (activeThumb === 0) {
                const maxVal = Math.max(minVal, props.max ? props.max : minVal);
                const clamped = Math.min(newValue[0], maxVal - minDistance);
                const start = clamped;
                const end = clamped + minDistance;
                setValues([start, end]);
                props.setStartTime(start);
                props.setEndTime(end);
                props.seekToTime(start);
            } else {
                const clamped = Math.max(newValue[1], minDistance);
                const start = clamped - minDistance;
                const end = clamped;
                setValues([start, end]);
                props.setStartTime(start);
                props.setEndTime(end);
                props.seekToTime(start);
            }
        } else {
            setValues(newValue);
            props.setStartTime(newValue[0]);
            props.setEndTime(newValue[1]);
            props.seekToTime(newValue[0]);
        }
    };

    return (
        <Slider
            {...props}
            value={values}
            onChange={handleChange}
            min={minVal}
            max={Math.max(minVal, props.max ? props.max : minVal)}
            valueLabelDisplay="auto"
            valueLabelFormat={valuetext}
            getAriaLabel={() => 'Minimum distance shift'}
            getAriaValueText={valuetext}
            disableSwap
        />
    );
}