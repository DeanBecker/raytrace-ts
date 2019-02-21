import { Material, Scatter } from './material';
import { Ray } from '../math/ray';
import { HitRecord } from '../math/irayhittable';
import { Vec3 } from '../math/Vec3';
import { Sphere } from '../math/sphere';

export class Diffuse implements Material {
    constructor(private albedo: Vec3) { }

    Scatter(ray: Ray, rec: HitRecord): Scatter {
        let target = rec.p.Copy();
        target.Add(rec.normal);
        target.Add(Sphere.RandomInUnitSphere());
        target.Subtract(rec.p);

        const r = new Ray(rec.p, target);
        const scatter: Scatter = {
            ray: r,
            attenuation: this.albedo,
            absorbed: true
        };

        return scatter;
    }

}