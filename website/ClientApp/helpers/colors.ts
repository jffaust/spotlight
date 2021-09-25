export type rgb = {
    r: number;
    g: number;
    b: number;
}

export type hsl = {
    h: number;
    s: number;
    l: number;
}

export const toRgbString = (input: rgb): string => {
    return `rgb(${input.r}, ${input.g}, ${input.b})`
}

export const isRgbString = (input: string): rgb | null => {
    if (!input) { return null; }

    const regex = new RegExp('rgb\\((\\d{1,3}),\\s*(\\d{1,3}),\\s*(\\d{1,3})\\)');
    const matches = input.match(regex);
    
    return matches ? {
        r: matches !== null ? Number(matches[1]) : 0,
        g: matches !== null ? Number(matches[2]) : 0,
        b: matches !== null ? Number(matches[3]) : 0
    } : null;
};

export const isHslString = (input: string): hsl | null => {
    if (!input) { return null; }

    const regex = new RegExp('hsl\\((\\d{1,2})%,\\s*(\\d{1,2})%,\\s*(\\d{1,2})%\\)');
    const matches = input.match(regex);
    
    return matches ? {
        h: matches !== null ? Number(matches[1]) : 0,
        s: matches !== null ? Number(matches[2]) : 0,
        l: matches !== null ? Number(matches[3]) : 0
    } : null;
};

//https://css-tricks.com/converting-color-spaces-in-javascript/#hsl-to-rgb
export const hslToRgb = ({h, s, l}: hsl): rgb => {
    // Must be fractions of 1
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;  
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    }
  }

  export const blendTwoRgbColors = (bottom: rgb, top: rgb, alpha: number): rgb => {
    if (alpha < 0 || alpha > 1) {
        throw `Received an alpha value outside of the range [0,1]: '${alpha}'`
    } else {
        return {
            r: bottom.r + (top.r-bottom.r)*alpha,
            g: bottom.g + (top.g-bottom.g)*alpha,
            b: bottom.b + (top.b-bottom.b)*alpha,
        }
    }
}