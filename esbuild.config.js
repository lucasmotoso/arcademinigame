// esbuild.config.js - Build configuration for Arcade Mini Game
const esbuild = require('esbuild');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const outdir = path.join(__dirname, 'dist');

const options = {
  entryPoints: ['src/index.js'],
  bundle: true,
  outdir,
  minify: isProduction,
  sourcemap: !isProduction,
  target: ['es2020'],
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      isProduction ? 'production' : 'development'
    ),
  },
  loader: {
    '.js': 'jsx',
  },
};

if (process.argv.includes('--watch')) {
  esbuild
    .context(options)
    .then((ctx) => {
      console.log('👀 Watching for changes...');
      return ctx.watch();
    })
    .catch(() => process.exit(1));
} else {
  esbuild
    .build(options)
    .then(() => {
      console.log('✓ Build completed successfully!');
    })
    .catch(() => process.exit(1));
}
