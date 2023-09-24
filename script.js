const Snake = {
    axisX: 0,
    axisY: 0,
    viewDirection: 'Right',
    color: "#00FF00",
    updatePosition(x, y) {
        Snake.axisX = x
        Snake.axisY = y
    },
    updateViewDirection(viewDirection){
        Snake.viewDirection = viewDirection
    },
    tailPositions: [
        {axisX: 20, axisY: 20},
        {axisX: 40, axisY: 20},
        {axisX: 40, axisY: 20},
        {axisX: 40, axisY: 20}
    ],
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

//TODO: Timer do movimento reinicia ao fazer curva (Pode ser que ao virar a cobra, ela apenas vire, sem andar para o lado)


window.setInterval(goStraight, 500)

window.addEventListener('load', () => {
    renderGame()
})

window.addEventListener('keydown', async (event) => {
    const key = event.key
    await handleKeyPressed(key)
})

function goStraight(){
    handleKeyPressed(`Arrow${Snake.viewDirection}`, true)
}

async function handleMovement(x, y){

    let { axisX, axisY, color, updatePosition , tailPositions, points} = Snake

    let tempAxisX = axisX + x * 20
    let tempAxisY = axisY + y * 20

    tailPositions.unshift({axisX: axisX, axisY: axisY})
    const blank = tailPositions.pop()

    updatePosition(tempAxisX, tempAxisY)
    handleCollision()
    
    drawRectangle(blank.axisX, blank.axisY, "#eff0f1")
    drawRectangle(tempAxisX, tempAxisY, color)

        for(block of tailPositions){
           drawRectangle(block.axisX, block.axisY, color)
        }
}

function handleCollision(){

    let { axisX, axisY, tailPositions} = Snake

    //TODO: Game over
    if(hasColidedWithTail(axisX, axisY, tailPositions)) {
        console.log('colisão com o rabo')
    }

    //TODO: Ao colidir com fruta + pontuação

    //TODO: Ao colidir com parede

}

function hasColidedWithTail(axisX, axisY, tailPositions){
    for(square of tailPositions){
        if(square.axisX === axisX && square.axisY === axisY){
            return true
        }
    }

    return false
}

async function handleKeyPressed(key, isAutomatic = false){

    const {viewDirection, updateViewDirection} = Snake
    console.log(key, isAutomatic)
    const moves = {
        ArrowUp() {
            if((viewDirection != 'Down' && viewDirection != 'Up') || isAutomatic){
                handleMovement(0,-1)
                updateViewDirection("Up")
            }
        },
        ArrowRight() {
            if((viewDirection != 'Left' && viewDirection != 'Right') || isAutomatic){
                handleMovement(1,0)
                updateViewDirection("Right")
            }
        },
        ArrowDown() {
            if((viewDirection != 'Up' && viewDirection != 'Down') || isAutomatic){
                handleMovement(0,1) 
                updateViewDirection("Down")
            }      
        },
        ArrowLeft() {
            if((viewDirection != 'Right' && viewDirection != 'Left') || isAutomatic){
                handleMovement(-1,0)
                updateViewDirection("Left")
            }    
        }
    }

    const move = moves[key]

    if(move){
        await move()
    }

}

function renderGame(){

    let { axisX, axisY, color } = Snake

    drawRectangle(axisX, axisY, color)
    generateFruit()
}

function generateFruit(){

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