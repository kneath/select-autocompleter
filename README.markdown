# SelectAutocompleter

SelectAutocomplter is a plugin for MooTools (1.2) that provides a way to create an editable `<select>`.  It works by replacing a `<select>` in your document with a text field that uses the Quicksilver filtering algorithm to narrow down results.

![Example Image](http://github.com/kneath/select-autocompleter/tree/master/examples/example_image.png?raw=true_)

### Recommended Uses:

* User lists
* Company lists
* Dropdowns with many items

The Javascript is 100% unobtrusive and will fall back to a `<select>` tag for users without Javascript enabled. It's keyboard accessible and will respond to up/down arrow and enter/return keys as expected.

## How to use

To activate the control, call `new SelectAutocompleter(element, options)` on any `<select>` tag you would like to replace.  Your server will receive the same response as if the `<select>` was not replaced, so no backend work is needed.
  
Any class names on the `<select>` element will be carried over to the `<input>` that replaces it as well as the `<ul>` containing the results.

### Options

* **cutoffScore** - A decimal between 0 and 1 determining what Quicksilver score to cut off results for. Default is 0.1. Use higher values to show more relevant, but less results.
* **template** - A string describing the template for the drop down list item. Default variables available: rawText, highlightedText.  Default value is "{highlightedText}"  Use in conjunction with templateAttributes to build rich autocomplete lists.
* **templateAttributes** - An array of attributes on the `<option>` element SelectAutocompleter should use for its template

### Events

There are two events mixed in - onFocus (when the autocompleter takes focus) and onBlur (when the autocompleter loses focus)

### Example

See `index.html` for a working example.

## License

License is MIT. See LICENSE file.

## Todo

* Need to refactor the keyboardListener function, it's messy
* Add a trigger to show the list without typing in the box (similar to clicking the down arrow on a select field)
* Add in effects to make it smoother
* Test thoroughly