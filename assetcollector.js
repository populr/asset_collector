populrme = window.populrme || { env: 't' };
populrme.appHosts = { d: 'lvh.me:3000', p: 'populr.me', s: 'staging.populr.me', t: 'populr.me' };
populrme.appHost = populrme.appHosts[populrme.env];
populrme.protocol = populrme.env == 'd' ? 'http:' : window.location.protocol;
populrme.id = String(new Date().getTime());

populrme.close = function() {
  var i;
  for (i=0; i<populrme.elements.length; i++) {
    document.body.removeChild(populrme.elements[i]);
  }
  document.documentElement.style.overflow = populrme.originalDocOverflowStyle;
  document.body.scroll = populrme.originalBodyScroll; // ie
  populrme = null;
}

populrme.mineImages = function () {
  var images = document.getElementsByTagName('img');
  var i, img, width, height;
  var tempImage;
  var imageData = [];
  for (i=0; i<images.length; i++) {
    img = images[i];
    tempImage = new Image();
    tempImage.src = img.src;
    width = tempImage.width;
    height = tempImage.height;
    if (img.src.length < 1700 && width >= 100 && height >= 100) {
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
    alert("Couldn't find any images on this page that are large enough to capture");
    populrme.close();
    return;
  }
  var i, img, div;

  populrme.messageCount = messages.length;

  div = document.createElement('div');
  populrme.elements.push(div);
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

populrme.applySharedAttributes = function(block) {
  block.style.position = 'fixed';
  block.style.left = '0';
  block.style.width = '100%';
  block.style['z-index'] = 9999;
}

populrme.getViewportHeight = function() {
  if (window.innerHeight) {
    return window.innerHeight;
  } else if (document.body && document.body.offsetHeight) {
    return document.body.offsetHeight;
  } else {
    return 0;
  }
}

populrme.showIFrame = function () {
  var barHeight, div, cancel, iframe, body, html;
  body = document.body;
  html = document.documentElement;
  barHeight = 35;

  cancel = document.createElement('a');
  populrme.elements.push(cancel);
  populrme.applySharedAttributes(cancel);
  cancel.style.backgroundColor = '#fff';
  cancel.style.textAlign = 'center';
  cancel.style.cursor = 'pointer';
  cancel.style.display = 'block';
  cancel.style.textDecoration = 'none';
  cancel.style.lineHeight = '2.5em';
  cancel.style.top = '0';
  cancel.style.height = String(barHeight) + 'px';
  cancel.onclick = function() { populrme.close(); };
  if (typeof document.body.textContent == 'string') {
    cancel.textContent = 'Cancel';
  } else {
    cancel.innerText = 'Cancel';
  }
  document.body.appendChild(cancel);

  iframe = document.createElement('iframe');
  populrme.elements.push(iframe);
  populrme.applySharedAttributes(iframe);
  iframe.style.top = String(barHeight) + 'px';
  iframe.style.height = String(populrme.getViewportHeight() - barHeight) + 'px';
  iframe.style.border = '0';
  iframe.frameborder = 0;
  // iframe.border = 0;
  iframe.src = populrme.protocol + '//' + populrme.appHost + '/asset_collector?id=' + populrme.id;
  document.body.appendChild(iframe);
}

populrme.displayCollector = function () {
  populrme.originalDocOverflowStyle = document.documentElement.style.overflow;
  populrme.originalBodyScroll = document.body.scroll;
  document.documentElement.style.overflow = 'hidden';
  document.body.scroll = "no"; // ie

  var imageData = populrme.mineImages();
  var messages = populrme.constructMessages(imageData);
  populrme.sendMessages(messages);
}

populrme.displayCollector();
