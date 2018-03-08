(function (Kablamo) {

    function byId(id) {
        return document.getElementById(id);
    }

    var spnPlayer = byId("spnPlayer");
    var btnStart = byId("btnStart");
    var btnPause = byId("btnPause");
    var blueStrategy = byId("blueStrategy");
    var redStrategy = byId("redStrategy");
    var expectedStrategy = null;
    var timeoutHandle;
    var pause = 50;

    var colors = [];
    colors[Kablamo.EMPTY] = "#FFF";
    colors[Kablamo.BRICK] = "#555555";
    colors[Kablamo.RHOME] = "#750000";
    colors[Kablamo.RLITE] = "#FFCCCC";
    colors[Kablamo.RDARK] = "#BA0000";
    colors[Kablamo.BHOME] = "#000075";
    colors[Kablamo.BLITE] = "#CCCCFF";
    colors[Kablamo.BDARK] = "#0000BA";

    function Player(home, light, dark, strategy) {
        this.home = home;
        this.light = light;
        this.dark = dark;
        this.name = home === Kablamo.BHOME ? "Blue" : "Red";
        this.strategy = strategy;
    }

    function populateStrategies(ddl) {
        var key, strategy, option;
        var selected = true;
        for (key in Kablamo.strategies) {
            if (!Kablamo.strategies.hasOwnProperty(key)) {
                continue;
            }
            strategy = Kablamo.strategies[key];
            option = document.createElement("option");
            option.value = key;
            option.innerText = strategy.description;
            if (selected) {
                option.setAttribute("selected", "selected");
                selected = false;
            }
            ddl.appendChild(option);
        }
    }

    populateStrategies(blueStrategy);
    populateStrategies(redStrategy);

    function create() {

        var bKey = blueStrategy.value;
        var rKey = redStrategy.value;

        var bStrategy = new Kablamo.strategies[bKey](Kablamo.BDARK, onMove);
        var rStrategy = new Kablamo.strategies[rKey](Kablamo.RDARK, onMove);

        var blue = new Player(Kablamo.BHOME, Kablamo.BLITE, Kablamo.BDARK, bStrategy);
        var red = new Player(Kablamo.RHOME, Kablamo.RLITE, Kablamo.RDARK, rStrategy);

        return new Kablamo(red, blue);
    }

    var k = create();

    function boardClicked() {
        var x = this.attr("kablamo:x") * 1;
        var y = this.attr("kablamo:y") * 1;
        if (k.board[x][y] === k.current.dark) {
            if (typeof k.current.strategy.handleClick === "function") {
                k.current.strategy.handleClick(x, y);
            }
        }
    }

    function makeUI() {
        var surface = SVG("svg").size(500, 500);
        var ui = [[], [], [], [], [], [], [], [], [], []];
        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                ui[x][y] = surface.rect(50, 50)
                    .stroke("#000")
                    .move(x * 50, y * 50)
                    .attr({
                        "kablamo:x": x,
                        "kablamo:y": y
                    }).click(boardClicked);
            }
        }
        return ui;
    }

    var ui = makeUI();

    function promptMove() {
        expectedStrategy = k.current.strategy;
        expectedStrategy.selectMove(Kablamo.cloneBoard(k.board));
    }

    function onMove(x, y) {
        if (this !== expectedStrategy) {
            return;
        }
        expectedStrategy = null;
        if (x === undefined) {
            k.next(); // no valid move so pass...
            render();
        }
        else if (k.move(x, y)) {
            render();
        } else {
            console.log("Invalid move:", { x: x, y: y });
        }
        if (!k.winner) {
            timeoutHandle = setTimeout(function () {
                promptMove();
            }, pause);
        }
    }

    function render() {
        for (var x = 0; x < 10; x++) {
            for (var y = 0; y < 10; y++) {
                ui[x][y].fill(colors[k.board[x][y]]);
            }
        }
        if (k.winner) {
            ui.forEach(function (row) {
                row.forEach(function (cell) {
                    cell.animate().fill(colors[k.winner.home]);
                })
            });
        } else {
            spnPlayer.innerText = k.current.name;
        }
    }

    function togglePause(paused) {
        btnPause.setAttribute("data-paused", paused ? "1" : "0");
        btnPause.innerText = paused ? "Resume" : "Pause";
    }

    function reset() {
        var blueIsHuman = blueStrategy.value === "human";
        if (blueIsHuman) {
            btnStart.style.display = "none";
            btnPause.style.display = "none";
        } else {
            btnStart.style.display = "inline-block";
            btnPause.style.display = "inline-block";
        }
        clearTimeout(timeoutHandle);
        k = create();
        render();
        togglePause(false);
        if (blueIsHuman) {
            promptMove();
        }
    }

    function start() {
        reset();
        promptMove();
    }

    btnStart.addEventListener("click", start);
    redStrategy.addEventListener("change", reset);
    blueStrategy.addEventListener("change", reset);

    btnPause.addEventListener("click", function () {
        if (this.getAttribute("data-paused") == "0") {
            clearTimeout(timeoutHandle);
            togglePause(true);
        } else {
            promptMove();
            togglePause(false);
        }
    });

    reset();
    render();
    promptMove();

})(Kablamo);