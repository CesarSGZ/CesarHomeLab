# Vendored browser dependency

- `three.module.min.js`: Three.js 0.185.1
- `three.core.min.js`: Three.js 0.185.1 core imported by the module build
- `OrbitControls.js`: Three.js 0.185.1 example module
- `THREE-LICENSE.txt`: upstream MIT license

These files are served locally so Mission Control does not contact a CDN at
runtime. `../thermal-viewer.bundle.js` packages these dependencies into one
classic browser script so authentication and MIME handling cannot interrupt a
module dependency chain. Update the source files together from the official
`three` npm package, then rebuild the bundle.
