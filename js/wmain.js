function initialiseVideo(sourceName, sinkName, cb) {
  gumInit();

  window.ocvl = {
    video: document.querySelector('video'),
    source: document.getElementById(sourceName).getContext('2d'),
    sink: document.getElementById(sinkName).getContext('2d'),
    process: function(input, output) {
      var x, y;
      for (y=0, i=0; y<output.height; y++) {
        for (x=0; x<output.width; x++) {
          output[y][x].r = input[y][x].r;
          output[y][x].g = input[y][x].g;
          output[y][x].b = input[y][x].b;
        }
      }
    }
  }

  // shim layer with setTimeout fallback - from Paul Irish
  window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(callback) {
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  if (navigator.getUserMedia) {
    $("#nowebcam").css("display", "none");
  }

  // note: video is defined in gum.js
  ocvl.video.addEventListener('loadedmetadata', function () {
    // due to bug in Chrome: http://crbug.com/168700
    if (ocvl.video.videoWidth) {
      ocvl.source.canvas.width = ocvl.video.videoWidth;
      ocvl.source.canvas.height = ocvl.video.videoHeight;
      ocvl.sink.canvas.width = ocvl.video.videoWidth;
      ocvl.sink.canvas.height = ocvl.video.videoHeight;
    }
    draw();
    cb();
  });
}
 
function draw() {
  requestAnimFrame(draw);
  ocvl.source.drawImage(ocvl.video, 0, 0, ocvl.video.videoWidth, ocvl.video.videoHeight, 0, 0, ocvl.source.canvas.width, ocvl.source.canvas.height);
}

function log(message) {
  var log = $("#log");
  var currentText = log.html().split("\n");
  currentText.push(message + "<br/>");
  if (currentText.length > 100)
    currentText = currentText.splice(currentText.length - 100, currentText.length);
  log.html(currentText.join("\n"));
  log.scrollTop(log.prop("scrollHeight"));
}

function clearLog(message) {
  $("#log").html("");
}

var worker;
function run(code) {
  if (!worker) {
    worker = new Worker("js/worker.js");
    worker.addEventListener('message', handleMessage);
  }
  worker.postMessage({"message": "code", "code": code});
}

function handleMessage(e) {
  if (e.data.message === "getImage") {
    var pixels = ocvl.source.getImageData(0, 0, ocvl.source.canvas.width, ocvl.source.canvas.height);
    worker.postMessage({"message": "image", "pixels":pixels});
  } else if (e.data.message === "setImage") {
    ocvl.sink.putImageData(e.data.pixels, 0, 0);

    var pixels = ocvl.source.getImageData(0, 0, ocvl.source.canvas.width, ocvl.source.canvas.height);
    worker.postMessage({"message": "image", "pixels":pixels});
  } else if (e.data.message === "log") {
    log(e.data.data);
  } else if (e.data.message === "clearLog") {
    clearLog();
  } else {
    console.log(e.data.message);
  }
}

function gumSuccess(stream) {
  if ('mozSrcObject' in ocvl.video) {
    ocvl.video.mozSrcObject = stream;
  } else if (window.URL) {
    ocvl.video.src = window.URL.createObjectURL(stream);
  } else {
    ocvl.video.src = stream;
  }
  ocvl.video.play();
}

function gumError(error) {
  console.error('Error on getUserMedia', error);
}

function gumInit() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true }, gumSuccess, gumError);
  }
}

function save(title, code) {
  var data = {
    'name': title,
    'code': code
  };

  $.post(
    "save.php",
    {data: JSON.stringify(data)},
    function(result) {
      showSave(result);
    }
  );
}

function showSave (code) {
  $("#code").text(code);
  $("#dialogBackground").css("display", "block");
  $("#saveDialog").css("display", "block");
}

function dismissSave() {
  $("#saveDialog").css("display", "none");
  $("#dialogBackground").css("display", "none");
}

function showLoad () {
  $("#codeInput").val("");
  setTimeout(function(){
    $("#codeInput").focus();
  }, 1);
  $("#dialogBackground").css("display", "block");
  $("#loadDialog").css("display", "block");
}

function dismissLoad() {
  $("#loadDialog").css("display", "none");
  $("#dialogBackground").css("display", "none");
}

