import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "**/tests/e2e/**"],
    coverage: {
      provider: "v8",
      include: [
        "src/utils/**/*.ts",
        "src/data/**/*.ts",
        "src/lib/random.ts",
        "src/lib/seo.ts",
        "src/lib/audio/voiceMoods.ts",
        "src/lib/audio/speechPhrases.ts",
        "src/lib/lessonPhase.ts",
      ],
      exclude: ["**/*.test.ts", "src/utils/audio.ts"],
      reporter: ["text", "lcov", "html"],
      thresholds: {
        statements: 97,
        branches: 90,
        functions: 100,
        lines: 99,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
