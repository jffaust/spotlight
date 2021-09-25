import * as React from 'react';
import { useState } from 'react';
import { SettingsGroup, SettingsGroupProps } from './SettingsGroup';

type SettingsMenuProps = {
    title: string;
    menuId: string;
    visible: boolean;
    children: React.ReactElement<SettingsGroupProps>[]
};

export function SettingsMenu(props: React.PropsWithChildren<SettingsMenuProps>) {

    const [activeSettingsGroupName, setActiveGroup] = useState("");

    function handleGroupClick(groupName: string) {
        setActiveGroup(groupName);
    }

    function showGroupContent(p: SettingsGroupProps) {
        return activeSettingsGroupName == "" || isGroupActive(p);
    }

    function isGroupActive(p: SettingsGroupProps): boolean {
        return p.groupName == activeSettingsGroupName; 
    }

    const groupsToShow = props.children.filter((e: React.ReactElement<SettingsGroupProps>) => showGroupContent(e.props));
    const menuGroups = groupsToShow.map((e: React.ReactElement<SettingsGroupProps>) => 
        React.cloneElement<SettingsGroupProps>(e, {
            ...e.props,
            active: isGroupActive(e.props),
            onGroupClick: e.props.onClickOverride ? e.props.onGroupClick : handleGroupClick
        })
    );

    const groupSelectionMode = activeSettingsGroupName == "";    
    const groupSelectionHeader = <h4>{props.title}</h4>;
    const activeGroupHeader = <>
        <span className="glyphicon glyphicon-arrow-left" onClick={() => setActiveGroup("")}/>
        <h4>{activeSettingsGroupName}</h4>
    </>;
    const header = groupSelectionMode ? groupSelectionHeader : activeGroupHeader;

    const menuClasses = props.visible ? "settings-menu": "hidden"
    return <div id={props.menuId} className={menuClasses}>
        <div className="settings-menu-header">
            {header}
        </div>
        {menuGroups}
    </div>;
}