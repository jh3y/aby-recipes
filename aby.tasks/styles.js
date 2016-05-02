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
      'stylus',
      'winston'
    ],
    func: (fs, m, nano, p, postcss, s, w, instance) => {
      'use strict';
      const src = instance.config.paths.sources;
      const dest = instance.config.paths.destinations;
      let outputPath = `${dest.styles}${instance.config.name}.css`;
      const stylString = fs.readFileSync(src.styles, 'utf-8');
      s(stylString)
        .set('paths', [
          `${p.dirname(src.styles)}`
        ])
        .render((err, css) => {
          m(p.dirname(outputPath), (err) => {
            if (err) throw Error(err);
            fs.writeFileSync(outputPath, css);
            if (instance.env === 'dist') {
              const nanoOpts = instance.config.pluginOpts.cssnano;
              outputPath = outputPath.replace('.css', '.min.css');
              postcss([ nano(nanoOpts) ])
                .process(css, {})
                .then(function(result) {
                  fs.writeFileSync(outputPath, result.css);
                });
            }
            instance.resolve();
          });
        });
    }
  },
  {
    name: 'lint:styles',
    doc: 'lint style src',
    deps: [
      'fs',
      'stylint',
      'winston'
    ],
    func: (fs, s, w, instance) => {
      'use strict';
      const rc = JSON.parse(fs.readFileSync('.stylintrc', 'utf-8'));
      s('src/stylus/', rc)
        .methods({
          done: function () {
            if (this.cache.errs && this.cache.errs.length) {
              let errorMsg = '';
              for (const error of this.cache.errs)
                errorMsg += `\n\n${error}\n`;
              w.error(errorMsg);
            }
            if (this.cache.warnings && this.cache.warnings.length) {
              let warningMsg = '';
              for (const warning of this.cache.warnings)
                warningMsg += `\n\n${warning}\n`;
              w.warn(warningMsg);
            }
            instance.resolve();
          }
        })
        .create();
    }
  },
  {
    name: 'watch:styles',
    doc: 'watch and compile style files',
    deps: [
      'winston',
      'gaze'
    ],
    func: function(w, g, b) {
      g('src/**/*.styl', (err, watcher) => {
        watcher.on('changed', function(file) {
          w.info(`${file} changed!`);
          b.run('compile:styles');
        });
      });
    }
  }
];
