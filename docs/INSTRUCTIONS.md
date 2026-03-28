# orgmenv instructions

Guía extendida para uso local después de `npm install -g orgmenv@latest`.

## 1) Cómo arrancar

- `orgmenv` → abre el menú interactivo.
- `orgmenv --help` → ayuda corta de comandos.
- `orgmenv instructions` → esta guía extendida local.

## 2) Menú interactivo: qué hace cada opción

1. **Generate env**: genera salida `.env`, export de shell o una variable puntual.
2. **Current project**: muestra el proyecto resuelto y su contexto.
3. **Variables**: alta/baja/import de variables del snapshot actual, y alta global con alias.
4. **Search**: búsqueda por clave/proyecto/alias/entorno (scope proyecto + global).
5. **History / Restore**: historial de versiones y restauración no destructiva.
6. **Register project**: registra proyecto actual para resolución automática futura.
7. **Configuration menu**: ver configuración activa y ajustar settings locales.
8. **Exit**: salir de la UI.

En Home también hay **Status area** para `AGE_KEY_FILE`.
Seleccioná esa línea con teclado y presioná Enter para ver guía de setup en bash/fish.

## 3) Flujo recomendado por proyecto

1. `orgmenv init --name <proyecto> --env dev`
2. `orgmenv set <KEY> <VALUE>` o `orgmenv import --file .env --merge`
3. `orgmenv gen --output .env`
4. `orgmenv history` para validar snapshots
5. `orgmenv restore --version <N>` para recuperar estado (crea snapshot nuevo)

## 4) Flujo de variables globales (independiente del proyecto)

Usá la opción **Variables → upsert global** en modo interactivo.

Secuencia:
1. Alias global (obligatorio)
2. Key
3. Value

Luego podés buscar todo con:

```bash
orgmenv search <query>
```

Esto devuelve resultados de scope `project` y `global`.

## 5) Setup de AGE_KEY_FILE

```bash
# bash
export AGE_KEY_FILE="$HOME/.config/orgmenv/keys/age.txt"

# fish
set -gx AGE_KEY_FILE "$HOME/.config/orgmenv/keys/age.txt"
```

Podés generar archivo de clave con:

```bash
orgmenv keygen --output ~/.config/orgmenv/keys/age.txt
```
