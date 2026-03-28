import { describe, expect, it } from 'vitest';
import { ProjectResolverService } from '../../../src/services/projectResolver.js';
import type { ProjectRepo } from '../../../src/db/repositories/projectRepo.js';
import type { Project, ProjectIdentifierType } from '../../../src/types/domain.js';

const projects: Project[] = [
  {
    id: 'proj-a',
    name: 'alpha',
    alias: 'core',
    rootPath: '/workspace/alpha',
    gitRemote: 'git@github.com:org/alpha.git',
    gitRepoName: 'alpha',
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastUsedAt: null,
    active: true
  },
  {
    id: 'proj-b',
    name: 'beta',
    alias: 'payments',
    rootPath: '/workspace/beta',
    gitRemote: 'git@github.com:org/beta.git',
    gitRepoName: 'beta',
    description: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastUsedAt: null,
    active: true
  }
];

function createRepoStub(): ProjectRepo {
  return {
    getById(projectId: string) {
      return projects.find((project) => project.id === projectId);
    },
    getByNameOrAlias(nameOrAlias: string) {
      if (nameOrAlias === 'shared') {
        return [projects[0], projects[1]];
      }

      return projects.filter((project) => project.name === nameOrAlias || project.alias === nameOrAlias);
    },
    findByIdentifier(type: ProjectIdentifierType, value: string) {
      switch (type) {
        case 'root_path':
          return projects.find((project) => project.rootPath === value);
        case 'git_remote':
          return projects.find((project) => project.gitRemote === value);
        case 'git_repo_name':
          return projects.find((project) => project.gitRepoName === value);
        case 'folder_name':
          return projects.find((project) => project.name === value);
        case 'alias':
          return projects.find((project) => project.alias === value);
        default:
          return undefined;
      }
    }
  } as unknown as ProjectRepo;
}

describe('ProjectResolverService', () => {
  it('prioritizes explicit project over auto-detection signals', () => {
    const resolver = new ProjectResolverService(createRepoStub());

    const result = resolver.resolve({
      explicit: { id: 'proj-b' },
      cwd: '/workspace/alpha',
      gitRemote: 'git@github.com:org/alpha.git',
      repoName: 'alpha',
      nonInteractive: false
    });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        projectId: 'proj-b',
        reason: 'explicit:id'
      })
    );
  });

  it('returns INVALID_EXPLICIT when explicit value cannot be resolved', () => {
    const resolver = new ProjectResolverService(createRepoStub());

    expect(
      resolver.resolve({
        explicit: { nameOrAlias: 'missing-project' },
        cwd: '/workspace/unknown',
        nonInteractive: true
      })
    ).toEqual({ ok: false, error: 'INVALID_EXPLICIT' });
  });

  it('returns AMBIGUOUS candidates when explicit name/alias collides in interactive mode', () => {
    const resolver = new ProjectResolverService(createRepoStub());

    const result = resolver.resolve({
      explicit: { nameOrAlias: 'shared' },
      cwd: '/workspace/nowhere',
      nonInteractive: false
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('AMBIGUOUS');
      expect(result.candidates).toHaveLength(2);
      expect(result.candidates?.map((candidate: { projectId: string }) => candidate.projectId).sort()).toEqual([
        'proj-a',
        'proj-b'
      ]);
    }
  });

  it('selects highest-confidence candidate when auto-detection is unambiguous', () => {
    const resolver = new ProjectResolverService(createRepoStub());

    const result = resolver.resolve({
      cwd: '/workspace/alpha',
      gitRemote: 'git@github.com:org/alpha.git',
      repoName: 'alpha',
      folderName: 'alpha',
      nonInteractive: true
    });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        projectId: 'proj-a'
      })
    );
  });

  it('returns AMBIGUOUS when multiple candidates tie at highest confidence', () => {
    const resolver = new ProjectResolverService(createRepoStub());

    const result = resolver.resolve({
      cwd: '/workspace/nowhere',
      folderName: 'shared',
      nonInteractive: true
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('AMBIGUOUS');
      expect(result.candidates).toHaveLength(2);
      expect(result.candidates?.map((candidate: { projectId: string }) => candidate.projectId).sort()).toEqual([
        'proj-a',
        'proj-b'
      ]);
    }
  });
});
