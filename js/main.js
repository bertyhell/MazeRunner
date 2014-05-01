var selection = "start";
var colStart;
var rowStart;
var colStop;
var rowStop;
var mazeImg;

$(window).load(function () {
    var canvas = document.getElementById('mainCanvas');
    var context = canvas.getContext('2d');
    mazeImg = document.getElementById("mazeImg");

    $("#fileSelect").change(function (e) {
        var file = e.originalEvent.srcElement.files[0];

        var reader = new FileReader();
        reader.onloadend = function () {
            mazeImg.src = reader.result;
            resizeCanvas();
        }
        reader.readAsDataURL(file);

    });

    $("#btnStart").click(function () {
        selection = "start";
    });
    $("#btnEnd").click(function () {
        selection = "end";
    });
    $("#mainCanvas").click(function (e) {
        if (selection == "start") {
            colStart = e.offsetX;
            rowStart = e.offsetY;
            $("#btnStart").css({"background": "#AAFFAA"});

        } else {
            colStop = e.offsetX;
            rowStop = e.offsetY;
            $("#btnEnd").css({"background": "#AAFFAA"});
        }
        if (colStart > 0 && colStop > 0 && rowStart > 0 && rowStop > 0 &&
            colStart < mazeImg.width && colStop < mazeImg.width && rowStart < mazeImg.height && rowStop < mazeImg.height) {
            $("#btnCalculate").removeAttr("disabled");
        } else {
            $("#btnCalculate").attr("disabled", "disabled");
        }

    });

//    $("#mainCanvas").mousemove(function(e){
//       $("#debug").html(e.offsetX + "," + e.offsetY);
//    });
    $("#btnCalculate").click(function () {
        calculateRoute();
    });

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
        canvas.width = mazeImg.width;
        canvas.height = mazeImg.height;
        context.drawImage(mazeImg, 0, 0);
    }


    function calculateRoute() {
        var width = mazeImg.width;
        var height = mazeImg.height;

        var imageData = context.getImageData(0, 0, mazeImg.width, mazeImg.height);

        var worker = new Worker('js/drawer.js');

        worker.addEventListener('message', function (e) {
            context.putImageData(e.data.imageData, 0, 0);
            if (e.data.error) {
                window.alert(e.data.error);
            }

        }, false)

        worker.postMessage(
            {
                imageData: imageData,
                start: [colStart, rowStart],
                stop: [colStop, rowStop]
            });
    }

    resizeCanvas();
});