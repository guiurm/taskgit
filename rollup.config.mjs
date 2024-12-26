import resolve from "@rollup/plugin-node-resolve";
import { dts } from "rollup-plugin-dts";

export default [
    /*{
        input: "src/main.ts",
        output: {
            dir: "dist/mjs",
            format: "esm",
            entryFileNames: "main.mjs",
        },
        plugins: [typescript({ declaration: false, tsconfig: "./tsconfig.json" })],
    },*/
    {
        input: "build/index.js",
        output: [
            {
                dir: "dist",
                format: "esm",
                entryFileNames: "index.mjs",
            },
            {
                dir: "dist",
                format: "cjs",
                entryFileNames: "index.cjs",
            },
        ],
        plugins: [resolve()],
        // external: ["@guiurm/termify", "@guiurm/askly"],
    },
    {
        input: "build/index.d.ts",
        output: [{ file: "dist/main.d.ts", format: "es" }],
        plugins: [dts()],
    },
];
