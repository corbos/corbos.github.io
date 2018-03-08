var Kablamo = (function () {

    var EMPTY = 0;
    var BRICK = 1;
    var RHOME = 2;
    var RLITE = 3;
    var RDARK = 4;
    var BHOME = 5;
    var BLITE = 6;
    var BDARK = 7;

    function createBoard() {
        return [
            [RHOME, RDARK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BRICK, BRICK],
            [RDARK, RLITE, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BRICK, BRICK],
            [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, BRICK, BRICK, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, BRICK, BRICK, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY],
            [BRICK, BRICK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BLITE, BDARK],
            [BRICK, BRICK, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, BDARK, BHOME]
        ];
    }

    function playerColors(light, dark, home) {
        this.light = light;
        this.dark = dark;
        this.home = home;
    }

    function Kablamo(red, blue) {
        this.current = blue;
        this.opponent = red;
        this.board = createBoard();
    }

    Kablamo.EMPTY = EMPTY;
    Kablamo.BRICK = BRICK;
    Kablamo.RHOME = RHOME;
    Kablamo.RLITE = RLITE;
    Kablamo.RDARK = RDARK;
    Kablamo.BHOME = BHOME;
    Kablamo.BLITE = BLITE;
    Kablamo.BDARK = BDARK;

    Kablamo.RED = new playerColors(RLITE, RDARK, RHOME);
    Kablamo.BLUE = new playerColors(BLITE, BDARK, BHOME);

    Kablamo.register = function (strategy) {
        if (!this.strategies) {
            this.strategies = {};
        }
        if (typeof strategy !== "function") {
            throw "Kablamo.register: second argument must be a constructor.";
        }
        if (strategy.length <= 1) {
            throw "Kablamo.register: constructor must accept two parameters, " +
            "the 'active' color and a move callback.";
        }
        var s = new strategy();
        if (typeof s.selectMove !== "function") {
            throw "Kablamo.register: strategy must construct on object with a 'selectMove' function.";
        }
        if (s.selectMove.length < 1) {
            throw "Kablamo.register: 'selectMove' must accept one parameter, the board.";
        }
        this.strategies[strategy.key] = strategy;
    };

    Kablamo.cloneBoard = function (board) {
        var result = [];
        board.forEach(function (row) {
            result.push(row.slice(0));
        });
        return result;
    };

    Kablamo.getActive = function (board, activeColor) {
        var active = [];
        for (x = 0; x < 10; x++) {
            for (y = 0; y < 10; y++) {
                if (board[x][y] === activeColor) {
                    active.push({ x: x, y: y });
                }
            }
        }
        return active;
    };

    // Instance functions
    Kablamo.prototype.move = function (x, y) {
        if (this.board[x][y] !== this.current.dark) {
            return false;
        }
        this.flipInactive();
        this.mark(x, y, EMPTY);
        this.project(x, y, 1, 0); // right
        this.project(x, y, -1, 0); // left
        this.project(x, y, 0, -1); // up
        this.project(x, y, 0, 1); // down
        this.project(x, y, 1, -1); // right up
        this.project(x, y, 1, 1); // right up
        this.project(x, y, -1, 1); // left down
        this.project(x, y, -1, -1); // left up
        this.next();
        return true;
    };

    Kablamo.prototype.flipInactive = function () {
        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                if (this.board[x][y] === this.current.light) {
                    this.mark(x, y, this.current.dark);
                }
            }
        }
    };

    Kablamo.prototype.mark = function (x, y, val) {
        this.board[x][y] = val;
    }

    Kablamo.prototype.project = function (x, y, deltaX, deltaY) {

        if (this.winner) return;

        var searching = true;

        while (searching) {
            x += deltaX;
            y += deltaY;
            if (x < 0 || x > 9 || y < 0 || y > 9) {
                searching = false;
            } else if (this.board[x][y] !== EMPTY) {
                searching = false;
                if (this.board[x][y] === this.opponent.dark || this.board[x][y] === this.opponent.light) {
                    this.mark(x, y, EMPTY);
                } else if (this.board[x][y] === this.opponent.home) {
                    this.winner = this.current;
                }
            } else {
                this.mark(x, y, this.current.light);
            }
        }
    };

    Kablamo.prototype.next = function () {
        if (this.winner) return;
        var swap = this.current;
        this.current = this.opponent;
        this.opponent = swap;
    };

    return Kablamo;

})();