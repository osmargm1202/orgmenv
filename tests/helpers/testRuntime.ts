import Database from 'better-sqlite3';
import { runMigrations } from '../../src/db/migrations.js';
import { EnvironmentRepo } from '../../src/db/repositories/environmentRepo.js';
import { GlobalVariableRepo } from '../../src/db/repositories/globalVariableRepo.js';
import { ImportedArtifactRepo } from '../../src/db/repositories/importedArtifactRepo.js';
import { ProjectRepo } from '../../src/db/repositories/projectRepo.js';
import { VariableRepo } from '../../src/db/repositories/variableRepo.js';
import { VersionRepo } from '../../src/db/repositories/versionRepo.js';
import { EncryptionService } from '../../src/services/encryption.js';
import { EnvGeneratorService } from '../../src/services/envGenerator.js';
import { GlobalVariableService } from '../../src/services/globalVariableService.js';
import { ImportedArtifactService } from '../../src/services/importedArtifactService.js';
import { VariableService } from '../../src/services/variableService.js';
import { VersioningService } from '../../src/services/versioning.js';
import type { OrgmenvConfig } from '../../src/types/contracts.js';

export interface TestRuntime {
  db: Database.Database;
  projectRepo: ProjectRepo;
  environmentRepo: EnvironmentRepo;
  versionRepo: VersionRepo;
  variableRepo: VariableRepo;
  globalVariableRepo: GlobalVariableRepo;
  importedArtifactRepo: ImportedArtifactRepo;
  encryption: EncryptionService;
  versioning: VersioningService;
  variableService: VariableService;
  envGenerator: EnvGeneratorService;
  globalVariableService: GlobalVariableService;
  importedArtifactService: ImportedArtifactService;
}

export function createTestRuntime(configOverride: Partial<OrgmenvConfig> = {}): TestRuntime {
  const db = new Database(':memory:');
  runMigrations(db);

  const projectRepo = new ProjectRepo(db);
  const environmentRepo = new EnvironmentRepo(db);
  const versionRepo = new VersionRepo(db);
  const variableRepo = new VariableRepo(db);
  const globalVariableRepo = new GlobalVariableRepo(db);
  const importedArtifactRepo = new ImportedArtifactRepo(db);

  const config: OrgmenvConfig = {
    dbPath: ':memory:',
    useEncryption: false,
    ...configOverride
  };

  const encryption = new EncryptionService(config);
  const versioning = new VersioningService(environmentRepo, versionRepo, variableRepo);
  const variableService = new VariableService(versioning, encryption);
  const envGenerator = new EnvGeneratorService(environmentRepo, variableRepo, encryption);
  const globalVariableService = new GlobalVariableService(db, globalVariableRepo, encryption);
  const importedArtifactService = new ImportedArtifactService(environmentRepo, importedArtifactRepo, encryption);

  return {
    db,
    projectRepo,
    environmentRepo,
    versionRepo,
    variableRepo,
    globalVariableRepo,
    importedArtifactRepo,
    encryption,
    versioning,
    variableService,
    envGenerator,
    globalVariableService,
    importedArtifactService
  };
}
