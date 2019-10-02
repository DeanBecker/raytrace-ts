import { Vec3 } from './math/Vec3';
import { Ray } from './math/ray';
import { HittableList } from './math/hittablelist';
import { HitRecord } from './math/irayhittable';
import { Sphere } from './math/sphere';
import { Camera } from './camera';
import { Diffuse } from './material/diffuse';
import { Metal } from './material/metal';
import { Dielectric } from './material/dielectric';
 
export class RayTracer {
    private readonly PIXEL_WIDTH: number; 
    private readonly PIXEL_HEIGHT: number;
    
    private readonly RESOLUTION_WIDTH = 1280;
    private readonly RESOLUTION_HEIGHT = 720;

    private readonly AA_SAMPLES = 75;
    private readonly REFLECTION_DEPTH = 35;

    constructor(
        private context: CanvasRenderingContext2D,
        private CANVAS_WIDTH: number,
        private CANVAS_HEIGHT: number
    ) {
        this.PIXEL_WIDTH = CANVAS_WIDTH / this.RESOLUTION_WIDTH;
        this.PIXEL_HEIGHT = CANVAS_HEIGHT / this.RESOLUTION_HEIGHT;

        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    private FillPixel(
        x: number, y: number, z: number,
        r: number, g: number, b: number, a: number
    ): void {
        this.context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        this.context.fillRect(x, y, this.PIXEL_WIDTH, this.PIXEL_HEIGHT);
    }

    private FillPixelVec(pos: Vec3, color: Vec3): void {
        this.FillPixel(pos.X, pos.Y, pos.Z, color.R, color.G, color.B, 1.0);
    }

    private ColorBackground(ray: Ray): Vec3 {
        const unitDirection = Vec3.CreateUnitVector(ray.Direction);
        let t = 0.5 * (unitDirection.Y + 1);
        
        let r1 = new Vec3(1.0, 1.0, 1.0);
        r1.MultiplyScalar(1 - t);
        
        let r2 = new Vec3(0.5, 0.7, 1.0);
        r2.MultiplyScalar(t);
        
        r1.Add(r2);
        
        return r1;
    }

    private ColorNormalMap(ray: Ray): Vec3 {
        let t = this.HitSphere(new Vec3(0, 0, -1), 0.5, ray);
        if (t > 0) {
            let N = ray.PointAt(t);
            N.Subtract(new Vec3(0, 0, -1));
            N.ConvertToUnitVector();
            
            const r = new Vec3(N.X + 1, N.Y + 1, N.Z + 1);
            r.MultiplyScalar(0.5);

            return r;
        }

        return this.ColorBackground(ray);
    }

    private Color(ray: Ray): Vec3 {
        if (this.HitSphere(new Vec3(0, 0, -1), 0.5, ray) >= 0) {
            return new Vec3(1, 0, 0);
        }

        return this.ColorBackground(ray);
    }

    private ColorWorldNormal(ray: Ray, world: HittableList): Vec3 {
        let rec: HitRecord = {
            normal: new Vec3(0, 0, 0),
            t: 0,
            p: new Vec3(0, 0, 0),
            material: new Diffuse(new Vec3(0,0,0))
        };

        if (world.Hit(ray, 0.0, Number.MAX_VALUE, rec)) {
            let v = new Vec3(rec.normal.X + 1, rec.normal.Y + 1, rec.normal.Z + 1);
            v.MultiplyScalar(0.5);

            return v;
        } else {
            let unitDirection = Vec3.CreateUnitVector(ray.Direction);
            let t = 0.5 * (unitDirection.Y + 1.0);
            let v1 = new Vec3(1.0, 1.0, 1.0);
            v1.MultiplyScalar(1.0 - t);

            let v2 = new Vec3(0.5, 0.7, 1.0);
            v2.MultiplyScalar(t);

            v1.Add(v2);
            
            return v1;
        }
    }

    private ColorDiffuse(ray: Ray, world: HittableList): Vec3 {
        let rec: HitRecord = {
            normal: new Vec3(0, 0, 0),
            t: 0,
            p: new Vec3(0, 0, 0),
            material: new Diffuse(new Vec3(0, 0, 0))
        };

        if (world.Hit(ray, 0.001, Number.MAX_VALUE, rec)) {
            let target = rec.p.Copy();
            target.Add(rec.normal);
            target.Add(Sphere.RandomInUnitSphere());
            target.Subtract(rec.p);

            let newRay = new Ray(rec.p, target);
            let color = this.ColorDiffuse(newRay, world);
            color.MultiplyScalar(0.5);

            return color;
        } else {
            let unitDirection = Vec3.CreateUnitVector(ray.Direction);
            let t = 0.5 * (unitDirection.Y + 1.0);
            let v1 = new Vec3(1.0, 1.0, 1.0);
            v1.MultiplyScalar(1.0 - t);

            let v2 = new Vec3(0.5, 0.7, 1.0);
            v2.MultiplyScalar(t);

            v1.Add(v2);

            return v1;
        }
    }

    private ColorMaterial(ray: Ray, world: HittableList, depth: number): Vec3 {
        let rec: HitRecord = {
            normal: new Vec3(0, 0, 0),
            t: 0,
            p: new Vec3(0, 0, 0),
            material: new Diffuse(new Vec3(0, 0, 0))
        };

        if (world.Hit(ray, 0.0001, Number.MAX_VALUE, rec)) {
            if (depth < this.REFLECTION_DEPTH) {
                let scatter = rec.material.Scatter(ray, rec);
                if (scatter.absorbed) {
                    let attenuation = scatter.attenuation.Copy();
                    attenuation.Multiply(this.ColorMaterial(scatter.ray, world, depth + 1));
                    return attenuation;
                }
            }
            return new Vec3(0, 0, 0);
        } else {
            let unitDirection = Vec3.CreateUnitVector(ray.Direction);
            let t = 0.5 * (unitDirection.Y + 1.0);
            let v1 = new Vec3(1.0, 1.0, 1.0);
            v1.MultiplyScalar(1.0 - t);

            let v2 = new Vec3(0.5, 0.7, 1.0);
            v2.MultiplyScalar(t);

            v1.Add(v2);

            return v1;
        }
    }

    private HitSphere(center: Vec3, radius: number, ray: Ray): number {
        const o_c = ray.Origin.Copy();
        o_c.Subtract(center);

        let a = Vec3.Dot(ray.Direction, ray.Direction);
        let b = 2.0 * Vec3.Dot(o_c, ray.Direction);
        let c = Vec3.Dot(o_c, o_c) - Math.pow(radius, 2);
        let discriminant = Math.pow(b, 2) - (4 * a * c);

        if (discriminant < 0) {
            return -1.0;
        } else {
            return (-b - Math.sqrt(discriminant)) / (2.0 * a);
        }
    }

    private Draw(camera: Camera, world: HittableList) {
        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let color = new Vec3(0.0, 0.0, 0.0);
                for (let s = 0; s < this.AA_SAMPLES; s++) {
                    let u = (i + Math.random()) / this.RESOLUTION_WIDTH;
                    let v = (this.RESOLUTION_HEIGHT - j + Math.random()) / this.RESOLUTION_HEIGHT;
                    let r = camera.GetRay(u, v);
                    let c = this.ColorMaterial(r, world, 0);
                    color.Add(c);
                }
                color.DivideScalar(this.AA_SAMPLES);
                color = new Vec3(Math.sqrt(color.R), Math.sqrt(color.G), Math.sqrt(color.B));
                this.FillPixel(i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0, Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1);
            }
        }
    }

