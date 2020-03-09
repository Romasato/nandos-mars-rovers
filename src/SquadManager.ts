import {Rover, HEADING} from './Rover';
import {NavModule} from './NavModule';
import {xCoord, yCoord} from './types';

import {
    RoversCoordinatesConflictError,
    RoverLandingCoordinatesError,
    RoverOutsideGridExplorationError,
    RoversCollisionError
} from "./ErrorTypes";

type RoverData = {
    ID: number,
    startingPos: number,
    startX: number,
    startY: number,
    heading: HEADING,
    waypoints: Array<[xCoord, yCoord]>,
    commandsString: string,
    finalX: number,
    finalY: number
};

class SquadManager {
    private navModule: NavModule = new NavModule();

    private rovers: Array<RoverData> = [];
    private maxGridX: number = 0;
    private maxGridY: number = 0;

    private setGridSize(xMax: xCoord, yMax: yCoord): void {
        this.maxGridX = +xMax;
        this.maxGridY = +yMax;
    }

    private validateCmdStr(cmdStr: string): boolean {
        // Not the cleanest way, but we want to validate complete command message at once
        const rxpValidCommand = /^(\d+)\s(\d+)(\n(\d+)\s(\d+)\s(\b[NESW]\b)\n([LRM]+))+$/g;
        return rxpValidCommand.test(cmdStr);
    }

    /**
     * Cleans a string removing redundant spaces etc.
     * @param cmdStr
     */
    private cleanCmdStr(cmdStr: string): string {
        return cmdStr.replace(/(^|(?<=\n))\s+|\s+((?=\n)|$)/mg, '');
    }

    private parseRoverData(parsedRoverCmds: string[][]): void {
        parsedRoverCmds.forEach((roverCmdLines: string[], roverIdx: number) => {
            const [roverCoords, roverMoveCmds] = roverCmdLines;
            const [roverPosX, roverPosY, roverHeading] = roverCoords.split(/\s/);

            const {x: finalX, y: finalY, heading: finalHeading, waypoints} = this.navModule.getFinalCoordinates(+roverPosX, +roverPosY, roverHeading as HEADING, roverMoveCmds);

            const roverData: RoverData = {
                ID: roverIdx,
                startingPos: roverIdx,
                startX: +roverPosX,
                startY: +roverPosY,
                heading: roverHeading as HEADING,
                waypoints: waypoints,
                commandsString: roverMoveCmds,
                finalX: finalX,
                finalY: finalY
            };

            this.rovers.push(roverData);
        });
    }

