export default class Fruit {
    constructor(xpoint, ypoint, color) {
        this.axisX = xpoint
        this.axisY = ypoint
        this.color = color
    }

    definePosition(x, y) {
        this.axisX = x
        this.axisY = y
    }
}