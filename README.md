![explore.vision](assets/explore-vision.png)

[explore.vision](https://explore.vision) is an interactive browser-based tool for teaching the fundamentals of image processing and computer vision. It was developed by [Dr Jonathon Hare](http://users.ecs.soton.ac.uk/jsh2) from [Electronics and Computer Science](http://ecs.soton.ac.uk) at the [University of Southampton](http://www.soton.ac.uk). 

[explore.vision](https://explore.vision) allows users to experiment with image analysis techniques by writing code in a simplified Javascript-based programming environment. At [Southampton](http://www.soton.ac.uk), we're using [explore.vision](https://explore.vision) as a platform for running lab sessions that introduce the fundamentals of computer vision and image processing. In particular, we use it to teach students with very limited programming experience as part of our [summer school for sixth-formers](http://www.summerschool.ecs.soton.ac.uk).

##Requirements
[explore.vision](https://explore.vision) works in a modern web-browser. If you want to use a webcam to provide the video, you'll need to be using a browser that supports `getUserMedia.` At the time of writing, this restricts you to relatively recent versions of Chrome and Firefox. Other browsers, like Safari, will revert to playing the video from a file.

Currently, you'll need a screen with a resolution above 1440x900 for the interface to display properly. The interface looks best when full-screen mode is enabled in the browser.

##The explore.vision interface
![The explore.vision UI](assets/ui.png)

The interface is fairly self explanatory, and is broken into four functional areas. In the top-left, the input video is displayed (either from a webcam or the built-in file). In the top-right, the processed video is displayed. The code that performs the processing of each frame is shown in an editor at the bottom left. The controls and log output are shown in the bottom right. When you've written some code in the editor, you press the ENABLE button to start it running. The save button will save your code to the server, using an automatically generated 5-character code as a the file identifier. The load button allows you to load a previously saved piece of code. 

##The programming language
The language used for working with [explore.vision](https://explore.vision) is [Javascript](http://en.wikipedia.org/wiki/JavaScript). All standard Javascript constructs are usable in any code that is written in the editor. 

The entry point to creating processing operations is a function called `process` that has two parameters: the input image, and the output image. The input and output image objects take the form of augmented 2D arrays (arrays of arrays) of pixels, with additional properties for easily determining the height and width of the image. Each pixel within the images is an object with `r`, `g` and `b` properties to represent the red, green and blue colour values. Each colour value is a number, which should normally be between 0.0 and 1.0. The application will clip values outside of this range when drawing the images to the screen.

The following code shows an implementation of the process function that copies the input image directly to the output image:

	function process(input, output) {
	    var x, y;
	    for (y=0; y<output.height; y++) {
	        for (x=0; x<output.width; x++) {
	            output[y][x].r = input[y][x].r;
	            output[y][x].g = input[y][x].g;
	            output[y][x].b = input[y][x].b;
	        }
	    }
	}

###Additional functions
[explore.vision](https://explore.vision) purposefully doesn't include a library of built-in image processing and computer vision functionality. A few helper functions/methods are however provided:

* `image.clone()` creates a copy of an image. This is useful for performing operations that rely on a previous frame, such as background differencing:

		var last;
		function process(input, output) {
		    var x, y;
		    if (last) {
		        for (y=0; y<output.height; y++) {
		            for (x=0; x<output.width; x++) {
		                output[y][x].r = Math.abs(last[y][x].r-input[y][x].r);
		                output[y][x].g = Math.abs(last[y][x].g-input[y][x].g);
		                output[y][x].b = Math.abs(last[y][x].b-input[y][x].b);
		            }
		        }
		    }
		    last = input.clone();
		}

* `newImage(width, height)` creates a new image object with the specified dimensions.
* `log(...)` prints out information to the logging panel on the right-hand side of the interface. Logging is expensive, so care should be taken not to call it too often.

###Examples
A list of example computer vision and image processing functions implemented using [explore.vision](https://explore.vision) can be found in the [filelist](https://explore.vision/filelist).

##Demo Mode
The [demo mode](https://explore.vision/demo) automatically cycles through the examples.

##Sourcecode, bugs, licensing, etc
The sourcecode for the [explore.vision](https://explore.vision) website is available from [github](http://github.com/jonhare/explore.vision) under [Version 2 of the Apache Software License (ASL)](https://github.com/jonhare/explore.vision/blob/master/LICENSE). If you find any bugs, or run into problems, please report them in the [issue tracker](https://github.com/jonhare/explore.vision/issues).
