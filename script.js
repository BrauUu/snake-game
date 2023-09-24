const Snake = {
    axisX: 0,
    axisY: 0,
    viewDirection: 'Right',
    color: "#00FF00",
    updatePosition(x, y) {
        Snake.axisX = x
        Snake.axisY = y
    },
    updateViewDirection(viewDirection) {
        Snake.viewDirection = viewDirection
    },
    tailPositions: [],
    points: 1
}

const Fruit = {
    axisX: 0,
    axisY: 0,
    definePosition(x, y) {
        Fruit.axisX = x
        Fruit.axisY = y
    },
}

let eventOnProgress = false

const intervalID = window.setInterval(goStraight, 500)

window.addEventListener('load', () => {
    renderGame()
})


window.addEventListener('keydown', (event) => {

    if (eventOnProgress) {
        event.preventDefault()
        return
    }

    eventOnProgress = true

    const key = event.key
    handleKeyPressed(key)
})

function goStraight() {

    const Moves = {
        'Up': { axisX: 0, axisY: -1 },
        'Right': { axisX: 1, axisY: 0 },
        'Down': { axisX: 0, axisY: 1 },
        'Left': { axisX: -1, axisY: 0 },
    }

    const { axisX, axisY} = Moves[Snake.viewDirection]

    handleMovement(axisX, axisY)

    eventOnProgress = false
}

function handleMovement(x, y) {

    let { axisX, axisY, color, updatePosition, tailPositions } = Snake
    let tempAxisX = axisX + x * 20
    let tempAxisY = axisY + y * 20

    
    updatePosition(tempAxisX, tempAxisY)
    if(handleCollision()){
        return
    }
    
    tailPositions.unshift({ axisX: axisX, axisY: axisY })
    const blank = tailPositions.pop()

    drawRectangle(blank.axisX, blank.axisY, "#eff0f1")
    drawRectangle(tempAxisX, tempAxisY, color)

    for (block of tailPositions) {
        drawRectangle(block.axisX, block.axisY, color)
    }
}

function handleCollision() {

    let { axisX, axisY, tailPositions } = Snake

    if (hasColidedWithTail(axisX, axisY, tailPositions)) {
        return gameOver()
    }
    else if(hasColidedWithFruit(axisX, axisY)){  
        Snake.points += 1
        hasGotFruit()
        generateFruit()
    }
    else if(hasColidedWithWalls(axisX, axisY)){
        return gameOver()
    }

    return false
}

function gameOver(){
    let canvas = document.querySelector("#canvas");
    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", canvas.width/2, canvas.height/2); 
    }

    window.clearInterval(intervalID)
    return true
}

function hasColidedWithWalls(axisX, axisY){
    const Walls = {
        'axisX' : {
            'min': 0,
            'max': 400
        },
        'axisY' : {
            'min': 0,
            'max': 300
        }
    }
    if(axisX < Walls.axisX.min || axisX >= Walls.axisX.max || axisY < Walls.axisY.min || axisY >= Walls.axisY.max){
        return true
    }

    return false
}

function hasGotFruit(){
    Snake.tailPositions.push({})
}

function hasColidedWithFruit(axisX, axisY) {

    const fruitAxisX = Fruit.axisX
    const fruitAxisY = Fruit.axisY

    if (fruitAxisX === axisX && fruitAxisY === axisY) {
        return true
    }

    return false

}

function hasColidedWithTail(axisX, axisY, tailPositions) {
    for (square of tailPositions) {
        if (square.axisX === axisX && square.axisY === axisY) {
            return true
        }
    }

    return false
}

function handleKeyPressed(key) {

    const { viewDirection, updateViewDirection } = Snake

    const Keys = {
        ArrowUp() {
            if ((viewDirection != 'Down' && viewDirection != 'Up')) {
                updateViewDirection("Up")
            }
        },
        ArrowRight() {
            if ((viewDirection != 'Left' && viewDirection != 'Right')) {
                updateViewDirection("Right")
            }
        },
        ArrowDown() {
            if ((viewDirection != 'Up' && viewDirection != 'Down')) {
                updateViewDirection("Down")
            }
        },
        ArrowLeft() {
            if ((viewDirection != 'Right' && viewDirection != 'Left')) {
                updateViewDirection("Left")
            }
        }
    }

    const direction = Keys[key]

    if (direction) {
        direction()
    }

}

function renderGame() {

    let { axisX, axisY, color } = Snake

    drawRectangle(axisX, axisY, color)
    generateFruit()
}

function generateFruit() {

    const color = "#FF00FF"

    const maxX = 400
    const maxY = 300

    let axisX = Math.random() * (maxX - 0)
    axisX = axisX - (axisX % 20)

    let axisY = Math.random() * (maxY - 0)
    axisY = axisY - (axisY % 20)

    drawRectangle(axisX, axisY, color)
    Fruit.definePosition(axisX, axisY)
}

function drawRectangle(axisX, axisY, color) {
    let canvas = document.querySelector("#canvas");
    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        let obj = new Path2D();
        obj.rect(axisX, axisY, 20, 20);
        ctx.fillStyle = color
        ctx.fill(obj);
    }
}