"use strict";
const config = {
    root: true,
    env: {
        es2022: true,
        node: true,
    },
    extends: ["eslint:recommended"],
    rules: {
        strict: ["error"],
        "valid-jsdoc": [
            "error",
            {
                requireReturn: false,
                requireReturnType: false,
                requireParamType: false,
            },
        ],
    },
    overrides: [
        {
            files: ["src/**"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                tsconfigRootDir: __dirname,
                project: ["./tsconfig.json"],
            },
            plugins: ["@typescript-eslint/eslint-plugin"],
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@typescript-eslint/recommended-requiring-type-checking",
                "prettier",
            ],
        },
    ],
};
module.exports = config;
