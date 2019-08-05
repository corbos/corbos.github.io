const FULL_CIRCLE = Math.PI * 2.0;
const EMPTY = 0;
const HERO = 1;
const WALL = 2;

const COLOR_SHADOW = "#555";
// 654321 brown
const COLOR_WALL = "#654321";
const COLOR_SHADOWED_WALL = "#000";
const COLOR_HERO = "#3337E8";

const CELL_SIZE = 15;

var canvas = document.getElementById("surface");
var txtVisibility = document.getElementById("txtVisibility");
var ctx = canvas.getContext('2d');
ctx.strokeStyle = "#000";
var width = parseInt(canvas.getAttribute("width"), 10);
var height = parseInt(canvas.getAttribute("height"), 10);

var gridWidth = width / CELL_SIZE;
var gridHeight = height / CELL_SIZE;
var heroRow = Math.floor(gridHeight / 2);
var heroCol = Math.floor(gridWidth / 2);
var visibilityRadius = 3;

function Cell(type, color) {
    this.type = type;
    this.color = color;
}

// one-time grid set-up
var grid = [];
for (let r = 0; r < height; r += CELL_SIZE) {
    let row = [];
    for (let c = 0; c < width; c += CELL_SIZE) {
        row.push(new Cell(EMPTY, COLOR_SHADOW));
    }
    grid.push(row);
}

grid[heroRow][heroCol] = new Cell(HERO, COLOR_HERO);

function bearing(x, y) {
    let value = Math.atan2(y, x);
    if (value < 0) {
        value += FULL_CIRCLE;
    }
    return value;
}

function makeArc(cell) {

    var arc = {
        min: 1000000,
        max: -1000000
    };

    var halves = [0.5, -0.5];

    var relativeCol = cell.col - heroCol;
    var relativeRow = heroRow - cell.row;

    for (let x = 0; x < halves.length; x++) {
        for (let y = 0; y < halves.length; y++) {
            let b = bearing(relativeCol + halves[x], relativeRow + halves[y]);
            arc.min = Math.min(arc.min, b);
            arc.max = Math.max(arc.max, b);
        }
    }

    return arc;
}

function Shadows() {
    this.arcs = [];
}

