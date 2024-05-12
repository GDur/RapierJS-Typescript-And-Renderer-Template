import * as RAPIER from '@dimforge/rapier2d-compat';
import { World } from '@dimforge/rapier2d-compat';
// import * as PIXI from 'pixi.js';
// import { Viewport } from 'pixi-viewport';
//import { World } from '@dimforge/rapier2d-compat';
import { Application, Graphics, Color, Assets, Sprite } from 'pixi.js';
import { log } from './utils';

const BOX_INSTANCE_INDEX = 0;
const BALL_INSTANCE_INDEX = 1;

var kk = 0;

const app = new Application();

(async () => {

    // Intialize the application.
    await app.init({ background: '#242233', resizeTo: window });

    // Then adding the application's canvas to the DOM body.
    document.body.appendChild(app.canvas);

})();

export class RapierRenderer {
    coll2gfx: Map<number, Graphics>;
    colorIndex: number;
    colorPalette: Array<number>;
    app = app;
    // app!: Application<Renderer<HTMLCanvasElement>>;
    //viewport: Viewport;
    instanceGroups = new Array<Array<Graphics>>();
    lines = new Graphics()

    constructor(pixiContianerSelector: string, public world: World) {

        // High pixel Ratio make the rendering extremely slow, so we cap it.
        const pixelRatio = window.devicePixelRatio
            ? Math.min(window.devicePixelRatio, 1.5)
            : 1;

        this.coll2gfx = new Map();
        this.colorIndex = 0;
        this.colorPalette = [0xf3d9b9, 0x005a91, 0x05c5e0, 0x1f7a8c];

        /*
        this.viewport = new Viewport({
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
          worldWidth: 1000,
          worldHeight: 1000,
          interaction: this.renderer.plugins.interaction,
        });
    
        this.scene.addChild(this.viewport);
        this.viewport.drag().pinch().wheel().decelerate();
    */
        let me = this;


        function onContextMenu(event: UIEvent) {
            event.preventDefault();
        }

        document.oncontextmenu = onContextMenu;
        document.body.oncontextmenu = onContextMenu;


        this.initInstances();

        this.startRenderLoop();
    }

