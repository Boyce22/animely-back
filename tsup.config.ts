import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  replaceNodeEnv: true,
  clean: true,
  keepNames: false,
  minify: false,
  shims: true,
  splitting: false,
  bundle: true,
});
