/*
  Script: select_autocompleter.js
    SelectoAutocompleter provides a way to make editable combo box (a select tag in HTML).

  License:
    MIT-style license.
*/

/*
  Class: SelectAutocompleter
  
    To activate the control, call `new SelectAutocompleter(element, options)` on any `<select>` 
    tag you would like to replace.  Your server will receive the same response as if the `<select>` 
    was not replaced, so no backend work is needed.

    Any class names on the `<select>` element will be carried over to the `<input>` that replaces 
    it as well as the `<ul>` containing the results.


  Options:

    cutoffScore:          A decimal between 0 and 1 determining what Quicksilver score to cut off results 
                          for. Default is 0.1. Use higher values to show more relevant, but less results.
                          
    template:             A string describing the template for the drop down list item. Default variables 
                          available: rawText, highlightedText.  Default value is "{highlightedText}"  
                          Use in conjunction with templateAttributes to build rich autocomplete lists.
                          
    templateAttributes:   An array of attributes on the `<option>` element SelectAutocompleter should use 
                          for its template
*/
var SelectAutocompleter = new Class({
  Implements: [Events, Options],
  
  options:{
    cutoffScore: 0.1,
    templateAttributes: [],
    template: "{highlightedText}"
  },
  
  select: null,
  // The input element to autocomplete on
  element: null,
  // The element containing the autocomplete results
  dropDown: null,
  // JSON object containing key/value for autocompleter
  data: {},
  // Contains all the searchable terms (strings)
  terms: [],
  
  // Contains the current filtered terms from the quicksilver search
  filteredTerms: [],
  
  initialize: function(select, options){
    this.select = $(select);
    this.setOptions(options)
    
    // Setup the autocompleter element
    var wrapper = new Element('div', {'class': 'autocomplete'});
    this.element = new Element('input', {'class': 'textfield ' + this.select.className});
    this.dropDown = new Element('ul', {'class': 'auto-dropdown ' + this.select.className});
    this.dropDown.setStyle('display', 'none');
    this.element.addEvent('focus', this.onFocus.bind(this));
    this.element.addEvent('blur', function(){ this.onBlur.delay(100, this); }.bind(this));
    this.element.addEvent('keyup', this.keyListener.bind(this));
    
    
    // Hide the select tag
    this.select.setStyle('display', 'none');
    wrapper.appendChild(this.element);
    wrapper.appendChild(this.dropDown);
    wrapper.inject(this.select, 'after');
    
    // Gather the data from the select tag
    this.select.getElements('option').each(function(option){
      var dataItem = {}
      this.options.templateAttributes.each(function(attr){
        dataItem[attr] = option.getAttribute(attr);
      });
      this.data[option.get('text')] = $merge(dataItem, {value: option.value});
      
      this.terms.push(option.get('text'));
    }, this);
    
    // Prepopulate the select tag's selected option
    this.element.set('value', $(this.select.options[this.select.selectedIndex]).get('text'));
  },
  
  onFocus: function(){
    this.element.set('value', '');
    this.dropDown.setStyle('display', '');
    this.updateTermsList();
    
    this.fireEvent('onFocus');
  },
  
  onBlur: function(){
    this.dropDown.setStyle('display', 'none');
    
    if (this.termChosen != null){
      this.element.set('value', this.termChosen);
      this.select.set('value', this.data[this.termChosen].value);
    }else{
      this.element.set('value', $(this.select.options[this.select.selectedIndex]).get('text'));      
    }
    
    this.fireEvent('onBlur');
  },
  
  keyListener: function(event){
    // Escape means we want out!
    if (event.key == "esc"){
      this.onBlur();
      this.element.blur();
    
    // Up/Down arrows to navigate the list
    }else if(event.key == "up" || event.key == "down"){
      var choices = this.dropDown.getElements('li');
      if (choices.length == 0) return;
      
      // If there's no previous choice, or the current choice has been filtered out
      if (this.highlightedChoice == null || choices.indexOf(this.highlightedChoice) == -1){
        this.highlight(choices[0]);
        return;
      }
      
      switch(event.key){
        case "up":
          // Are we at the top of the list already?
          if (choices.indexOf(this.highlightedChoice) == 0){
            this.highlight(choices[0]);
          // Otherwise, move down one choice
          }else{
            this.highlight(choices[choices.indexOf(this.highlightedChoice) - 1]);
          }
        break;
        case "down":
          // Are we at the bottom of the list already?
          if(choices.indexOf(this.highlightedChoice) == choices.length - 1){
            this.highlight(choices[choices.length - 1]);
          // Otherwise, move up one choice
          }else{
            this.highlight(choices[choices.indexOf(this.highlightedChoice) + 1]);
          }
        break;
      }
    
    // Select an item through the keyboard
    }else if (event.key == "return" || event.key == "enter"){
      this.termChosen = this.highlightedChoice.getAttribute('rawText');
      this.element.blur();
      
    // Regular keys (filtering for something)
    }else{
      this.updateTermsList();
    }
  },
  
  highlight: function(elem){
    if (this.highlightedChoice) this.highlightedChoice.removeClass('highlighted');
    this.highlightedChoice = elem.addClass('highlighted');
  },
  
  updateTermsList: function(){
    var filterValue = this.element.get('value');
    this.buildFilteredTerms(filterValue);
    
    this.dropDown.empty();
    
    var letters = []
    for(var i=0; i<filterValue.length; i++){
      var letter = filterValue.substr(i, 1);
      if (!letters.contains(letter)) letters.push(letter);
    }
    
    this.filteredTerms.each(function(scoredTerm){
      
      
      // Build the regular expression for highlighting matching terms
      var regExpString = ""
      letters.each(function(letter){
        regExpString += letter;
      });
      
      // Build a formatted string highlighting matches with <strong>
      var formattedString = scoredTerm[1];
      var regexp = new RegExp("([" + regExpString + "])", "ig");
      formattedString = formattedString.replace(regexp, "<strong>$1</strong>");
      
      // Build the template
      var template = {
        highlightedText: formattedString,
        rawText: scoredTerm[1]
      }
      this.options.templateAttributes.each(function(attr){
        template["attr" + attr.capitalize()] = this.data[template.rawText][attr];
      }, this);
      
      // Build the output element for the dropDown
      var choice = new Element('li');
      choice.innerHTML =  this.options.template.substitute(template);
      choice.setAttribute('rawText', scoredTerm[1]);
      
      choice.addEvent('click', function(){
        this.termChosen = scoredTerm[1];
      }.bind(this));
      choice.addEvent('mouseover', this.highlight.bind(this, choice));
      
      this.dropDown.appendChild(choice);
    }, this);
  },
  
  buildFilteredTerms: function(filter){
    this.filteredTerms = [];
    
    // Build the terms
    this.terms.each(function(term){
      var score = term.toLowerCase().score(filter.toLowerCase())
      if (score < this.options.cutoffScore) return;
      this.filteredTerms.push([score, term]);
    }, this);
    
    // Sort the terms
    this.filteredTerms.sort(function(a, b) { return b[0] - a[0]; });
  }
});