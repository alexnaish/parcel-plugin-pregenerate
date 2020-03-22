const cheerio = require('cheerio');

module.exports = bundler => {
  if (!bundler.options.watch) {
    bundler.addPackager('html', require.resolve('./generate'));
  }
};
