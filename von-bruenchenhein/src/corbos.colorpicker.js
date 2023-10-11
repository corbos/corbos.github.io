(() => {

    const pickers = document.querySelectorAll('input[data-colorpicker]');

    const square = 120;

    let canvas;
    let current;
    let hovered = false;

    const hexChars = "0123456789ABCDEF";

    function intToHex(val) {
        const first = Math.floor(val / 16);
        const second = val % 16;
        return hexChars.charAt(first) + hexChars.charAt(second);
    }

    function colorStrength(focus, index) {
        const diff = Math.min(Math.abs(focus - index), Math.abs(focus + 120 - index));
        if (diff <= 20) {
            return 255;
        } else if (diff > 40) {
            return 0.0;
        }
        return Math.max(0, 255 - (255 * (diff - 20.0) / 25.0));
    }

    const safeColor = val => Math.min(255, Math.max(0, Math.round(val)));

    function createCanvas() {

        const canvas = document.createElement('canvas');

        canvas.width = square;
        canvas.height = square;
        canvas.style.display = 'none';
        canvas.style.position = 'absolute';
        const ctx = canvas.getContext('2d');

        for (let i = 0; i < square; i++) {
            const red = colorStrength(0, i);
            const green = colorStrength(40, i);
            const blue = colorStrength(80, i);
            for (let j = 0; j < square; j++) {
                const factor = 3.2 * (j - 60);
                ctx.fillStyle = '#'
                    + intToHex(safeColor(red - factor))
                    + intToHex(safeColor(green - factor))
                    + intToHex(safeColor(blue - factor))
                ctx.fillRect(i, j, 1, 1);
            }
        }

        canvas.addEventListener('click', function (e) {

            const x = e.clientX - this.offsetLeft + window.pageXOffset;
            const y = e.clientY - this.offsetTop + window.pageYOffset;
            const data = ctx.getImageData(x, y, 1, 1).data;

            current.value = '#' + intToHex(data[0]) + intToHex(data[1]) + intToHex(data[2]);
            this.style.display = 'none';
            whatNext.emit('colorChange', current);
        });

        canvas.addEventListener('mouseover', () => hovered = true);
        canvas.addEventListener('mouseout', () => hovered = false);

        return canvas;
    };

    if (pickers.length > 0) {

        canvas = createCanvas();
        pickers[0].parentNode.appendChild(canvas);

        for (const picker of pickers) {
            picker.addEventListener('focus', function () {
                picker.parentNode.appendChild(canvas);
                canvas.style.display = 'block';
                current = picker;
            });
            picker.addEventListener('blur', function () {
                if (!hovered) {
                    canvas.style.display = 'none';
                }
            });
            picker.addEventListener('change', function () {
                whatNext.emit('colorChange', this);
            });
        }
    }

})();

whatNext.on('colorChange', elem => {

    const val = elem.value.replace('#', '');

    if (val.length === 6) {
        const red = parseInt(val.substring(0, 2), 16);
        const green = parseInt(val.substring(2, 4), 16);
        const blue = parseInt(val.substring(4, 6), 16);
        const avg = (red + green + blue) / 3.0;
        elem.style.background = elem.value;
        elem.style.color = avg < 125 ? "#FFF" : "#000";
    }
});