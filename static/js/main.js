$(function() {
  errors = {'Name in base.' : "Пользователь с таким именем уже существует.",
  			'Wrong password.' : "Неправильный пароль.",
  			'User not register.' : "Пользователь с таким именем не зарегистрирован.",
  			"Wrong secret key!" : "Неверный секретный ключ.",
  			'Bad size of field!' : "Неверный размер поля."
  };

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
    url: '/',
    data: JSON.stringify(data),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: function(data) {
      console.log('ajax request success');
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
    },
    error: function(text) {
      errorName = text.statusText;
      if (errorName in errors) {
      	alert(errors[errorName]);
      }
      else {
        alert(errorName);
      }
      console.log(text.statusText in errors);
      onSuccess();
      console.error('AJAX ERROR', arguments);
    }
  });
};

function onRegistration(secretKey, field, name) {
  window.finderOfTwo.secretKey = secretKey;
  window.finderOfTwo.name = name;
  window.finderOfTwo.field = field;
 
  var gameView = new GameView();

  gameView.render($('#content'));

  gameView.start();

  gameView.setEndGameCallback(onEndGame);
};

function onEndGame(gameDurationMs) {
  alert('game ended ms: ' + gameDurationMs);
  window.sendRequest({
  	type: '2',
    name: window.finderOfTwo.name,
    secret_key: window.finderOfTwo.secretKey,
    result: gameDurationMs
  });

  var results = new ResultsView();

  results.afterEndGame();
  
  results.setOnResults(onSaveResults);
};

function onSaveResults(results_top) {
  window.finderOfTwo.results_top = results_top;
  window.finderOfTwo.len_results = results_top.length;
};

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