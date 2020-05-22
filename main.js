var canvas;
var context;
var c_saved;
var original_image = new Image();
original_image.src = "/demo.jpg";var jcrop_api;
var crop_limit = 75;

var server_url = "localhost";

$(window).on("load", function() {
    canvas = document.getElementById("image");
    context = canvas.getContext("2d");
    make_base();

    $("#file-input").on("change", file_input);
    $("#btn-load-image").prop("disabled", true);
    $("#image").Jcrop({
            onChange: updatePreview,
            onSelect: updatePreview,
            allowSelect: true,
            allowMove: true,
            allowResize: true,
            aspectRatio: 1,
            bgOpacity: 1,
        },
        function() {
            jcrop_api = this;
        }
    );
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

function loadImage() {
    scaleToFill(original_image);
    $("#modification-area").show();
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

function drawRectangle() {
    context.beginPath();
    context.fillRect(c_saved.x, c_saved.y, c_saved.w, c_saved.h);
    jcrop_api.release();
}

function postImage() {
    //Get image from canvas
    var imageData = canvas.toDataURL("image/jpg", 1.0);
    console.log(imageData);
    // Send image to server
    jQuery.post(server_url, imageData, drawFilledImage);
    // Wait for response

    // add image to output canvas
}

function drawFilledImage(data, textStatus, jjqXHR) {
    // TODO
    console.log("Not implemented");
    scaleToFill(original_image);
}