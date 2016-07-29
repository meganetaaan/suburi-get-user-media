var onFailSoHard = function(e){
  console.log('rejected', e);
};

var getUserMedia;
if(navigator.getUserMedia){
  getUserMedia = navigator.getUserMedia;
} else if (navigator.mozGetUserMedia) {
  getUserMedia = navigator.mozGetUserMedia;
} else if (navigator.webkitGetUserMedia) {
  getUserMedia = navigator.webkitGetUserMedia;
} else if (navigator.msGetUserMedia) {
  getUserMedia = navigator.msGetUserMedia;
} else {
  console.error('getUserMedia not supported in your browser');
}
getUserMedia(
  {video: true},
  function(localMediaStream){
    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(localMediaStream);
  },
  onFailSoHard);

var video = document.querySelector('video');
var srcCanvas = document.querySelector('.src-canvas');
var srcContext = srcCanvas.getContext('2d');
var destCanvas = document.querySelector('.dest-canvas');
var destContext = destCanvas.getContext('2d');

var worker = new Worker('./worker.js');
worker.addEventListener('message', function(e){
  destContext.putImageData(e.data, 0, 0);
});

var drawVideo = function(){
  var h = srcCanvas.height;
  var w = srcCanvas.width;
  srcContext.drawImage(video, 0, 0, w, h);

  var imageData = srcContext.getImageData(0, 0, w, h);
  worker.postMessage(imageData);
};

function animLoop(){
  drawVideo();
  requestAnimationFrame(animLoop);
};
window.onload = animLoop;

