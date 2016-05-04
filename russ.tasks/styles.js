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
    func: (fs, mkdirp, nano, path, postcss, stylus, russ) => {
      'use strict';
      const src = russ.config.paths.sources,
        dest = russ.config.paths.destinations,
        stylString = fs.readFileSync(src.styles, 'utf-8');
      let outputPath = `${dest.styles}${russ.config.name}.css`;
      stylus(stylString)
        .set('paths', [
          `${path.dirname(src.styles)}`
        ])
        .render((err, css) => {
          mkdirp(path.dirname(outputPath), (err) => {
            if (err) russ.reject(err);
            fs.writeFileSync(outputPath, css);
            if (russ.env === 'dist') {
              const nanoOpts = russ.config.pluginOpts.cssnano;
              outputPath = outputPath.replace('.css', '.min.css');
              postcss([ nano(nanoOpts) ])
                .process(css, {})
                .then(function(result) {
                  fs.writeFileSync(outputPath, result.css);
                });
            }
            russ.resolve();
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
    func: (fs, stylint, russ) => {
      'use strict';
      const rc = JSON.parse(fs.readFileSync('.stylintrc', 'utf-8'));
      stylint('src/stylus/', rc)
        .methods({
          done: function () {
            if (this.cache.errs && this.cache.errs.length) {
              let errorMsg = '';
              for (const error of this.cache.errs)
                errorMsg += `\n\n${error}\n`;
              russ.log.error(errorMsg);
            }
            if (this.cache.warnings && this.cache.warnings.length) {
              let warningMsg = '';
              for (const warning of this.cache.warnings)
                warningMsg += `\n\n${warning}\n`;
              russ.log.warn(warningMsg);
            }
            russ.resolve();
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
    func: function(gaze, russ) {
      gaze('src/**/*.styl', (err, watcher) => {
        watcher.on('changed', function(file) {
          russ.log.info(`${file} changed!`);
          russ.run('compile:styles');
        });
      });
    }
  }
];
