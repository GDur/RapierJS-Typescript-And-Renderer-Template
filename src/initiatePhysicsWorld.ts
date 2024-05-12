import RAPIER, {
  ColliderDesc,
  RigidBodyType,
  Vector2,
  World,
} from '@dimforge/rapier2d-compat';
import { v2 } from './v2';
import { RapierHelper } from './RapierHelper';
import { log } from './utils';

/**
 * Here you can change the gravity and add physics bodies
 */
export function initiatePhysicsWorld(world: World, helper: RapierHelper) {
  world.gravity = new RAPIER.Vector2(0.0, -9.81);

  // Create the ground
  helper.createComponent({
    position: { x: 0, y: -10 },
    // other possibility: position: new Vector2(0, 10)
    colliderDesc: ColliderDesc.cuboid(10, 0.1),
    isFixed: true,
  });

  // moving wall
  let i = 0;
  let movingWall = helper.createComponent({
    position: { x: 10, y: 10 },
    colliderDesc: ColliderDesc.cuboid(10, 0.1),
    rotation: Math.PI * 0.5,
    isFixed: true,
  });

  setInterval(() => {
    let dynamicOffset = Math.cos(i) * 5;
    //movingWall.rigidBody.setTranslation(new Vector2(dynamicOffset, 0), true);
    i += 0.02;
  }, 1000 / 60);

  // create the falling box
  let dynamicBox = helper.createComponent({
    position: new Vector2(-3, 0),
    colliderDesc: ColliderDesc.cuboid(0.5, 0.5),
    rotation: Math.random() * Math.PI * 2,
  }).rigidBody!

  // usage of common rigidbody getters
  dynamicBox.translation();
  dynamicBox.rotation();
  dynamicBox.linvel();

  // usage of common rigidbody setters
  dynamicBox.setLinvel(new Vector2(10, 2), true);
  dynamicBox.setAngvel(25, true);

  // The Rapier Vector2 can not calculate itself.
  // Another vector library is necessary
  // In this example we use the '@math.gl/core'
  // The v2 function helps to simply convert the Rapier Vector to a GLVector2
  let vectorA = v2(dynamicBox.translation())
    .add(v2(3, 4))
    .add(v2(dynamicBox.translation()));

  // let newVector = vectorA.scale(dynamicBox.translation());
  // console.log(newVector);
  // // set the translation using the GLVector2
  // dynamicBox.setTranslation(newVector, true);

  return world;
}
