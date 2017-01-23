function ResultsView() {
  this.$el = $(window.finderOfTwo.templates.results());



  this.isWaitingResponse = false;

  this.onResultsCallback = null;

  this._onResponse = this._onResponse.bind(this);

  this.RESULTS_SIZE = [3, 10];

  this.resultsField = this.GenField(this.RESULTS_SIZE);

//  this.resultsField = this.processingResults(this.RESULTS_SIZE);

//  this.render($('#content'));
}


ResultsView.prototype.setOnResults = function(callback) {
  this.onResultsCallback = callback;
}

ResultsView.prototype.afterEndGame = function(){
  window.sendRequest({
    type: '4'
  }, this._onResponse);

 // this.$el.find('.waitingContainer').html('waiting...');
  this.isWaitingResponse = true;
};

ResultsView.prototype.showResults = function(results_top) {
//  console.log(results_top, " ininin");
  this.resultsField = this.processingResults(this.RESULTS_SIZE);
  this.render($('#content'));
};


ResultsView.prototype.render = function($container) {
  var $table = this.$el.find('.resultsContent table');
  $table.html('');

  for (var i = 0; i < this.RESULTS_SIZE[1]; ++i) {
    if (window.finderOfTwo.user_name === resultsField[i][1]) {
      var $tr = $('<tr class="userResult"></tr>');
    }
    else {
      var $tr = $('<tr></tr>');
    }

    for (var j = 0; j < this.RESULTS_SIZE[0]; ++j) {
      var $td = $('<td class="resultsCell"></td>');

      $td.attr('data-x', j);
      $td.attr('data-y', i);

      $td.html(this.resultsField[i][j]);

      $tr.append($td);
    }

     $table.append($tr);
  }
  

  $container.html(this.$el);
};

// size is array [width, height]

ResultsView.prototype.processingResults = function(size) {

  resultsField = [];

  top_results = window.finderOfTwo.results_top;

  console.log(top_results);
  
  for (var i = 0; i < size[1]; ++i) {
    resultsField[i] = [];

    for (var j = 0; j < size[0]; ++j) {
      resultsField[i].push(top_results[i][j]);
    }
  }

  return resultsField;
};

ResultsView.prototype.GenField = function(size) {
  resultsField = [];
  
//  console.log(window.finderOfTwo.results_top);

  for (var i = 0; i < size[1]; ++i) {
    resultsField[i] = [];

    for (var j = 0; j < size[0]; ++j) {
      resultsField[i].push(j);
    }
  }

  return resultsField;
};

ResultsView.prototype._onResponse = function(response) {
  this.isWaitingResponse = false;
//  this.$el.find('.waitingContainer').html('');
  if (typeof this.onResultsCallback === 'function') {
    this.onResultsCallback(response.results_top);
    this.showResults(window.finderOfTwo.results_top);
  }
};