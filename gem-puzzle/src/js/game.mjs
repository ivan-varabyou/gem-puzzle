

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
