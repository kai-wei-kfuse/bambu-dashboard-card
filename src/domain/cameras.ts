import type { HassEntity, RegistrySnapshot } from '../ha/types';
import type { Printer } from './printers';

export interface CameraPreference { version: 1; entityId: string | null }
export type CameraStatus = 'ready' | 'missing' | 'disabled' | 'unavailable' | 'unknown';
export interface CameraSource { entityId?: string; name: string; external: boolean; status: CameraStatus; streaming: boolean }
const CAMERA_ID = /^camera\.[a-z0-9_]+$/;

export function parseCameraPreference(value: unknown): CameraPreference {
  if (value === null) return { version: 1, entityId: null };
  if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1 || !('entityId' in value)
    || !(value.entityId === null || (typeof value.entityId === 'string' && CAMERA_ID.test(value.entityId)))) {
    throw new Error('HA returned an unsupported camera source preference.');
  }
  return { version: 1, entityId: value.entityId };
}

function cameraSource(entityId: string | undefined, external: boolean, states: Record<string, HassEntity>, registry: RegistrySnapshot): CameraSource {
  const state = entityId ? states[entityId] : undefined;
  const entry = registry.entities.find((candidate) => candidate.entity_id === entityId);
  const friendly = state?.attributes.friendly_name;
  const name = typeof friendly === 'string' && friendly.trim() ? friendly : entry?.name || entry?.original_name || entityId || '';
  const status: CameraStatus = entry?.disabled_by ? 'disabled' : !state ? 'missing' : state.state === 'unavailable' ? 'unavailable' : state.state === 'unknown' ? 'unknown' : 'ready';
  return { entityId, name, external, status, streaming: (Number(state?.attributes.supported_features) & 2) !== 0 };
}

export function externalCameras(states: Record<string, HassEntity>, registry: RegistrySnapshot): CameraSource[] {
  const internal = new Set(registry.entities.filter((entry) => entry.platform === 'bambu_lab').map((entry) => entry.entity_id));
  return Object.keys(states).filter((id) => CAMERA_ID.test(id) && !internal.has(id))
    .map((id) => cameraSource(id, true, states, registry)).filter((source) => source.status !== 'disabled')
    .sort((a, b) => a.name.localeCompare(b.name) || a.entityId!.localeCompare(b.entityId!));
}

export function resolveCameraSource(printer: Printer, preference: CameraPreference, states: Record<string, HassEntity>, registry: RegistrySnapshot): CameraSource {
  return cameraSource(preference.entityId ?? printer.camera?.entry.entity_id, preference.entityId !== null, states, registry);
}
