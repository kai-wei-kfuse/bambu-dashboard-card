import { entityAvailability } from '../domain/printers';
import type { EntityBinding } from '../domain/printers';
import { text } from './i18n';
import type { Language, Message } from './i18n';

export function entityValue(language: Language, entity?: EntityBinding): string {
  const availability = entityAvailability(entity);
  if (availability !== 'ready') return text(language, availability);
  const unit = entity!.state!.attributes.unit_of_measurement;
  return `${entity!.state!.state}${unit ? ` ${String(unit)}` : ''}`;
}

const stages: Record<string, Message> = {
  idle: 'idle', offline: 'offline', printing: 'running', paused_user: 'pause',
  auto_bed_leveling: 'stageLeveling', heatbed_preheating: 'stageBedHeating', heating_hotend: 'stageNozzleHeating',
  changing_filament: 'stageChangingFilament', filament_loading: 'stageLoading', filament_unloading: 'stageUnloading',
  homing_toolhead: 'stageHoming', cleaning_nozzle_tip: 'stageCleaning', calibrating_extrusion: 'stageFlowCalibration',
  calibrating_extrusion_flow: 'stageFlowCalibration', paused_filament_runout: 'stageRunout', cooling_nozzle: 'stageNozzleCooling',
};

export function stageValue(language: Language, entity?: EntityBinding): string {
  if (entityAvailability(entity) !== 'ready') return entityValue(language, entity);
  const state = entity!.state!.state;
  return stages[state] ? text(language, stages[state]) : state;
}
