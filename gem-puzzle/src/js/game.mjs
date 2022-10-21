

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
        let arg = this.loadStorage(`gempuzzle`)
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
    this.lock = 0;
    this.pause = 0;
    this.empty = 0;
    this.timeId = {};
    this.status = 0;
    this.timerStatus = 0;
    this.win = win;
    this.soundFx = new Audio('../sound/fx.mp3');
    this.setCard(this.grid);
    this.random = (random) || this.getRandomCard();
    this.field = (field) || this.getField(this.random);
    this.event();
    this.frameSize.innerHTML = `<strong>Frame size:</strong> ${grid}x${grid}`;
  }

  isMove(e) {
    const eX = Number(e.target.dataset.x);
    const eY = Number(e.target.dataset.y);
    const nEmpty = document.querySelector('[data-id="0"]');
    let y = Number(nEmpty.dataset.y);
    let x = Number(nEmpty.dataset.x);
    if ((eY === y && eX - 1 === x)) return 'up';
    if ((eY === y && eX + 1 === x)) return 'down';
    if ((eY - 1 === y && eX === x)) return 'left';
    if ((eY + 1 === y && eX === x)) return 'right';
    return false;
  }

  updateRandom() {
    const arr = [];
    let cards = document.querySelectorAll('[data-id]')
      .forEach((e) =>
      arr.push([Number(e.dataset.x),Number(e.dataset.y),Number(e.dataset.id)])
    );
    this.random = arr
      .sort((a, b) => a[1] - b[1])
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[2]);
  }

  isWin() {
    this.updateRandom();
    if (this.random.join('') === this.cards.join('')) {
        this.win = 1;
        let minScore, topScore = [];
        this.addModal(`Hooray! You solved the puzzle in ${this.getMinut(this.time)} and ${this.moves} moves!`)
        if (localStorage.getItem('gempuzzleresult')) {
          topScore = this.loadStorage('gempuzzleresult');
          if(topScore.length >= 10) {
            topScore = sortResult(topScore)
            if(topScore[topScore.length-1][1] > this.time) {
              topScore.pop()
              topScore.push([this.moves,this.time])
            }
            topScore = sortResult(topScore)
          } else {

            topScore.push([this.moves,this.time])
            topScore = sortResult(topScore)
          }
        } else {
          topScore.push([this.moves,this.time])
        }

        this.saveStorage('gempuzzleresult', topScore)

        function sortResult(array){
          array.sort((a,b) => a[0] - b[0])
          array.sort((a,b) => a[1] - b[1])
          return  array
        }
    }
  }

  moveCard(e) {
    e.target.style.cssText = '';
    if (this.time >= 0) {
      this.startTimer(); this.status = 1;
    }

    if (this.pause === 0 && this.time > 0 && this.lock === 0) {
      let x = Number(e.target.dataset.x);
      let y = Number(e.target.dataset.y);
      let id = Number(e.target.dataset.id);
      if (this.isMove(e)) {
        let animation = this.isMove(e);
        e.target.classList.add(animation)
        this.lock = 1;
        let nEmpty = document.querySelector('[data-id="0"]');
        nEmpty.dataset.x = x;
        nEmpty.dataset.y = y;
        nEmpty.className = `p-${x}-${y}`;
        setTimeout(() => {
       // if (nEmpty.className) nEmpty.className = `p-${x}-${y}`;

        this.field[x][y].set(this.empty.x, this.empty.y);
        e.target.className = `p-${this.empty.x}-${this.empty.y}`;
        e.target.dataset.x = this.empty.x;
        e.target.dataset.y = this.empty.y;
        this.empty.set(x, y);
        this.moves++;
        this.movesPanel.innerHTML = `<strong>Moves:</strong> ${this.moves}`;
        if (this.sound === 1) {
          this.soundFx.play();
        }
        this.lock = 0;
        this.isWin();
        e.target.classList.remove(animation)
        }, 280);


      }
    }
  }

  event() {
    this.dragCard();
    let x; let y; let id;
    const box = document.querySelector('.box');
    box.addEventListener('click', (e) => {
      if(this.win === 0) {


        if (e.target.id === 'save') {
          this.timerStatus = 1;
          this.saveStorage(
            'gempuzzle',
            [
              Number(this.grid),
              Number(this.time),
              Number(this.moves),
              this.random
            ]
          );
          this.timerStatus = 0;
          this.addModal('Game saved successfully','<p>Reload the page to check if the data is safe. Сlick close to continue</p>');
        }

        if (e.target.id === 'stop') {
          this.addModal('The game is paused','<p>Сlick close to continue</p>');
        }


        if (e.target.id === 'sound') {
          if (this.sound == 1) {
            e.target.innerText = 'Sound OFF';
            this.sound = 0;
          } else {
            e.target.innerText = 'Sound On';
            this.sound = 1;
          }
        }

        if (e.target.id == 'bodyfield') {
          this.startTimer();
        }

        if (e.target.dataset.game) {
          this.startGame(e.target.dataset.game);
          this.pause = 0;
        }

      }

      if (e.target.id === 'start') {
        this.startGame();
        this.startTimer();
      }

      if (e.target.id === 'result') {
        if(localStorage.getItem('gempuzzleresult')) {
          let topScore = this.loadStorage('gempuzzleresult');
          this.addModal('The Top 10 Results',topScore);
        } else {
          this.addModal('The Top 10 Results','<p>No best results, be the first!</p>');
        }
      }
    });

    this.modal.addEventListener('click', (e) => {
      if(e.target.dataset.modal === 'close') {
        this.modal.style.display = 'none';
        this.pause = 0;
      }
    })


  }



  dragCard() {
      document.onmousedown = (e) => {
        if(e.target.dataset && e.target.dataset.id && e.target.dataset.id !== 0) {
        //if(isMouseWork(e) || !isMove(e)) return;
        const coord = e.target.getBoundingClientRect()
        const nEmpty = document.querySelector('[data-id="0"]');
        const coordNEmpty = nEmpty.getBoundingClientRect()
        let mousemove = 0;
        e.target.style.cssText =
        ` position: absolute;
          width: ${coord.width}px;
          height: ${coord.height}px;
          top: ${coord.top}px;
          left: ${coord.left}px;
        `
          let move = this.isMove(e);
          document.onmousemove = (eM) => {
            if(!move) return
            mousemove = 1;

            if(move == 'down' && (coord.top + coord.height + e.offsetY) >= eM.clientY) {
              if(coord.top > eM.clientY || coord.left > eM.clientX || coord.left + coord.width < eM.clientX ) {
                resetPosition(e)
              }
              e.target.style.top = `${eM.clientY - e.offsetY}px`;
            }
            if(move == 'up' && (coord.top - coord.height + e.offsetY) <= eM.clientY) {

              if(coord.top + coord.height/1.5 < eM.clientY || coord.left > eM.clientX || coord.left + coord.width < eM.clientX ) {
                resetPosition(e)
              }
              e.target.style.top = `${eM.clientY - e.offsetY}px`;
            }


            if(move == 'right' && (coord.left + coord.width + e.offsetX) >= eM.clientX) {
              if(coord.left > eM.clientX || coord.top > eM.clientY || coord.top + coord.height < eM.clientY ) {
                resetPosition(e)
              }
              e.target.style.left = `${eM.clientX - e.offsetX}px`;
            }
            if(move == 'left' && (coord.left - coord.width + e.offsetX) <= eM.clientX) {

              if(coord.left + coord.width/1.5 < eM.clientX || coord.top > eM.clientY || coord.top + coord.height < eM.clientY ) {
                resetPosition(e)
              }
              e.target.style.left = `${eM.clientX - e.offsetX}px`;
            }
          }
          document.onmouseup = (eU) => {
            if(mousemove === 0) {
              this.moveCard(e)
            } else {
            if((move == 'up' && coord.top > eU.clientY - coord.height/2)
            || (move == 'down' && coord.top + coord.height/2 < eU.clientY)
            || (move == 'left' && coord.left > eU.clientX - coord.width/2)
            || (move == 'right' && coord.left + coord.width/2 < eU.clientX)
            ) {
              this.moveCard(e);
            }
          }

          resetPosition(e)
          };
          function resetPosition(e) {
            e.target.style.cssText = '';
            document.onmousemove = null;
            document.onmouseup = null;
          }
        }
      }

  }






  setCard(grid = this.grid) {
    const max = grid * grid;
    const cards = [];
    for (let i = 1; max > i; i++) {
      cards.push(i);
    }
    cards.push(0);
    this.cards = cards
  }

  getRandomCard(cards = this.cards) {
    return [...cards].sort(() => Math.random() - Math.random());
  }

  getField(cards = this.random) {
    const bodyField = document.getElementById('bodyfield');
    this.bodyField = bodyField;
    bodyField.style.cssText = `
            grid-template-columns: repeat(${this.grid}, 1fr);
            grid-template-rows: repeat(${this.grid}, 1fr);
    `;
    bodyField.innerHTML = '';
    const rand = new Array(this.grid);
    let i = 0; let node; let
      id;

    for (let x = 0; this.grid > x; x++) {
      rand[x] = [...new Array(this.grid)];
      for (let y = 0; this.grid > y; y++) {
        id = cards[i];
        rand[x][y] = new Card(x, y, id);
        if (id === 0) {
          this.empty = rand[x][y];
        }
        node = document.createElement('div');
        node.className = `p-${rand[x][y].position()}`;
        node.dataset.x = `${rand[x][y].x}`;
        node.dataset.y = `${rand[x][y].y}`;
        node.dataset.id = `${rand[x][y].id}`;
        node.innerText = `${rand[x][y].id}`;
        bodyField.append(node);
        i++;
      }
    }

    return rand;
  }

  getMinut(time) {
    const m = (Math.trunc(time / 60) < 10) ? `0${Math.trunc(time / 60)}` : `${Math.trunc(time / 60)}`;
    const s = (time % 60 < 10) ? `0${time % 60}` : `${time % 60}`;
    return `${m}:${s}`;
  }

  setTimer(time = this.time) {
    if (this.timerStatus === 0) {
      this.timerStatus = 1;
      if(this.time === 0) {
        this.time= 1
      }
      clearInterval(this.timeId);
      this.timeId = setInterval(() => {
        if (this.pause === 0 && this.win === 0) {
          ++time;
          this.time = time;
          this.timePanel.innerHTML = `<strong>Time:</strong> ${this.getMinut(time)}`;
        }
      }, 1000);
      this.timerStatus = 0;
    }
  }

  startGame(grid = this.grid) {
    this.win = 0;
    this.time = 0;
    this.moves = 0;
    clearInterval(this.timeId);
    this.grid = grid;
    this.timePanel.innerHTML = '<strong>Time:</strong> 00:00';
    this.movesPanel.innerHTML = '<strong>Moves:</strong> 0';
    this.frameSize.innerHTML = `<strong>Frame size:</strong> ${grid}x${grid}`;
    this.cards = []; this.setCard(this.grid);
    this.random = this.getRandomCard();
    this.field = this.getField();
  }

  saveStorage(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
  }

  loadStorage(name, data) {
    return JSON.parse(localStorage.getItem(name));
  }

  startTimer() {
    if (this.time === 0 || this.status === 0) this.setTimer();
  }

  addModal(massage, body=null) {
    this.pause = 1;
    this.modal.innerHTML = '';
    let bodyHtml;

    if(body == null) {
      body = ''
    }
    //Hooray! You solved the puzzle in ##:## and N moves!
    let modalDialog = document.createElement('div')
    modalDialog.className = 'modal-dialog';
    let modalContent = document.createElement('div')
    modalContent.className = 'modal-content';

    let modalHeader = document.createElement('div')
    modalHeader.className = 'modal-header';

    let modalTitle = document.createElement('h5')
    modalTitle.className = 'modal-title';
    modalTitle.append(massage)

    let modalBody = document.createElement('div')
    modalBody.className = 'modal-body';
    if(Array.isArray(body)) {
      bodyHtml = document.createElement('table');
      bodyHtml.className = 'table';
      let bodyHtmlTr;
      bodyHtml.insertAdjacentHTML('beforeend',`<tr><td>Top</td><td>Mover</td><td>Time</td></tr>`)
      body.forEach((v,i) => {
        bodyHtmlTr = `
          <tr><td>${i+1}</td><td>${v[0]}</td><td>${this.getMinut(v[1])}</td></tr>
        `
        bodyHtml.insertAdjacentHTML('beforeend',bodyHtmlTr)
      })
    } else {
      bodyHtml = document.createElement('div');
      bodyHtml.insertAdjacentHTML('beforeend',body)
    }

    modalBody.append(bodyHtml)

    let modalFooter= document.createElement('div')
    modalFooter.className = 'modal-footer';
    modalFooter.insertAdjacentHTML('beforeend','<button type="button" class="btn btn-secondary" data-modal="close">Close</button>')

    modalHeader.append(modalTitle)
    modalContent.append(modalHeader)
    modalContent.append(modalBody)
    modalContent.append(modalFooter)
    modalDialog.append(modalContent)


    this.modal.append(modalDialog)
    this.modal.style.display = 'grid';
  }

  pageGenerator() {
    //Hooray! You solved the puzzle in ##:## and N moves!
    let html = document.createElement("main")
    html.className = 'main';
    html.innerHTML = `
    <div class="container">
      <div class="wrapper">
      <div class="box">
      <header class=" header">
        <div class="header__button">
          <button type="button" class="btn btn-primary" name="start" id="start">Shuffle and start</button>
          <button type="button" class="btn btn-secondary" name="stop" id="stop">Stop</button>
          <button type="button" class="btn btn-success" name="save" id="save">Save</button>
          <button type="button" class="btn btn-info" name="result" id="result">Result</button>
          <button type="button" class="btn btn-light" name="sound" id="sound">Sound ON</button>
        </div>
        <div class="center header__stat">
            <div class="header__moves" id="moves">
              <strong>Moves:</strong>
              <span>0</span>
            </div>
            <div class="header__time" id="time">
              <strong>Time:</strong>
              <span>00:00</span>
            </div>
        </div>
      </header>
      <div class="wrapper-body">
      <div class="body" id="bodyfield">
      </div>
    </div>
      <div class="footer">
        <div class="footer__text" id="framesize">
          <strong>Frame size:</strong>
          <span>4x4</span>
        </div>
        <div class="footer__text d-inline-grid" id="gamegrid" >
          <strong>Other size:</strong>
          <span class="footer__link" data-game="3">3x3</span>
          <span class="footer__link" data-game="4">4x4</span>
          <span class="footer__link" data-game="5">5x5</span>
          <span class="footer__link" data-game="6">6x6</span>
          <span class="footer__link" data-game="7">7x7</span>
          <span class="footer__link" data-game="8">8x8</span>
        </div>
      </div>
      </div>
      </div>
    </div>
  </main>
    <div class="modal" style="display:none;">

    </div>
    `
    document.body.append(html)
  }
}

const game = new Game();
