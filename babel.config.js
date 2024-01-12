// module.exports = {
//   presets: [['@babel/preset-env', { modules: false }], ['@vue/babel-preset-jsx']],
//   plugins: [
//     [
//       'component',
//       {
//         libraryName: 'element-ui',
//         styleLibraryName: 'theme-chalk',
//       },
//     ],
//     [
//       'import',
//       {
//         libraryName: 'view-design',
//         libraryDirectory: 'src/components',
//       },
//     ],
//   ],
// };
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    [
      '@babel/preset-env',
      {
        modules: false, // 控制是否transform es Modules，默认使用commonJS的形式，如果传入false则不启用
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    [
      'import',
      {
        libraryName: 'view-design',
        libraryDirectory: 'src/components',
      },
    ],
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk',
      },
    ],
  ],
  ignore: [/\/core-js/],
};
