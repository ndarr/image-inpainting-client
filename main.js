var canvas;
var context;
var c_saved;
var original_image = new Image();
original_image.src = "demo.jpg"; var jcrop_api;
var crop_limit = 75;

var server_url = "https://darr.cloud:6969";

var loader;

var mouseDown = false;

var mask = createEmptyMask()

var pos = { x: 0, y: 0 };

var context;
var canvas;

// window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw), {passive: false};
document.addEventListener('mousedown', setPosition, {passive: false});
document.addEventListener('mouseenter', setPosition), {passive: false};

document.addEventListener("mousedown", (e)=>{
    mouseDown = true;
});

document.addEventListener("mouseup", (e)=>{
    mouseDown = false;
});

document.addEventListener('touchmove', draw, {passive: false});
document.addEventListener('touchstart', setPosition, {passive: false});
document.addEventListener('touchenter', setPosition, {passive: false});

$(window).on("load", function () {
    canvas = document.getElementById("image");
    context = canvas.getContext("2d");

    c_saved = canvas;

    make_base();
    loader = document.getElementById('loader');

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
    

    loader.style.display="inherit"
    $.ajax({
        type: "POST",
        url: server_url,
        data: JSON.stringify(body),
        dataType: "json",
        contentType: "application/json",
        success: drawFilledImage,
        error: function (jqXHR, exception) {
            alert("Something went wrong!");
            loader.style.display = "none";
        },
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

    loader.style.display="none";
    // update canvas with new data
    ctx.putImageData(idata, 0, 0, 0, 0, 256, 256);

}

// new position from mouse event
function setPosition(e) {
    if (e.target.nodeName == 'CANVAS') { e.preventDefault(); }
    console.log("Position")
    var rect = canvas.getBoundingClientRect();
    console.log(e.type);
    var x, y;
    if (e.type=="touchmove"){
        var touch = e.touches[0];
        x = touch.pageX;
        y = touch.pageY;
    }
    else{
        x = e.clientX;
        y = e.clientY;
    }
    pos.x = x - rect.left;
    pos.y = y - rect.top;
}


function draw(e) {
    if (e.target.nodeName == 'CANVAS') { e.preventDefault(); }
    // mouse left button must be pressed
    let line_width = 10;
    if (e.type != "touchmove" && !mouseDown){
        return;
    }
    


    //if (e.buttons !== 1) return;

    origImgData = context.getImageData(0, 0, 256, 256)
    console.log(pos.x, " - ",pos.y)
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
