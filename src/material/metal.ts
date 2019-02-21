import { Material, Scatter } from "./material";
import { Vec3 } from "../math/Vec3";
import { HitRecord } from "../math/irayhittable";
import { Ray } from "../math/ray";

export class Metal implements Material {
    constructor(private albedo: Vec3) { }

    Scatter(ray: Ray, rec: HitRecord): Scatter {
        let reflection = Vec3.Reflect(Vec3.CreateUnitVector(ray.Direction), rec.normal);
        let scatteredRay = new Ray(rec.p, reflection);
        const scatter: Scatter = {
            ray: scatteredRay,
            attenuation: this.albedo,
            absorbed: (Vec3.Dot(scatteredRay.Direction, rec.normal)) > 0
        }

        return scatter;
    }
}