function initialiseVideo(sourceName, sinkName) {
  gumInit();

  window.ocvl = {
    video: document.querySelector('video'),
    source: document.getElementById(sourceName).getContext('2d'),
    sink: document.getElementById(sinkName).getContext('2d'),
    width: 160,
    height: 120,
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

  var article = video.parentNode,
      gum = document.getElementById('gum');

  if (navigator.getUserMedia) {
    article.removeChild(gum);
    //article.className = 'supported';
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
    window.ocvl.inimg = newImage(ocvl.video.videoWidth, ocvl.video.videoHeight);
    window.ocvl.outimg = newImage(ocvl.video.videoWidth, ocvl.video.videoHeight);
    draw();
  });


}

function draw() {
  requestAnimFrame(draw);
  ocvl.source.drawImage(ocvl.video, 0, 0, ocvl.video.videoWidth, ocvl.video.videoHeight, 0, 0, ocvl.source.canvas.width, ocvl.source.canvas.height);
  var pixels = ocvl.source.getImageData(0, 0, ocvl.source.canvas.width, ocvl.source.canvas.height);

  toImage(pixels, ocvl.inimg);

  try {
    ocvl.process(ocvl.inimg, ocvl.outimg);
  } catch (e) {
    log(e.message);
  }
  fromImage(ocvl.outimg, pixels);

  ocvl.sink.putImageData(pixels, 0, 0);
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

function newImage(width, height, data) {
  var output = [];
  output.width = width;
  output.height = height;
  output.clone = function(data) {
    return newImage(this.width, this.height, data);
  };
  if (!data) {
    for (y=0; y<output.height; y++) {
      output.push([]);
      for (x=0; x<output.width; x++) {
        output[y].push({});
        output[y][x].r = 0;
        output[y][x].g = 0;
        output[y][x].b = 0;
      }
    }
  } else {
    for (y=0; y<output.height; y++) {
      output.push([]);
      for (x=0; x<output.width; x++) {
        output[y].push({});
        output[y][x].r = data[y][x].r;
        output[y][x].g = data[y][x].g;
        output[y][x].b = data[y][x].b;
      }
    }
  }
  return output;
}

var _INV_255_ = 1/255;

function toImage(imagedata, output) {
  var x,y,i;
  for (y=0, i=0; y<output.height; y++) {
    for (x=0; x<output.width; x++, i+=4) {
      output[y][x].r = imagedata.data[i] * _INV_255_;
      output[y][x].g = imagedata.data[i+1] * _INV_255_;
      output[y][x].b = imagedata.data[i+2] * _INV_255_;
    }
  }
}

function fromImage(image, imagedata) {
  var x,y,i;
  for (y=0, i=0; y<image.height; y++) {
    for (x=0; x<image.width; x++, i+=4) {
      //shifting casts to int
      imagedata.data[i]   = clip(image[y][x].r * 255) >> 0;
      imagedata.data[i+1] = clip(image[y][x].g * 255) >> 0;
      imagedata.data[i+2] = clip(image[y][x].b * 255) >> 0;
    }
  }
}

function clip(v) {
  return Math.max(0, Math.min(255,v));
}

function run(code) {
  try {
    clearLog();
    ocvl.process = window.eval("(function(){" + code + " return process;}())");
    log("Running code");
  } catch (e) {
    log(e.message);
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

