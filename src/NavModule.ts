import {xCoord, yCoord, xyCoord, PositionHeading, HEADING, CMD_MOVING, CMD_ROTATION} from './types';

type Waypoints = {
    waypoints: xyCoord[]
}

class NavModule {
    private posX: xCoord;
    private posY: yCoord;
    private heading: HEADING;
    private waypointsTaken: xyCoord[]

    private setPosition(x: number, y: number): void {
        this.posX = x;
        this.posY = y;
    }

    private setHeading(newHeading: HEADING): void {
        this.heading = newHeading;
    }

    private getPosHeadingWaypoints(): PositionHeading & Waypoints {
        return {
            x: this.posX,
            y: this.posY,
            heading: this.heading,
            waypoints: this.waypointsTaken
        };
    }

    public getFinalCoordinates(
        startX: number,
        startY: number,
        startHeading: string,
        moveCmds: string
    ): PositionHeading & Waypoints {
        this.setPosition(startX, startY);
        this.setHeading(<HEADING>startHeading);
        this.waypointsTaken = this.processMoveCommands(moveCmds);
        return this.getPosHeadingWaypoints();
    }

    private processMoveCommands(cmdInput: string): xyCoord[]  {
        const cmdsList = cmdInput.split('');
        const waypointsTaken: xyCoord[] = [];

        cmdsList.forEach((cmd: string) => {
            if(cmd in CMD_ROTATION) {
                const newHeading = this.rotate(this.heading, cmd);
                this.setHeading(newHeading);
            }
            else if(cmd in CMD_MOVING) {
                const [newX, newY] = this.move(this.posX, this.posY, this.heading, cmd);
                waypointsTaken.push([newX, newY]);
                this.setPosition(newX, newY);
            }
        });

        return waypointsTaken;
    }

    private rotate(currHeading: HEADING, rotateTo: string): HEADING {
        const headings = [HEADING.N, HEADING.E, HEADING.S, HEADING.W];
        const idxCurrentHeading: number = headings.indexOf(currHeading);
        const iDirCount: number = headings.length;
        const iDelta: number = rotateTo === CMD_ROTATION.L ? -1 : 1;

        let idxNewHeading = idxCurrentHeading + iDelta;
        if(idxNewHeading < 0) { idxNewHeading = iDirCount - 1; }
        else if(idxNewHeading >= iDirCount) {
            idxNewHeading = 0;
        }

        // Return new heading
        return headings[idxNewHeading];
    }

    private move(posX: xCoord, posY: yCoord, heading: HEADING, cmd: string = CMD_MOVING.M): [number, number] {
        if(cmd === CMD_MOVING.M) {
            return this.moveForward(posX, posY, heading,1);
        }
    }

    private moveForward(
        xPos: number,
        yPos: number,
        heading: HEADING,
        distance: number = 1
    ): [number, number] {

        const currHeading = heading;
        let xPosNew = xPos;
        let yPosNew = yPos;

        switch(currHeading) {
            case HEADING.N:
                yPosNew += distance;
                break;
            case HEADING.E:
                xPosNew += distance;
                break;
            case HEADING.S:
                yPosNew -= distance;
                break;
            case HEADING.W:
                xPosNew -= distance;
                break;
        }

        return [xPosNew, yPosNew];
    }

    public __testingPort__ = {
        move: this.move.bind(this),
        moveForward: this.moveForward.bind(this),
        rotate: this.rotate.bind(this)
    };
}

export {NavModule};
