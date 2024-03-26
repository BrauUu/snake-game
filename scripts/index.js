import Fruit from "./classes/Fruit.js"
import Snake from "./classes/Snake.js"

const size = 30
let gameOver = false
let tempViewDirection

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const tryAgainButton = document.querySelector("#try-again-button");
const gameOverScreen = document.querySelector("#gameover");
const finalScoreElement = document.querySelector("#final-score-value");

const scoreElement = document.querySelector("#score-value");

const Moves = {
    'Up': { moveX: 0, moveY: -1 },
    'Right': { moveX: 1, moveY: 0 },
    'Down': { moveX: 0, moveY: 1 },
    'Left': { moveX: -1, moveY: 0 },
}

const Walls = {
    'axisX' : {
        'min': 0,
        'max': canvas.width
    },
    'axisY' : {
        'min': 0,
        'max': canvas.height
    }
}

let eventOnProgress = false
let intervalId

const moveAudio = new Audio('/assets/audios/move.mp3');
const eatAudio = new Audio('/assets/audios/food.mp3');
const gameOverAudio = new Audio('/assets/audios/gameover.mp3');

let snake
let fruit

loopGame()

function loopGame() {
    snake = generateSnake()
    fruit = generateFruit()
    intervalId = setInterval(() => {
        updateViewDirection(tempViewDirection)
        move()
        if(isGameOver()) {
            playGameOverAudio()
            return
        }
        cleanCanvas()
        drawGrid()
        drawSnake()
        drawFruit()
    }, 150)
}

window.addEventListener('keydown', (event) => {
    
    if (!eventOnProgress && gameOver === false) {
        eventOnProgress = true
        const key = event.key
        handleKeyPressed(key)
    }
    
    eventOnProgress = false
    event.preventDefault()
})

tryAgainButton.addEventListener('click', (event) => {
    gameOver = false
    gameOverScreen.style.display = 'none'
    canvas.style.filter = "none"
    scoreElement.textContent = "000"
    loopGame()
})

function move() {

    const viewDirection = snake.viewDirection
    const { moveX, moveY} = Moves[viewDirection]

    handleMovement( moveX, moveY)
}

function handleMovement(moveX, moveY) {

    const { axisX, axisY, tailPositions } = snake

    const newAxisX = axisX + (moveX * size)
    const newAxisY = axisY + (moveY * size)
    
    snake.updatePosition(newAxisX, newAxisY)
    
    tailPositions.unshift([axisX, axisY])
    
    handleCollision()
    
    tailPositions.pop()
    
}

function handleCollision() {

    const { axisX, axisY, tailPositions } = snake

    if (hasColidedWithTail(axisX, axisY, tailPositions)) {
        handleGameOver()
    }
    else if(hasColidedWithWalls(axisX, axisY)){
        handleGameOver()
    }
    else if(hasColidedWithFruit(axisX, axisY)){  
        snake.points += 1
        hasGotFruit()
        fruit = generateFruit()
    }

}

function isGameOver() {
    return gameOver
}

function handleGameOver(){

    const score = snake.score

    clearInterval(intervalId)
    gameOverScreen.style.display = 'flex'
    canvas.style.filter = "blur(2px)"
    finalScoreElement.textContent = ("0".repeat(3 - (score.toString().length))) + score.toString()
    gameOver = true 

}

function cleanCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function hasColidedWithWalls(axisX, axisY){
   
    if(axisX < Walls.axisX.min || axisX >= Walls.axisX.max || axisY < Walls.axisY.min || axisY >= Walls.axisY.max){
        return true
    }

    return false
}

function hasGotFruit(){
    playEatAudio()
    updateScoreValue()
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
    for (let position of tailPositions) {
        if (position[0] === axisX && position[1] === axisY) {
            return true
        }
    }

    return false
}

function handleKeyPressed(key) {

    const Keys = {
        ArrowUp() {
            tempViewDirection = "Up"
        },
        ArrowRight() {
            tempViewDirection = "Right"
        },
        ArrowDown() {
            tempViewDirection = "Down"
        },
        ArrowLeft() {
            tempViewDirection = "Left"
        }
    }

    const direction = Keys[key]

    if (direction) {
        direction()
    }

}

function updateViewDirection(direction) {
    const viewDirection = snake.viewDirection
    const opositeDirections = {
        "Up" : "Down",
        "Down" : "Up",
        "Left" : "Right",
        "Right": "Left"
    }
    if(direction != undefined && direction != viewDirection && opositeDirections[viewDirection] != direction){
        playMoveAudio()
        snake.updateViewDirection(direction)
    }
    tempViewDirection = undefined
}

function generateFruit() {

    const maxX = canvas.width
    const maxY = canvas.height

    const tailPositions = snake.tailPositions

    let axisX
    let axisY
    
    const color = "#FF00FF"
    
    axisX = parseInt((Math.random() * (maxX - 0)) / size) * size
    axisY =  parseInt((Math.random() * (maxY - 0)) / size) * size

    do {
        axisX = parseInt((Math.random() * (maxX - 0)) / size) * size
        axisY =  parseInt((Math.random() * (maxY - 0)) / size) * size
    } while (tailPositions.findIndex(value => ((value[0] === axisX && value[1] === axisY) || (value[1] === axisX && value[0] === axisY))) != -1 || (snake.axisX === axisX && snake.axisY === axisY));

    return new Fruit(axisX, axisY, color)

}

function generateSnake() {

    const color = "#00FF00"
    const axisX = 0
    const axisY = 0
    const viewDirection = "Right"

    return new Snake(axisX, axisY, viewDirection, color)

}

function drawRectangle(axisX, axisY, color, shadowBlur) {
   
    ctx.shadowColor = color
    ctx.shadowBlur = shadowBlur
    ctx.fillStyle = color
    ctx.fillRect(axisX, axisY, size, size);
    ctx.shadowBlur = 0
}

function drawGrid() {
    ctx.strokeStyle = "#313131"
    ctx.lineWidth = 1
    ctx.lineCap = "round"
    ctx.setLineDash([2, 6]);
    ctx.lineDashOffset = 100;
    for(let i = size-1;i<canvas.width-1;i+=size){
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(canvas.height, i)
        ctx.stroke()
    }
}

function drawSnake() {

    const {
        color, 
        axisX, 
        axisY, 
        tailPositions
    } = snake

    drawRectangle(axisX, axisY, color)

    tailPositions.forEach((position, index) => {
        drawRectangle(position[0], position[1], color)
    })

}

function drawFruit() {

    const {
        axisX, 
        axisY, 
        color
    } = fruit

    drawRectangle(axisX, axisY, color, 10)

}

function updateScoreValue(){
    snake.updateScore()
    const score = snake.score
    scoreElement.textContent = ("0".repeat(3 - (score.toString().length))) + score.toString()
}

function playMoveAudio(){
    moveAudio.play()
}

function playEatAudio(){
    eatAudio.play()
}

function playGameOverAudio(){
    gameOverAudio.play()
}