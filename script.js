class Snake {
    constructor(xpoint, ypoint, viewDirection, color) {
        this.axisX = xpoint
        this.axisY = ypoint
        this.viewDirection = viewDirection
        this.color = color 
        this.tailPositions = []
        this.points = 0
    }

    updatePosition(x, y) {
        this.axisX = x
        this.axisY = y
    }

    updateViewDirection(viewDirection) {
        this.viewDirection = viewDirection
    }

}
class Fruit {
    constructor(xpoint, ypoint) {
        this.axisX = xpoint
        this.axisY = ypoint
    }

    definePosition(x, y) {
        this.axisX = x
        this.axisY = y
    }
}

let snake = new Snake(0, 0, "Right", "#00FF00")
let fruit

let eventOnProgress = false

let intervalID = window.setInterval(goStraight, 150)

window.addEventListener('load', () => {
    renderGame()
})


window.addEventListener('keydown', (event) => {
    
    if (eventOnProgress) {
        event.preventDefault()
        console.log('evento em progresso')
        return
    }
    
    eventOnProgress = true
    
    const key = event.key
    handleKeyPressed(key)
})

const canvas = document.querySelector("#canvas");

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if(isRefreshButtonPosition(x, y))
        refreshGame()
})

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if(isRefreshButtonPosition(x, y)){
        changeMousePointer('pointer')
    } else {
        changeMousePointer('default')
    }
})

function renderGame() {

    let { axisX, axisY, color } = snake

    drawRectangle(axisX, axisY, color)
    generateFruit()
}

function isRefreshButtonPosition(x, y){

    const buttonXmin = canvas.width/2 - 15
    const buttonXmax = canvas.width/2 + 15
    const buttonYmin = canvas.height/2 + 10
    const buttonYmax = canvas.height/2 + 40

    if(x >= buttonXmin && x <= buttonXmax) {
        if(y >= buttonYmin && y <= buttonYmax){
            return true
        }
    }
    return false
}

function refreshGame() {
    snake = new Snake(0, 0, "Right", "#00FF00")
    intervalID = window.setInterval(goStraight, 150)
    cleanCanvas()
    renderGame()
}

function goStraight() {

    const Moves = {
        'Up': { axisX: 0, axisY: -1 },
        'Right': { axisX: 1, axisY: 0 },
        'Down': { axisX: 0, axisY: 1 },
        'Left': { axisX: -1, axisY: 0 },
    }

    const { axisX, axisY} = Moves[snake.viewDirection]

    handleMovement(axisX, axisY)

    eventOnProgress = false
}

function handleMovement(x, y) {

    let { axisX, axisY, color, tailPositions } = snake
    let tempAxisX = axisX + x * 20
    let tempAxisY = axisY + y * 20
    
    snake.updatePosition(tempAxisX, tempAxisY)
    if(handleCollision()){
        return
    }
    
    tailPositions.unshift([axisX, axisY])
    const blank = tailPositions.pop()

    drawRectangle(blank[0], blank[1], "#eff0f1")
    drawRectangle(tempAxisX, tempAxisY, color)

    for (block of tailPositions) {
        drawRectangle(block[0], block[1], color)
    }
}

function handleCollision() {

    let { axisX, axisY, tailPositions } = snake

    if (hasColidedWithTail(axisX, axisY, tailPositions)) {
        return gameOver()
    }
    else if(hasColidedWithFruit(axisX, axisY)){  
        snake.points += 1
        hasGotFruit()
        generateFruit()
    }
    else if(hasColidedWithWalls(axisX, axisY)){
        return gameOver()
    }

    return false
}

function gameOver(){
    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        ctx.font = "30px Comic Sans MS";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2); 
        let img = new Image();
        img.onload = function () {
            ctx.drawImage(img, canvas.width/2 - 15, canvas.height/2 + 10, 30, 30);
        };
        img.src = "assets/recarregar.png";
    }

    window.clearInterval(intervalID)
    return true
}

function cleanCanvas(){
    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
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
    snake.tailPositions.push([])
}

function hasColidedWithFruit(axisX, axisY) {

    const fruitAxisX = fruit.axisX
    const fruitAxisY = fruit.axisY

    if (fruitAxisX === axisX && fruitAxisY === axisY) {
        
        return true
    }

    return false

}

function hasColidedWithTail(axisX, axisY, tailPositions) {
    for (square of tailPositions) {
        if (square[0] === axisX && square[1] === axisY) {
            return true
        }
    }

    return false
}

function handleKeyPressed(key) {

    const { viewDirection } = snake

    const Keys = {
        ArrowUp() {
            if ((viewDirection != 'Down' && viewDirection != 'Up')) {
                snake.updateViewDirection("Up")
            }
        },
        ArrowRight() {
            if ((viewDirection != 'Left' && viewDirection != 'Right')) {
                snake.updateViewDirection("Right")
            }
        },
        ArrowDown() {
            if ((viewDirection != 'Up' && viewDirection != 'Down')) {
                snake.updateViewDirection("Down")
            }
        },
        ArrowLeft() {
            if ((viewDirection != 'Right' && viewDirection != 'Left')) {
                snake.updateViewDirection("Left")
            }
        }
    }

    const direction = Keys[key]

    if (direction) {
        direction()
    }

}

function generateFruit() {
    
    const color = "#FF00FF"

    const maxX = 380
    const maxY = 280
    let axisX
    let axisY 

    axisX = Math.random() * (maxX - 0)
    axisX = axisX - (axisX % 20)

    axisY = Math.random() * (maxY - 0)
    axisY = axisY - (axisY % 20)

    console.log(axisX, axisY)

    drawRectangle(axisX, axisY, color)
    fruit = new Fruit(axisX, axisY, color)
}

function drawRectangle(axisX, axisY, color) {
    if (canvas.getContext) {
        let ctx = canvas.getContext("2d");
        let obj = new Path2D();
        obj.rect(axisX, axisY, 20, 20);
        ctx.fillStyle = color
        ctx.fill(obj);
    }
}

function changeMousePointer(pointer) {
    console.log(pointer)
    document.body.style.cursor = pointer
}