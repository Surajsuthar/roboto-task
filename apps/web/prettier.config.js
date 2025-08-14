/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  arrowParens: "always",
  bracketSameLine: false,
  objectWrap: "preserve",
  bracketSpacing: true,
  semi: true,
  experimentalOperatorPosition: "end",
  experimentalTernaries: false,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  singleAttributePerLine: false,
  htmlWhitespaceSensitivity: "css",
  vueIndentScriptAndStyle: false,
  proseWrap: "preserve",
  insertPragma: false,
  printWidth: 80,
  requirePragma: false,
  tabWidth: 2,
  useTabs: false,
  embeddedLanguageFormatting: "auto",
};

export default config;
