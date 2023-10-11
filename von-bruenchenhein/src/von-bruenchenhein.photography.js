VonBruenchenhein.prototype.restoreImage = function () {

    const canvas = this.canvas;
    const ctx = this.ctx;

    if (this.image) {
        canvas.width = this.image.width;
        canvas.height = this.image.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.image, 0, 0);
        this.rendered();
    }
};

VonBruenchenhein.prototype.setImageSrc = function (src) {
    this.image = new Image();
    this.image.style.display = "none";
    this.image.onload = () => this.restoreImage();
    this.image.src = src;
};

// start simple transformations

VonBruenchenhein.prototype.transform = function (fn) {

    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        fn(data, i);
    }
    this.ctx.putImageData(imgData, 0, 0);
    this.rendered();
};

VonBruenchenhein.prototype.redder = function () {
    this.transform((data, i) => {
        data[i] = Math.min(data[i] + 50, 255);
    });
};

VonBruenchenhein.prototype.greener = function () {
    this.transform((data, i) => {
        data[i + 1] = Math.min(data[i + 1] + 50, 255);
    });
};

VonBruenchenhein.prototype.bluer = function () {
    this.transform((data, i) => {
        data[i + 2] = Math.min(data[i + 2] + 50, 255);
    });
};

VonBruenchenhein.prototype.lighter = function () {
    this.transform((data, i) => {
        data[i] = Math.min(data[i] + 25, 255);
        data[i + 1] = Math.min(data[i + 1] + 25, 255);
        data[i + 2] = Math.min(data[i + 2] + 25, 255);
    });
};

VonBruenchenhein.prototype.darker = function () {
    this.transform((data, i) => {
        data[i] = Math.max(data[i] - 25, 0);
        data[i + 1] = Math.max(data[i + 1] - 25, 0);
        data[i + 2] = Math.max(data[i + 2] - 25, 0);
    });
};

VonBruenchenhein.prototype.grayscale = function () {
    this.transform((data, i) => {
        const avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    });
};

VonBruenchenhein.prototype.blackAndWhite = function () {
    this.grayscale();
    this.transform((data, i) => {
        if (data[i] < 128) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        } else {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
        }
    });
};

VonBruenchenhein.prototype.invert = function () {
    this.transform((data, i) => {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    });
};

// start kernels

VonBruenchenhein.prototype.runKernel = function (kernel) {

    const canvas = this.canvas;
    const ctx = this.ctx;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const len = data.length;
    const width = canvas.width * 4;
    const height = canvas.height;
    const buffer = [];
    const safeColor = this.safeColor;

    const work = function (data, index) {

        let red = 0.0;
        let green = 0.0;
        let blue = 0.0;
        const row = Math.floor(index / width);
        const col = index % width;

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                let c = col + (j * 4);
                let widthOffset = i;
                let heightOffset = j;
                if (row + i < 0 || row + i >= height) {
                    widthOffset = 0;
                }
                if (c < 0 || c >= height) {
                    heightOffset = 0;
                }
                let baseIndex = index + (width * widthOffset) + (heightOffset * 4);
                let k = kernel[i + 1][j + 1];
                red += (data[baseIndex] * k);
                green += (data[baseIndex + 1] * k);
                blue += (data[baseIndex + 2] * k);
            }
        }

        buffer[index] = safeColor(red);
        buffer[index + 1] = safeColor(green);
        buffer[index + 2] = safeColor(blue);
        buffer[index + 3] = data[index + 3];
    };

    for (let index = 0; index < len; index += 4) {
        work(data, index);
    }

    for (let index = 0; index < len; index++) {
        data[index] = buffer[index];
    }

    ctx.putImageData(imgData, 0, 0);
    this.rendered();
};

VonBruenchenhein.prototype.sharpen = function () {
    this.runKernel([
        [0.0, -1.0, 0.0],
        [-1.0, 5.0, -1.0],
        [0.0, -1.0, 0.0]
    ]);
};

VonBruenchenhein.prototype.blur = function () {
    this.runKernel([
        [0.0625, 0.125, 0.0625],
        [0.125, 0.25, 0.125],
        [0.0625, 0.125, 0.0625]
    ]);
};

VonBruenchenhein.prototype.emboss = function () {
    this.runKernel([
        [-2.0, -1.0, 0.0],
        [-1.0, 1.0, 1.0],
        [0.0, 1.0, 2.0]
    ]);
};

VonBruenchenhein.prototype.outline = function () {
    this.runKernel([
        [-1.0, -1.0, -1.0],
        [-1.0, 8.0, -1.0],
        [-1.0, -1.0, -1.0]
    ]);
};

VonBruenchenhein.prototype.edge = function () {
    this.runKernel([
        [-1.0, 0.0, 0.0],
        [-1.0, 3.0, 0.0],
        [-1.0, 0.0, 0.0]
    ]);
};

VonBruenchenhein.prototype.sobelBottom = function () {
    this.runKernel([
        [-1.0, -2.0, -1.0],
        [0.0, 0.0, 0.0],
        [1.0, 2.0, 1.0]
    ]);
};

VonBruenchenhein.prototype.gradientHorizontal = function () {
    this.runKernel([
        [-1.0, -1.0, -1.0],
        [0.0, 0.0, 0.0],
        [1.0, 1.0, 1.0]
    ]);
};
