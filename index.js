const path = require('path');
const fs = require('fs');

const Bundler = require('parcel');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const cheerio = require('cheerio');

const defaultOptions = {
  templateFile: 'index.html',
  rootElement: '#root',
  entryFile: 'static.js',
  exportedName: 'default',
  removeFilesOnCompletion: true
};

const NOOP = () => {};
const storageMock = { getItem: NOOP, setItem: NOOP, clear: NOOP };

global.location = { pathname: '/' };
global.localStorage = storageMock;
global.sessionStorage = storageMock;

module.exports = async (bundler) => {
  // If you're in watch mode - you're developing so skip
  if (bundler.options.watch) {
    return;
  }


  bundler.on('buildEnd', async () => {
    // Merge package.json pregenerate config with default options
    const { name, entryAsset } = bundler.mainBundle;
    const { pregenerate = {} } = await entryAsset.getPackage();
    const options = Object.assign({}, defaultOptions, pregenerate);
    const { rootDir } = bundler.options;

    // If this build wasn't for the template - skip over it
    if (!name.includes(options.templateFile)) {
      return;
    }

    // Bundle and transform the file to generate
    const newBundler = new Bundler(path.join(rootDir, options.entryFile), { target: 'node', sourceMaps: false, logLevel: 2 });
    const result = await newBundler.bundle();

    // Render the resulting file to static HTML
    const Static = require(result.name)[options.exportedName];
    const markup = renderToStaticMarkup(React.createElement(Static, {}, null));

    // Update HTML template
    const existingHtml = fs.readFileSync(name);
    const $ = cheerio.load(existingHtml);
    $(options.rootElement).html(markup);
    entryAsset.generated.html = $.html();
    fs.writeFileSync(name, $.html());

    // Clean up temporary files
    if (options.removeFilesOnCompletion) {
      const filesToDelete = new Set([
        result.name,
        ...Array.from(result.childBundles).map(bundle => bundle.name),
        ...Array.from(result.siblingBundles).map(bundle => bundle.name),
      ]);
      filesToDelete.forEach(filePath => fs.unlinkSync(filePath))
    }

  });
};
