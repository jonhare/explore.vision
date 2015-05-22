#explore.vision

[explore.vision](https://explore.vision) is an interactive browser-based tool for teaching the fundamentals of image processing and computer vision. It was developed by [Dr Jonathon Hare](http://users.ecs.soton.ac.uk/jsh2) from [Electronics and Computer Science](http://ecs.soton.ac.uk) at the [University of Southampton](http://www.soton.ac.uk). 

explore.vision allows users to experiment with image analysis techniques by writing code in a simplified Javascript environment. 
At Southampton, we're using explore.vision as a platform for running lab sessions that introduce the fundamentals of computer vision and image processing. In particular, we use explore.vision to teach students with limited programming experience as part of our [summer school for sixth-formers](http://summerschool.ecs.soton.ac.uk).

##Requirements
explore.vision works in a modern web-browser. If you want to use a webcam to provide the video, you'll need to be using a browser that supports `getUserMedia.` At the time of writing, this restricts you to relatively recent versions of Chrome and Firefox. Other browsers, like Safari, will revert to playing the video from a file.

Currently, you'll need a screen with a resolution above 1440x900 for the interface to display properly. The interface looks best when full-screen mode is enabled in the browser.

##The explore.vision interface
The interface is fairly self explanatory, and is broken into four functional areas. In the top-left, the input video is displayed (either from a webcam or the built-in file). In the top-right, the processed video is displayed. The code that performs the processing of each frame is shown in an editor at the bottom left. The controls and log output are shown in the bottom right.

##The programming language