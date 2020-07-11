var canvas;
var context;
var c_saved;
var original_image = new Image();
original_image.src = "/demo.jpg"; var jcrop_api;
var crop_limit = 75;

var server_url = "localhost";


var mask = createEmptyMask()


// some hotfixes... ( ≖_≖)
// document.body.style.margin = 0;
// canvas.style.position = 'fixed';




// last known position
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

function createEmptyMask(){
    let n = 256;
    let a = new Array(n); for (let i=0; i<n; ++i) a[i] = 0;
    let b = new Array(n); for (let i=0; i<n; ++i) b[i] = a.slice();
    return b;
}


function createEmptyImage() {
    let n = 256;
    let c = new Array(3); for (let i=0; i<3; ++i) c[i] = 0;
    let a = new Array(n); for (let i=0; i<n; ++i) a[i] = c.slice();
    let b = new Array(n); for (let i=0; i<n; ++i) b[i] = a.slice();
    
    return b;
}

function loadImage() {
    scaleToFill(original_image);
    $("#modification-area").show();
    mask = createEmptyMask();
}

function scaleToFill(img) {
    // get the scale
    var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    var x = (canvas.width / 2) - (img.width / 2) * scale;
    var y = (canvas.height / 2) - (img.height / 2) * scale;
    context.drawImage(img, x, y, img.width * scale, img.height * scale);
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
    for (var x = 0; x < 256; x++){
        for (var y = 0; y < 256 ; y++){
            for (var c = 0; c < 3; c++){
                pixel_val = damagedImageData.shift()
                if (c < 3){
                    emptyImage[x][y][c] = pixel_val
                }
            }
        }
    }
    damagedImage = emptyImage


    let body = {
        damaged_image: damagedImage,
        mask: mask
    }
    console.log(body)
    // Send image to server
    jQuery.post(server_url, body, drawFilledImage);
    // Wait for response

    // add image to output canvas
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
    console.log("Not implemented");
    scaleToFill(original_image);
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

    context.beginPath(); // begin

    context.lineWidth = line_width;
    context.lineCap = 'round';
    context.strokeStyle = '#000000';

    context.moveTo(pos.x, pos.y); // from
    setPosition(e);
    context.lineTo(pos.x, pos.y); // to 
    context.stroke(); // draw it!
    bounds = line_width
    for (var x = pos.x-bounds; x < pos.x + 2*bounds; x++){
        for (var y = pos.y-bounds; y < pos.y + 2*bounds; y++){
            if (context.isPointInStroke(x, y)){
                mask[Math.floor(x)][Math.floor(y)] = 1.
            }
        }
    }
}
