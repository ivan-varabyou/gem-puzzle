

class Card {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.id = id;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  position() {
    return `${this.x}-${this.y}`;
  }
}

class Game {
  constructor(grid = 4, time = 0, moves = 0, random = null, field = null, win = 0) {
    this.pageGenerator();
    this.timePanel = document.getElementById('time');
    this.movesPanel = document.getElementById('moves');
    this.frameSize = document.getElementById('framesize');
    this.modal = document.querySelector('.modal');

    if (localStorage.getItem('gempuzzle')) {
        let arg = JSON.parse(localStorage.getItem(`gempuzzle`))
        grid = arg[0];
        time = arg[1];
        moves = arg[2];
        random = arg[3];
        this.timePanel.innerHTML = `<strong>Time:</strong> ${this.getMinut(time)}`;
        this.movesPanel.innerHTML = `<strong>Moves:</strong> ${moves}`;
    }

    this.grid = Number(grid);
    this.time = time;
    this.moves = moves;
    this.sound = 1;
    this.pause = 0;
    this.empty = 0;
    this.timeId = setInterval(() => {}, 1000);
    this.status = 0;
    this.timerStatus = 0;
    this.win = win;
    this.soundFx = new Audio('../sound/fx.mp3');
    this.cards = this.getCard(this.grid);
    this.random = (random) || this.getRandomCard(this.cards);
    this.field = (field) || this.getField(this.random);
    this.event();
    this.frameSize.innerHTML = `<strong>Frame size:</strong> ${grid}x${grid}`;
  }

 
}

const game = new Game();

