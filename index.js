const { Engine, Render, Runner, World, Bodies, Mouse, MouseConstraint, Body, Events} = Matter;
const cellsHorizontal = 20;
const cellsVertical = 20;
const width = window.innerWidth;
const height = window.innerHeight;
const unitLengthX = width / cellsHorizontal; 
const unitLengthY = width / cellsVertical; 

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(), engine)

// walls 
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true}),
    Bodies.rectangle(width / 2, height, width, 2, { isStatic: true}),
    Bodies.rectangle(0, height / 2, 2, height, { isStatic: true}),
    Bodies.rectangle(width, height / 2, 2, height, { isStatic: true})
];
World.add(world, walls);
World.add(world, MouseConstraint.create(engine, { mouse: Mouse.create(render.canvas) }));

// Maze generation 

const shuffle = function(arr) {
    let counter = arr.length;
    while (counter > 0) {
        const index = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
};

const grid = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical)
.fill(null)
.map(() => Array(cellsHorizontal - 1).fill(false));
const horizontals = Array(cellsVertical - 1)
.fill(null)
.map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row,column) => {
    //if i have visited this cell [row, column], then return
    if (grid[row][column]) {
        return;
    }

    //mark this cel as being visited
    grid[row][column] = true;
    //assemble randomly-ordered list of neighbors
    const neighbors = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);
        //for each neighbor
    for(let neighbor of neighbors) {
        const [nextRow, nextColumn, direction] = neighbor;
    
    //see if that neighbor is out of bounds
    if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
        continue;
    }
    //if we have visited that neighbor, continue to the next 
    if (grid[nextRow] [nextColumn]) {
        continue;
    }
    //remove a wall from either horizontal array
    if (direction === 'left') {
        verticals[row][column - 1] = true;
    } else if (direction === 'right') {
        verticals[row][column] = true;
    } else if (direction === 'up') {
        horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
        horizontals[row][column] = true;
    }
    stepThroughCell(nextRow, nextColumn);
    }
    //if we have vist=ited that neighbour, continue to next neighbor
};
stepThroughCell(startRow, startColumn); 

//adds maze patterns
horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2,
            rowIndex * unitLengthY + unitLengthY,
            unitLengthX,
            3,
            {
                label: 'wall',
                isStatic: true,
                render:
                {
                    fillStyle: 'red'
                }
            }
        );
        World.add(world, wall);
    });
});
verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX,
            rowIndex * unitLengthY + unitLengthY / 2,
            5,
            unitLengthY,
            {
             label: 'wall',
             isStatic: true,
             render:
             {
                fillStyle: 'red'
             }
            }
        );
        World.add(world, wall);
    });
});

//goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * .7,
    unitLengthY * .7,
    {isStatic: true,
    label: 'goal',
    render:
    {
        fillStyle: 'green'
    }
    }
);
World.add(world, goal);

//ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    {label: 'ball',
    render:
    {
        fillStyle: 'blue'
    }}
)
World.add(world, ball);

//movement ball
document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    if (event.keyCode === 38) {
        Body.setVelocity(ball, {x, y: y - 5});
    }
    if (event.keyCode === 39) {
        Body.setVelocity(ball, {x: x + 5, y});
    }
    if (event.keyCode === 40) {
        Body.setVelocity(ball, {x, y: y + 5});
    }
    if (event.keyCode === 37) {
        Body.setVelocity(ball, {x: x - 5, y});
    }
})
//win condition
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const  labels = ['ball', 'goal'];
        if(
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        )
            {
                document.querySelector('.winner').classList.remove('hidden');
                document.querySelector('.reload').classList.remove('hidden');
                world.gravity.y = 1;
                world.bodies.forEach(body => {
                    if (body.label === 'wall') {
                        Body.setStatic(body, false)
                    }
                })
            }
        
    })
})

//start new game
const reloadBtn = document.querySelector('button');
function reload() {
    reload = window.location.reload();
}
reloadBtn.addEventListener('click', reload, false);