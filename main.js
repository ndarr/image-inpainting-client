var canvas;
var context;
var c_saved;
var original_image = new Image();
original_image.src = "demo.jpg"; var jcrop_api;
var crop_limit = 75;

var server_url = "http://darr.cloud:6969";


var mask = createEmptyMask()

var pos = { x: 0, y: 0 };

var context;
var canvas;

// window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

$(window).on("load", function () {
    canvas = document.getElementById("image");
    context = canvas.getContext("2d");

    c_saved = canvas;

    make_base();

    $("#file-input").on("change", file_input);
    $("#btn-load-image").prop("disabled", true);
    scaleToFill(original_image);
});

function file_input(event) {
    $("#btn-load-image").prop("disabled", true);
    original_image = new Image();
    original_image.src = "";
    status.textContent = "";
    const file = event.target.files[0];
    if (file == null) {
        return;
    }
    if (!file.type) {
        status.textContent =
            "Error: The File.type property does not appear to be supported on this browser.";
        return;
    }
    if (!file.type.match("image.*")) {
        status.textContent =
            "Error: The selected file does not appear to be an image.";
        return;
    }
    $("#btn-load-image").prop("disabled", false);
    const reader = new FileReader();
    reader.addEventListener("load", (event) => {
        original_image.src = event.target.result;
    });
    reader.readAsDataURL(file);
}

function make_base() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.w, canvas.h);
}

function createEmptyMask() {
    let n = 256;
    let a = new Array(n); for (let i = 0; i < n; ++i) a[i] = 0;
    let b = new Array(n); for (let i = 0; i < n; ++i) b[i] = a.slice();
    return b;
}


function createEmptyImage() {
    let n = 256;
    let c = new Array(3); for (let i = 0; i < 3; ++i) c[i] = 0;
    let a = new Array(n); for (let i = 0; i < n; ++i) a[i] = c.slice();
    let b = new Array(n); for (let i = 0; i < n; ++i) b[i] = a.slice();

    return b;
}

function loadImage() {
    scaleToFill(original_image);
    $("#modification-area").show();
    mask = createEmptyMask();
    // create off-screen canvas element
    var output_canvas = document.getElementById('output-img'),
        ctx = output_canvas.getContext('2d');
        
        ctx.clearRect(0, 0, 256, 256);
}

function scaleToFill(img) {
    // get the scale
    var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    var x = (canvas.width / 2) - (img.width / 2) * scale;
    var y = (canvas.height / 2) - (img.height / 2) * scale;
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
    imgData = context.getImageData(0, 0, 256, 256)
    d = imgData.data
    for (var i = 0; i < d.length; i++){
        if (d[i] == 0){
            d[i] = 1
        }
    }
    imgData.data.set(d)
    context.putImageData(imgData, 0, 0)


}

function updatePreview(c) {
    loadImage();
    if (c.h > crop_limit || c.w > crop_limit) {
        c.h = crop_limit;
        c.w = crop_limit;
    }
    c_saved = c;
}

function postImage() {
    //Get image from canvas

    //var imageData = canvas.toDataURL("image/jpg", 1.0);
    var damagedImageData = Array.prototype.slice.call(context.getImageData(0, 0, 256, 256).data);


    let emptyImage = createEmptyImage()

    imageHeight = 256
    imageWidth = 256
    data = damagedImageData
    damagedImage = emptyImage


    let body = {
        damagedImage: data,
        mask: mask
    }
    console.log(JSON.stringify(body))
    console.log(body)
    // Send image to server
    $.ajax({
        type: "POST",
        url: server_url,
        data: JSON.stringify(body),
        dataType: "json",
        contentType: "application/json",
        success: drawFilledImage
    })

    // create off-screen canvas element
    var output_canvas = document.getElementById('output-img'),
        ctx = output_canvas.getContext('2d');
        ctx.clearRect(0, 0, 256, 256);

}

function getPixelValues(image) {
    var img = new Image();
    img.src = image.src;

    var cnv = document.createElement('canvas');
    var ctx = cnv.getContext('2d');
    ctx.drawImage(img, 0, 0, 256, 256);
    return ctx.getImageData(0, 0, 256, 256);
}


function drawFilledImage(data, textStatus, jjqXHR) {
    // TODO
    console.log(data)

    //alert("Doing")
    var width = 256,
       height = 256;

    buffer= Uint8ClampedArray.from(data)
    var output_canvas = document.getElementById('output-img'),
        ctx = output_canvas.getContext('2d');

    output_canvas.width = width;
    output_canvas.height = height;

    // create imageData object
    var idata = ctx.createImageData(width, height);

    // set our buffer as source
    idata.data.set(buffer);
    console.log(buffer)

    // update canvas with new data
    ctx.putImageData(idata, 0, 0, 0, 0, 256, 256);

}

// new position from mouse event
function setPosition(e) {
    var rect = canvas.getBoundingClientRect();
    pos.x = e.clientX - rect.left;
    pos.y = e.clientY - rect.top;
}


function draw(e) {
    // mouse left button must be pressed
    let line_width = 10;

    if (e.buttons !== 1) return;

    origImgData = context.getImageData(0, 0, 256, 256)

    context.beginPath(); // begin

    context.lineWidth = line_width;
    context.lineCap = 'round';
    context.strokeStyle = '#000000';

    context.moveTo(pos.x, pos.y); // from
    setPosition(e);
    context.lineTo(pos.x, pos.y); // to 
    context.stroke(); // draw it!

    afterImgData = context.getImageData(0, 0, 256, 256)

    d = afterImgData.data

    for (var i = 0; i < d.length; i++){
        if (d[i] != 0){
            d[i] = origImgData.data[i]
        }
    }
    afterImgData.data.set(d)
    context.putImageData(afterImgData, 0, 0)

}
