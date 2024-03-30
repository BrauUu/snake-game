import Fruit from "./classes/Fruit.js"
import Snake from "./classes/Snake.js"

const size = 30
const pointValue = 10
const defaultTime = 300

let gameOver = false
let tempViewDirection
let currentTime = defaultTime
let checkpoint = 50

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const tryAgainButtons = document.querySelectorAll(".play-button");
const gameOverScreen = document.querySelector("#gameover");
const gameWinScreen = document.querySelector("#gamewin");

const gameOverScore = document.querySelector("#game-over-score");
const gameWinScore = document.querySelector("#game-win-score");

const scoreElement = document.querySelector("#score-value");
const divScoreElement = document.querySelector(".score");

const Moves = {
    'Up': { moveX: 0, moveY: -1 },
    'Right': { moveX: 1, moveY: 0 },
    'Down': { moveX: 0, moveY: 1 },
    'Left': { moveX: -1, moveY: 0 },
}

const Walls = {
    'axisX': {
        'min': 0,
        'max': canvas.width
    },
    'axisY': {
        'min': 0,
        'max': canvas.height
    }
}

const maxScore = (canvas.width / size * canvas.height / size) * pointValue - pointValue

let eventOnProgress = false
let intervalId

const moveAudio = new Audio("https://brauuu.github.io/snake-game/assets/audios/move.mp3");
const eatAudio = new Audio("https://brauuu.github.io/snake-game/assets/audios/food.mp3");
const gameOverAudio = new Audio("https://brauuu.github.io/snake-game/assets/audios/gameover.mp3");
const gameWinAudio = new Audio("https://brauuu.github.io/snake-game/assets/audios/gamewin.mp3");

let snake
let fruit

loopGame()

function loopGame() {
    snake = generateSnake()
    fruit = generateFruit()
    createInterval()
}

function createInterval(){
    intervalId = setInterval(() => {
        updateViewDirection(tempViewDirection)
        move()
        if (hasGameOver()) {
            handleGameOver()
            return
        }
        cleanCanvas()
        drawGrid()
        drawSnake()
        if (hasGameWin()) {
            handleGameWin()
            return
        }
        drawFruit()
    }, currentTime)
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

tryAgainButtons.forEach((tryAgainButton) => {
    tryAgainButton.addEventListener('click', () => {
        restartGame()
    })
})

function move() {

    const viewDirection = snake.viewDirection
    const { moveX, moveY } = Moves[viewDirection]

    handleMovement(moveX, moveY)
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
        gameOver = true
    }
    else if (hasColidedWithWalls(axisX, axisY)) {
        gameOver = true
    }
    else if (hasColidedWithFruit(axisX, axisY)) {
        hasGotFruit()
        fruit = generateFruit()
    }

}

function handleSpeed(){
    const score = snake.score
    if(currentTime > 90 && score >= checkpoint){
        currentTime = currentTime - 30
        clearInterval(intervalId)
        createInterval()
        checkpoint += checkpoint/2
    }
}

function hasGameWin() {
    return snake.score >= maxScore
}

function handleGameWin() {

    const score = snake.score

    gameWinScreen.style.display = 'flex'
    canvas.style.filter = "blur(2px)"
    divScoreElement.style.filter = "blur(2px)"
    gameWinScore.textContent = ("0".repeat(3 - (score.toString().length))) + score.toString()

    clearInterval(intervalId)
    playGameWinAudio()
}

function hasGameOver() {
    return gameOver
}

function handleGameOver() {

    const score = snake.score

    gameOverScreen.style.display = 'flex'
    canvas.style.filter = "blur(2px)"
    divScoreElement.style.filter = "blur(2px)"
    gameOverScore.textContent = ("0".repeat(3 - (score.toString().length))) + score.toString()

    clearInterval(intervalId)
    playGameOverAudio()

}

function restartGame(){
    gameOver = false
    currentTime = defaultTime
    gameWinScreen.style.display = 'none'
    gameOverScreen.style.display = 'none'
    canvas.style.filter = "none"
    divScoreElement.style.filter = "none"
    scoreElement.textContent = "000"
    loopGame()
}

function cleanCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function hasColidedWithWalls(axisX, axisY) {

    if (axisX < Walls.axisX.min || axisX >= Walls.axisX.max || axisY < Walls.axisY.min || axisY >= Walls.axisY.max) {
        return true
    }

    return false
}

function hasGotFruit() {
    playEatAudio()
    updateScoreValue()
    handleSpeed()
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
        "Up": "Down",
        "Down": "Up",
        "Left": "Right",
        "Right": "Left"
    }
    if (direction != undefined && direction != viewDirection && opositeDirections[viewDirection] != direction) {
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
    axisY = parseInt((Math.random() * (maxY - 0)) / size) * size

    do {
        axisX = parseInt((Math.random() * (maxX - 0)) / size) * size
        axisY = parseInt((Math.random() * (maxY - 0)) / size) * size
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
    for (let i = size - 1; i < canvas.width - 1; i += size) {
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

function updateScoreValue() {
    snake.updateScore(pointValue)
    const score = snake.score
    scoreElement.textContent = ("0".repeat(3 - (score.toString().length))) + score.toString()
}

function playMoveAudio() {
    moveAudio.play()
}

function playEatAudio() {
    eatAudio.play()
}

function playGameOverAudio() {
    gameOverAudio.play()
}

function playGameWinAudio() {
    gameWinAudio.play()
}