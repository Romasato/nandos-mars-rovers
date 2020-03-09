import {NavModule} from "./NavModule";

import {HEADING, PositionHeading} from './types';

class Rover {
    posX: number = 0;
    posY: number = 0;
    heading: HEADING = HEADING.N;

    private navModule: NavModule = new NavModule();

    private setPosAndHeading(x: number, y: number, heading: HEADING): void {
        this.posX = x;
        this.posY = y;
        this.heading = heading;
    }

    private validateCmdStr(cmdStr: string): boolean {
        const rxpValidCommand = /^(\d+)\s(\d+)\s(\b[NESW]\b)\n([LRM]+)$/g;
        return rxpValidCommand.test(cmdStr);
    }

    public readMessage(cmdStr: string): string {
        const trimmedCmdStr = cmdStr.replace(/(^|(?<=\n))\s+|\s+((?=\n)|$)/mg, '');

        const isValid = this.validateCmdStr(trimmedCmdStr);
        if(!isValid) {
            return 'ERROR: Command is invalid';
        }

        const [cmdInitPos, cmdsMove] = trimmedCmdStr.split('\n');

        this.processPositionCommand(cmdInitPos);
        const {x, y, heading} = this.processMovementCommands(cmdsMove);

        // Send back the message
        return [x, y, heading].join(' ');
    }

    private processPositionCommand(cmdInput: string): void {
        const [posX, posY, heading] = cmdInput.split(/\s/);
        this.setPosAndHeading(+posX, +posY, heading as HEADING);
    }

    private processMovementCommands(cmdsMovement: string): PositionHeading {
        return this.navModule.getFinalCoordinates(this.posX, this.posY, this.heading, cmdsMovement);
    }
}

export {Rover, HEADING};
