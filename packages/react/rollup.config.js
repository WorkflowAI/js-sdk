import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts', // entry point of your library
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(), // automatically externalize peerDependencies in package.json
    resolve(), // resolves node_modules packages
    commonjs(), // converts CommonJS modules to ES6
    typescript({ tsconfig: './tsconfig.json' }),
    postcss({
      modules: true, // enable CSS modules
      sourceMap: true,
      minimize: true, // minify CSS if desired
      // Inline CSS for now
      extract: false,
      inject: true,
    }),
  ],
};
