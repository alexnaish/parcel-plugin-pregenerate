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

global.location = { pathname: '/' };

module.exports = async (bundler) => {

  // If you're in watch mode - you're developing so skip
  if (bundler.options.watch) {
    return;
  }

  bundler.on('bundled', async ({ name, entryAsset }) => {

    // Merge package.json pregenerate config block with default options
    const { pregenerate = {} } = await entryAsset.getPackage();
    const options = Object.assign({}, defaultOptions, pregenerate);
    const { rootDir } = bundler.options;

    // If the file just bundled was our template file - proceed
    if (name.includes(options.templateFile)) {

      // Bundle and transform the file to generate
      const newBundler = new Bundler(path.join(rootDir, options.entryFile), { target: 'node', sourceMaps: false, logLevel: 2 });
      const result = await newBundler.bundle();

      // Render the resulting file to static HTML
      const Static = require(result.name)[options.exportedName];
      const markup = renderToStaticMarkup(React.createElement(Static, {}, null));

      // Update HTML template
      const $ = cheerio.load(entryAsset.generated.html);
      $(options.rootElement).html(markup);
      entryAsset.generated.html = $.html();

      // Clean up temporary files
      if (options.removeFilesOnCompletion) {
        const filesToDelete = new Set([
          result.name,
          ...Array.from(result.childBundles).map(bundle => bundle.name),
          ...Array.from(result.siblingBundles).map(bundle => bundle.name),
        ]);
        filesToDelete.forEach(filePath => fs.unlinkSync(filePath))
      }

      // Update the HTML file
      fs.writeFileSync(name, entryAsset.generated.html);

    }

  });
};