//#region RayTracer Output Functions
    private GetRandomWorld(): HittableList {
        let staticVec = new Vec3(4, 0.2, 0);
        let world = new HittableList();
        let n = 500;
        world.Hittables.push(new Sphere(new Vec3(0, -1000, 0), 1000, new Diffuse(new Vec3(0.5, 0.5, 0.5))));

        let i = 1;
        for (let a = -11; a < 11; a++) {
            for (let b = -11; b < 11; b++) {
                let chooseMat = Math.random();
                let centre = new Vec3(a + 0.9 * Math.random(), 0.2, b + 0.9 * Math.random());

                let centreCopy = centre.Copy();
                centreCopy.Subtract(staticVec);

                if (centreCopy.Length > 0.9) {
                    if (chooseMat < 0.8) {
                        world.Hittables.push(
                            new Sphere(centre, 0.2, new Diffuse(new Vec3(Math.random() * Math.random(), Math.random() * Math.random(), Math.random() * Math.random())))
                        );
                    } else if (chooseMat < 0.95) {
                        world.Hittables.push(
                            new Sphere(centre, 0.2, new Metal(new Vec3(0.5 * (1 + Math.random()), 0.5 * (1 + Math.random()), 0.5 * Math.random())))
                        );
                    } else {
                        world.Hittables.push(
                            new Sphere(centre, 0.2, new Dielectric(1.5))
                        );
                    }
                }
            }
        }

        world.Hittables.push(new Sphere(new Vec3(0, 1, 0), 1.0, new Dielectric(1.5)));
        world.Hittables.push(new Sphere(new Vec3(-4, 1, 0), 1.0, new Diffuse(new Vec3(0.4, 0.2, 0.1))));
        world.Hittables.push(new Sphere(new Vec3(4, 1, 0), 1.0, new Metal(new Vec3(0.7, 0.6, 0.5), 0.0)));
        
        return world;
    }
    
    private GetCamera(): Camera {
        // let lookFrom = new Vec3(3, 3, 2);
        // let lookFrom = new Vec3(-2, 2, 2);
        let lookFrom = new Vec3(13, 2, 3);
        let lookAt = new Vec3(0, 0, 0);
        let vFov = 45;

        let distanceToFocus = lookFrom.Copy();
        distanceToFocus.Subtract(lookAt);
        let aperture = 0.05;

        let aspectRatio = this.RESOLUTION_WIDTH / this.RESOLUTION_HEIGHT;

        return new Camera(lookFrom, lookAt, new Vec3(0, 1, 0), vFov, aspectRatio, aperture, distanceToFocus.Length);
    }
    
    public DrawRandomWorld(): void {
        let world = this.GetRandomWorld();
        let camera = this.GetCamera();
        this.Draw(camera, world);
    }

    public DrawCameraTest_1(): void {
        let world = new HittableList();
        let R = Math.cos(Math.PI / 4);
        world.Hittables.push(new Sphere(new Vec3(-R, 0, -1), R, new Diffuse(new Vec3(0, 0, 1))));
        world.Hittables.push(new Sphere(new Vec3(R, 0, -1), R, new Diffuse(new Vec3(1, 0, 0))));

        let camera = this.GetCamera();
        this.Draw(camera, world);
    }
    
    public DrawMixedMaterials(): void {
        let world = new HittableList();
        world.Hittables.push(new Sphere(new Vec3(0, 0, -1), 0.5, new Diffuse(new Vec3(0.1, 0.2, 0.5))));
        world.Hittables.push(new Sphere(new Vec3(0, -100.5, -1), 100, new Diffuse(new Vec3(0.8, 0.8, 0.0))));
        world.Hittables.push(new Sphere(new Vec3(1, 0, -1), 0.5, new Metal(new Vec3(0.8, 0.6, 0.2), 0.05)));
        world.Hittables.push(new Sphere(new Vec3(-1, 0, -1), 0.4, new Dielectric(1.5)));

        
        let camera = this.GetCamera();

        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let color = new Vec3(0.0, 0.0, 0.0);

                for (let s = 0; s < this.AA_SAMPLES; s++) {
                    let u = (i + Math.random()) / this.RESOLUTION_WIDTH;
                    let v = (this.RESOLUTION_HEIGHT - j + Math.random()) / this.RESOLUTION_HEIGHT;
                    let r = camera.GetRay(u, v);
                    let c = this.ColorMaterial(r, world, 0);

                    color.Add(c);
                }

                color.DivideScalar(this.AA_SAMPLES);
                color = new Vec3(Math.sqrt(color.R), Math.sqrt(color.G), Math.sqrt(color.B));
                this.FillPixel(
                    i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0,
                    Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1
                );
            }
        }
    }
    
    public DrawDiffusedSpheres(): void {
        let world = new HittableList();
        world.Hittables.push(new Sphere(new Vec3(0, 0, -1), 0.5));
        world.Hittables.push(new Sphere(new Vec3(0, -100.5, -1), 100));

        let camera = this.GetCamera();

        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let color = new Vec3(0.0, 0.0, 0.0);

                for (let s = 0; s < this.AA_SAMPLES; s++) {
                    let u = (i + Math.random()) / this.RESOLUTION_WIDTH;
                    let v = (this.RESOLUTION_HEIGHT - j + Math.random()) / this.RESOLUTION_HEIGHT;
                    let r = camera.GetRay(u, v);
                    let c = this.ColorDiffuse(r, world);

                    color.Add(c);
                }

                color.DivideScalar(this.AA_SAMPLES);
                color = new Vec3(Math.sqrt(color.R), Math.sqrt(color.G), Math.sqrt(color.B));
                this.FillPixel(
                    i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0,
                    Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1
                );
            }
        }
    }
    
    public DrawNormalMapWithCameraAndSuperSampling(): void {
        let world = new HittableList();
        world.Hittables.push(new Sphere(new Vec3(0, 0, -1), 0.5));
        world.Hittables.push(new Sphere(new Vec3(0, -100.5, -1), 100));

        let camera = this.GetCamera();

        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let color = new Vec3(0.0, 0.0, 0.0);

                for (let s = 0; s < this.AA_SAMPLES; s++) {
                    let u = (i + Math.random()) / this.RESOLUTION_WIDTH;
                    let v = (this.RESOLUTION_HEIGHT - j + Math.random()) / this.RESOLUTION_HEIGHT;
                    let r = camera.GetRay(u, v);                    
                    let c = this.ColorWorldNormal(r, world); 

                    color.Add(c);
                }

                color.DivideScalar(this.AA_SAMPLES);
                this.FillPixel(
                    i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0,
                    Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1
                );
            }
        }
    }
    
    public DrawNormalMapWorld(): void {
        let lowerLeft = new Vec3(-2.0, -1.0, -1.0);
        let horizontal = new Vec3(4.0, 0.0, 0.0);
        let vertical = new Vec3(0.0, 2.0, 0.0);
        let origin = new Vec3(0.0, 0.0, 0.0);

        let world = new HittableList();
        world.Hittables.push(new Sphere(new Vec3(0, 0, -1), 0.5));
        world.Hittables.push(new Sphere(new Vec3(0, -100.5, -1), 100));

        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let u = i / this.RESOLUTION_WIDTH;
                let v = (this.RESOLUTION_HEIGHT - j) / this.RESOLUTION_HEIGHT;

                let direction = lowerLeft.Copy();
                let innerHorizontal = horizontal.Copy();
                innerHorizontal.MultiplyScalar(u)

                let innerVertical = vertical.Copy();
                innerVertical.MultiplyScalar(v);

                direction.Add(innerHorizontal);
                direction.Add(innerVertical);

                var r = new Ray(origin, direction);

                let color = this.ColorWorldNormal(r, world);

                this.FillPixel(
                    i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0,
                    Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1
                );
            }
        }
    }
    
    public DrawNormalMap(): void {
        let lowerLeft = new Vec3(-2.0, -1.0, -1.0);
        let horizontal = new Vec3(4.0, 0.0, 0.0);
        let vertical = new Vec3(0.0, 2.0, 0.0);
        let origin = new Vec3(0.0, 0.0, 0.0);

        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let u = i / this.RESOLUTION_WIDTH;
                let v = (this.RESOLUTION_HEIGHT - j) / this.RESOLUTION_HEIGHT;

                let direction = lowerLeft.Copy();
                let innerHorizontal = horizontal.Copy();
                innerHorizontal.MultiplyScalar(u)

                let innerVertical = vertical.Copy();
                innerVertical.MultiplyScalar(v);

                direction.Add(innerHorizontal);
                direction.Add(innerVertical);

                var r = new Ray(origin, direction);

                let color = this.ColorNormalMap(r);

                this.FillPixel(
                    i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0,
                    Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1
                );
            }
        }
    }
    
    public DrawGeometry(): void {
        let lowerLeft = new Vec3(-2.0, -1.0, -1.0);
        let horizontal = new Vec3(4.0, 0.0, 0.0);
        let vertical = new Vec3(0.0, 2.0, 0.0);
        let origin = new Vec3(0.0, 0.0, 0.0);

        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let u = i / this.RESOLUTION_WIDTH;
                let v = (this.RESOLUTION_HEIGHT - j) / this.RESOLUTION_HEIGHT;

                let direction = lowerLeft.Copy();
                let innerHorizontal = horizontal.Copy();
                innerHorizontal.MultiplyScalar(u)

                let innerVertical = vertical.Copy();
                innerVertical.MultiplyScalar(v);

                direction.Add(innerHorizontal);
                direction.Add(innerVertical);

                var r = new Ray(origin, direction);

                let color = this.Color(r);

                this.FillPixel(
                    i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0,
                    Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1
                );
            }
        }
    }
    
    public GradientBackground(): void {
        let lowerLeft = new Vec3(-2.0, -1.0, -1.0);
        let horizontal = new Vec3(4.0, 0.0, 0.0);
        let vertical = new Vec3(0.0, 2.0, 0.0);
        let origin = new Vec3(0.0, 0.0, 0.0);

        for (let j = this.RESOLUTION_HEIGHT - 1; j >= 0 ; j--) {
            for (let i = 0; i < this.RESOLUTION_WIDTH; i++) {
                let u = i / this.RESOLUTION_WIDTH;
                let v = (this.RESOLUTION_HEIGHT - j) / this.RESOLUTION_HEIGHT;

                let direction = lowerLeft.Copy();
                let innerHorizontal = horizontal.Copy();
                innerHorizontal.MultiplyScalar(u)

                let innerVertical = vertical.Copy();
                innerVertical.MultiplyScalar(v);

                direction.Add(innerHorizontal);
                direction.Add(innerVertical);

                var r = new Ray(origin, direction);

                let color = this.ColorBackground(r);

                this.FillPixel(
                    i * this.PIXEL_WIDTH, j * this.PIXEL_HEIGHT, 0,
                    Math.floor(255.99 * color.R), Math.floor(255.9 * color.G), Math.floor(255.9 * color.B), 1
                );
            }
        }
    }
    
    public RandomFill(): void {
        for (let y_i = 0; y_i < this.RESOLUTION_HEIGHT; y_i++) {
            for (let x_i = 0; x_i < this.RESOLUTION_WIDTH; x_i++) {
                this.FillPixel(
                    x_i * this.PIXEL_WIDTH, y_i * this.PIXEL_HEIGHT, 0,
                    Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), 1);
            }
        }
    }

    public GradientFill(): void {
        for (let y_i = 0; y_i < this.RESOLUTION_HEIGHT; y_i++) {
            for (let x_i = 0; x_i < this.RESOLUTION_WIDTH; x_i++) {
                const vec = new Vec3(
                    x_i / this.RESOLUTION_WIDTH,
                    (this.RESOLUTION_HEIGHT - y_i) / this.RESOLUTION_HEIGHT, // Flip y-axis to match RT in a weekend result
                    0.2
                );

                const ir = Math.floor(255.99 * vec.R);
                const ig = Math.floor(255.99 * vec.G);
                const ib = Math.floor(255.99 * vec.B);

                this.FillPixel(
                    x_i * this.PIXEL_WIDTH, y_i * this.PIXEL_HEIGHT, 0,
                    ir, ig, ib, 1);
            }
        }
    }
//#endregion 
}