# Census Index

This project contains a series of json object that describe the collections of Census.

## Usage

Main properties:

- `collection` name of the collection(same as the filename);
- `format` all the properties of the model*;
- `conditions` parameters that can be used to search**.

*when an object is wrapped in an array it means it is a list of said object.

**keys ending with a question mark are optional. The question mark is not part of the path.

### Others

The `resolve` property is an optional object where the keys represent the value used in the resolve command. The
associated value is the equivalent join. There is one caveat, when the `inject_at` property is missing it means it is
merged at the root.
