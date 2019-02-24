import { Vec3 } from './math/vec3';
import { Ray } from './math/ray';

export class Camera {

    public Origin: Vec3;
    public LowerLeftCorner: Vec3;
    public Horizontal: Vec3;
    public Vertical: Vec3;

    // constructor() {
    //     this.Origin = new Vec3(0.0, 0.0, 0.0);
    //     this.LowerLeftCorner = new Vec3(-2.0, -1.0, -1.0);
    //     this.Horizontal = new Vec3(4.0, 0.0, 0.0);
    //     this.Vertical = new Vec3(0.0, 2.0, 0.0);
    // }

    constructor(verticalFov: number, aspect: number) {
        let theta = verticalFov * Math.PI / 180;
        let halfHeight = Math.tan(theta / 2.0);
        let halfWidth = aspect * halfHeight;
        this.LowerLeftCorner = new Vec3(-halfWidth, -halfHeight, -1.0);
        this.Horizontal = new Vec3(2 * halfWidth, 0, 0);
        this.Vertical = new Vec3(0, 2 * halfHeight, 0);
        this.Origin = new Vec3(0, 0, 0);
    }

    public GetRay(u: number, v: number): Ray {
        var horiCopy = this.Horizontal.Copy();
        horiCopy.MultiplyScalar(u);

        var vertCopy = this.Vertical.Copy();
        vertCopy.MultiplyScalar(v);
        
        var llcCopy = this.LowerLeftCorner.Copy();
        llcCopy.Add(horiCopy);
        llcCopy.Add(vertCopy);
        llcCopy.Subtract(this.Origin);

        return new Ray(this.Origin, llcCopy);
    }
}