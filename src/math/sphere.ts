import { IRayHittable, HitRecord } from "./irayhittable";
import { Ray } from "./ray";
import { Vec3 } from "./Vec3";
import { Material } from "../material/material";
import { Diffuse } from "../material/diffuse";

export class Sphere implements IRayHittable {
    constructor(
        private _center: Vec3,
        private _radius: number,
        private _material: Material = new Diffuse(new Vec3(0.8, 0.3, 0.3))
    ) { }

    get Center(): Vec3 {
        return this._center;
    }

    get Radius(): number {
        return this._radius;
    }

    Hit(ray: Ray, t_min: number, t_max: number, record: HitRecord): boolean {
        const o_c = ray.Origin.Copy();
        o_c.Subtract(this.Center);

        record.material = this._material;

        let a = Vec3.Dot(ray.Direction, ray.Direction);
        let b = Vec3.Dot(o_c, ray.Direction);
        let c = Vec3.Dot(o_c, o_c) - Math.pow(this.Radius, 2);
        let discriminant = Math.pow(b, 2) - (a * c);
        
        if (discriminant > 0) {
            let sqrtDiscriminant = Math.sqrt(discriminant);
            let temp = (-b - sqrtDiscriminant) / a;
            if (temp < t_max && temp > t_min) {
                record.t = temp;
                record.p = ray.PointAt(record.t);
                record.normal = record.p.Copy();
                record.normal.Subtract(this.Center);
                record.normal.DivideScalar(this.Radius);

                return true;
            }

            temp = (-b + sqrtDiscriminant) / a;

            if (temp < t_max && temp > t_min) {
                record.t = temp;
                record.p = ray.PointAt(record.t);
                record.normal = record.p.Copy();
                record.normal.Subtract(this.Center);
                record.normal.DivideScalar(this.Radius);

                return true;
            }
        }
        return false;
    }

    static RandomInUnitSphere(): Vec3 {
        let p: Vec3;
        const unitVec = new Vec3(1.0, 1.0, 1.0);
        do {
            p = new Vec3(Math.random(), Math.random(), Math.random());
            p.MultiplyScalar(2.0);
            p.Subtract(unitVec);
        } while (p.SquaredLength >= 1.0);
        return p;
    }
}