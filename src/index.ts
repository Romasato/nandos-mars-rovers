import {SquadManager} from './SquadManager';

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const question = (str: string, defaultString: string = '') => {
    return new Promise(resolve => {
        rl.write(defaultString);
        return rl.question(str, resolve);
    });
}

// A list of all the steps involved in our program
const steps = {
    start: async () => {
        return steps.startNewExploration();
    },
    startNewExploration: async () => {
        console.log([
            'Hello there!',
            'You\'re about to deploy one or more Rovers to explore Mars!',
            'To do that, first we need to construct and then send a message to Rovers Squad Manager',
            'Let\'s construct a message to send!'
        ].join('\n'));

        console.log('Please tell us the size of area to explore:')
        const gridX = await question('Grid size - X: ');
        const gridY = await question('Grid size - Y: ');

        let roversCount: any;
        do {
            roversCount = await question('Number of Mars Rovers to deploy: ');
        } while(roversCount === '');

        const messageParts: string[] = [
            `${gridX} ${gridY}`,
        ];

        for(let i = 0; i < +roversCount; i++) {
            const roverCoords = await question(`Rover [${i}] coordinates and heading [X Y H]: `);
            const roverCommands = await question(`Rover [${i}] MOVE commands: `);

            messageParts.push(<string>roverCoords);
            messageParts.push(<string>roverCommands);
        }

        const finalMessage = messageParts.join('\n');

        console.log([
            'The message to be sent:',
            '------------------------',
                finalMessage,
            '------------------------'
        ].join('\n'));

        const squadManager = new SquadManager();
        const res = squadManager.readMessage(finalMessage);

        console.log([
            'Rovers Squad Manager - Response:',
            '------------------------',
                res,
            '------------------------'
        ].join('\n'));

        return steps.end();
    },
    end: async () => {
        rl.close();
    },
};

// Start the program by running the first step.
steps.start();
