$(function() {
  window.finderOfTwo = {
    templates: loadTemplates()
  };
  var registration = new RegistrationView();

  registration.render($('#content'));

  registration.setOnRegistration(onRegistration);
});

window.showError = function(message) {
  alert('ERROR: ' + message);
};

window.sendRequest = function(data, onSuccess, onError) {
  if (!data) {
    data = {};
  }

  console.log('send request', data, 'callback exists', !!onSuccess);

  $.ajax({
    type: 'POST',
    url: '127.0.0.1',
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function() {
      console.log('ajax request success');
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    },
    error: function() {
      onSuccess();
      console.error('AJAX ERROR', arguments);
    }
  });
};

function onRegistration() {
  var gameView = new GameView();

  gameView.render($('#content'));

  gameView.start();

  gameView.setEndGameCallback(onEndGame);
}

function onEndGame(gameDurationMs) {
  alert('game ended ms: ' + gameDurationMs);
}

// also delete from page
function loadTemplates() {
  var templateClass = 'TEMPLATE';

  var $templates = $('.' + templateClass);

  return _.reduce($templates, function(resultTemplates, el) {
    var text = el.innerHTML;
    resultTemplates[el.getAttribute('data-name')] = _.template(text);
    $(el).remove(); // <- remove from page
    return resultTemplates;
  }, {});
}