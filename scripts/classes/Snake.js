export default class Snake {
    constructor(xpoint, ypoint, viewDirection, color, headColor) {
        this.axisX = xpoint
        this.axisY = ypoint
        this.viewDirection = viewDirection
        this.color = color 
        this.headColor = headColor
        this.tailPositions = []
        this.score = 0
    }

    updatePosition(x, y) {
        this.axisX = x
        this.axisY = y
    }

    updateViewDirection(viewDirection) {
        this.viewDirection = viewDirection
    }

    updateScore(pointValue) {
        this.score += pointValue
    }

}