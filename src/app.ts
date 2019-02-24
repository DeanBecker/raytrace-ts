import { RayTracer } from './raytracer';

(function Bootstrap() {
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    if (!canvas.getContext) {
        throw "Canvas unsupported!";
    }

    const context = canvas.getContext('2d')!;
    let rt = new RayTracer(context, canvas.width, canvas.height);
    // rt.RandomFill();
    // rt.GradientFill();
    // rt.GradientBackground();
    // rt.DrawGeometry();
    // rt.DrawNormalMap();
    // rt.DrawNormalMapWorld();
    // rt.DrawNormalMapWithCameraAndSuperSampling();
    // rt.DrawDiffusedSpheres();
    // rt.DrawMixedMaterials();
    // rt.DrawCameraTest_1();
    rt.DrawRandomWorld();
})();