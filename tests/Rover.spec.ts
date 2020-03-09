import {expect} from 'chai';
import 'mocha';

import {Rover} from '../src/Rover';


describe('Mars Rover', () => {
    let rover: Rover;
    beforeEach(() => {
        rover = new Rover();
    });

    it('should return an error if message of invalid format', () => {
        const invalidMessages = [
            [
                '1 2 N',
                'LMLMLMLMMB' // has invalid 'B' token
            ],
            [
                '1 N', // Missing coord
                'LMLMLMLMM'
            ],
            [
                '-1 0 N', // Negative coord
                'LMLMLMLMM'
            ],
            [
                '0 0 N' // Missing second line
            ],
            [
                '0 0 N',
                'B' // Invalid command
            ]
        ];

        invalidMessages.forEach((roverCmdLines) => {
            const roverRes = rover.readMessage(roverCmdLines.join('\n'));
            expect(roverRes).to.contain('ERROR:');
        });
    });

    it('should process 2-line command string and move to correct location', () => {

        const scenarios = [
            {
                msgLines: [
                    '  1 2 N       ',
                    '  LMLMLMLMM  '
                ],
                expectation: '1 3 N'
            },
            {
                msgLines: [
                    '3 3 E',
                    'MMRMMRMRRM'
                ],
                expectation: '5 1 E'
            },
            {
                msgLines: [
                    '0 0 E',
                    'R'
                ],
                expectation: '0 0 S'
            },
            {
                msgLines: [
                    '0 0 N',
                    'R'
                ],
                expectation: '0 0 E'
            },
            {
                msgLines: [
                    '0 0 N',
                    'L'
                ],
                expectation: '0 0 W'
            },
            {
                msgLines: [
                    '0 0 N',
                    'LLLL'
                ],
                expectation: '0 0 N'
            },
            {
                msgLines: [
                    '0 0 N',
                    'RRRR'
                ],
                expectation: '0 0 N'
            }
        ];

        scenarios.forEach((scenario, scIdx) => {
            const {msgLines, expectation} = scenario;
            const finalLocation = rover.readMessage(msgLines.join('\n'));

            expect(finalLocation).to.be.equal(expectation);
        });


    });
});
