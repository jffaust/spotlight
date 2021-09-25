import * as React from 'react';

type IconButtonProps = {
    id: string
    icon: string;   
    title: string;   
    active: boolean;
    onClick: () => void;
};

export default function IconButton(props: IconButtonProps) {

    let classes = `icon-button ${props.icon} ${props.active ? "active": ""}`;
    return <span id={props.id} className={classes} onClick={() => props.onClick()}/>;
}