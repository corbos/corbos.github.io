const download = document.getElementById('download');
const app = new VonBruenchenhein('canvas', url => download.href = url);
const theFile = document.getElementById('theFile');

function handleOperation() {
    app[this.getAttribute('data-vb-operation')]();
}

function handleProp() {

    const key = this.getAttribute('data-vb-property');

    if (typeof app[key] === "number") {
        const n = parseInt(this.value, 10);
        if (!isNaN(n)) {
            app[key] = n;
        }
    } else {
        app[key] = this.value;
    }
}

whatNext.on('colorChange', function (elem) {
    const key = elem.getAttribute('data-vb-property');
    app[key] = elem.value;
});

theFile.addEventListener("change", function () {

    if (theFile.files.length === 0) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function () {
        app.setImageSrc(reader.result);
    };
    reader.readAsDataURL(theFile.files[0]);

}, false);

for (const btn of document.querySelectorAll('button[data-vb-operation]')) {
    btn.addEventListener('click', handleOperation);
}

for (const ctrl of document.querySelectorAll('*[data-vb-property]')) {
    ctrl.addEventListener('change', handleProp);
    ctrl.value = app[ctrl.getAttribute('data-vb-property')];
    if (typeof ctrl.getAttribute('data-colorpicker') === "string") {
        whatNext.emit('colorChange', ctrl);
    }
}