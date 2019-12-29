/* function test1(n: number, y: string) {
    var x: number;
}

function test2() {
    var str: string;
} */
/* function foo() : void {
    var a4: number = 3;
    var a2: number = 3;
    var a3: number = 3;
    var a1: number = a2+a3+a4;
} */
function factorial(n) {
    if (n < 1) {
        return 1;
    }
    return n * factorial(n - 1);
}
/* function search(): number {
    var bottom: number = 0;
    var top: number = this.elem.length - 1;
    var mid: number;
    var index: number;
        
    while ( bottom <= top ) {
            mid = Math.floor((top + bottom) / 2);
        if ( this.elem[mid] == this.key ) {
            index = mid;
            break;
        } else {
            if ( this.elem[mid] < this.key ) {
                bottom = mid + 1;
            } else {
                top = mid - 1;
            }
        }
    }

    return index;
} */ 
//# sourceMappingURL=src_file_origin.js.map