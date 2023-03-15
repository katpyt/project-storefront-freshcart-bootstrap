export default class HelperFunctions {
    static roundToOneDecimalPlaced(number: number, precision: number) {
        return (Math.round(number) / 1000).toFixed(precision);
    }
}