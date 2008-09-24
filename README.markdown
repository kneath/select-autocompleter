# SelectAutoCompleter

SelectAutoComplter is a plugin for MooTools (1.2) that provides a way to create an editable `<select>`.  It works by replacing a `<select>` in your document with a text field that uses the Quicksilver filtering algorithm to narrow down results.

![Example Image](http://github.com/kneath/select-autocompleter/tree/master/example_image.png?raw=true_)

### Recommended Uses:

* User lists
* Company lists
* Dropdowns with many items

The Javascript is 100% unobtrusive and will fall back to a `<select>` tag for users without Javascript enabled. It's keyboard accessible and will respond to up/down arrow and enter/return keys as expected.

## How to use

Usage is simple. Just call `new SelectAutoCompleter(element)` on any `<select>` tag you would like to replace.  Your server will receive the same response as if the `<select>` was not replaced, so no backend work is needed.

See `index.html` for a working example.

## License

License is MIT. See LICENSE file.

## Todo

* Need to refactor the keyboardListener function, it's messy
* Add a trigger to show the list without typing in the box (similar to clicking the down arrow on a select field)
* Add in effects to make it smoother
* Test thoroughly