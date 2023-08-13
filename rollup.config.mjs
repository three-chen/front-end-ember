import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve';

// rollup.config.mjs
export default {
    input: 'src/index.js',
    output: {
        name: 'Ember',
        file: './dist/umd/ember.js',
        format: 'umd',
        sourcemap: true,
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        commonjs(),
        serve({
            contentBase: '',
            port: 8080,
            open: true
        })
    ]
};