Shadows.prototype = {

    add: function (cell) {
        let arc = makeArc(cell);

        // special case, straddling 0 on the unit circle,
        // break into two arcs.
        if (arc.max - arc.min > Math.PI) {
            let maxMin = Math.atan2(1.0, cell.col - heroCol);
            this.merge({ min: 0.0, max: maxMin });
            this.merge({ min: FULL_CIRCLE - maxMin, max: FULL_CIRCLE });
        } else {
            this.merge(arc);
        }
    },
    merge: function (arc) {

        if (this.arcs.length === 0) {
            this.arcs.push(arc);
            return;
        }

        let candidates = this.arcs;
        let inserted = false;
        for (let i = 0; i < candidates.length; i++) {
            if (arc.min < candidates[i].min) {
                candidates.splice(i, 0, arc);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            candidates.push(arc);
        }

        let arcs = [];
        let current = 0;
        arcs.push(candidates[current]);

        for (let i = 1; i < candidates.length; i++) {
            if (candidates[i].min <= arcs[current].max) {
                arcs[current].max = Math.max(candidates[i].max, arcs[current].max);
            } else {
                arcs.push(candidates[i]);
                current++;
            }
        }

        this.arcs = arcs;
    },
    isShadowed: function (cell) {

        var arc = makeArc(cell);
        var arcs = this.arcs;

        // special case, straddling 0 on the unit circle.
        if (arcs.length > 1 && arc.max - arc.min > Math.PI) {
            if (arcs[0].min < 0.01
                && arcs[arcs.length - 1].max > (Math.PI * 1.99)
                && arc.min <= arcs[0].max
                && arc.max >= arcs[arcs.length - 1].min) {
                return true;
            }
        }

        for (let i = 0; i < arcs.length; i++) {
            if (arc.min > arcs[i].min && arc.max < arcs[i].max) {
                return true;
            }
        }
        return false;
    }
};

function generateRing(distance) {

    let points = [];
    let minRow = Math.max(heroRow - distance + 1, 0);
    let maxRow = Math.min(heroRow + distance, gridHeight);
    let minCol = Math.max(heroCol - distance, 0)
    let maxCol = Math.min(heroCol + distance + 1, gridWidth);

    // top horizontal
    var top = heroRow - distance;
    if (top >= 0) {
        for (let col = minCol; col < maxCol; col++) {
            points.push({ row: top, col: col });
        }
    }

    // bottom horizontal
    var bottom = heroRow + distance;
    if (bottom < gridHeight) {
        for (let col = minCol; col < maxCol; col++) {
            points.push({ row: bottom, col: col });
        }
    }

    // left vertical
    var left = heroCol - distance;
    if (left >= 0) {
        for (let row = minRow; row < maxRow; row++) {
            points.push({ row: row, col: left });
        }
    }

    // right vertical
    var right = heroCol + distance;
    if (right < gridWidth) {
        for (let row = minRow; row < maxRow; row++) {
            points.push({ row: row, col: right });
        }
    }

    points.forEach(pt => {
        pt.distance = calcDistance(pt.row, pt.col);
    });

    return points;
}

function colorize() {
    grid.forEach(function (row) {
        row.forEach(function (cell) {
            if (cell.type === WALL) {
                cell.color = COLOR_SHADOWED_WALL;
            } else if (cell.type !== HERO) {
                cell.color = COLOR_SHADOW;
            }
        });
    });
}

function getLightColor(distance) {
    let shift = Math.floor(255.0 / (visibilityRadius * 2.0));
    let tone = Math.max(255 - ((distance - 1) * shift), 0);
    let toneStr = tone.toString(16);
    if (toneStr.length === 1) {
        toneStr = "0" + toneStr;
    }
    return "#" + toneStr + toneStr + "00";
}

function calculate() {

    var points = [];
    var shadows = new Shadows();

    // queue up candidates (some may be left over each round)
    for (let distance = 1; distance <= visibilityRadius; distance++) {

        points = points.concat(generateRing(distance));
        // process the closest cells first to avoid faux shadows
        points.sort((a, b) => a.distance - b.distance);

        let next = [];

        points.forEach(pt => {
            if (pt.distance <= distance) {
                if (!shadows.isShadowed(pt)) {
                    if (grid[pt.row][pt.col].type === WALL) {
                        grid[pt.row][pt.col].color = COLOR_WALL;
                        shadows.add(pt);
                    } else {
                        grid[pt.row][pt.col].color = getLightColor(distance);
                    }
                }
            } else {
                next.push(pt);
            }
        });

        points = next;
    }
}

function calcDistance(row, col) {
    var rowDelta = heroRow - row;
    var colDelta = heroCol - col;
    var d = Math.sqrt(Math.pow(rowDelta, 2) + Math.pow(colDelta, 2));
    return d;
}

function draw() {

    colorize();
    calculate();

    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            ctx.fillStyle = grid[row][col].color;
            ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
}

// event handling
var cellType = WALL;
function handleWalls(e) {
    var x = e.clientX - this.offsetLeft + (window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft);
    var y = e.clientY - this.offsetTop + (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop);
    var row = Math.floor(y / CELL_SIZE);
    var col = Math.floor(x / CELL_SIZE);
    if (grid[row][col].type !== HERO) {
        grid[row][col].type = cellType;
        draw();
    }
}

canvas.addEventListener('mousedown', function (e) {
    var x = e.clientX - this.offsetLeft + (window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft);
    var y = e.clientY - this.offsetTop + (window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop);
    var row = Math.floor(y / CELL_SIZE);
    var col = Math.floor(x / CELL_SIZE);
    if (grid[row][col].type === EMPTY) {
        cellType = WALL;
        canvas.addEventListener("mousemove", handleWalls);
        handleWalls.call(this, e);
    } else if (grid[row][col].type === WALL) {
        cellType = EMPTY;
        canvas.addEventListener("mousemove", handleWalls);
        handleWalls.call(this, e);
    }
});

canvas.addEventListener('mouseup', function () {
    canvas.removeEventListener("mousemove", handleWalls);
});

document.addEventListener("keydown", function (evt) {
    let current = grid[heroRow][heroCol];
    switch (evt.key) {
        case "w":
        case "W":
        case "Up":
        case "ArrowUp":
            if (evt.target.tagName === "INPUT" && evt.target.id === "txtVisibility") {
                return;
            }
            evt.preventDefault();
            if (heroRow - 1 >= 0 && grid[heroRow - 1][heroCol].type !== WALL) {
                grid[heroRow][heroCol] = grid[heroRow - 1][heroCol];
                grid[heroRow - 1][heroCol] = current;
                heroRow--;
                draw();
            }
            break;
        case "a":
        case "A":
        case "Left":
        case "ArrowLeft":
            if (heroCol - 1 >= 0 && grid[heroRow][heroCol - 1].type !== WALL) {
                grid[heroRow][heroCol] = grid[heroRow][heroCol - 1];
                grid[heroRow][heroCol - 1] = current;
                heroCol--;
                draw();
            }
            break;
        case "s":
        case "S":
        case "Down":
        case "ArrowDown":
            if (evt.target.tagName === "INPUT" && evt.target.id === "txtVisibility") {
                return;
            }
            evt.preventDefault();
            if (heroRow + 1 < gridHeight && grid[heroRow + 1][heroCol].type !== WALL) {
                grid[heroRow][heroCol] = grid[heroRow + 1][heroCol];
                grid[heroRow + 1][heroCol] = current;
                heroRow++;
                draw();
            }
            break;
        case "d":
        case "D":
        case "Right":
        case "ArrowRight":
            if (heroCol + 1 < gridWidth && grid[heroRow][heroCol + 1].type !== WALL) {
                grid[heroRow][heroCol] = grid[heroRow][heroCol + 1];
                grid[heroRow][heroCol + 1] = current;
                heroCol++;
                draw();
            }
            break;
    }
});

txtVisibility.addEventListener("change", function () {
    if (txtVisibility.checkValidity()) {
        visibilityRadius = parseInt(txtVisibility.value, 10);
        draw();
    }
});

visibilityRadius = parseInt(txtVisibility.value, 10);
draw();