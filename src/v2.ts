import { Vector, Vector2 } from '@dimforge/rapier2d-compat';
import { Vector2 as GlVector2 } from '@math.gl/core';

/**
 * Wrapper helper to convert the Rapier Vector2 to GLVector2
 */ export function v2(a?: Vector2 | Vector | GlVector2 | number, y?: number) {
  if (a === undefined) {
    console.error('error: v not defined');
  }
  if (typeof a === 'number') {
    return new GlVector2(a, y);
  } else {
    let v = a as GlVector2;
    return new GlVector2(v.x, v.y);
  }
}
