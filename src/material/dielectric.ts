import { Material, Scatter } from "./material";
import { Ray } from "../math/ray";
import { HitRecord } from "../math/irayhittable";
import { Vec3 } from "../math/Vec3";

export class Dielectric implements Material {

    constructor(private refractionIndex: number) { }

    Scatter(ray: Ray, rec: HitRecord): Scatter {
        let outwardNormal = rec.normal.Copy();
        let reflected = Vec3.Reflect(ray.Direction, rec.normal);
        let niOverNt: number;

        let reflectProbability: number = 1.0;
        let cosine: number;

        if (Vec3.Dot(ray.Direction, rec.normal) > 0) {
            outwardNormal.MultiplyScalar(-1);
            niOverNt = this.refractionIndex;
            cosine = this.refractionIndex * Vec3.Dot(ray.Direction, rec.normal) / ray.Direction.Length;
        } else {
            niOverNt = 1.0 / this.refractionIndex;
            cosine = -Vec3.Dot(ray.Direction, rec.normal) / ray.Direction.Length;
        }

        let refraction = Vec3.Refract(ray.Direction, outwardNormal, niOverNt);
        const attenuation = new Vec3(1.0, 1.0, 1.0);

        if (refraction.refracted) {
            reflectProbability = Dielectric.Schlick(cosine, this.refractionIndex);
        }

        if (Math.random() < reflectProbability) {
            return {
                ray: new Ray(rec.p, reflected),
                attenuation,
                absorbed: true
            };
        } else {
            return {
                ray: new Ray(rec.p, refraction.refraction),
                attenuation,
                absorbed: true
            };
        }
    }

    static Schlick(cosine: number, refractionIndex: number): number {
        let r0 = (1 - refractionIndex) / (1 + refractionIndex);
        r0 *= r0;
        return r0 + (1 - r0) * Math.pow(1 - cosine, 5);
    }

}