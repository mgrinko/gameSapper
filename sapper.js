/**
 * Лисин Сергей lisin2@yandex.ru
 */

"use strict";

let sapperCSS = document.createElement("link");
sapperCSS.rel = "stylesheet";
sapperCSS.href = "sapper.css";
document.head.insertBefore(sapperCSS, document.head.childNodes[document.head.childNodes.length - 1].nextSibling);

class Sapper {
  constructor () {
    this.defaultValues = {
      width: 16,
      height: 16,
      mines: 40,
    };
    this.cells = [];
    this.sizeField = 20;
  }

  run () {
    this._getRandomizeValues();
    this._setHelpNumbers();
    this._drawGameField();
  }

  _countCells () {
    return this.defaultValues.width * this.defaultValues.height;
  }

  _getRandomizeValues () {
    let x = 0;
    let y = 0;

    for (let i = 0; i < this._countCells(); i++) {
      this.cells.push((i < this.defaultValues.mines));
    }

    this.cells = this.cells
      .sort(() => Math.random() - 0.5)
      .map(value => {

        if (x === this.defaultValues.width) {
          x = 0;
          y++;
        }

        return {
          x: x++,
          y: y,
          mine: value,
          status: 'close'
        };
      });
  }

  _setHelpNumbers () {
    this.cells.forEach(cell => {
      if (cell.mine === false) {
        let counter = 0;
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            if (y !== 0 || x !== 0) {
              let find = this.cells.filter(cellAround => cellAround.mine === true)
                .filter(cellAround => cellAround.x === cell.x + x)
                .filter(cellAround => cellAround.y === cell.y + y);
              if (find.length === 1) {
                counter++;
              }
            }
          }
        }
        if (counter > 0) {
          cell.hint = counter;
        }
      }
    });
  }

  _drawGameField () {
    let gameField = document.getElementById('sapper');
    let html = '';

    gameField.innerHTML = '';

    this.cells.forEach((item, i) => {
      let g = '';
      if(item.status === 'close'){
        g = `
        <g data-id="${i}" class="cell">
            <rect
              class="cell-close"
              x="${item.x * this.sizeField}"
              y="${item.y * this.sizeField}"
              width="${this.sizeField}"
              height="${this.sizeField}">
            </rect>
        </g>
      `;
      } else {
        g = `
        <g data-id="${i}" class="cell">
            <rect
              class="cell-rect ${(item.mine) ? 'cell-mine' : 'card-square-empty'}"
              x="${item.x * this.sizeField}"
              y="${item.y * this.sizeField}"
              width="${this.sizeField}"
              height="${this.sizeField}">
            </rect>
            <text
              class="cell-text ${(item.mine) ? 'mine' : ''}"
              text-anchor="middle"
              x="${item.x * this.sizeField + this.sizeField / 2}"
              y="${item.y * this.sizeField + this.sizeField / 2 + 5}">
                ${(item.mine) ? 'x' : (item.hint || '')}
            </text>
        </g>
      `;
      }
      html += g;
    });

    gameField.innerHTML = html;

    let cellElements = document.getElementsByClassName('cell');

    for (let i = 0; i < cellElements.length; i++) {
      cellElements[i].onclick = (e) => this._clickCell(e.currentTarget.dataset.id);
      cellElements[i].oncontextmenu = (e) => this._labelCell(e.currentTarget.dataset.id);
    }
  };

  _clickCell (id) {
    let cell = this.cells[id];
    if (cell.status === 'open') {
      return false;
    } else if (cell.mine === true) {
      this._gameOver();
    } else if (cell.hint === undefined && cell.mine === false) {
      this._openEmptyCells(cell.x, cell.y);
      this._drawGameField();
    } else {
      cell.status = 'open';
      this._drawGameField();
    }
  }

  _labelCell (id) {
    let cell = this.cells[id];
    console.log('Клик правой клавишей' + cell);
    return false;
  }

  _openEmptyCells (x, y) {
    for (let lX = -1; lX <= 1; lX++) {
      for (let lY = -1; lY <= 1; lY++) {
        if (lY !== 0 || lX !== 0) {
          let find = this.cells.filter(cellAround => cellAround.mine === false)
            .filter(cellAround => cellAround.x === lX + x)
            .filter(cellAround => cellAround.y === lY + y);
          find.forEach( cell => {
            if(cell.status === 'open'){
              return;
            } else {
              cell.status = 'open';
            }
            if(cell.hint){
              return;
            }
            this._openEmptyCells(cell.x, cell.y);
          })

        }
      }
    }
  }

  _gameOver () {
    this.cells.forEach(cell => {
      cell.status = 'open';
    });

    this._drawGameField();
  }
}

new Sapper().run();
