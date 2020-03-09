import {expect} from 'chai';
import 'mocha';

import {SquadManager} from '../src/SquadManager';

describe('Rovers Squad Manager', () => {
    let squadManager: SquadManager;

    beforeEach(() => {
        squadManager = new SquadManager();
    });

    it('validates a valid cmd string', () => {
        const isValid = squadManager.__testingInterface__.validateCmdStr([
            '5 5',
            '1 2 N',
            'LMLMLMLMM',
            '3 3 E',
            'MMRMMRMRRM'
        ].join('\n'));

        expect(isValid).to.be.true;
    });

    it('invalidates an invalid CMD string', () => {
        const resForInvalidStr = squadManager.__testingInterface__.validateCmdStr([
            '5 A', // A not number
            '12 N', // Missing XY coord
            'LMLMLMLMMB', // Invalid command among valid ones
            '3 3', // Missing heading
            'MMRMMRMRRMB'
        ].join('\n'));

        expect(resForInvalidStr).to.be.false;
    });


    it('should process the full message correctly', () => {
        const res = squadManager.readMessage([
            '5 5',
            '1 2 N',
            'LMLMLMLMM',
            '3 3 E',
            'MMRMMRMRRM'
        ].join('\n'));

        expect(res).to.be.equal('1 3 N\n5 1 E');
    });

    it('should process loosely white-spaced message correctly', () => {
        const res = squadManager.readMessage([
            ' 5 5   ',
            '  1 2 N    ',
            'LMLMLMLMM   ',
            '3 3 E   ',
            '   MMRMMRMRRM'
        ].join('\n'));

        expect(res).to.be.equal('1 3 N\n5 1 E');
    });

    it('works with 1-point grid size for one rover to deploy and rotate taking photos', () => {
        const res = squadManager.readMessage([
            '0 0',
            '0 0 N',
            'RRRR',
        ].join('\n'));

        expect(res).to.be.equal('0 0 N');
    });

    describe('returns error', () => {
        it('if grid size not provided', () => {
            const res = squadManager.readMessage([
                '',
                '0 0 E',
                'MRMLMLMMM',
            ].join('\n'));

            expect(res).to.contain('ERROR:');
        });

        it('if rover exploration path would move rover outside the grid', () => {
            const res = squadManager.readMessage([
                '5 5',
                '0 0 E',
                'MRMLMLMMM',
            ].join('\n'));

            expect(res).to.contain('ERROR:');
        });

        it('if rover commands that would result in final location outside the grid', () => {
            const res = squadManager.readMessage([
                '5 5',
                '1 1 N',
                'MMMMMM',
            ].join('\n'));

            expect(res).to.contain('ERROR:');
        });

        it('if initial rover positions are outside the grid size to explore', () => {
            const res = squadManager.readMessage([
                '5 5',
                '6 1 N',
                'MMMMMM',
                '2 2 N',
                'MMMMMM',
            ].join('\n'));

            expect(res).to.contain('RoverLandingCoordinatesError:');
        });

        it('if two rovers to be deployed in the same coordinates', () => {
            const res = squadManager.readMessage([
                '5 5',
                '1 1 E',
                'M',
                '1 1 N',
                'M',
            ].join('\n'));

            expect(res).to.contain('RoversCoordinatesConflictError:');
        });

        it('if a rover would collide with another rover while exploring', () => {
            const res = squadManager.readMessage([
                '5 5',
                '1 1 E',
                'M',
                '1 2 N',
                'M',
                '1 3 N',
                'M',
            ].join('\n'));

            expect(res).to.contain('RoversCollisionError:');
        });
    });
});
