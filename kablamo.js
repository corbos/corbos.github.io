(function () {

    function Player(home, light, dark, name) {
        this.home = home;
        this.light = light;
        this.dark = dark;
        this.name = name;
    }

    var EMPTY = 0;
    var BRICK = 1;
    var RHOME = 2;
    var RLITE = 3;
    var RDARK = 4;
    var BHOME = 5;
    var BLITE = 6;
    var BDARK = 7;

    var colors = [];
    colors[EMPTY] = "#FFF";
    colors[BRICK] = "#555555";
    colors[RHOME] = "#750000";
    colors[RLITE] = "#FFCCCC";
    colors[RDARK] = "#BA0000";
    colors[BHOME] = "#000075";
    colors[BLITE] = "#CCCCFF";
    colors[BDARK] = "#0000BA";

    var player = new Player(BHOME, BLITE, BDARK, "Blue");
    var opponent = new Player(RHOME, RLITE, RDARK, "Red");


    var board = [
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

    var ui = [[], [], [], [], [], [], [], [], [], []];

    var win = false;
    var surface = SVG("svg").size(500, 500);
    var msg = document.getElementById("msg");

    function nextTurn() {
        var swap = player;
        player = opponent;
        opponent = swap;
        msg.innerText = player.name + "'s Turn";
    }

    function flipInactive() {
        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                if (board[x][y] === player.light) {
                    mark(x, y, player.dark);
                }
            }
        }
    }

    function project(x, y, deltaX, deltaY) {

        if (win) return;

        var searching = true;

        while (searching) {
            x += deltaX;
            y += deltaY;
            if (x < 0 || x > 9 || y < 0 || y > 9) {
                searching = false;
            } else if (board[x][y] !== EMPTY) {
                searching = false;
                if (board[x][y] === opponent.dark || board[x][y] === opponent.light) {
                    mark(x, y, EMPTY);
                } else if (board[x][y] === opponent.home) {
                    msg.innerText = player.name + " WINS!";
                    win = true;
                }
            } else {
                mark(x, y, player.light);
            }
        }
    }

    function mark(x, y, val) {
        board[x][y] = val;
        ui[x][y].fill(colors[val]);
    }

    function explode(x, y) {

        flipInactive();
        mark(x, y, EMPTY);

        for (var deltaX = -1; deltaX < 2; deltaX++) {
            for (var deltaY = -1; deltaY < 2; deltaY++) {
                if (!(deltaX === 0 && deltaY === 0)) {
                    project(x, y, deltaX, deltaY);
                }
            }
        }

        if (win) {
            ui.forEach(function (row) {
                row.forEach(function (cell) {
                    cell.animate().fill(colors[player.home]);
                })
            });
        } else {
            nextTurn();
        }
    }

    function move() {
        var x = this.attr("kablamo:x");
        var y = this.attr("kablamo:y");
        if (board[x][y] === player.dark) {
            explode(x, y);
        }
    }

    for (var x = 0; x < 10; x++) {
        for (var y = 0; y < 10; y++) {
            ui[x][y] = surface.rect(50, 50)
                .fill(colors[board[x][y]])
                .stroke("#000")
                .move(x * 50, y * 50)
                .attr({
                    "kablamo:x": x,
                    "kablamo:y": y
                }).click(move);
        }
    }

})();