    // 60 fps:
    startRenderLoop() {

        let self = this;
        let start: number;
        let previousTimeStamp = 0;

        function step(timestamp: number) {
            if (start === undefined) {
                start = timestamp;
            }
            const totalElapsedMs = timestamp - start;
            const dt = timestamp - previousTimeStamp;
            //console.log(totalElapsedMs, dt);

            // render the graphics
            self.render(self.world, true);

            previousTimeStamp = timestamp;
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    initInstances() {

        this.instanceGroups = [];
        this.instanceGroups.push(
            this.colorPalette.map((color) => {
                let graphics = new Graphics()
                    .rect(-1.0, 1.0, 2.0, -2.0)
                    .fill(color);
                return graphics;
            })
        );

        this.instanceGroups.push(
            this.colorPalette.map((color) => {
                let graphics = new Graphics()
                    .circle(0.0, 0.0, 1.0)
                    .fill(color);
                return graphics;
            })
        );

    }

    render(world: RAPIER.World, debugRender: boolean) {

        kk += 1;

        if (!this.lines) {
            this.lines = new Graphics();
            // this.viewport.addChild(this.lines);
        }

        if (debugRender) {
            let buffers = world.debugRender();
            let vtx = buffers.vertices;
            let cls = buffers.colors;

            this.lines.clear();

            for (let i = 0; i < vtx.length / 4; i += 1) {

                let color = Color.shared.setValue([cls[i * 8], cls[i * 8 + 1], cls[i * 8 + 2]]).toHex();

                this.lines.lineStyle(1.0, color, cls[i * 8 + 3]);
                this.lines.moveTo(vtx[i * 4], -vtx[i * 4 + 1]);
                this.lines.lineTo(vtx[i * 4 + 2], -vtx[i * 4 + 3]);
            }
        } else {
            this.lines.clear();
        }

        this.updatePositions(world);

    }

    lookAt(pos: { zoom: number; target: { x: number; y: number } }) {
        // this.viewport.setZoom(pos.zoom);
        // this.viewport.moveCenter(pos.target.x, pos.target.y);
    }

    updatePositions(world: RAPIER.World) {

        world.forEachCollider((elt) => {
            let gfx = this.coll2gfx.get(elt.handle);
            let translation = elt.translation();
            let rotation = elt.rotation();

            if (!!gfx) {
                gfx.position.x = translation.x;
                gfx.position.y = -translation.y;
                gfx.rotation = -rotation;
            }
        });
    }

    reset() {
        this.coll2gfx.forEach((gfx) => {
            // this.viewport.removeChild(gfx);
            gfx.destroy();
        });
        this.coll2gfx = new Map();
        this.colorIndex = 0;
    }

    async addCollider(collider: RAPIER.Collider) {

        let i;
        let parent = collider.parent()!;
        let instance;
        let graphics;
        let vertices;
        let instanceId = parent.isFixed() ? 0 : this.colorIndex + 1;

        switch (collider.shape.type) {
            case RAPIER.ShapeType.Cuboid:
                let hext = collider.halfExtents();
                // instance = this.instanceGroups[BOX_INSTANCE_INDEX][instanceId];
                // graphics = instance.clone();
                // // graphics.scale.x = hext.x;
                // // graphics.scale.y = hext.y;
                // log(hext)
                //
                // graphics.x = hext.x + this.app.screen.width / 2;
                // graphics.y = hext.y + this.app.screen.height / 2;
                // this.app.stage.addChild(graphics);

                graphics = new Graphics();

                // Rectangle
                graphics.rect(0, 0, 11.0, 11.0);
                graphics.fill(0xde3249);
                // Center the sprite's anchor point
                graphics.scale.set(0.5);

                // Move the sprite to the center of the screen
                // graphics.x = hext.x + app.screen.width / 2;
                // graphics.y = hext.y + app.screen.height / 2;
                graphics.scale.x = hext.x // + app.screen.width / 2;
                graphics.scale.y = hext.y // + app.screen.height / 2;


                app.stage.addChild(graphics);
                break;

            case RAPIER.ShapeType.Ball:
                let rad = collider.radius();
                instance = this.instanceGroups[BALL_INSTANCE_INDEX][instanceId];
                graphics = instance.clone();
                graphics.scale.x = rad;
                graphics.scale.y = rad;
                this.app.stage.addChild(graphics);
                break;

            case RAPIER.ShapeType.Polyline:
                vertices = Array.from(collider.vertices());
                graphics = new Graphics();
                graphics
                    .lineStyle(0.2, this.colorPalette[instanceId])
                    .moveTo(vertices[0], -vertices[1]);

                for (i = 2; i < vertices.length; i += 2) {
                    graphics.lineTo(vertices[i], -vertices[i + 1]);
                }

                this.app.stage.addChild(graphics);
                break;

            case RAPIER.ShapeType.HeightField:
                let heights = Array.from(collider.heightfieldHeights());
                let scale = collider.heightfieldScale();
                let step = scale.x / (heights.length - 1);

                graphics = new Graphics();
                graphics
                    .lineStyle(0.2, this.colorPalette[instanceId])
                    .moveTo(-scale.x / 2.0, -heights[0] * scale.y);

                for (i = 1; i < heights.length; i += 1) {
                    graphics.lineTo(-scale.x / 2.0 + i * step, -heights[i] * scale.y);
                }

                this.app.stage.addChild(graphics);

                break;
            case RAPIER.ShapeType.ConvexPolygon:
                vertices = Array.from(collider.vertices());
                graphics = new Graphics();
                graphics.beginFill(this.colorPalette[instanceId], 1.0);
                graphics.moveTo(vertices[0], -vertices[1]);

                for (i = 2; i < vertices.length; i += 2) {
                    graphics.lineTo(vertices[i], -vertices[i + 1]);
                }

                this.app.stage.addChild(graphics);
                break;

            default:
                console.log('Unknown shape to render.');
                break;
        }

        let t = collider.translation();
        let r = collider.rotation();

        if (graphics) {
            graphics.position.x = t.x;
            graphics.position.y = -t.y;
            graphics.rotation = r;
            this.coll2gfx.set(collider.handle, graphics);
        }
        this.colorIndex = (this.colorIndex + 1) % (this.colorPalette.length - 1);

    }
}
