function willOrderExpire(order, secondsFromNow) {
    var millisecondsInSecond = 1000;
    var currentUnixTimestampSec = new BigNumber(Date.now() / millisecondsInSecond).integerValue();
    return order.expirationTimeSeconds.isLessThan(currentUnixTimestampSec.plus(secondsFromNow));
}
//# sourceMappingURL=file.js.map