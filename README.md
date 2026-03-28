# orgmenv

Local-first CLI para administrar variables de entorno por proyecto, con snapshots versionados y restauración no destructiva.

## Instalación y ejecución

```bash
npm install
npm test
npm run build
./dist/cli.js --help
```

También podés ejecutar en desarrollo con `npm test` para validar comportamiento antes de usar el binario compilado.

Instalación global:

```bash
npm install -g orgmenv@latest
orgmenv --help
orgmenv instructions
```

## Modos de uso

- **Modo interactivo (Ink):** ejecutar `orgmenv` sin subcomandos.
- **Modo scriptable:** ejecutar `orgmenv <subcommand> ...`.
- **Modo no interactivo determinista:** agregar `--noconfirm` para evitar prompts.

## Opciones globales

- `--project <id|name|alias>`: selecciona proyecto objetivo.
- `--env <name>`: selecciona ambiente (por defecto `dev`).
- `--noconfirm`: evita prompts y falla de forma determinista cuando hay ambigüedad.
- `--db-path <path>`: ruta de SQLite local.
- `--key-path <path>`: fallback de clave age cuando `AGE_KEY_FILE` no está definido.
- `--no-encryption`: desactiva cifrado en persistencia (muestra advertencia de postura insegura).

## Matriz de comandos

| Comando | Propósito |
|---|---|
| `init` | Registrar proyecto actual |
| `projects` | Listar proyectos registrados |
| `envs` | Listar ambientes del proyecto resuelto |
| `show` | Mostrar contexto resuelto (proyecto/ambiente/config) |
| `set <KEY> <VALUE>` | Crear/actualizar variable y generar snapshot nuevo |
| `unset <KEY>` | Eliminar variable y generar snapshot nuevo |
| `import --file <path> [--merge\|--replace]` | Importar variables con estrategia merge/replace |
| `history` | Ver historial de snapshots |
| `restore --version <N>` | Restaurar versión creando nuevo snapshot latest |
| `gen [--stdout\|--output\|--export\|--key]` | Generar salida `.env`, export shell o clave individual |
| `keys [--key <name>]` | Listar claves o imprimir una clave puntual |
| `search <query>` | Buscar variables de scope proyecto + global |
| `doctor` | Diagnóstico de tooling y claves |
| `keygen --output <path>` | Generar material de clave age |
| `instructions` | Mostrar guía extendida local empaquetada en la instalación |

## Cifrado por defecto (at-rest)

- Persistencia de secretos usa **age** por defecto.
- Orden de resolución de clave:
  1. `AGE_KEY_FILE`
  2. `--key-path` / path configurado
- Si desactivás cifrado con `--no-encryption`, orgmenv avisa explícitamente y persiste plaintext.

## Tooling requerido

- **Requeridos** para cifrado por defecto: `age`, `age-keygen`
- **Opcional/no bloqueante**: `sops`

Diagnóstico:

```bash
orgmenv doctor
```

Generación de clave:

```bash
orgmenv keygen --output ~/.config/orgmenv/keys/age.txt
export AGE_KEY_FILE="$HOME/.config/orgmenv/keys/age.txt"
```

## Comportamiento interactivo

El home interactivo incluye las 8 acciones principales requeridas:

1. Generate env
2. Current project
3. Variables
4. Search
5. History / Restore
6. Register project
7. Configuration menu
8. Exit

El encabezado siempre muestra versión, proyecto resuelto/no resuelto, cwd, db path y estado de `AGE_KEY_FILE`.

### ¿Qué hace cada opción interactiva?

1. **Generate env**
   - Genera archivo `.env`, salida a stdout, export shell o una variable puntual.
2. **Current project**
   - Muestra cómo se resolvió el proyecto actual y su metadata.
3. **Variables**
   - Alta/baja/import de variables por entorno.
   - También permite **upsert global** (alias obligatorio) para secretos no atados a un proyecto.
4. **Search**
   - Busca sobre snapshots de proyecto y sobre variables globales.
5. **History / Restore**
   - Navega historial versionado y restaura sin destruir historial previo.
6. **Register project**
   - Registra proyecto actual para que la resolución automática sea estable.
7. **Configuration menu**
   - Muestra configuración activa.
   - Permite seleccionar settings para configurar (toggle cifrado, set/clear fallback key path, generar key file, refrescar diagnóstico).
8. **Exit**
   - Sale del modo interactivo.

### Status area (AGE_KEY_FILE)

En Home hay un status item navegable por teclado:

- `AGE_KEY_FILE: defined | not defined`

Seleccionalo con `↑/↓` y presioná `Enter` para ver guía corta de setup en:

- bash: `export AGE_KEY_FILE="$HOME/.config/orgmenv/keys/age.txt"`
- fish: `set -gx AGE_KEY_FILE "$HOME/.config/orgmenv/keys/age.txt"`

## Flujos de uso

### 1) Flujo normal basado en proyecto

1. Registrar proyecto:

```bash
orgmenv init --name mi-api --env dev
```

2. Cargar variables:

```bash
orgmenv set DATABASE_URL "postgres://..."
orgmenv import --file .env --merge
```

3. Generar `.env` para uso local:

```bash
orgmenv gen --env dev --output .env
```

4. Auditar y recuperar si hace falta:

```bash
orgmenv history --env dev
orgmenv restore --env dev --version 3
```

### 2) Flujo de variables globales (independiente de proyecto)

Este flujo sirve para tokens/keys que no pertenecen a un repo puntual.

1. Abrir modo interactivo:

```bash
orgmenv
```

2. Ir a `Variables` y ejecutar `upsert global` (`g`).
3. Completar:
   - alias (obligatorio)
   - key
   - value
4. Buscar desde CLI:

```bash
orgmenv search OPENAI
```

Vas a ver resultados combinados de scope `global` + `project`.
