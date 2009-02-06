Object.extend(Event, (function() {
 // DOM Level 3 events
 var W3C_MOUSE_EVENTS = $w('click mousedown mousemove mouseout mouseup');
 var W3C_KEYBOARD_EVENTS = $w('keydown keyup keypress');
 var W3C_BASIC_EVENTS = $w('abort change error load reset resize scroll submit unload');

 function createDOMEvent(aEventName, aEventParams)
 {
   var event;
   if(W3C_MOUSE_EVENTS.include(aEventName)) {
     var p = Object.extend({
       bubble: true,
       cancelable: true,
       view: window,
       detail: 0,
       screenX: 0,
       screenY: 0,
       clientX: 0,
       clientY: 0,
       ctrlKey: false,
       altKey: false,
       shiftKey: false,
       metaKey: false,
       button: 0,
       relatedTarget: null
     }, aEventParams);
     if(document.createEvent) {
       event = document.createEvent('MouseEvent');
       event.initMouseEvent(aEventName, p.bubble, p.cancelable, p.view, p.detail, p.screenX,
           p.screenY, p.clientX, p.clientY, p.ctrlKey, p.altKey, p.shiftKey, p.metaKey,
           p.button, p.relatedTarget);
     } else {
       // TODO: IE
       Object.extend(event, p);
       event.eventType = 'on' + aEventName;
     }
   } else if(W3C_KEYBOARD_EVENTS.include(aEventName)){
     var p = Object.extend({
       bubble: true,
       cancelable: true,
       view: null,
       ctrlKey: false,
       altKey: false,
       shiftKey: false,
       metaKey: false,
       keyCode: 0,
       charCode: 0
     }, aEventParams);
     if(document.createEvent) {
       event = document.createEvent('KeyboardEvent');
       event.initKeyEvent(aEventName, p.canBubble, p.cancelable, p.view, p.ctrlkey, p.altKey, p.shiftKey, p.metaKey,
                           p.keyCode, p.charCode);
     } else {
       // TODO: IE
       event = document.createEventObject();
       Object.extend(event, p);
       event.eventType = 'on' + aEventName;
      }
   } else if(W3C_BASIC_EVENTS.include(aEventName)) {
     var p = Object.extend({
       bubbles: true,
       cancelable: true
     }, aEventName);
     if(document.createEvent) {
       event = document.createEvent('HTMLEvents');
       event.initEvent(aEventName, p.bubbles, p.cancelable);
     } else {
       // TODO: IE
       event = doument.createEventObject();
       Object.extend(event, p);
       event.eventType = 'on' + aEventName;
     }
   }
   return event;
 }

 return {
   fire_with_native_events: function(element, eventName, eventParamsOrMemo) {
     var event = createDOMEvent(eventName, eventParamsOrMemo);
     if(event) {
       document.createEvent? element.dispatchEvent(event) : element.fireEvent(event.eventType, event);
     } else {
       Event.fire(element, eventName, eventParamsOrMemo);
     }
   }
 };
})());

// Replace an Element#fire 
Element.addMethods({
 fire: Event.fire_with_native_events
});