(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./raytracer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var raytracer_1 = require("./raytracer");
    (function Bootstrap() {
        var rt = new raytracer_1.RayTracer();
    })();
});
//# sourceMappingURL=app.js.map