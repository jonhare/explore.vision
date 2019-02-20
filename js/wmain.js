/*
Copyright 2015 Jonathon Hare / The University of Southampton

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
    ocvl.sourceframes = 0;
    ocvl.sinkframes = 0;
    ocvl.lsourceframes = 0;
    ocvl.lsinkframes = 0;
    ocvl.sourcefps = $("#sourcefps");
    ocvl.sinkfps = $("#sinkfps");
    setInterval(function() {
      ocvl.lsourceframes = (ocvl.sourceframes + ocvl.lsourceframes) / 2;
      ocvl.lsinkframes = (ocvl.sinkframes + ocvl.lsinkframes) / 2;
      ocvl.sourcefps.text(ocvl.lsourceframes.toFixed(1));
      ocvl.sinkfps.text(ocvl.lsinkframes.toFixed(1));
      ocvl.sourceframes = 0;
      ocvl.sinkframes = 0;
    }, 1000);
  });
}
 
function draw() {
  requestAnimFrame(draw);
  ocvl.sourceframes++;
  ocvl.source.drawImage(ocvl.video, 0, 0, ocvl.video.videoWidth, ocvl.video.videoHeight, 0, 0, ocvl.source.canvas.width, ocvl.source.canvas.height);
}

function log(message) {
  var log = $("#log");
  var currentText = log.text().split("\n");
  currentText.push(message);
  if (currentText.length > 100)
    currentText = currentText.splice(currentText.length - 100, currentText.length);
  log.text(currentText.join("\n"));
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
    ocvl.sinkframes++;
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
    //ocvl.video.src = window.URL.createObjectURL(stream);
    ocvl.video.srcObject = stream
  } else {
    ocvl.video.src = stream;
  }
  ocvl.video.play();

  $("#nowebcam").css("display", "none");
}

function gumError(error) {
  console.error('Error on getUserMedia', error);
}

function gumInit() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({video: true }).then(gumSuccess).catch(gumError);
  } else {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true }, gumSuccess, gumError);
    }
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

function showHelp() {
  $("#dialogBackground").css("display", "block");
  $("#helpDialog").css("display", "block");
}

function dismissHelp() {
  $("#helpDialog").css("display", "none");
  $("#dialogBackground").css("display", "none");
}

function browse() {
  var url = window.location + "";
  var base = url.substring(0,url.lastIndexOf("/"));
  url = base + "/filelist #content";

  $("#loadDialog").css("display", "none");
  $("#browseContents").load(url);
  $("#browseDialog").css("display", "block");
}

function dismissBrowse() {
  $("#browseDialog").css("display", "none");
  $("#dialogBackground").css("display", "none");
}
