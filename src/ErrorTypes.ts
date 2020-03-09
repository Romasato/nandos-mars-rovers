class RoverLandingCoordinatesError extends Error {
    name = 'RoverLandingCoordinatesError'
}

class RoverCoordinatesError extends Error {
    name = 'RoverCoordinatesError';
}

class RoversCoordinatesConflictError extends Error {
    name = 'RoversCoordinatesConflictError';
}

class RoverOutsideGridExplorationError extends Error {
    name = 'RoverOutOfGridExplorationError';
}

class RoversCollisionError extends Error {
    name = 'RoversCollisionError';
}

export {
    RoverCoordinatesError,
    RoverLandingCoordinatesError,
    RoversCoordinatesConflictError,
    RoversCollisionError,
    RoverOutsideGridExplorationError
};
