import './style.scss';

import RAPIER, { Vector2 } from '@dimforge/rapier2d-compat';
import { initiatePhysicsWorld } from './initiatePhysicsWorld';
import { log } from './utils';
import { RapierRenderer } from './RapierRenderer';
import { RapierHelper } from './RapierHelper';

/**
 * This example seeks to be a practical and simple starting point
 * for using RapierJS.
 *
 * If offers
 *   - the rapier setup
 *   - a simple to use debug drawer (which is largely based on the original Graphics.ts)
 *   - practical examples on how to use the Vector library
 */

export async function init() {

  await RAPIER.init();

  // create the physics world
  let world = new RAPIER.World(new Vector2(0, 0));

  // create the renderer
  let rapierRenderer = new RapierRenderer('#game-container-canvas', world);
  /*
  rapierRenderer.lookAt({
    target: {
      x: 0,
      y: 0,
    },
    zoom: 20,
  });
  */

  // create the helper (makes it easy to create boxes and rendering them)
  let helper = new RapierHelper(world, rapierRenderer);

  initiatePhysicsWorld(world, helper);

  // about 60 steps per second
  let gameLoop = () => {
    // progress physics simulation one step
    world.step();
    window.requestAnimationFrame(gameLoop);
  };

  window.requestAnimationFrame(gameLoop);
}

init();
