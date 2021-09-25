import * as Force from './Force';

export interface LinkSettings {
    length: number;
    labelProperty: string;
    showArrowheads: boolean;
}

export interface NodeSettings {
    labelProperty: string;
    colorProperty: string;
}

export interface ForceSettings {
    forceCenter: Force.Center;
    forceCharge: Force.Charge;
    forceCollide: Force.Collide;
    forceX: Force.Position;
    forceY: Force.Position;
    forceRadial: Force.Radial;
}

export interface SearchSettings {
    searchString?: string;
    isActive: boolean;
    useRegex: boolean;
}

export interface TimeSettings {
    
}