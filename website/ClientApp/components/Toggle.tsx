import React from 'react';

type ToggleProps = {
    active: boolean
    onToggle: (active: boolean) => void;
};

export default function ToggleComponent(props: ToggleProps) {

    return  <label className="switch">
                <input type="checkbox" checked={props.active} onChange={() => props.onToggle(!props.active)}/>
                <span className="slider round"></span>
            </label>;
}