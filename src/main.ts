import './style.scss';

import RAPIER, { ColliderDesc, Vector2 } from '@dimforge/rapier2d-compat';
import { RapierRenderer } from './RapierRenderer';
import { RapierComponents, RapierHelper } from './RapierHelper';

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

  // create the helper (makes it easy to create boxes and rendering them)
  let helper: RapierHelper

  let movingWall: RapierComponents;
  let dynamicBox: RAPIER.RigidBody;
  let i = 0

  // create the renderer
  let rapierRenderer = new RapierRenderer({
    debugRender: true,
    // selector: 'body',
    world,
    tps: 1000 / 30,
    onInit: () => {
      world.gravity = new RAPIER.Vector2(0.0, -9.81);

      helper = new RapierHelper(world, rapierRenderer);

      rapierRenderer.lookAt({
        target: {
          x: 0,
          y: 0,
        },
        zoom: 30,
      });

      // Create the ground
      helper.createComponent({
        position: { x: 0, y: -10 },
        // other possibility: position: new Vector2(0, 10)
        colliderDesc: ColliderDesc.cuboid(10, 0.1),
        isFixed: true,
      });

      // moving wall
      movingWall = helper.createComponent({
        position: { x: 10, y: 10 },
        colliderDesc: ColliderDesc.cuboid(10, 0.1),
        rotation: Math.PI * 0.5,
        isFixed: true,
      })!



      // create the falling box
      dynamicBox = helper.createComponent({
        position: new Vector2(-3, 0),
        colliderDesc: ColliderDesc.cuboid(0.5, 0.5),
        rotation: Math.random() * Math.PI * 2,
      }).rigidBody!

      // usage of common rigidbody getters
      dynamicBox.translation();
      dynamicBox.rotation();
      dynamicBox.linvel();

    },
    onTick: () => {

      let dynamicOffset = Math.cos(i * 0.02) * 5;
      movingWall.rigidBody!.setTranslation(new Vector2(dynamicOffset, 0), true);

      if (i % 400 === 0) {

        //  usage of common rigidbody setters
        dynamicBox.setLinvel(new Vector2(5, 8), true);
        dynamicBox.setAngvel(25, true);
      }


      // The Rapier Vector2 can not calculate itself.
      // Another vector library is necessary
      // In this example we use the '@math.gl/core'
      // The v2 function helps to simply convert the Rapier Vector to a GLVector2
      // let vectorA = v2(dynamicBox.translation())
      //   .add(v2(3, 4))
      //   .add(v2(dynamicBox.translation()));

      // let newVector = vectorA.scale(dynamicBox.translation());
      // console.log(newVector);
      // // set the translation using the GLVector2
      // dynamicBox.setTranslation(newVector, true);
      i += 1;
    },

  });

}

init();
