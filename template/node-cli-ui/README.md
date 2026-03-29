# node-cli-ui starter

Starter for Node.js CLI tools using Ink + React with orgmenv visual grammar.

## 1) Instantiate

```bash
cp -R ./template/node-cli-ui ./my-cli
mv ./my-cli/package.template.json ./my-cli/package.json
mv ./my-cli/tsconfig.template.json ./my-cli/tsconfig.json
```

## 2) Replace placeholders

- `__APP_BIN_NAME__`
- `__APP_DESCRIPTION__`
- `__PRODUCT_PREFIX__`
- `__PRODUCT_SUFFIX__`
- `__PRIMARY_THEME_COLOR__`
- `__ASCII_BANNER_LINE_1__` ... `__ASCII_BANNER_LINE_6__`

Suggested color token examples:

- `yellowBright`
- `cyanBright`
- `greenBright`

## 3) Entry points

- `src/cli.ts`: command bootstrap + interactive startup
- `src/app.tsx`: Ink render wrapper
- `src/interactive/menu.tsx`: persistent shell + route stack

## 4) Reuse contract

Keep the shell/theme/keyboard baseline, replace only business actions and screen content.
