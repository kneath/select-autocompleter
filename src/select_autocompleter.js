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
var SelectAutocompleter = Class.create({
  
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
    // For some reason Prototype's classes bleed (?!)
    this.select = null;
    this.element = null;
    this.dropDown = null;
    this.data = {};
    this.terms = [];
    
    // Setup
    this.select = $(select);
    this.setOptions(options);
    
    // Convert MooTools type templates to Prototype type templates
    this.options.template = this.options.template.replace(/{([A-Za-z0-9]+)}/g, "#{$1}");
    
    // Setup the autocompleter element
    var wrapper = new Element('div', {'class': 'autocomplete'});
    this.element = new Element('input', {'class': 'textfield ' + this.select.className});
    this.dropDown = new Element('ul', {'class': 'auto-dropdown ' + this.select.className});
    this.dropDown.hide();
    this.element.observe('focus', this.onFocus.bind(this));
    this.element.observe('blur', function(){ this.onBlur.delay(100, this); }.bind(this));
    this.element.observe('keyup', this.keyListener.bind(this));
    
    
    // Hide the select tag
    this.select.hide();
    wrapper.appendChild(this.element);
    wrapper.appendChild(this.dropDown);
    this.select.insert({'after':wrapper});
    
    // Gather the data from the select tag
    this.select.getElementsBySelector('option').each(function(option){
      var dataItem = {}
      this.options.templateAttributes.each(function(attr){
        dataItem[attr] = option.getAttribute(attr);
      });
      var text = option.innerHTML.strip();
      this.data[text] = $H(dataItem).merge({value: option.value}).toObject();
      
      this.terms.push(text);
    }.bind(this));
    
    // Prepopulate the select tag's selected option
    this.element.value =  $(this.select.options[this.select.selectedIndex]).innerHTML.strip();
  },
  
  setOptions: function(options){
    this.options = $H(this.options).merge(options).toObject();
  },
  
  onFocus: function(){
    this.element.value = '';
    this.dropDown.show();
    this.updateTermsList();
  },
  
  onBlur: function(){
    this.dropDown.hide();
    if (this.termChosen != null){
      this.element.value = this.termChosen;
      this.select.value = this.data[this.termChosen].value;
    }else{
      this.element.value = $(this.select.options[this.select.selectedIndex]).innerHTML.strip();
    }
    
  },
  
  keyListener: function(event){
    var keyPressed = event.keyCode || event.which; // Alas, Prototype.
    
    // Escape means we want out!
    if (keyPressed == Event.KEY_ESC){
      this.onBlur();
      this.element.blur();
    
    // Up/Down arrows to navigate the list
    }else if(keyPressed == Event.KEY_UP || keyPressed == Event.KEY_DOWN){
      var choices = this.dropDown.getElementsBySelector('li');
      if (choices.length == 0) return;
      
      // If there's no previous choice, or the current choice has been filtered out
      if (this.highlightedChoice == null || choices.indexOf(this.highlightedChoice) == -1){
        this.highlight(choices[0]);
        return;
      }
      
      switch(keyPressed){
        case Event.KEY_UP:
          // Are we at the top of the list already?
          if (choices.indexOf(this.highlightedChoice) == 0){
            this.highlight(choices[0]);
          // Otherwise, move down one choice
          }else{
            this.highlight(choices[choices.indexOf(this.highlightedChoice) - 1]);
          }
        break;
        case Event.KEY_DOWN:
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
    }else if (keyPressed == Event.KEY_RETURN || keyPressed == Event.KEY_ENTER){
      event.stop(); // to prevent the form from being submitted
      this.termChosen = this.highlightedChoice.getAttribute('rawText');
      this.onBlur();
      this.element.blur();
      
    // Regular keys (filtering for something)
    }else{
      this.updateTermsList();
    }
  },
  
  highlight: function(elem){
    if (this.highlightedChoice) this.highlightedChoice.removeClassName('highlighted');
    this.highlightedChoice = elem.addClassName('highlighted');
  },
  
  updateTermsList: function(){
    var filterValue = this.element.value;
    this.buildFilteredTerms(filterValue);
    
    this.dropDown.update('');
    
    var letters = []
    for(var i=0; i<filterValue.length; i++){
      var letter = filterValue.substr(i, 1);
      if (letters.indexOf(letter) == -1) letters.push(letter);
    }
    
    this.filteredTerms.each(function(scoredTerm){
      
      // Build the regular expression for highlighting matching terms
      var regExpString = ""
      letters.each(function(letter){
        regExpString += letter;
      });
      
      // Build a formatted string highlighting matches with <strong>
      var formattedString = scoredTerm[1];
      if (filterValue.length > 0){
        var regexp = new RegExp("([" + regExpString + "])", "ig");
        formattedString = formattedString.replace(regexp, "<strong>$1</strong>");
      }
      
      // Build the template
      var template = {
        highlightedText: formattedString,
        rawText: scoredTerm[1]
      }
      this.options.templateAttributes.each(function(attr){
        template["attr" + attr.capitalize()] = this.data[template.rawText][attr];
      }.bind(this));
      
      // Build the output element for the dropDown
      var choice = new Element('li');
      choice.innerHTML =  this.options.template.interpolate(template);
      choice.setAttribute('rawText', scoredTerm[1]);
      
      choice.observe('click', function(){
        this.termChosen = scoredTerm[1];
        this.onBlur();
      }.bind(this));
      choice.observe('mouseover', this.highlight.bind(this, choice));
      
      this.dropDown.appendChild(choice);
    }.bind(this));
  },
  
  buildFilteredTerms: function(filter){
    this.filteredTerms = [];
    
    // Build the terms
    this.terms.each(function(term){
      var score = term.toLowerCase().score(filter.toLowerCase())
      if (score < this.options.cutoffScore) return;
      this.filteredTerms.push([score, term]);
    }.bind(this));
    
    // Sort the terms
    this.filteredTerms.sort(function(a, b) { return b[0] - a[0]; });
  }
});