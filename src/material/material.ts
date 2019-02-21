import { Ray } from '../math/ray';
import { Vec3 } from '../math/vec3';
import { HitRecord } from '../math/irayhittable';

export interface Scatter {
    ray: Ray,
    attenuation: Vec3,
    absorbed: boolean
}

export abstract class Material {
    abstract Scatter(ray: Ray, rec: HitRecord): Scatter;
}