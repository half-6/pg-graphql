/* eslint-disable no-undef */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
        ecmaFeatures: {
            jsx: true // Allows for the parsing of JSX
        }
    },
    // settings: {
    //     react: {
    //         version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
    //     }
    // },
    extends: [
        //"plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        //"plugin:jest/recommended",
        //"plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-undef": "off",
        "@typescript-eslint/no-empty-function": ["error", { "allow": ["constructors"] }],

        "@typescript-eslint/explicit-member-accessibility": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/no-parameter-properties": 0,
        "@typescript-eslint/interface-name-prefix": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
    }
};
