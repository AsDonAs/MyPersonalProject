function RegistrationView() {
  this.$el = $(window.finderOfTwo.templates.registration());
  this._selectMenuOption('registration');
  this._setEvents();
  this.isWaitingResponse = false;

  this._onResponse = this._onResponse.bind(this);

  this.onRegistrationCallback = null;

  this.userName = null;
}

RegistrationView.prototype.setOnRegistration = function(callback) {
  this.onRegistrationCallback = callback;
};

RegistrationView.prototype.render = function($container) {
  $container.html(this.$el);
};

RegistrationView.prototype._selectMenuOption = function(optionName) {
  const $menuOptions = this.$el.find('.menuOption');
  $menuOptions.removeClass('selected');
  $menuOptions.filter('[data-action="' + optionName + '"]').addClass('selected');

  const $tabs = this.$el.find('.tabContent');
  $tabs.hide();
  $tabs.filter('.' + optionName).show();
};

RegistrationView.prototype._setEvents = function() {
  var self = this;

  this.$el.find('.menuOption').click(function(e) {
    var $target = $(e.currentTarget);

    var option = $target.attr('data-action');

    if (!option) {
      return console.error('selected bad option without action', 'target', e.target, 'current target', e.currentTarget, 'event', e);
    }

    if (self.isWaitingResponse) {
      return window.showError('waiting response...');
    }

    self._selectMenuOption(option);
  });

  this.$el.find('.actionButton').click(function(e) {
    e.preventDefault();

    var $target = $(e.currentTarget);

    var option = $target.attr('data-action');

    if (!option) {
      return console.error('selected bad button without action', 'target', e.target, 'current target', e.currentTarget, 'event', e);
    }

    if (self.isWaitingResponse) {
      return window.showError('waiting response...');
    }

    self._onClickActionButton(option);
  });
};


// request_settings = {"0": save_user, "1": login_user, "2": save_result,\
// "4": get_result, "9": secret_key_name}
RegistrationView.prototype._onClickActionButton = function(optionName) {
  console.log('click button', optionName);

  var formData = this._collectAndClearFormData(optionName);

  if (optionName === 'registration') {
    if (!formData.registrationName || !formData.registrationPassword) {
      return window.showError('no registration name or password');
    }

    if (formData.registrationPassword !== formData.registrationRepeatPassword) {
      return window.showError('registration passwords dont match');
    }

    window.sendRequest({
      type: '0',
      name: formData.registrationName,
      password: formData.registrationPassword
    }, this._onResponse);

    this.userName = formData.registrationName;
  }
  else if (optionName === 'login') {
    if (!formData.loginName || !formData.loginPassword) {
      return window.showError('login name or password is empty');
    }

    window.sendRequest({
      type: '1',
      name: formData.loginName,
      password: formData.loginPassword
    }, this._onResponse);

    this.userName = formData.loginName;
  }
  else {
    console.error('unknown button action', optionName);
    return;
  }

  this.$el.find('.waitingContainer').html('waiting...');
  this.isWaitingResponse = true;
};

RegistrationView.prototype._collectAndClearFormData = function(optionName) {
  var classByOptionName = {
    registration: 'registrationInput',
    login: 'loginInput'
  };

  var className = classByOptionName[optionName];

  if (!className) {
    return console.error('failed to get class name by option name', optionName);
  }

  var $inputs = this.$el.find('.' + className);

  return _.reduce($inputs, function(inputValues, el) {
    var val = el.value;
    var id = el.id;

    console.log('COLLECTING FORM DATA', optionName, 'id', id, 'val', val);

    inputValues[id] = val;

    el.value = '';

    return inputValues;
  }, {});
};

RegistrationView.prototype._onResponse = function(response) {
  this.isWaitingResponse = false;
  console.log("Answer");
  this.$el.find('.waitingContainer').html('');
  if (typeof this.onRegistrationCallback === 'function') {
    this.onRegistrationCallback(response.secret_key, response.field, this.userName);
    console.log("Answer2");
  }
};