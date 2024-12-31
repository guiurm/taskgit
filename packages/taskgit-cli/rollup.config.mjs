import resolve from "@rollup/plugin-node-resolve";

export default [
    {
        input: "build/index.js",
        output: [
            {
                dir: "../../dist",
                format: "cjs",
                entryFileNames: "cli.cjs",
            },
        ],
        plugins: [resolve()],
    },
];
