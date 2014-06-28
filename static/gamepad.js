// TODO:
// * code cleanup
// * support button mapping / more than one button
// * better handling for when gamepads disconnect/reconnect at runtime
// * refactor getting gamepads into a function

require(["widgets/js/widget"], function(WidgetManager) {
  function reportGamepadEnabled() {
    var gamepadSupportAvailable = navigator.getGamepads ||
      !!navigator.webkitGetGamepads ||
      !!navigator.webkitGamepads;

    var stat= document.getElementById("gpenabled")
    if (gamepadSupportAvailable) {
      stat.innerHTML = "yes"
      stat.style.color="green"
    } else {
      var stat= document.getElementById("gpenabled")
      stat.innerHTML = "no"
      stat.style.color="red"
    }
  }

  function pollGamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    for (var i = 0; i < gamepads.length; i++) {
      var gp = gamepads[i];
      if(gp) {
		registerGamepad(i);
        clearInterval(interval);
		setInterval(pollButtons, 50);
      }
    }
  }

  var gamepad;
  function registerGamepad(i) {
	gamepad = i;
  }

  var button_cache = {};
  function pollButtons() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
	var pad = gamepads[gamepad];
	var i;
    for (i = 0; i < pad.buttons.length; ++i) {
	  var value = pad.buttons[i];

	  if (button_cache[i] !== value) {
		notifyButton(i, value);
	  }
	  button_cache[i] = value;
    }
  }

  var notifiers = {};
  function notifyButton(i, value) {
	if (notifiers[i] !== undefined) {
	  notifiers[i](value);
	}
  }

  function onButton(i, callback) {
	notifiers[i] = callback;
  };

  // Assume gamepad events are not available. Use polling
  var interval = setInterval(pollGamepads, 500);

  /////// begin IPython stuff
  var JoystickBoolView = IPython.DOMWidgetView.extend({
    render : function(){
      // Called when view is rendered.

      // This is a single-line horizontal widget
      this.$el
        .addClass('widget-hbox-single');

      // Add a label div, which will contain the description
      this.$label = $('<div />')
        .addClass('widget-hlabel')
        .appendTo(this.$el)
        .hide();

      // Add a checkbox representing the state
      this.$checkbox = $('<input />')
        .attr('type', 'checkbox')
        .prop('disabled', true)
        .appendTo(this.$el);

      // Register an event handler with the joystick - TODO
      onButton(0, $.proxy(this.handle_value, this));
      //register_handler($.proxy(this.handle_value, this));

      this.$el_to_style = this.$checkbox; // Set default element to style
      this.update(); // Set defaults.
    },

    handle_value: function(new_value) {
      // Handles when the checkbox is clicked.

      // Calling model.set will trigger all of the other views of the
      // model to update.
      this.model.set('value', !!new_value, {updated_view: this});
      this.touch();
    },

    update : function(options){
      // Update the contents of this view
      //
      // Called when the model is changed. The model may have been
      // changed by another view or by a state update from the back-end.
      this.$checkbox.prop('checked', this.model.get('value'));

      if (options === undefined || options.updated_view != this) {
        var disabled = this.model.get('disabled');
        if (disabled) {
          // Remove the gamepad event
        } else {
          // Re-introduce the gamepad event
        }

        var description = this.model.get('description');
        if (description.trim().length === 0) {
          this.$label.hide();
        } else {
          this.$label.text(description);
          MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.$label.get(0)]);
          this.$label.show();
        }
      }
      return JoystickBoolView.__super__.update.apply(this);
    },
  });
  WidgetManager.register_widget_view('JoystickBoolView', JoystickBoolView);
});
