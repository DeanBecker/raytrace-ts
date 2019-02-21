import { Ray } from "./ray";
import { Vec3 } from "./Vec3";
import { Material } from '../material/material';

export interface HitRecord {
    t: number;
    p: Vec3;
    normal: Vec3;
    material: Material
}

export interface IRayHittable {
    Hit(ray: Ray, t_min: number, t_max: number, record: HitRecord): boolean;
}