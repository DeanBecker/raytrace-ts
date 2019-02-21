import { IRayHittable, HitRecord } from "./irayhittable";
import { Ray } from "./ray";
import { Vec3 } from "./Vec3";
import { Material } from "../material/material";
import { Diffuse } from "../material/diffuse";

export class HittableList implements IRayHittable {
    public Hittables = new Array<IRayHittable>();

    Hit(ray: Ray, t_min: number, t_max: number, record: HitRecord): boolean {
        let tempRecord: HitRecord = {
            normal: new Vec3(0, 0, 0),
            t: 0,
            p: new Vec3(0, 0, 0),
            material: new Diffuse(new Vec3(1, 1, 1))
        };

        let hasHitAnything = false;
        let closestSoFar = t_max;

        this.Hittables.forEach(element => {
            if (element.Hit(ray, t_min, closestSoFar, tempRecord)) {
                hasHitAnything = true;
                closestSoFar = tempRecord.t;
                record.normal = tempRecord.normal;
                record.p = tempRecord.p;
                record.t = tempRecord.t;
                record.material = tempRecord.material
            }
        });

        return hasHitAnything;
    }
}