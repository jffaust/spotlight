import * as React from 'react';
import Toggle from './Toggle';

type SettingsSectionProps = {
    name: string;
    link?: string;
    active: boolean;
    onToggle: (active: boolean) => void;
};

export default function SettingsSection(incomingProps: React.PropsWithChildren<SettingsSectionProps>) {
    const props = {
        ...{link: ""},
        ...incomingProps,
      };

    const header = props.link ? 
        <a className="h4 header-link" href={props.link} target="_blank">{props.name}</a> :
        <h4>{props.name}</h4>;
        
    const section = <div>
        <div className="settings-section-header">
            {header}<Toggle active={props.active} onToggle={props.onToggle}/>
        </div>
        {props.active ? props.children : null}
    </div>;
    return section;
}