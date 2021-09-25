import * as React from 'react';

export type SettingsGroupProps = {
    iconName: string;
    groupName: string;
    description: string;
} & Partial<DefaultProps>;

type DefaultProps = {
    active: boolean;
    enabled: boolean;
    disabledReason: string,
    onClickOverride: boolean;
    onGroupClick: (groupName: string) => void;
};

export function SettingsGroup (incomingProps: React.PropsWithChildren<SettingsGroupProps>) {

    const defaultProps: DefaultProps = {
        active: false,
        enabled: true,
        disabledReason: "",
        onClickOverride: false,
        onGroupClick: (g: string) => {}
    }
    const props = {
        ...defaultProps,
        ...incomingProps,
      };

    const title = props.enabled ? "" : props.disabledReason;
    const classes = `settings-group ${props.enabled ? "" : "disabled"}`;

    const group = <div title={title} className={classes} onClick={() => props.onGroupClick(props.groupName)}>
        <span className={props.iconName}/>
        <div className="settings-group-text">
            <p>{props.groupName}</p><p>{props.description}</p>
        </div>
    </div>;
    const settings = <div>{props.children}</div>;
    return props.active ? settings : group;
}