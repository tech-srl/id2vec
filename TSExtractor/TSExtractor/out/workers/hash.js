"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var worker_1 = require("threads/worker");
worker_1.expose(function hashPassword(password, salt) {
    return password + salt;
});
//# sourceMappingURL=hash.js.map