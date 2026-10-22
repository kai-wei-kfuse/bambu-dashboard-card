import { describe, expect, it } from 'vitest';
import { strToU8, zipSync } from 'fflate';
import { cacheLocation, fileApiPath, inspectProject, projectCompatibility, remoteProjectPath, validateFileList, validatePrintOptions } from '../src/domain/projects';
import { options, project, slicedProject } from './fixtures';

describe('cached project protocol', () => {
  it('keeps local cache ownership distinct from the remote SD path', () => {
    expect(cacheLocation(project.path)).toEqual({ serial: 'SYNTHETIC_ONE', relative: 'prints/cache/123-project.3mf', remote: 'cache/123-project.3mf' });
    expect(fileApiPath('SERIAL/prints/cache/项目 #1.3mf')).toBe('/api/bambu_lab/file_cache/SERIAL/prints/cache/%E9%A1%B9%E7%9B%AE%20%231.3mf');
  });
  it('rejects traversal and malformed API results rather than returning an empty list', () => {
    for (const path of ['SERIAL/prints/../secret', '/SERIAL/prints/a', 'SERIAL/prints/a\\b']) expect(() => cacheLocation(path)).toThrow();
    expect(() => validateFileList({ error: 'failed' })).toThrow();
    expect(() => validateFileList({ files: [{ ...project, size: 0 }] })).toThrow();
  });
  it('honors legacy paths and only accepts successful file-check statuses', () => {
    expect(remoteProjectPath(project, { status: 'use_legacy_path', detail: '/cache/project.3mf' })).toBe('cache/project.3mf');
    expect(remoteProjectPath(project, { status: 'uploaded' })).toBe('cache/123-project.3mf');
    expect(() => remoteProjectPath(project, { status: 'error', detail: 'Transfer failed' })).toThrow('Transfer failed');
    expect(() => remoteProjectPath(project, { status: 'use_legacy_path', detail: '/../../private' })).toThrow();
  });
});

describe('sliced project compatibility', () => {
  it('reads sliced plates, model, nozzle and material metadata', () => {
    const metadata = inspectProject(slicedProject());
    expect(metadata.model).toBe('Bambu Lab A1');
    expect(metadata.nozzles).toEqual([0.4]);
    expect(metadata.plates).toEqual([{ id: 1, name: 'Main plate', filaments: [{ id: 1, type: 'PLA', color: '#aabbcc' }] }]);
    expect(projectCompatibility(metadata, 'A1', 0.4)).toEqual([]);
  });
  it('rejects cross-model/nozzle prints, missing metadata, and unsliced projects', () => {
    expect(projectCompatibility(inspectProject(slicedProject()), 'X1C', 0.6)).toHaveLength(2);
    expect(projectCompatibility({ model: null, nozzles: [], plates: [] }, 'A1', 0.4)).toHaveLength(2);
    expect(() => inspectProject(zipSync({ '3D/model.model': strToU8('mesh') }))).toThrow('not a sliced');
  });
  it('validates plate existence and explicit AMS mapping', () => {
    expect(() => validatePrintOptions({ ...options, plate: 2 }, inspectProject(slicedProject()).plates)).toThrow('no sliced G-code');
    expect(() => validatePrintOptions({ ...options, useAms: true, amsMapping: '' })).toThrow('AMS mapping');
    expect(() => validatePrintOptions({ ...options, useAms: true, amsMapping: '0,2,-1' })).not.toThrow();
  });
});
