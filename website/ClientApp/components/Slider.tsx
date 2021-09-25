import * as React from 'react';

type SliderProps = {
    min: number;
    max: number;
    step: number;
    value: number;
    disabled?: boolean;
    onChange: (value: number) => void;
}

export default function Slider(incomingProps: SliderProps) {
    const props = {
        ...{disabled: false},
        ...incomingProps,
      };

    function handleOnChange(event: React.ChangeEvent<HTMLInputElement>) {
        props.onChange(parseFloat(event.target.value));
    }

    return  <input type="range" min={props.min} max={props.max} step={props.step}
        value={props.value} disabled={props.disabled} onChange={handleOnChange}/>;
}