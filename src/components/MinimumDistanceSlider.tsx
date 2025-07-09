/*
    https://mui.com/material-ui/react-slider/#minimum-distance
*/
import { useState } from 'react';
import Slider, { SliderProps } from '@mui/material/Slider';

function valuetext(value: number, _index: number) {
    return `${secondsToFormattedString(value)}`;
}

function secondsToFormattedString(seconds: number): string {
    let secs: number = seconds % 60;
    let mins: number = Math.floor(seconds / 60);
    if (secs < 10) return mins + ":0" + secs;
    return mins + ":" + secs;
}

const minVal = 0;
const minDistance = 5;

type MinDistanceSliderProps = SliderProps & {
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
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
                props.setStartTime(secondsToFormattedString(start));
                props.setEndTime(secondsToFormattedString(end));
                props.seekToTime(start);
            } else {
                const clamped = Math.max(newValue[1], minDistance);
                const start = clamped - minDistance;
                const end = clamped;
                setValues([start, end]);
                props.setStartTime(secondsToFormattedString(start));
                props.setEndTime(secondsToFormattedString(end));
                props.seekToTime(start);
            }
        } else {
            setValues(newValue);
            props.setStartTime(secondsToFormattedString(newValue[0]));
            props.setEndTime(secondsToFormattedString(newValue[1]));
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