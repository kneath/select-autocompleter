/*
Script: specs.js
	Specs for SelectAutocompleter

License:
	MIT-style license.
*/

describe("SelectAutocompleter Initialization", {
  'before all': function(){
    var html = '<select id="autocomplete">'
      + '  <option value="NULL">Select a name...</option>'
      + '  <option value="0">Kamren Boyer</option>'
      + '  <option value="1">Jadon Schiller</option>'
      + '  <option value="2">Boyd Hilpert</option>'
      + '  <option value="3">Thalia Cole II</option>'
      + '  <option value="4">Felix Wintheiser</option>'
      + '</select>';
    document.body.appendChild(new Element('div', {id: 'autoCompleterWrapper', style:'display:none', html: html}))
    Instance = new SelectAutocompleter('autocomplete');
  },
  
  
  'should hide the original select tag': function(){
    value_of($('autocomplete').getStyle('display')).should_be('none');
  }
});