import { Material, Scatter } from "./material";
import { Vec3 } from "../math/Vec3";
import { HitRecord } from "../math/irayhittable";
import { Ray } from "../math/ray";
import { Sphere } from "../math/sphere";

export class Metal implements Material {
    constructor(
        private albedo: Vec3,
        private fuzz: number = 0
    ) { 
        if (fuzz > 1) {
            this.fuzz = 1;
        }
        if (fuzz < 0) {
            this.fuzz = 0;
        }
    }

    Scatter(ray: Ray, rec: HitRecord): Scatter {
        let reflection = Vec3.Reflect(Vec3.CreateUnitVector(ray.Direction), rec.normal);
        let fuzzVec = Sphere.RandomInUnitSphere();
        fuzzVec.MultiplyScalar(this.fuzz);
        reflection.Add(fuzzVec);
        let scatteredRay = new Ray(rec.p, reflection);
        const scatter: Scatter = {
            ray: scatteredRay,
            attenuation: this.albedo,
            absorbed: (Vec3.Dot(scatteredRay.Direction, rec.normal)) > 0
        }

        return scatter;
    }
}