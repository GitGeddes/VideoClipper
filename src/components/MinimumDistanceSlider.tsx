/*
    https://mui.com/material-ui/react-slider/#minimum-distance
*/
import { useState } from 'react';
import Slider, { SliderProps } from '@mui/material/Slider';
import { secondsToFormattedString, secondsToFrame } from '../util/converters';

function valuetext(value: number, _index: number) {
    return `${secondsToFormattedString(value)}`;
}

const minVal = 0;
export const minDistance = 5;

type MinDistanceSliderProps = SliderProps & {
    setStartTime: (time: number) => void;
    setEndTime: (time: number) => void;
    setStartFrame: (frame: number) => void;
    setEndFrame: (frame: number) => void;
    seekToTime: (time: number) => void;
    framerate: number;
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
                updateValues(start, end);
            } else {
                const clamped = Math.max(newValue[1], minDistance);
                const start = clamped - minDistance;
                const end = clamped;
                setValues([start, end]);
                updateValues(start, end);
            }
        } else {
            setValues(newValue);
            updateValues(newValue[0], newValue[1]);
        }
    };

    function updateValues(startTime: number, endTime: number) {
        props.seekToTime(startTime);
        props.setStartTime(startTime);
        props.setEndTime(endTime);
        props.setStartFrame(secondsToFrame(startTime, props.framerate));
        props.setEndFrame(secondsToFrame(endTime, props.framerate));
    }

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