    /**
     * Validates Rover deployment coords and navigation paths for conflicts.
     * Returns array of errors - or an empty array if none.
     * @param parsedRoverCmds
     */
    private validateRoversData(): any {
        const errorsList: Error[] = this.rovers.reduce((errorsList: Error[], currentRover: RoverData, roverIdx: number, allRovers: RoverData[]) => {
            const {startX: roverPosX, startY: roverPosY, waypoints, ID, startingPos} = currentRover;

            // Verify that initial coordinates are within grid boundary
            if(+roverPosX > this.maxGridX || +roverPosY > this.maxGridY) {
                const errMsg = `Rover [${ID}]: coordinates [x: ${roverPosX}, y: ${roverPosY}] are outside the grid [${this.maxGridX}, ${this.maxGridY}] boundaries.`;

                const err = new RoverLandingCoordinatesError(errMsg);
                errorsList.push(err);
                return errorsList;
            }

            // Verify no other rover is to be deployed in the same coords.
            const otherRoverInSameInitialPos = allRovers.find(rover => rover.startX === roverPosX && rover.startY === roverPosY && rover.ID !== currentRover.ID);
            if(otherRoverInSameInitialPos) {
                const errMsg = `Rover [${ID}]: another rover [ID: ${otherRoverInSameInitialPos.ID}] is to be deployed at [x: ${roverPosX}, y: ${roverPosY}] coordinates.`;
                const err = new RoversCoordinatesConflictError(errMsg);
                errorsList.push(err);
            }

            // Validate rover exploration path is not breaching the grid boundaries at any point
            const hasWaypointsOutsideGrid = waypoints.find(([x, y]) => {
                return x < 0 || x > this.maxGridX || y < 0 || y > this.maxGridX;
            });
            if(hasWaypointsOutsideGrid) {
                const errMsg = `Rover [${ID}]: with given commands would navigate outside grid.`;
                const err = new RoverOutsideGridExplorationError(errMsg);
                errorsList.push(err);
            }

            /* Validate that Rover would not bump into any other static Rovers when exploring.
                Find Rovers that would be in current Rover's path:
                - in final position for ones that finished,
                - in starting position for ones that just deployed, but have not moved yet.
            */
            const roversInOurPath = this.rovers.filter((roverB) => {
                // Ignore rovers starting at same coordinates
                // Previous checks should detect same coord deployement conflicts.
                if(roverB.startX === currentRover.startX && roverB.startY === currentRover.startY) {
                    return false;
                }

                // For ones which would have already finished exploration before our Rover
                if(roverB.startingPos < startingPos) {
                    const hasCommonCoords = waypoints.find(([x,y]) => x === roverB.finalX && y === roverB.finalY);
                    if(hasCommonCoords) {
                        return true;
                    }
                }

                if(startingPos < roverB.startingPos) {
                    const hasCommonCoords = waypoints.find(([x,y]) => x === roverB.startX && y === roverB.startY);
                    if(hasCommonCoords) {
                        return true;
                    }
                }
            });

            if(roversInOurPath.length) {
                const otherRoverIDs = roversInOurPath.map(rover => rover.ID);
                const errMsg = `Rover [${ID}]: with given commands would collide with other rover(s) [ID: ${otherRoverIDs.join(', ')}].`;
                const err = new RoversCollisionError(errMsg);
                errorsList.push(err);
            }

            return errorsList;
        }, []);

        return errorsList;
    }

    /**
     * Accepts string messages with plateau grid size and rover commands.     *
     * @param cmdStr
     */
    public readMessage(cmdStr: string): string {
        // Clean cmd string
        const pureCmdStr = this.cleanCmdStr(cmdStr);

        // Ensure command tokens are valid
        const isCmdValid = this.validateCmdStr(pureCmdStr);
        if(!isCmdValid) {
            return 'ERROR: Command message is not formatted correctly.';
        }

        // Split message into parts
        const msgSplit = pureCmdStr.split(/\n/);
        const [rawGridSize, ...roversCmds] = msgSplit;

        // Process grid size info
        const [xMax, yMax]  = rawGridSize.split(/\s/);
        this.setGridSize(+xMax, +yMax);

        // Rover cmds should come in pairs
        if(roversCmds.length % 2 > 0) {
            return 'ERROR: Rover commands incomplete';
        }

        // Group remaining Rover commands in chunks of 2 lines for each Rover
        const parsedRoverCmds: Array<string[]> = [];

        const iRoverLinesCount = 2;
        for (let idx = 0, iCmdsCount = roversCmds.length; idx < iCmdsCount; idx += iRoverLinesCount) {
            const tempArray = roversCmds.slice(idx, idx + iRoverLinesCount);
            parsedRoverCmds.push(tempArray);
        }

        // Parse Rover data first
        this.parseRoverData(parsedRoverCmds);

        // Validate Rover coords and predicted exploration paths BEFORE sending to rovers
        const validationResults: string[] = this.validateRoversData();
        if(validationResults.length) {
            return 'ERROR:\n'+validationResults.join('\n');
        }

        // Process Rover coordinates and send the commands
        const roversFinalPositions: string[] = parsedRoverCmds.map((roverCmdLines: string[]) => {
            return this.processRoverCmds(roverCmdLines);
        });

        return roversFinalPositions.join('\n');
    }

    private processRoverCmds(strRoverCmds: string[]): string {
        const [roverCoords, roverMoveCmds] = strRoverCmds;
        const [posX, posY, heading] = roverCoords.split(/\s/);

        // Construct message for Rover
        const msgForRover = strRoverCmds.join('\n');

        // Deploy the Rover
        return this.deployRover(msgForRover);
    }

    private deployRover(msgForRover: string): string {
        const rover = new Rover();
        return rover.readMessage(msgForRover);
    }

    public __testingInterface__ = {
        validateCmdStr: this.validateCmdStr
    }
}

export {SquadManager};
