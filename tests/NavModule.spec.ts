import {expect} from 'chai';
import 'mocha';

import {NavModule} from '../src/NavModule';
import {CMD_MOVING, CMD_ROTATION, HEADING} from "../src/types";

describe('Navigation Module', () => {
    let roverNavModule: NavModule;
    beforeEach(() => {
        roverNavModule = new NavModule();
    });

    describe('internal unit tests', () => {
        describe('move():', () => {
            it('given a command, moves rover to correct coordinates', () => {
                const res = roverNavModule.__testingPort__.move(
                    0,
                    0,
                    HEADING.N,
                    CMD_MOVING.M
                );
                expect(res).to.eql([0, 1]);
            });
        })

        describe('moveForward():', () => {
            it('moves rover forward to correct coordinates', () => {
                let res = roverNavModule.__testingPort__.moveForward(
                    0,
                    0,
                    HEADING.N,
                    1
                );
                expect(res).to.eql([0, 1]);

                res = roverNavModule.__testingPort__.moveForward(
                    1,
                    1,
                    HEADING.E,
                    1
                );
                expect(res).to.eql([2, 1]);
            });
        });

        describe('rotate():', () => {
            it('rotates rover around its axis to face new direction', () => {
                let res = roverNavModule.__testingPort__.rotate(
                    HEADING.N,
                    CMD_ROTATION.L
                );
                expect(res).to.equal(HEADING.W);

                let res2 = roverNavModule.__testingPort__.rotate(
                    HEADING.S,
                    CMD_ROTATION.R
                );
                expect(res2).to.equal(HEADING.W);
            });
        })

    });

    it('given initial position, heading and commands list returns final coordinates and waypoints taken', () => {
        const scenarios = [
            {
                posX: 1,
                posY: 2,
                heading: 'N' as HEADING,
                cmd: 'LMLMLMLMM',
                expectation: {
                    x: 1,
                    y: 3,
                    heading: 'N',
                    waypoints: [
                        [0,2],
                        [0,1],
                        [1,1],
                        [1,2],
                        [1,3]
                    ]
                }
            },
            {
                posX: 3,
                posY: 3,
                heading: 'E' as HEADING,
                cmd: 'MMRMMRMRRM',
                expectation: {
                    x: 5,
                    y: 1,
                    heading: 'E',
                    waypoints: [
                        [4,3],
                        [5,3],
                        [5,2],
                        [5,1],
                        [4,1],
                        [5,1],
                    ]
                }
            }
        ];

        scenarios.forEach((scenario, scIdx) => {
            const {posX, posY, heading, cmd, expectation} = scenario;

            const finalPos = roverNavModule.getFinalCoordinates(posX, posY, heading, cmd);
            expect(finalPos, scIdx + ' ' +JSON.stringify(scenario)).to.eql(expectation);
        });
    });
});
