(function (k) {

    var min = -100000000;

    function nextBoard(board, coord) {

        var result = {
            win: false,
            delta: -1, // the "exploded" cell starts us with a deficit     
            board: k.cloneBoard(board)
        };

        var current = k.RED;
        var opponent = k.BLUE;

        if (board[coord.x][coord.y] === k.BDARK) {
            current = k.BLUE;
            opponent = k.RED;
        }

        result.board[coord.x][coord.y] = k.EMPTY;

        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                if (result.board[x][y] === current.light) {
                    result.board[x][y] = current.dark;
                }
            }
        }

        this.project(result, coord, 1, 0, current, opponent);
        this.project(result, coord, -1, 0, current, opponent);
        this.project(result, coord, 0, -1, current, opponent);
        this.project(result, coord, 0, 1, current, opponent);
        this.project(result, coord, 1, -1, current, opponent);
        this.project(result, coord, 1, 1, current, opponent);
        this.project(result, coord, -1, 1, current, opponent);
        this.project(result, coord, -1, -1, current, opponent);

        return result;
    }

    function project(result, coord, deltaX, deltaY, current, opponent) {

        var searching = true;
        var x = coord.x;
        var y = coord.y;
        var board = result.board;

        while (searching) {
            x += deltaX;
            y += deltaY;
            if (x < 0 || x > 9 || y < 0 || y > 9) {
                searching = false;
            } else if (board[x][y] !== k.EMPTY) {
                searching = false;
                if (board[x][y] === opponent.dark || board[x][y] === opponent.light) {
                    board[x][y] = k.EMPTY;
                    result.delta++;
                } else if (board[x][y] === opponent.home) {
                    result.win = true;
                }
            } else {
                board[x][y] = current.light;
                result.delta++;
            }
        }
    }

    function evaluate(board, coord, depth, factor) {

        var result = this.nextBoard(board, coord);
        if (result.win) { // Either really good or really bad. No need to go further.
            return 1000000 * factor;
        }
        if (depth === 0) {
            return result.delta * factor;
        }
        var active = k.getActive(result.board, factor > 0 ? this.otherColor : this.activeColor);
        if (active.length === 0) { // Avoid situations with no moves and nudge opponents toward it.
            return 1000 * factor;
        }

        var x, val, n;
        var flippedFactor = factor * -1;
        var d = depth - 1;

        if (factor > 0) {
            n = 100000000;
            for (x = 0; x < active.length; x++) {
                val = this.evaluate(result.board, active[x], d, flippedFactor);
                if (val < n) {
                    n = val;
                }
            }
        } else {
            n = min;
            for (x = 0; x < active.length; x++) {
                val = this.evaluate(result.board, active[x], d, flippedFactor);
                if (val > n) {
                    n = val;
                }
            }
        }

        return (result.delta * factor) + n;
    }

    function buildSpaceFiller(key, description, depth) {

        var ctor = function (activeColor, callback) {
            this.activeColor = activeColor;
            this.otherColor = activeColor === k.BDARK ? k.RDARK : k.BDARK;
            this.callback = callback;
        };

        ctor.key = key;
        ctor.description = description;

        ctor.prototype.nextBoard = nextBoard;
        ctor.prototype.project = project;
        ctor.prototype.evaluate = evaluate;
        ctor.prototype.selectMove = function (board) {

            var x, val;
            var active = k.getActive(board, this.activeColor);
            var pick;
            var max = min;

            if (active.length === 0) {
                this.callback();
            } else if (active.length === 1) {
                this.callback(active[0].x, active[0].y);
            } else {
                for (x = 0; x < active.length; x++) {
                    val = this.evaluate(board, active[x], depth, 1);
                    if (val > max) {
                        max = val;
                        pick = active[x];
                    }
                }
                this.callback(pick.x, pick.y);
            }
        };
        return ctor;
    }

    // human =======
    function HumanStrategy(activeColor, callback) {
        this.callback = callback;
        this.active = false;
    }

    HumanStrategy.key = "human";
    HumanStrategy.description = "Human";

    HumanStrategy.prototype.selectMove = function (board) {
        this.active = true;
    };

    HumanStrategy.prototype.handleClick = function (x, y) {
        if (this.active) {
            this.callback(x, y);
            this.active = false;
        }
    };

    k.register(HumanStrategy);

    // random =========
    function RandomStrategy(activeColor, callback) {
        this.activeColor = activeColor;
        this.callback = callback;
    }

    RandomStrategy.key = "random";
    RandomStrategy.description = "Random";

    RandomStrategy.prototype.selectMove = function (board) {

        var x, y;
        var active = k.getActive(board, this.activeColor);
        var pick;

        if (active.length === 0) {
            this.callback();
        } else {
            pick = active[Math.floor(Math.random() * active.length)];
            this.callback(pick.x, pick.y);
        }
    };

    k.register(RandomStrategy);

    // Space fillers ==============
    k.register(buildSpaceFiller("oneply", "1-ply Space Filler", 0));
    k.register(buildSpaceFiller("twoply", "2-ply Space Filler", 1));
    k.register(buildSpaceFiller("threeply", "3-ply Space Filler", 2));
    k.register(buildSpaceFiller("fourply", "4-ply Space Filler", 3));


})(Kablamo);