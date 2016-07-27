Worker = {};

self.addEventListener('message',function(e){
  var data = e.data;
  self.postMessage(Worker.process(data));
}, false);

Worker.process = function(imageData){
  colorToThreshold(imageData.data, 100);
  return imageData;
}

function colorToThreshold(color, th){
  for (var i = 0; i < color.length; i += 4) {
    g = 0.299*color[i+0]
      + 0.587*color[i+1]
      + 0.114*color[i+2];
    if( g > th){
      color[i+0] = color[i+1] = color[i+2] = 255;
    } else{
      color[i+0] = color[i+1] = color[i+2] = 0;
    }
  }
}
