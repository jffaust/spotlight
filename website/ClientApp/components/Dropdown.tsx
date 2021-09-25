import * as React from 'react';

type DropdownProps = {
    value: string
    options: string[];   
    onOptionChange: (option: string) => void;
};

export default function Dropdown(props: DropdownProps) {

    function handleOnChange(event: React.ChangeEvent<HTMLSelectElement>) {
        props.onOptionChange(event.target.value)
    }

    return <div className="custom-select">
                <select value={props.value} onChange={handleOnChange}>
                    {props.options.map(o => (
                        <option value={o}>{o}</option>
                    ))}
                </select>
                <span className="focus"></span>
            </div>;
}