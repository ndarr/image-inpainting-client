var canvas;
var context;
var c_saved;
var original_image = new Image();
original_image.src = "/demo.jpg"; var jcrop_api;
var crop_limit = 75;

var server_url = "http://localhost:5000";


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

    imageHeight = 256
    imageWidth = 256
    data = damagedImageData
    console.log(data)
    // iterate over all pixels based on x and y coordinates
    // for (var y = 0; y < imageHeight; y++) {
    //     // loop through each column
    //     for (var x = 0; x < imageWidth; x++) {
    //         var red = data[((imageWidth * y) + x) * 4];
    //         var green = data[((imageWidth * y) + x) * 4 + 1];
    //         var blue = data[((imageWidth * y) + x) * 4 + 2];
    //         var alpha = data[((imageWidth * y) + x) * 4 + 3];
    //         emptyImage[y][x][0] = red;
    //         emptyImage[y][x][1] = blue;
    //         emptyImage[y][x][2] = green;
        
    //     }
    // }
    // for (var x = 0; x < 256; x++) {
    //     for (var y = 0; y < 256; y++) {
    //         for (var c = 0; c < 3; c++) {
    //             pixel_val = damagedImageData.shift()
    //             if (c < 3) {
    //                 emptyImage[x][y][c] = pixel_val
    //             }
    //         }
    //     }
    // }
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

    //jQuery.post(server_url, JSON.stringify(body), drawFilledImage, "json");
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
    console.log(data)

    //alert("Doing")
    var width = 256,
       height = 256;

    buffer= Uint8ClampedArray.from(data)
    // for (var y = 0; y < height; y++) {
    //     for (var x = 0; x < width; x++) {
    //         var pos = (y * width + x) * 4; // position in buffer based on x and y
    //         buffer[pos] = data[y][x][0];           // some R value [0, 255]
    //         buffer[pos + 1] = data[y][x][1];           // some G value
    //         buffer[pos + 2] = data[y][x][2];          // some B value
    //         buffer[pos + 3] = 255;           // set alpha channel
    //     }
    // }

    // create off-screen canvas element
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
    //alert("Finished")

    //console.log("Not implemented");
    //scaleToFill(original_image);
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
    for (var x = pos.x - bounds; x < pos.x + 4 * bounds; x++) {
        for (var y = pos.y - bounds; y < pos.y + 4 * bounds; y++) {
            if (context.isPointInStroke(x, y)) {
                x_idx = Math.floor(x)
                y_idx = Math.floor(y)
                if (x_idx < 256 && y_idx < 256) {
                    mask[y_idx][x_idx] = 1.
                }
            }
        }
    }
}
