export default class Snake {
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