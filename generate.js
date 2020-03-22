const Path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const Bundler = require('parcel');
const DefaultHTML = require('parcel/src/packagers/HTMLPackager');

const staticFilePattern = /static\.js$/;

module.exports = class extends DefaultHTML {
  async staticBundle(asset) {
    const { rootDir } = this.options;

    process.env.NODE_ENV = 'NOT_PROD';
    const newBundler = new Bundler(Path.join(rootDir, 'static.js'), { sourceMaps: false });
    const result = await newBundler.bundle();

    const Static = require(result.name).default;

    const markup = renderToStaticMarkup(React.createElement(Static, {}, null));
    console.log('==================');
    console.log('markup', markup);
    console.log('==================');
  }

  async addAsset(asset) {
    if (this.bundler.entryFiles.includes(asset.name)) {
      console.log('\n', '💥', `react-prerender: Beginning bundle of entry file ${asset.name}`);
      await this.staticBundle(asset);
    }

    return await super.addAsset(asset);
  }
}
