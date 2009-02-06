/*
Script: specs.js
	Specs for SelectAutocompleter

License:
	MIT-style license.
*/

var setupHTML = function(){
  var html = '<select id="autocomplete" class="testClass">'
    + '  <option value="NULL">Select a name...</option>'
    + '  <option value="0">Kamren Boyer</option>'
    + '  <option value="1">Jadon Schiller</option>'
    + '  <option value="2">Boyd Hilpert</option>'
    + '  <option value="3">Thalia Cole II</option>'
    + '  <option value="4">Felix Wintheiser</option>'
    + '</select>';
  document.body.appendChild(new Element('div', {id: 'autoCompleterWrapper', style:'display:none'}).update(html))
}

describe("Initialization", {
  'before all': function(){
    setupHTML();
    Instance = new SelectAutocompleter('autocomplete');
    wrapper = $('autoCompleterWrapper');
  },
  'after all': function(){
    $('autoCompleterWrapper').remove();
  },
  
  
  'should hide the original select tag': function(){
    value_of($('autocomplete').getStyle('display')).should_be('none');
  },
  'should create an autocomplete div wrapper': function(){
    value_of(wrapper.getElementsBySelector('div.autocomplete')).should_have_exactly(1, "items");
  },
  'should create an input element': function(){
    value_of(wrapper.getElementsBySelector('.autocomplete input')).should_have_exactly(1, "items");
    value_of(wrapper.down('.autocomplete input')).should_be(Instance.element)
  },
  'should create a dropdown list': function(){
    value_of(wrapper.getElementsBySelector('ul.auto-dropdown')).should_have_exactly(1, "items");
    value_of(wrapper.down('ul.auto-dropdown')).should_be(Instance.dropDown);
  },
  'should hide the dropdown list on construction': function(){
    value_of(wrapper.down('ul.auto-dropdown').getStyle('display')).should_be('none');
  },
  'should carry classes over to input element': function(){
    var input = wrapper.down('input');
    value_of(input.hasClassName('testClass')).should_be_true();
    value_of(input.hasClassName('textfield')).should_be_true();
  },
  'should carry classes over to dropdown element': function(){
    var input = wrapper.down('ul.auto-dropdown');
    value_of(input.hasClassName('testClass')).should_be_true();
  }
});

describe("Keyboard Interaction", {
  'before all': function(){
    setupHTML();
    Instance = new SelectAutocompleter('autocomplete');
    wrapper = $('autoCompleterWrapper');
    input = Instance.element;
    dropdown = Instance.dropDown;
  },
  'after all': function(){
    $('autoCompleterWrapper').remove();
  },
  
  'after each': function(){
    input.value = '';
    input.fire('keyup', {keyCode: ' '});
    // Prototype is too dumb :(
    // input.fire('blur');
    Instance.onBlur();
  },
  
  
  'should show the drop down on focus': function(){
    value_of(dropdown.getStyle('display')).should_be('none');
    // Prototype is too dumb :(
    // input.fire('focus');
    Instance.onFocus();
    value_of(dropdown.getStyle('display')).should_not_be('none');
  },
  'should filter the list when characters are typed in': function(){
    input.fire('focus');
    input.value = "kamr";
    input.fire('keyup', {keyCode: 'r'});
    value_of(dropdown.getElementsBySelector('li')).should_have_at_most(1, "items");
  },
  'should move down the list when the down arrow is pressed': function(){
    // Prototype is too dumb :(
    // input.fire('focus');
    Instance.onFocus();
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[0]);
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[1]);
  },
  'should not go past the last item when the down arrow is pressed': function(){
    // Prototype is too dumb :(
    // input.fire('focus');
    Instance.onFocus();
    value_of(dropdown.getElementsBySelector('li')).should_have_at_most(6, "items");
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li').last());
  },
  'should move up the list when the down arrow is pressed': function(){
    // Prototype is too dumb :(
    // input.fire('focus');
    Instance.onFocus();
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[2]);
    input.fire('keyup', {keyCode: Event.KEY_UP});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[1]);
    input.fire('keyup', {keyCode: Event.KEY_UP});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[0]);
  },
  'should not go past the first item when the up arrow is pressed': function(){
    // Prototype is too dumb :(
    // input.fire('focus');
    Instance.onFocus();
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    input.fire('keyup', {keyCode: Event.KEY_DOWN});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[2]);
    input.fire('keyup', {keyCode: Event.KEY_UP});
    input.fire('keyup', {keyCode: Event.KEY_UP});
    input.fire('keyup', {keyCode: Event.KEY_UP});
    input.fire('keyup', {keyCode: Event.KEY_UP});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[0]);
  },
  
  'should highlight the choice while hovering': function(){
    dropdown.getElementsBySelector('li')[2].fire('mouseover');
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[2]);
  },
  'should move the keyboard from where the mouse is hovering': function(){
    dropdown.getElementsBySelector('li')[2].fire('mouseover');
    input.fire('keyup', {keyCode: Event.KEY_UP});
    value_of(Instance.highlightedChoice).should_be(dropdown.getElementsBySelector('li')[1]);
  }
});