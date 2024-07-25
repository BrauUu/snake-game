import Fruit from "./classes/Fruit.js"
import Snake from "./classes/Snake.js"

const size = 30
const pointValue = 10
const defaultClock = 300

let topScores = [
    {
        'player': 'BRY',
        'score': 2250
    },
    {
        'player': 'BRY',
        'score': 1800
    },
    {
        'player': 'AMD',
        'score': 1240
    },
    {
        'player': 'BRY',
        'score': 980
    },
    {
        'player': 'LCS',
        'score': 430
    },
    {
        'player': 'LCS',
        'score': 420
    },
    {
        'player': 'FED',
        'score': 100
    },
    {
        'player': 'PLA',
        'score': 10
    },
]

let snake
let fruit
let gameOver = false
let scoreboard = false
let tempViewDirection
let currentClock = defaultClock
let checkpoint = 50
let characterIndex = 0
let topScoresCopy
let eventOnProgress = false
let intervalId

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const gameOverScreen = document.querySelector("#gameover");
const scoreboardScreen = document.querySelector("#scoreboard");
const topScoresElement = document.querySelector("#scoreboard > #list");
const gameOverScoreElement = document.querySelector("#game-over-score");
const scoreElement = document.querySelector("#score-value");
const divScoreElement = document.querySelector(".score");

const Moves = {
    'Up': { moveX: 0, moveY: -1 },
    'Right': { moveX: 1, moveY: 0 },
    'Down': { moveX: 0, moveY: 1 },
    'Left': { moveX: -1, moveY: 0 },
}

const validKeys = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9'
]

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


const moveAudio = new Audio("https://brauuu.github.io/snake-game/assets/audios/move.mp3");
const eatAudio = new Audio("https://brauuu.github.io/snake-game/assets/audios/food.mp3");
const gameOverAudio = new Audio("https://brauuu.github.io/snake-game/assets/audios/gameover.mp3");

loopGame()

function setLocalStorage(key, valeu) {
    localStorage.setItem(key, JSON.stringify(valeu))
}

function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key))
}

function loopGame() {
    snake = generateSnake()
    fruit = generateFruit()
    createInterval()
}

function createInterval() {
    cleanCanvas()
    drawGrid()
    drawSnake()
    drawFruit()
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
        drawFruit()
    }, currentClock)
}

window.addEventListener('keydown', (event) => {

    if (!eventOnProgress) {
        eventOnProgress = true
        const key = event.key
        handleKeyPressed(key)
    }

    eventOnProgress = false
    event.preventDefault()
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

function handleSpeed() {
    const score = snake.score
    if (currentClock > 90 && score >= checkpoint) {
        currentClock = currentClock - 30
        clearInterval(intervalId)
        createInterval()
        checkpoint += checkpoint / 2
    }
}

function hasGameOver() {
    return gameOver
}

function handleGameOver() {

    const score = snake.score

    gameOverScreen.style.display = 'flex'
    canvas.style.filter = "blur(2px)"
    divScoreElement.style.filter = "blur(2px)"
    gameOverScoreElement.textContent = ("0".repeat(3 - (score.toString().length))) + score.toString()

    clearInterval(intervalId)
    playGameOverAudio()
}

function isTopScore() {

    const score = snake.score

    for (let i in topScores) {
        let topScore = topScores[i]
        if (score > topScore.score) {
            return +i
        }
    }
    return -1
}

function restartGame() {
    gameOver = false
    scoreboard = false
    currentClock = defaultClock
    scoreboardScreen.style.display = 'none'

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

    if (gameOver) {
        handleScoreboard(key)
        return
    }

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

    const colors = ["#f1bbba", "#6f2da8", "#ff6666", "#e0b610", "#c6f50f", "#66cdaa", "#ffa500", "#f67453", "#f6c653"]

    const color = colors[parseInt((Math.random() * colors.length))]

    axisX = parseInt((Math.random() * (maxX - 0)) / size) * size
    axisY = parseInt((Math.random() * (maxY - 0)) / size) * size

    do {
        axisX = parseInt((Math.random() * (maxX - 0)) / size) * size
        axisY = parseInt((Math.random() * (maxY - 0)) / size) * size
    } while (tailPositions.findIndex(value => ((value[0] === axisX && value[1] === axisY) || (value[1] === axisX && value[0] === axisY))) != -1 || (snake.axisX === axisX && snake.axisY === axisY));

    return new Fruit(axisX, axisY, color)
}

function generateSnake() {

    const bodyColor = '#229954'
    const headColor = '#1e864a'

    const axisX = 0
    const axisY = 0
    const viewDirection = "Right"

    return new Snake(axisX, axisY, viewDirection, bodyColor, headColor)
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
        headColor,
        axisX,
        axisY,
        tailPositions
    } = snake

    drawRectangle(axisX, axisY, headColor)

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

function showScoreboardScreen() {
    topScoresCopy = getLocalStorage('topScores') || [...topScores]
    let scoreboardPosition = isTopScore()
    if (scoreboardPosition != -1) {
        updateScoreboard(topScoresCopy, { 'player': '___', 'score': snake.score })
    }
    gameOverScreen.style.display = 'none'
    scoreboardScreen.style.display = 'flex'
    while (topScoresElement.children.length > 1) {
        removeChildren(topScoresElement)
    }
    for (const i in topScoresCopy) {
        let topScore = topScoresCopy[i]
        createScoreboardRowElement(topScore, true ? i == scoreboardPosition : false)
    }
    scoreboard = true
    characterIndex = 0
}

function createScoreboardRowElement(row, isBlinking) {
    const li = document.createElement('li')
    const playerDiv = document.createElement('div')
    const scoreDiv = document.createElement('div')
    playerDiv.textContent = row.player
    if (isBlinking)
        playerDiv.classList.add('blink')
    scoreDiv.textContent = row.score
    li.classList.add('row')
    li.appendChild(playerDiv)
    li.appendChild(scoreDiv)
    topScoresElement.appendChild(li)
}

function updateScoreboard(scoreboard, newScore) {
    scoreboard.push(newScore)
    scoreboard.sort((a, b) => a.score < b.score)
    scoreboard.pop()
}

function handleScoreboard(key) {
    if (!scoreboard) {
        showScoreboardScreen()
        return
    }

    if (key == 'Enter' && (isTopScore() == -1 || characterIndex == 3)) {
        setLocalStorage('topScores', topScoresCopy)
        topScores = [...topScoresCopy]
        restartGame()
    }
    let scoreboardPosition = isTopScore()
    if (scoreboardPosition != -1 && characterIndex < 3) {
        const playerScoreboardRow = [...topScoresElement.children][scoreboardPosition + 1]
        let newKey = key.toUpperCase()
        if (validKeys.includes(newKey)) {
            let str = playerScoreboardRow.children[0].textContent.slice(0, characterIndex) + newKey + ('_'.repeat(3 - characterIndex - 1))
            playerScoreboardRow.children[0].textContent = str
            topScoresCopy[scoreboardPosition].player = str
            characterIndex += 1
        }
    }
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

function removeChildren(element) {
    element.removeChild(element.lastChild)
}