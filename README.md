# parcel-plugin-pregenerate

A Parcel plugin that allows pre-generating and inserting markup into your index.html. No assumptions made!

## Installation

```bash
npm install -D parcel-plugin-pregenerate
```


## Configuration

### entryFile

The name of the file to render and insert. Defaults to `static.js`.

### entryDirectory

The directory location of the entryFile. Defaults to the directory of your HTML entry file.

### exportedName

The name of the export for the component within the `entryFile`. Defaults to `default`.

### targetSelector

The querySelector to inject the rendered markup into within your HTML entry file. Defaults to `#root`.

### removeFilesOnCompletion

Whether to delete the generated files after processing. Defaults to `true`.


## Contributing
Pull requests are very welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.