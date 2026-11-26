import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "oxc"],
  options: { typeAware: true },
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
  },
  rules: {
    curly: "warn",
    eqeqeq: ["warn", "smart"],
    "no-var": "warn",
    "unicorn/prefer-node-protocol": "warn",
  },
});
