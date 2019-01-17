(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RayTracer = /** @class */ (function () {
        function RayTracer() {
            var canvas = document.getElementById('canvas');
            if (!canvas.getContext) {
                throw "Canvas unsupported!";
            }
            this.context = canvas.getContext('2d');
            this.context.fillStyle = 'rgb(200, 0, 0)';
            this.context.fillRect(10, 10, 50, 50);
        }
        return RayTracer;
    }());
    exports.RayTracer = RayTracer;
});
//# sourceMappingURL=raytracer.js.map