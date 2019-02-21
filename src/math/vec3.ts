export interface Refraction {
    refraction: Vec3,
    refracted: boolean
}

export class Vec3 {
    constructor(c1: number, c2: number, c3: number) {
        this.X = c1;
        this.Y = c2;
        this.Z = c3;
    }
    
    private data: number[] = new Array(3);
//#region Vector Component Properties
    get X(): number {
        return this.data[0];
    }
    set X(x: number) {
        this.data[0] = x;
    }

    get Y(): number {
        return this.data[1];
    }
    set Y(x: number) {
        this.data[1] = x;
    }

    get Z(): number {
        return this.data[2];
    }
    set Z(x: number) {
        this.data[2] = x;
    }

    get R(): number {
        return this.data[0];
    }
    set R(x: number) {
        this.data[0] = x;
    }

    get G(): number {
        return this.data[1];
    }
    set G(x: number) {
        this.data[1] = x;
    }

    get B(): number {
        return this.data[2];
    }
    set B(x: number) {
        this.data[2] = x;
    }
//#endregion

    Copy(): Vec3 {
        return new Vec3(this.X, this.Y, this.Z);
    }
    
    Add(otherVec: Vec3): void {
        this.X += otherVec.X;
        this.Y += otherVec.Y;
        this.Z += otherVec.Z;
    }
    
    AddScalar(scalar: number): void {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] += scalar;
        }
    }

    Subtract(otherVec: Vec3): void {
        this.X -= otherVec.X;
        this.Y -= otherVec.Y;
        this.Z -= otherVec.Z;
    }

    SubtractScalar(scalar: number): void {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] -= scalar;
        }
    }

    Divide(otherVec: Vec3): void {
        this.X /= otherVec.X;
        this.Y /= otherVec.Y;
        this.Z /= otherVec.Z;
    }

    DivideScalar(scalar: number): void {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] /= scalar;
        }
    }

    Multiply(otherVec: Vec3): void {
        this.X *= otherVec.X;
        this.Y *= otherVec.Y;
        this.Z *= otherVec.Z;
    }

    MultiplyScalar(scalar: number): void {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] *= scalar;
        }
    }

    get Length(): number {
        return Math.sqrt(this.SquaredLength);
    }

    get SquaredLength(): number {
        return this.X * this.X + this.Y * this.Y + this.Z * this.Z;
    }

    static Dot(vecA: Vec3, vecB: Vec3): number {
        return (vecA.X * vecB.X) + (vecA.Y * vecB.Y) + (vecA.Z * vecB.Z);
    }

    static Cross(vecA: Vec3, vecB: Vec3): Vec3 {
        return new Vec3(
            (vecA.Y * vecB.Z) - (vecA.Z * vecB.Y),
            -((vecA.X * vecB.Z) - (vecA.Z * vecB.X)),
            (vecA.X * vecB.Y) - (vecA.Y * vecB.X)
        );
    }

    ConvertToUnitVector(): void {
        this.DivideScalar(this.Length);
    }

    static CreateUnitVector(vec: Vec3): Vec3 {
        let unitVector = vec.Copy();
        unitVector.ConvertToUnitVector();

        return unitVector;
    }

    static Reflect(v: Vec3, n: Vec3): Vec3 {
        let v1 = v.Copy();
        let n1 = n.Copy();

        n1.MultiplyScalar(2 * this.Dot(v, n));
        v1.Subtract(n1);

        return v1;
    }

    static Refract(v: Vec3, n: Vec3, niOverNt: number): Refraction {
        let unitVecV = this.CreateUnitVector(v);
        let dt = this.Dot(unitVecV, n);
        let discriminant = 1.0 - niOverNt * niOverNt * (1 - dt * dt);
        if (discriminant > 0) {
            let n2 = n.Copy();
            n2.MultiplyScalar(dt);

            let n3 = n.Copy();
            n3.MultiplyScalar(Math.sqrt(discriminant));

            let refraction = unitVecV.Copy();
            refraction.Subtract(n2);
            refraction.MultiplyScalar(niOverNt);
            refraction.Subtract(n3);

            return {
                refraction,
                refracted: true
            };
        } else {
            return {
                refraction: new Vec3(0, 0, 0),
                refracted: false
            }
        }
    }
}