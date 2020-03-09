# Mars Rover Technical Challenge

Scroll to **Implementation** section for more details and constraints pertaining to the provided solution.

## The Brief
The problem below requires some kind of input. You are free to implement any mechanism for feeding input into your solution (note, the
commands must be sent in a single message). You should provide sufficient evidence that your solution is complete by, as a minimum, indicating
that it works correctly against the supplied test data.

We highly recommend using a unit testing framework. Even if you have not used it before, it is simple to learn and incredibly useful.

The code you write should be of production quality, code you are proud of and with consideration of future maintenance that could be done by
another team.

### Mars Rovers
A squad of robotic rovers are to be landed by NASA on a plateau on Mars.

This plateau, which is curiously rectangular, must be navigated by the rovers so that their on-board cameras can get a complete view of the surrounding terrain to send back to Earth.

A rover's position is represented by a combination of an x and y co-ordinates and a letter representing one of the four cardinal compass points.

The plateau is divided up into a grid to simplify navigation. An example position might be 0, 0, N, which means the rover is in the bottom left
corner and facing North.

In order to control a rover, NASA sends a simple string of letters. The possible letters are 'L', 'R' and 'M'. 'L' and 'R' makes the rover spin 90
degrees left or right respectively, without moving from its current spot.
'M' means move forward one grid point, and maintain the same heading.
Assume that the square directly North from (x, y) is (x, y+1).

**Input:**

The first line of input is the upper-right coordinates of the plateau, the lower-left coordinates are assumed to be 0,0.

The rest of the input is information pertaining to the rovers that have been deployed. Each rover has two lines of input. The first line gives the
rover's position, and the second line is a series of instructions telling the rover how to explore the plateau.

The position is made up of two integers and a letter separated by spaces, corresponding to the x and y co-ordinates and the rover's orientation.

Each rover will be finished sequentially, which means that the second rover won't start to move until the first one has finished moving.

**Output:**

The output for each rover should be its final co-ordinates and heading.

**Test Input:**

```
5 5
1 2 N
LMLMLMLMM
3 3 E
MMRMMRMRRM
```

**Expected Output:**
```
1 3 N
5 1 E
```

# Unspecified Constraints / Questions 
The spec does not provide answers to some things, such as:

* Can multiple rovers be in the same grid position at once? (Maybe the grid location is big enough for multiple rovers - maybe not);

Which brings in other considerations:

* Can Rovers start from the same position? (Given rovers move one after another, maybe one lands first before another does?)
* And can a Rover pass through a grid point in which another Rover is already standing after finishing exploring?

# Implementation

## Constraints 
Below are the constraints under which the Mars Exploration program was coded.

* Rovers are controlled by a **Squad Manager** (SM) instance. Imagine, SM could be in a satellite orbiting Mars, so close to the deployed rovers to pass on the commands.
* Both **Rover** and **SM**, as per spec, understand and have only string-based messaging interface exposed. They can accept and return only string messages - nothing else.
* **SM** is the only one that knows about grid size and deployed rovers and controls their movements - rovers do not know about each other.
* As per specification, Rovers do not know about the size of the grid (plateau). Only **SM** does.
* The single message sent to **SM** is first parsed and validated before commands are sent to the deployed rovers.
* **Rover** instances understand only the 2-line (new line-delimited) string command containing _coordinates_, _heading_ info and _movement_ commands. 
* Before sending movement commands to rovers, **SM** checks if they would result in out-of-bounds exploration regarding the given plateau size. If that is the case, an error is returned and commands are not sent to any of the rovers.

## Classes
There are 3 main classes

| Class         | Purpose       |
| ------------- | ------------- |
| SquadManager  | Receives the master messages, validates, then deploys Rovers sends them relevant commands.  |
| Rover         | Receives messages from Squad Manager, validates them and executes given commands. |
| NavModule     | Common navigation module used by both SquadManager and Rovers to predict and move around the coordinates. |



