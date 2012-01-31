populrme = window.populrme || { env: 't' };
populrme.appHosts = { d: '192.168.1.100:3000', p: 'populr.me', s: 'staging.populr.me', t: 'populr.me' };
populrme.appHost = populrme.appHosts[populrme.env];
populrme.protocol = populrme.env == 'd' ? 'http:' : window.location.protocol;
populrme.id = String(new Date().getTime());

populrme.close = function() {
  populrme = null;
}

populrme.mineImages = function () {
  var images = document.getElementsByTagName('img');
  var i, img, width, height;
  var tempImage = new Image();
  var imageData = [];
  for (i=0; i<images.length; i++) {
    img = images[i];
    if (img.src.length < 1700 && img.width >= 75 && img.height >= 75) {
      tempImage.src = img.src;
      width = tempImage.width;
      height = tempImage.height;
      imageData.push({ width: width, height: height, encodedSrc: encodeURIComponent(img.src) });
    }
  }
  return imageData;
}

populrme.paramsFromMessage = function(message, i) {
  var istr = String(i);
  return  '&' + 'w' + istr + '=' + String(message.width) + '&h' + istr + '=' + String(message.height) + '&s' + istr + '=' + message.encodedSrc;
}

populrme.constructMessages = function(imageData) {
  var i, params;
  var baseUrl = populrme.protocol + '//' + populrme.appHost + '/collection_candidate?id=' + populrme.id;
  var messages = [];
  while (imageData.length > 0) {
    i = 0;
    params = '';
    while (imageData.length > 0 && (baseUrl + params + populrme.paramsFromMessage(imageData[0], i)).length < 2048) {
      params += populrme.paramsFromMessage(imageData.shift(), i++);
    }
    messages.push(baseUrl + params);
  }
  return messages;
}

populrme.sendMessages = function(messages) {
  if (messages.length == 0) {
    return populrme.showIFrame();
  }
  var i, img, div;

  populrme.messageCount = messages.length;

  div = document.createElement('div');
  div.id = 'populrme_messages';
  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '-10px';
  div.style.width = '1px';

  for (i=0; i<messages.length; i++) {
    img = document.createElement('img');
    img.onload = function() { populrme.messageComplete(); };
    img.src = messages[i];
    div.appendChild(img);
  }

  document.body.appendChild(div);
}

populrme.messageComplete = function() {
  if (--populrme.messageCount == 0) {
    populrme.showIFrame();
  }
}

populrme.showIFrame = function () {
  var iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '50px';
  iframe.style.left = '0';
  iframe.style.border = '0';    
  iframe.style.width = '100%';
  iframe.name = 'populr_asset_collector';
  iframe.src = populrme.protocol + '//' + populrme.appHost + '/asset_collector?id=' + populrme.id;
  iframe.style['z-index'] = 9999;

  var body = document.body;
  var html = document.documentElement;
  iframe.height = Math.max(body.clientHeight, html.clientHeight, body.offsetHeight, html.offsetHeight, body.scrollHeight, html.scrollHeight) - 50;

  document.body.appendChild(iframe);
}

populrme.displayCollector = function () {
  var imageData = populrme.mineImages();
  var messages = populrme.constructMessages(imageData);
  populrme.sendMessages(messages);
}

populrme.displayCollector();
