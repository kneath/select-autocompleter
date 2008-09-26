/*
Script: specs.js
	Specs for SelectAutocompleter

License:
	MIT-style license.
*/

describe("SelectAutocompleter Initialization", {
  'before all': function(){
    var html = '<select id="autocomplete" class="testClass">'
      + '  <option value="NULL">Select a name...</option>'
      + '  <option value="0">Kamren Boyer</option>'
      + '  <option value="1">Jadon Schiller</option>'
      + '  <option value="2">Boyd Hilpert</option>'
      + '  <option value="3">Thalia Cole II</option>'
      + '  <option value="4">Felix Wintheiser</option>'
      + '</select>';
    document.body.appendChild(new Element('div', {id: 'autoCompleterWrapper', style:'display:none', html: html}))
    Instance = new SelectAutocompleter('autocomplete');
    wrapper = $('autoCompleterWrapper');
  },
  'after all': function(){
    $('autoCompleterWrapper').remove();
  },
  
  
  'should hide the original select tag': function(){
    value_of($('autocomplete').getStyle('display')).should_be('none');
  },
  'sshould create an autocomplete div wrapper': function(){
    value_of(wrapper.getElements('div.autocomplete')).should_have_exactly(1, "items");
  },
  'should create an input element': function(){
    value_of(wrapper.getElements('.autocomplete input')).should_have_exactly(1, "items");
  },
  'should create a dropdown list': function(){
    value_of(wrapper.getElements('ul.auto-dropdown')).should_have_exactly(1, "items");
  },
  'should hide the dropdown list on construction': function(){
    value_of(wrapper.getElement('ul.auto-dropdown').getStyle('display')).should_be('none');
  },
  'should carry classes over to input element': function(){
    var input = wrapper.getElement('input');
    value_of(input.hasClass('testClass')).should_be_true();
    value_of(input.hasClass('textfield')).should_be_true();
  },
  'should carry classes over to dropdown element': function(){
    var input = wrapper.getElement('ul.auto-dropdown');
    value_of(input.hasClass('testClass')).should_be_true();
  }
});