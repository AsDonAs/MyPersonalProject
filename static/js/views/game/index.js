function GameView() {
  this.$el = $(window.finderOfTwo.templates.game());

  this.$timeValue = this.$el.find('.timeValue');

  this.MAX_DIFFERENT_IMAGES = 10;

  this.FIELD_SIZE = [5, 4];

  this.CELL_SHOW_TIME_MS = 1000;

  this.TOTAL_PAIRS = this.FIELD_SIZE[0] * this.FIELD_SIZE[1] / 2;

  this.gameField = this.generateGameField(this.FIELD_SIZE);

  this._setEvents();

  this.selectedCells = [null, null];

  this.foundPairs = 0;

  this.endGameCallback = null;

  this.startTime = Date.now();

  this.timerInterval = null;
}

GameView.prototype.start = function() {
  this.startTime = Date.now();
  this.timerInterval = setInterval(this._onTimer.bind(this), 1000);
};

GameView.prototype._getGameDurationMs = function() {
  return Date.now() - this.startTime;
};

GameView.prototype._onTimer = function() {
    var gameDurationSeconds = this._getGameDurationMs() / 1000 ^ 0;
    this.$timeValue.html(gameDurationSeconds);
};

GameView.prototype.setEndGameCallback = function(callback) {
  this.endGameCallback = callback;
};

GameView.prototype._setEvents = function() {
  var self = this;

  this.$el.find('table').delegate('.gameCell', 'click', function(e) {

    var newSelectedCellIndex = self._getSelectedCellIndex();

    if (newSelectedCellIndex === null) {
      return console.log('cells are already selected');
    }

    var $cell = $(this);

    var coordinates = [$cell.attr('data-y'), $cell.attr('data-x')];

    self._selectCell(coordinates, newSelectedCellIndex, $cell);
  });
};

GameView.prototype._selectCell = function(coordinates, cellIndex, $cell) {
  if (this.gameField[coordinates[0]][coordinates[1]] === null) {
    return console.log('this cell is already cleared');
  }

  // if this is a second cell in open pair - check that it's not the first one
  if (cellIndex === 1) {
    var firstSelectedCellCoordinates = this.selectedCells[0].coordinates;

    if (firstSelectedCellCoordinates[0] === coordinates[0] && firstSelectedCellCoordinates[1] === coordinates[1]) {
      return console.log('can not select one cell twice');
    }
  }


  if (this.selectedCells[cellIndex]) {
    clearTimeout(this.selectedCells[cellIndex].timeout);
    this.selectedCells[cellIndex].timeout = null;
  }

  this.selectedCells[cellIndex] = {
    coordinates: coordinates,
    ts: Date.now(),
    $cell: $cell
  };

  $cell.addClass('open');

  // check if pair is found
  if (cellIndex === 1 && this.selectedCells[0]) {
    var firstCoordinates = this.selectedCells[0].coordinates;
    var secondCoordinates = this.selectedCells[1].coordinates;

    var firstItem = this.gameField[firstCoordinates[0]][firstCoordinates[1]];
    var secondItem = this.gameField[secondCoordinates[0]][secondCoordinates[1]];

    if (firstItem === secondItem) {
      this.gameField[firstCoordinates[0]][firstCoordinates[1]] = null;
      this.gameField[secondCoordinates[0]][secondCoordinates[1]] = null;

      var $firstCell = this.selectedCells[0].$cell;
      $firstCell.removeClass('open').addClass('clear');
      $cell.removeClass('open').addClass('clear');

      clearTimeout(this.selectedCells[0].timeout);
      clearTimeout(this.selectedCells[1].timeout);

      this.selectedCells[0] = null;
      this.selectedCells[1] = null;

      ++this.foundPairs;

      if (this.foundPairs === this.TOTAL_PAIRS) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;

        this.endGameCallback(this._getGameDurationMs());
      }

      return;
    }
  }

  var self = this;

  this.selectedCells[cellIndex].timeout = setTimeout(function() {
    $cell.removeClass('open');
    self.selectedCells[cellIndex] = null;
  }, this.CELL_SHOW_TIME_MS);
};

GameView.prototype._getSelectedCellIndex = function() {
  var now = Date.now();
  
  // if second cell is selected - wait for it to disappear even if selectedCells[0] in clear
  if (this.selectedCells[1]) {
    var cell2EndTime = this.selectedCells[1].ts + this.CELL_SHOW_TIME_MS;

    if (cell2EndTime > now) {
      return null;
    }
  }

  if (!this.selectedCells[0]) {
    return 0;
  }

  if (!this.selectedCells[1]) {
    return 1;
  }

  return null;
};

GameView.prototype.render = function($container) {
  var $table = this.$el.find('.gameContent table');
  $table.html('');

  for (var i = 0; i < this.FIELD_SIZE[1]; ++i) {
    var $tr = $('<tr></tr>');

    for (var j = 0; j < this.FIELD_SIZE[0]; ++j) {
      var $td = $('<td class="gameCell"></td>');

      $td.attr('data-x', j);
      $td.attr('data-y', i);

      $td.html(this.gameField[i][j]);

      $tr.append($td);
    }

    $table.append($tr);
  }

  $container.html(this.$el);
};

// size is array [width, height]
GameView.prototype.generateGameField = function(size) {
  var totalCells = size[0] * size[1];

  if (totalCells % 2 !== 0) {
    return console.error('total number of cells should be even', 'bad size', size);
  }

  var halfCells = totalCells / 2;

  if (halfCells > this.MAX_DIFFERENT_IMAGES) {
    return console.error('cant generate field of', halfCells, 'different images', 'max images', this.MAX_DIFFERENT_IMAGES);
  }

  gameField = [];
  field = window.finderOfTwo.field;
  
  for (var i = 0; i < size[1]; ++i) {
    gameField[i] = []
    for (var j = 0; j < size[0]; j++) {
      gameField[i].push(field[j + i * size[0]])
    }
  }

  return gameField;
};