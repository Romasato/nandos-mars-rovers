type xCoord = number;
type yCoord = number;
type xyCoord = [xCoord, yCoord];

export enum HEADING {
    N = 'N',
    E = 'E',
    S = 'S',
    W = 'W',
}

export enum CMD_ROTATION {
    L = 'L',
    R = 'R'
}

export enum CMD_MOVING {
    M = 'M'
}

type PositionHeading = {
    x: number,
    y: number,
    heading: HEADING
}

export {
    xCoord,
    yCoord,
    xyCoord,
    PositionHeading
};
