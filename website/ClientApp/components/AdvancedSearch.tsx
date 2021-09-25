import * as React from 'react';
import { useEffect } from 'react';
import { debounce } from 'ts-debounce';
import { usePrevious } from '../helpers/customHooks';

type AdvancedSearchProps = {
    id: string;
    size: number;    
    visible: boolean;
    useRegex: boolean;
    autoFocus: boolean; //Automatically focus the input element whenever the component becomes visible or if useRegex changes
    debounceDurationSec: number;
    onToggleRegex: (active: boolean) => void;
    onSearchStringChanged: (searchText: string) => void;
};

export default function AdvancedSearch(props: AdvancedSearchProps) {

    const prevProps = usePrevious(props);
    let searchInputRef:  HTMLInputElement | null;
    
    function onSearchStringChanged() {
        if (props.onSearchStringChanged && searchInputRef) {
            props.onSearchStringChanged(searchInputRef.value)
        }
    }

    useEffect(() => {
        if (prevProps && props.autoFocus && searchInputRef &&
            ((prevProps.visible == false && props.visible == true) || (prevProps.useRegex != props.useRegex))) {
                searchInputRef.focus();
        }  
    });

    const divClasses = `advanced-search ${props.visible ? "": "hidden"}`
    const searchPlaceholder = `${props.useRegex ? "Regex search..": "Search.."}`;
    const regexBtnClasses = `regex glyphicon glyphicon-asterisk ${props.useRegex ? "active": ""}`;        
    let debounceOnChange = debounce(onSearchStringChanged, props.debounceDurationSec * 1000);

    return <div id={props.id} className={divClasses}>
                <input type="text" size={props.size} ref={elem => (searchInputRef = elem)} 
                        onChange={() => debounceOnChange()} placeholder={searchPlaceholder}/>
                <span className={regexBtnClasses} title="Search with regex" onClick={() => props.onToggleRegex(!props.useRegex)}/>
            </div>;
}