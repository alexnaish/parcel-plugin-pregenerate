const path = require('path');
const fs = require('fs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const cheerio = require('cheerio');

const Bundler = require('parcel');
const DefaultHTML = require('parcel/src/packagers/HTMLPackager');

const defaultOptions = {
  entryFile: 'static.js',
  exportedName: 'default',
  removeFilesOnCompletion: true
};

module.exports = class extends DefaultHTML {
  async staticBundle(asset) {

    const { pregenerate = {} } = await this.bundle.entryAsset.getPackage();
    const options = Object.assign({}, defaultOptions, pregenerate);
    const { rootDir } = this.options;

    global.location = { pathname: '/' };

    const newBundler = new Bundler(path.join(rootDir, options.entryFile), { target: 'node', sourceMaps: false, logLevel: 2 });
    const result = await newBundler.bundle();

    const Static = require(result.name)[options.exportedName];
    const markup = renderToStaticMarkup(React.createElement(Static, {}, null));

    const $ = cheerio.load(asset.generated.html);
    $('#root').html(markup);
    asset.generated.html = $.html();


    if (options.removeFilesOnCompletion) {
      const filesToDelete = new Set([
        result.name,
        ...Array.from(result.childBundles).map(bundle => bundle.name),
        ...Array.from(result.siblingBundles).map(bundle => bundle.name),
      ]);
      filesToDelete.forEach(filePath => fs.unlinkSync(filePath))
    }

  }

  async addAsset(asset) {
    if (this.bundler.entryFiles.includes(asset.name)) {
      console.log('\n', '💥', `plugin-pregenerate: Processing entry file "${asset.basename}"`);
      await this.staticBundle(asset);
    }

    return await super.addAsset(asset);
  }
}
