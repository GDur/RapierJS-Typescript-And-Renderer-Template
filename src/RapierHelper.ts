import * as RAPIER from '@dimforge/rapier2d-compat';

import { ColliderDesc, Vector2 } from '@dimforge/rapier2d-compat';
import { RapierRenderer } from './RapierRenderer';

export interface PhysicOptions {
  position: Vector2;
  colliderDesc: ColliderDesc;
  density?: number;
  rotation?: number;
  isFixed?: boolean;
  collisionGroups?: number;
  lockRotation?: boolean;
  lockTranslation?: boolean;
  restitution?: number;
  friction?: number;
  mass?: number;
  isSensor?: boolean;
}

export interface RapierComponents {
  collider?: RAPIER.Collider;
  rigidBody?: RAPIER.RigidBody;
}

export class RapierHelper {
  constructor(
    public world: RAPIER.World,
    public rapierRenderer: RapierRenderer
  ) {}

  createComponent({
    position: position,
    density,
    colliderDesc,
    isFixed = false,
    collisionGroups,
    lockRotation = false,
    lockTranslation = false,
    restitution,
    friction,
    mass,
    isSensor,
    rotation,
  }: PhysicOptions): RapierComponents {
    let bodyDesc = isFixed
      ? RAPIER.RigidBodyDesc.fixed()
      : RAPIER.RigidBodyDesc.dynamic();

    bodyDesc.setTranslation(position.x, position.y);

    let rigidBody = this.world.createRigidBody(bodyDesc);
    rigidBody.lockTranslations(lockTranslation, true);
    rigidBody.lockRotations(lockRotation, true);

    colliderDesc.setRotation(rotation !== undefined ? rotation : 0);
    let collider = this.world.createCollider(colliderDesc, rigidBody);
    collider.setDensity(density !== undefined ? density : collider.density());

    collider.setCollisionGroups(
      collisionGroups !== undefined
        ? collisionGroups
        : collider.collisionGroups()
    );
    collider.setRestitution(
      restitution !== undefined ? restitution : collider.restitution()
    );
    collider.setFriction(
      friction !== undefined ? friction : collider.friction()
    );

    collider.setMass(mass !== undefined ? mass : collider.mass());

    collider.setSensor(isSensor !== undefined ? isSensor : collider.isSensor());

    /**
     * add the object to the render pipeline
     */
    this.rapierRenderer.addCollider(rigidBody.collider(0));

    return { rigidBody, collider };
  }
}
