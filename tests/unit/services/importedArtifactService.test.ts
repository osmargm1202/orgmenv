import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createTestRuntime } from '../../helpers/testRuntime.js';

const tempDirs: string[] = [];

afterEach(() => {
  tempDirs.splice(0).forEach((dirPath) => {
    fs.rmSync(dirPath, { recursive: true, force: true });
  });
});

function createTempFile(fileName: string, content: string): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orgmenv-artifact-'));
  tempDirs.push(tempDir);
  const filePath = path.join(tempDir, fileName);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

describe('ImportedArtifactService', () => {
  it('imports supported file types and renders selected content for screen mode', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'artifact-project' });
    const envPath = createTempFile('.env', 'API_KEY=abc');
    const jsonPath = createTempFile('config.json', '{"feature":true}');

    const envImported = runtime.importedArtifactService.importFromFile({
      projectId: project.id,
      environment: 'dev',
      filePath: envPath
    });
    runtime.importedArtifactService.importFromFile({
      projectId: project.id,
      environment: 'dev',
      filePath: jsonPath
    });

    const listed = runtime.importedArtifactService.listByProjectEnvironment({
      projectId: project.id,
      environment: 'dev'
    });

    expect(listed).toHaveLength(2);
    expect(listed.some((artifact) => artifact.fileType === '.env')).toBe(true);
    expect(listed.some((artifact) => artifact.fileType === '.json')).toBe(true);

    const generated = runtime.importedArtifactService.generate({
      projectId: project.id,
      environment: 'dev',
      mode: 'screen',
      artifactIds: [envImported.artifact.id]
    });

    expect(generated).toHaveLength(1);
    expect(generated[0].content).toBe('API_KEY=abc');

    runtime.db.close();
  });

  it('writes imported content back to output paths in file mode', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'artifact-write-project' });
    const pemPath = createTempFile('private.pem', '-----BEGIN KEY-----\nabc\n-----END KEY-----');

    runtime.importedArtifactService.importFromFile({
      projectId: project.id,
      environment: 'prod',
      filePath: pemPath
    });

    fs.writeFileSync(pemPath, 'overwritten', 'utf8');

    const generated = runtime.importedArtifactService.generate({
      projectId: project.id,
      environment: 'prod',
      mode: 'file',
      generateAll: true
    });

    expect(generated).toHaveLength(1);
    expect(generated[0].outputPath).toBe(pemPath);
    expect(fs.readFileSync(pemPath, 'utf8')).toContain('-----BEGIN KEY-----');

    runtime.db.close();
  });

  it('rejects unsupported file types', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'artifact-invalid-type' });
    const txtPath = createTempFile('notes.txt', 'hello');

    expect(() =>
      runtime.importedArtifactService.importFromFile({
        projectId: project.id,
        environment: 'dev',
        filePath: txtPath
      })
    ).toThrow('unsupported file type: .txt');

    runtime.db.close();
  });
});
