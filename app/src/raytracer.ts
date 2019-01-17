export class RayTracer {
    private context: CanvasRenderingContext2D;
    
    constructor() {
        const canvas = <HTMLCanvasElement>document.getElementById('canvas');
        if (!canvas.getContext)
        {
            throw "Canvas unsupported!";
        }
        
        this.context = canvas.getContext('2d')!;
        this.context.fillStyle = 'rgb(200, 0, 0)';
        this.context.fillRect(10, 10, 50, 50);
    }
}