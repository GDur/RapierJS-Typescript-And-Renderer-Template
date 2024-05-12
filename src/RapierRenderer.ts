import * as RAPIER from '@dimforge/rapier2d-compat';
import { World } from '@dimforge/rapier2d-compat';
// import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
//import { World } from '@dimforge/rapier2d-compat';
import { Application, Graphics, Color } from 'pixi.js';

const BOX_INSTANCE_INDEX = 0;
const BALL_INSTANCE_INDEX = 1;

var kk = 0;


export class RapierRenderer {
    coll2gfx: Map<number, Graphics>;
    colorIndex: number;
    colorPalette: Array<number>;
    // app!: Application<Renderer<HTMLCanvasElement>>;
    //viewport: Viewport;
    instanceGroups = new Array<Array<Graphics>>();
    lines = new Graphics()

    app = new Application();
    viewport: Viewport | any = null;

    async loadPixi(cb: Function) {

        const app = new Application();

        (async () => {

            // Intialize the application.
            await app.init({ background: '#242233', resizeTo: window });

            // Then adding the application's canvas to the DOM body.
            document.body.appendChild(app.canvas);

            // create viewport
            this.viewport = new Viewport({
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                worldWidth: 1000,
                worldHeight: 1000,
                events: app.renderer.events
                // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
            })

            // add the viewport to the stage
            app.stage.addChild(this.viewport)

            // activate plugins
            this.viewport
                .drag()
                .pinch()
                .wheel()
                .decelerate()

            cb(this.viewport, app)
        })();
    }
    constructor(pixiContianerSelector: string, public world: World, cb: Function) {
        const self = this

        this.coll2gfx = new Map();
        this.colorIndex = 0;
        this.colorPalette = [0xf3d9b9, 0x005a91, 0x05c5e0, 0x1f7a8c];

        function onContextMenu(event: UIEvent) {
            event.preventDefault();
        }

        document.oncontextmenu = onContextMenu;
        document.body.oncontextmenu = onContextMenu;

        this.loadPixi(() => {

            self.initInstances();

            self.startRenderLoop();
            cb()
        })

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
                let graphics = new Graphics();

                // Rectangle
                graphics.rect(-.5, -.5, 1.0, 1.0);
                graphics.fill(color);
                return graphics;
            })
        );

        this.instanceGroups.push(
            this.colorPalette.map((color) => {
                let graphics = new Graphics()
                graphics.circle(0.0, 0.0, 1.0)
                graphics.fill(color);
                return graphics;
            })
        );

    }

    render(world: RAPIER.World, debugRender: boolean) {

        kk += 1;

        if (!this.lines) {
            this.lines = new Graphics();
            this.viewport.addChild(this.lines);
        }

        if (debugRender) {
            let buffers = world.debugRender();
            let vtx = buffers.vertices;
            let cls = buffers.colors;

            this.lines.clear();

            for (let i = 0; i < vtx.length / 4; i += 1) {

                let color = Color.shared.setValue([cls[i * 8], cls[i * 8 + 1], cls[i * 8 + 2]]).toHex();

                this.lines.fill(color);
                this.lines.width = 1.0
                // , color, cls[i * 8 + 3]
                this.lines.moveTo(vtx[i * 4], -vtx[i * 4 + 1]);
                this.lines.lineTo(vtx[i * 4 + 2], -vtx[i * 4 + 3]);
            }
        } else {
            this.lines.clear();
        }

        this.updatePositions(world);

    }

    lookAt(pos: { zoom: number; target: { x: number; y: number } }) {
        //this.viewport.zoom = pos.zoom
        // this.viewport.zoom(pos.zoom);
        this.viewport.scale.x = (pos.zoom)
        this.viewport.scale.y = (pos.zoom)
        this.viewport.moveCenter(pos.target.x, pos.target.y);
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

                graphics = new Graphics();

                instance = this.instanceGroups[BOX_INSTANCE_INDEX][instanceId];
                graphics = instance.clone();

                let hext = collider.halfExtents();
                graphics.scale.x = hext.x * 2
                graphics.scale.y = hext.y * 2

                break;

            case RAPIER.ShapeType.Ball:
                let rad = collider.radius();
                instance = this.instanceGroups[BALL_INSTANCE_INDEX][instanceId];
                graphics = instance.clone();
                graphics.scale.x = rad;
                graphics.scale.y = rad;
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


                break;
            case RAPIER.ShapeType.ConvexPolygon:
                vertices = Array.from(collider.vertices());
                graphics = new Graphics();
                graphics.beginFill(this.colorPalette[instanceId], 1.0);
                graphics.moveTo(vertices[0], -vertices[1]);

                for (i = 2; i < vertices.length; i += 2) {
                    graphics.lineTo(vertices[i], -vertices[i + 1]);
                }

                break;

            default:
                console.log('Unknown shape to render.');
                break;
        }

        let t = collider.translation();
        let r = collider.rotation();

        if (graphics) {
            this.viewport.addChild(graphics!);
            graphics.position.x = t.x;
            graphics.position.y = -t.y;
            graphics.rotation = r;
            this.coll2gfx.set(collider.handle, graphics);
        }
        this.colorIndex = (this.colorIndex + 1) % (this.colorPalette.length - 1);

    }
}
