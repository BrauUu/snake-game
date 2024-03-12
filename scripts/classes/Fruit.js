export default class Fruit {
    constructor(xpoint, ypoint) {
        this.axisX = xpoint
        this.axisY = ypoint
    }

    definePosition(x, y) {
        this.axisX = x
        this.axisY = y
    }
}