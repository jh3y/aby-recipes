module.exports = [
  {
    name: 'compile:styles',
    doc : 'compiles Stylus',
    deps: [
      'fs',
      'mkdirp',
      'cssnano',
      'path',
      'postcss',
      'stylus'
    ],
    func: (fs, mkdirp, nano, path, postcss, stylus, aby) => {
      'use strict';
      const src = aby.config.paths.sources,
        dest = aby.config.paths.destinations,
        stylString = fs.readFileSync(src.styles, 'utf-8');
      let outputPath = `${dest.styles}${aby.config.name}.css`;
      stylus(stylString)
        .set('paths', [
          `${path.dirname(src.styles)}`
        ])
        .render((err, css) => {
          mkdirp(path.dirname(outputPath), (err) => {
            if (err) aby.reject(err);
            fs.writeFileSync(outputPath, css);
            if (aby.env === 'dist') {
              const nanoOpts = aby.config.pluginOpts.cssnano;
              outputPath = outputPath.replace('.css', '.min.css');
              postcss([ nano(nanoOpts) ])
                .process(css, {})
                .then(function(result) {
                  fs.writeFileSync(outputPath, result.css);
                });
            }
            aby.resolve();
          });
        });
    }
  },
  {
    name: 'lint:styles',
    doc: 'lint style src',
    deps: [
      'fs',
      'stylint'
    ],
    func: (fs, stylint, aby) => {
      'use strict';
      const rc = JSON.parse(fs.readFileSync('.stylintrc', 'utf-8'));
      stylint('src/stylus/', rc)
        .methods({
          done: function () {
            if (this.cache.errs && this.cache.errs.length) {
              let errorMsg = '';
              for (const error of this.cache.errs)
                errorMsg += `\n\n${error}\n`;
              aby.log.error(errorMsg);
            }
            if (this.cache.warnings && this.cache.warnings.length) {
              let warningMsg = '';
              for (const warning of this.cache.warnings)
                warningMsg += `\n\n${warning}\n`;
              aby.log.warn(warningMsg);
            }
            aby.resolve();
          }
        })
        .create();
    }
  },
  {
    name: 'watch:styles',
    doc: 'watch and compile style files',
    deps: [
      'gaze'
    ],
    func: function(gaze, aby) {
      gaze('src/**/*.styl', (err, watcher) => {
        watcher.on('changed', function(file) {
          aby.log.info(`${file} changed!`);
          aby.run('compile:styles');
        });
      });
    }
  }
];
