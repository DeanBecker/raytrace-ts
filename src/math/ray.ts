import { Vec3 } from "./Vec3";

export class Ray {
    constructor(
        private _origin: Vec3,
        private _direction: Vec3
    ) { }

    get Origin(): Vec3 {
        return this._origin;
    }

    get Direction(): Vec3 {
        return this._direction;
    }

    PointAt(t: number): Vec3 {
        let a = this._origin.Copy();
        let b = this._direction.Copy();

        b.MultiplyScalar(t);
        a.Add(b);

        return a;
    }
}