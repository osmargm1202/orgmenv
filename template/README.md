# orgmenv reusable templates

This folder contains reusable starter templates for future tools.

## Available starter

- `node-cli-ui/`: Ink + React + Commander starter aligned with `docs/CLI_UI_STYLE_GUIDE.md`.

## Quick instantiate

1. Copy the starter to a new project directory.
2. Rename `package.template.json` -> `package.json` and `tsconfig.template.json` -> `tsconfig.json`.
3. Replace placeholders:
   - `__APP_BIN_NAME__`
   - `__APP_DESCRIPTION__`
   - `__PRODUCT_PREFIX__`
   - `__PRODUCT_SUFFIX__`
   - `__PRIMARY_THEME_COLOR__`
   - `__ASCII_BANNER_LINE_1__` ... `__ASCII_BANNER_LINE_6__`
4. Install dependencies and keep extending screens/components.

## Example copy flow

```bash
mkdir -p ./my-cli
cp -R ./template/node-cli-ui/. ./my-cli/
mv ./my-cli/package.template.json ./my-cli/package.json
mv ./my-cli/tsconfig.template.json ./my-cli/tsconfig.json
```

> This template is self-contained and does not affect orgmenv runtime.
