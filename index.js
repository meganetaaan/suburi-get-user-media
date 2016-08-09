var onFailSoHard = function(e){
  console.log('rejected', e);
};


navigator.getUserMedia = navigator.getUserMedia       ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var video = document.querySelector('video');
var srcCanvas = document.querySelector('.src-canvas');
var srcContext = srcCanvas.getContext('2d');
var destCanvas = document.querySelector('.dest-canvas');
var destContext = destCanvas.getContext('2d');
var worker = new Worker('./worker.js');
worker.addEventListener('message', function(e){
  destContext.putImageData(e.data, 0, 0);
});

var freqCanvas = document.querySelector('.freq-canvas');
var freqContext = freqCanvas.getContext('2d');

var width = freqCanvas.width;
var height = freqCanvas.height;

var context = new AudioContext();
var analyzer = context.createAnalyser();
analyzer.fftSize = 256;

function drawFreq(){
  var data = new Float32Array(analyzer.frequencyBinCount / 4);
  analyzer.getFloatFrequencyData(data);

  analyzer.maxDecibels = 0;
  analyzer.minDecibels = -60;

  freqContext.fillStyle = 'rgb(0, 0, 0)';
  freqContext.clearRect(0, 0, width, height);

  var range = analyzer.maxDecibels - analyzer.minDecibels;

  for(var i = 0, len = data.length; i < len; i++){
    var x = Math.floor(i / len * width);
    var power = -1 * ((data[i] - analyzer.maxDecibels) / range);
    var y = Math.floor(power * height);
    var color = Math.floor(power * 256);
    var style = 'rgb(' + color + ',' + color + ',' + color + ')';
    freqContext.fillStyle = style;
    freqContext.fillRect(x, y, width / len, height - y);
  }
  requestAnimationFrame(drawFreq);
}

navigator.getUserMedia(
  {video: true, audio: true},
  function(localMediaStream){
    // Create the instance of MediaStreamAudioSourceNode
    var source = context.createMediaStreamSource(localMediaStream);
    source.connect(analyzer);
    analyzer.connect(context.destination);
    drawFreq();

    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(localMediaStream);
  },
  onFailSoHard);

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
