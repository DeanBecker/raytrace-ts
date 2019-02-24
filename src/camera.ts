import { Vec3 } from './math/vec3';
import { Ray } from './math/ray';

export class Camera {

    public Origin: Vec3;
    public LowerLeftCorner: Vec3;
    public Horizontal: Vec3;
    public Vertical: Vec3;
    public LensRadius: number;
    public u: Vec3;
    public v: Vec3;
    public w: Vec3;

    // constructor() {
    //     this.Origin = new Vec3(0.0, 0.0, 0.0);
    //     this.LowerLeftCorner = new Vec3(-2.0, -1.0, -1.0);
    //     this.Horizontal = new Vec3(4.0, 0.0, 0.0);
    //     this.Vertical = new Vec3(0.0, 2.0, 0.0);
    // }

    // constructor(verticalFov: number, aspect: number) {
    //     let theta = verticalFov * Math.PI / 180;
    //     let halfHeight = Math.tan(theta / 2.0);
    //     let halfWidth = aspect * halfHeight;
    //     this.LowerLeftCorner = new Vec3(-halfWidth, -halfHeight, -1.0);
    //     this.Horizontal = new Vec3(2 * halfWidth, 0, 0);
    //     this.Vertical = new Vec3(0, 2 * halfHeight, 0);
    //     this.Origin = new Vec3(0, 0, 0);
    // }

    // constructor(
    //     lookFrom: Vec3,
    //     lookAt: Vec3,
    //     vUp: Vec3,
    //     verticalFov: number,
    //     aspect: number
    // ) {
    //     let theta = verticalFov * Math.PI / 180;
    //     let halfHeight = Math.tan(theta / 2.0);
    //     let halfWidth = aspect * halfHeight;
    //     this.Origin = lookFrom.Copy();
    //     let lookFromCopy = lookFrom.Copy();
    //     lookFromCopy.Subtract(lookAt);
    //     lookFromCopy.ConvertToUnitVector();

    //     let w = lookFromCopy.Copy();
    //     let u = Vec3.Cross(vUp, w);
    //     u.ConvertToUnitVector();
    //     let v = Vec3.Cross(w, u);

    //     u.MultiplyScalar(halfWidth);
    //     v.MultiplyScalar(halfHeight);

    //     this.LowerLeftCorner = this.Origin.Copy();
    //     this.LowerLeftCorner.Subtract(u);
    //     this.LowerLeftCorner.Subtract(v);
    //     this.LowerLeftCorner.Subtract(w);

    //     u.MultiplyScalar(2);
    //     v.MultiplyScalar(2);

    //     this.Horizontal = u.Copy();
    //     this.Vertical = v.Copy();
    // }

    constructor(
        lookFrom: Vec3,
        lookAt: Vec3,
        vUp: Vec3,
        verticalFov: number,
        aspect: number,
        aperture: number,
        focusDistance: number
    ) {
        this.LensRadius = aperture / 2;
        let theta = verticalFov * Math.PI / 180;
        let halfHeight = Math.tan(theta / 2.0);
        let halfWidth = aspect * halfHeight;
        this.Origin = lookFrom.Copy();

        let lookFromCopy = lookFrom.Copy();        
        lookFromCopy.Subtract(lookAt);
        lookFromCopy.ConvertToUnitVector();

        this.w = lookFromCopy.Copy();
        this.u = Vec3.Cross(vUp, this.w);
        this.u.ConvertToUnitVector();
        this.v = Vec3.Cross(this.w, this.u);

        let u1 = this.u.Copy();
        let v1 = this.v.Copy();
        let w1 = this.w.Copy();
        u1.MultiplyScalar(halfWidth * focusDistance);
        v1.MultiplyScalar(halfHeight * focusDistance);
        w1.MultiplyScalar(focusDistance);

        this.LowerLeftCorner = this.Origin.Copy();
        this.LowerLeftCorner.Subtract(u1);
        this.LowerLeftCorner.Subtract(v1);
        this.LowerLeftCorner.Subtract(w1);

        u1.MultiplyScalar(2);
        v1.MultiplyScalar(2);

        this.Horizontal = u1.Copy();
        this.Vertical = v1.Copy();
    }

    private RandomInUnitCircle(): Vec3 {
        let p: Vec3;
        const v = new Vec3(1, 1, 0);
        
        do {
            p = new Vec3(Math.random(), Math.random(), 0);
            p.MultiplyScalar(2.0);
            p.Subtract(v);
        } while (Vec3.Dot(p, p) >= 1.0);

        return p;
    }

    // public GetRay(u: number, v: number): Ray {
    //     var horiCopy = this.Horizontal.Copy();
    //     horiCopy.MultiplyScalar(u);

    //     var vertCopy = this.Vertical.Copy();
    //     vertCopy.MultiplyScalar(v);
        
    //     var llcCopy = this.LowerLeftCorner.Copy();
    //     llcCopy.Add(horiCopy);
    //     llcCopy.Add(vertCopy);
    //     llcCopy.Subtract(this.Origin);

    //     return new Ray(this.Origin, llcCopy);
    // }

    public GetRay(s: number, t: number): Ray {
        let rd = this.RandomInUnitCircle();
        rd.MultiplyScalar(this.LensRadius);
        
        let offset = this.u.Copy();
        offset.MultiplyScalar(rd.X);
        let v1 = this.v.Copy();
        v1.MultiplyScalar(rd.Y);
        offset.Add(v1);

        let o1 = this.Origin.Copy();
        o1.Add(offset);

        let llc1 = this.LowerLeftCorner.Copy();
        let horizontal1 = this.Horizontal.Copy();
        horizontal1.MultiplyScalar(s);
        let vertical1 = this.Vertical.Copy();
        vertical1.MultiplyScalar(t);

        llc1.Add(horizontal1);
        llc1.Add(vertical1);
        llc1.Subtract(this.Origin);
        llc1.Subtract(offset);


        return new Ray(o1, llc1);
    }
}