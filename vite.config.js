import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { minify } from 'html-minifier-terser';

export default defineConfig({
  root: 'public',
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true
    }),
    {
      apply: 'build',
      enforce: 'post',
      async generateBundle(_, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === 'asset' && file.fileName.endsWith('.html')) {
            file.source = await minify(file.source.toString(), {
              collapseWhitespace: true,
              removeComments: true,
              minifyCSS: true,
              minifyJS: true
            });

            file.source = file.source.replace(/\n+/g, '');
            file.fileName = 'app.html';
          }
        }
      }
    }
  ],
  build: {
    outDir: '../dist',
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: false,
    modulePreload: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined
      }
    }
  }
});