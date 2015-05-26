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

var process;
var inimg;
var outimg;
var running = false;
self.addEventListener('message', messageReceived);
 
function messageReceived(e) {
  if (e.data.message === 'code') {
    //if we've received new code, set it
    try {
      clearLog();
      process = eval("(function(){" + e.data.code + " return process;}())");
      log("Running code");

      if (!running) {
        running = true;
        self.postMessage({"message":"getImage"});
      }
    } catch (e) {
      log(e.message);
    }
  } else if (e.data.message === 'image') {
    //if we've received images
    if (!inimg || inimg.width!=e.data.pixels.width || inimg.height!=e.data.pixels.height) {
      inimg = newImage(e.data.pixels.width, e.data.pixels.height);
      outimg = newImage(e.data.pixels.width, e.data.pixels.height);
    }

    toImage(e.data.pixels, inimg);
    try {
      if (process)
        process(inimg, outimg);
    } catch (e) {
      log(e.message);
    }
    fromImage(outimg, e.data.pixels);

    self.postMessage({message: "setImage", "pixels": e.data.pixels});
  } else {
    console.log("Unknown message");
    console.log(e.data);
  }
}

function newImage(width, height, data) {
  var x,y;
  var output = [];
  output.width = width;
  output.height = height;
  output.clone = function() {
    return newImage(this.width, this.height, this);
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

function log(argument) {
  self.postMessage({"message": "log", "data": (argument + "").substring(0,255)});
}

function clearLog() {
  self.postMessage({"message": "clearLog"});
}

