const FULL_CIRCLE = Math.PI * 2.0;

function VonBruenchenhein(canvasId, renderedCallback) {

    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
        throw new Error(`Canvas element '${canvasId}' was not found.`);
    }
    this.ctx = this.canvas.getContext('2d');
    this.renderedCallback = renderedCallback || (() => { });

    // init properties
    this.points = [];
    this.lineWidth = 3;
    this.strokeStyle = '#000000';
    this.lineJoin = this.lineCap = 'round';
    this.shadowBlur = 0;
    this.shadowColor = '#000000';
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.history = [];

    this.clear();
    this.initEvents();
}

VonBruenchenhein.prototype.mouseToPoint = function (e) {
    return {
        x: e.clientX - this.canvas.offsetLeft + window.pageXOffset,
        y: e.clientY - this.canvas.offsetTop + window.pageYOffset
    };
};

VonBruenchenhein.prototype.safeColor = function (val) {
    return Math.max(Math.min(Math.round(val), 255), 0);
};

VonBruenchenhein.prototype.clear = function () {
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.history = [];
    this.rendered();
};

VonBruenchenhein.prototype.rendered = function () {
    this.dataURL = this.canvas.toDataURL("image/jpeg", 0.7);
    this.history.push({
        width: this.canvas.width,
        height: this.canvas.height,
        url: this.dataURL
    });
    this.renderedCallback(this.dataURL);
};

VonBruenchenhein.prototype.resize = function (scale) {

    const canvas = this.canvas;
    const ctx = this.ctx;
    const image = new Image();

    image.onload = () => {
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(canvas.width * image.height / image.width);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        this.rendered();
    };

    image.src = canvas.toDataURL("image/jpeg", 1.0);
}

VonBruenchenhein.prototype.enlarge = function () {
    this.resize(1.1);
};

VonBruenchenhein.prototype.shrink = function () {
    this.resize(0.9);
};

VonBruenchenhein.prototype.undo = function () {

    if (this.history.length > 1) {
        this.history.pop();
    }

    const canvas = this.canvas;
    const ctx = this.ctx;
    const image = new Image();
    const h = this.history[this.history.length - 1];

    image.onload = () => {
        canvas.width = h.width;
        canvas.height = h.height;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };

    image.src = h.url;
};

VonBruenchenhein.prototype.startDrawing = function (e) {
    this.drawing = true;
    this.points.push(this.mouseToPoint(e));
};

VonBruenchenhein.prototype.moveDrawing = function (e) {
    if (this.drawing) {
        const pt = this.mouseToPoint(e);
        this.points.push(pt);
        this.drawLine();
    }
};

VonBruenchenhein.prototype.stopDrawing = function (e) {
    if (this.drawing) {
        this.drawLine();
        this.drawing = false;
        this.points.length = 0;
        this.rendered();
    }
};

VonBruenchenhein.prototype.setDrawingProperties = function (ctx) {
    ctx.lineWidth = this.lineWidth;
    ctx.lineJoin = this.lineJoin;
    ctx.lineCap = this.lineCap;
    ctx.strokeStyle = this.strokeStyle;
    ctx.shadowBlur = this.shadowBlur;
    ctx.shadowColor = this.shadowColor;
    ctx.shadowOffsetX = this.shadowOffsetX;
    ctx.shadowOffsetY = this.shadowOffsetY;
};

VonBruenchenhein.prototype.drawLine = function () {

    const ctx = this.ctx;
    const points = this.points;

    ctx.save();
    this.setDrawingProperties(ctx);
    ctx.beginPath();
    if (points.length === 1) {
        ctx.fillStyle = this.strokeStyle;
        ctx.arc(points[0].x, points[0].y, Math.max(Math.round(ctx.lineWidth / 2), 0.5), 0, FULL_CIRCLE);
        ctx.fill();
    } else {
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
    }

    ctx.restore();
};

VonBruenchenhein.prototype.initEvents = function () {

    const vb = this;

    this.canvas.addEventListener('mousedown', e => vb.startDrawing(e));
    this.canvas.addEventListener('mousemove', e => vb.moveDrawing(e));
    this.canvas.addEventListener('mouseup', e => vb.stopDrawing(e));
    this.canvas.addEventListener('mouseout', e => vb.stopDrawing(e));
    this.canvas.addEventListener('mouseover', e => {
        if (vb.mouseDown) {
            vb.startDrawing(e);
        }
    });

    window.addEventListener('mousedown', function () { vb.mouseDown = true; });
    window.addEventListener('mouseup', function () { vb.mouseDown = false; });
};