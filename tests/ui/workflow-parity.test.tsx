import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const variablesScreenPath = 'src/interactive/screens/VariablesScreen.tsx';
const historyScreenPath = 'src/interactive/screens/HistoryRestoreScreen.tsx';
const generateScreenPath = 'src/interactive/screens/GenerateEnvScreen.tsx';
const searchScreenPath = 'src/interactive/screens/SearchScreen.tsx';
const interactiveMenuPath = 'src/interactive/menu.tsx';
const appShellPath = 'src/interactive/components/common/AppShell.tsx';
const optionListPath = 'src/interactive/components/common/OptionList.tsx';

describe('ui parity contracts', () => {
  it('variables screen is wired to shared mutation service with interactive source type', () => {
    const source = fs.readFileSync(variablesScreenPath, 'utf8');

    expect(source).toContain('runtime.variableService.mutate({');
    expect(source).toContain("sourceType: 'interactive'");
    expect(source).toContain("operation: 'set'");
    expect(source).toContain("operation: 'unset'");
    expect(source).toContain("operation: 'import'");
  });

  it('history/restore screen is wired to shared versioning restore service', () => {
    const source = fs.readFileSync(historyScreenPath, 'utf8');

    expect(source).toContain('runtime.versioning.restoreSnapshot({');
    expect(source).toContain('versionNumber');
    expect(source).toContain('interactive restore from');
  });

  it('generate screen enforces destination-first artifact selection workflow', () => {
    const source = fs.readFileSync(generateScreenPath, 'utf8');

    expect(source).toContain("STEP 1 · DESTINATION MODE");
    expect(source).toContain("STEP 2 · SELECT FILES");
    expect(source).toContain('Space select');
    expect(source).toContain('generate-all');
  });

  it('search screen starts directly in input mode', () => {
    const source = fs.readFileSync(searchScreenPath, 'utf8');

    expect(source).toContain('const [editing, setEditing] = useState(true);');
    expect(source).toContain('Search input');
  });

  it('interactive menu uses a persistent shared shell', () => {
    const menuSource = fs.readFileSync(interactiveMenuPath, 'utf8');
    const shellSource = fs.readFileSync(appShellPath, 'utf8');

    expect(menuSource).toContain('<AppShell appVersion={appVersion}>');
    expect(shellSource).toContain('borderColor="magenta"');
    expect(shellSource).toContain('minWidth={96}');
  });

  it('option list uses pink selected color', () => {
    const source = fs.readFileSync(optionListPath, 'utf8');

    expect(source).toContain("'magentaBright'");
  });
});
