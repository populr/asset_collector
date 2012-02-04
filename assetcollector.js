populrme = window.populrme || { env: 't' };
// populrme.appHosts = { d: '10.1.10.79:3000', p: 'populr.me', s: 'staging.populr.me', t: 'populr.me' };
populrme.appHosts = { d: 'lvh.me:3000', p: 'populr.me', s: 'staging.populr.me', t: 'populr.me' };
populrme.appHost = populrme.appHosts[populrme.env];
populrme.protocol = populrme.env == 'd' ? 'http:' : window.location.protocol;
populrme.id = String(new Date().getTime());

populrme.close = function() {
  if (typeof window.postMessage == 'function') {
    window.removeEventListener('message', populrme.receiveMessage, false);
  } else if (typeof window.postMessage == 'object') {
    window.detachEvent('onmessage', populrme.receiveMessage);
  }
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

  populrme.loaderTimeoutID = setTimeout(populrme.showLoader, 2000);

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

populrme.getViewportHeight = function() {
  if (window.innerHeight) {
    return window.innerHeight;
  } else if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientHeight;
  } else if (document.body && document.body.offsetHeight) {
    return document.body.offsetHeight;
  } else {
    return 0;
  }
}

populrme.getViewportWidth = function() {
  if (window.innerWidth) {
    return window.innerWidth;
  } else if (document.documentElement && document.documentElement.clientWidth) {
    return document.documentElement.clientWidth;
  } else if (document.body && document.body.offsetWidth) {
    return document.body.offsetWidth;
  } else {
    return 0;
  }
}

populrme.checkIFrameUrl = function () {
  if (populrme.iframe.src.split('#')[1] == 'close') {
    populrme.close();
  } else {
    populrme.setCloseCheckTimeout();
  }
}

populrme.receiveMessage = function(event) {
  if (true || event.origin == 'https://populr.me' ||
      event.origin == 'https://staging.populr.me' ||
      event.origin == 'http://lvh.me:3000') {
    if (event.data == 'close_populr_asset_collector') {
      populrme.close();
    }
  }
}

populrme.setupCallback = function() {
  if (typeof window.postMessage == 'function') {
    window.addEventListener('message', populrme.receiveMessage, false);
  } else if (typeof window.postMessage == 'object') {
    window.attachEvent('onmessage', populrme.receiveMessage);
  } else {
    populrme.setCloseCheckTimeout();
  }
}

populrme.setCloseCheckTimeout = function() {
  setTimeout(populrme.checkIFrameUrl, 100);
}


populrme.applySharedAttributes = function(block) {
  block.style.position = 'fixed';
  block.style.left = '0';
  block.style.width = '100%';
  block.style.zIndex = 99999;
}

populrme.showLoader = function() {
  var div, loader, body, html;
  body = document.body;
  html = document.documentElement;

  div = document.createElement('div');
  populrme.elements.push(div);
  populrme.applySharedAttributes(div);
  div.style.top = '45%';
  div.style.textAlign = 'center';
  div.style.fontSize = '48px';
  div.style.borderRadius = '10px';
  div.style.boxShadow = '0 5px 5px rgba(0, 0, 0, 0.75)';
  div.style.backgroundColor = '#eee';
  div.style.paddingTop = '50px';
  div.style.height = '90px';
  div.style.width = '140px';
  div.style.left = String(populrme.getViewportWidth() / 2 - 70) + 'px';

  loader = document.createElement('img');
  loader.src = populrme.protocol + '//' + populrme.appHost + '/images/tinyloader-dark.gif'
  div.appendChild(loader);

  document.body.appendChild(div);
}
populrme.showIFrame = function() {
  var iframe, body, html;

  clearTimeout(populrme.loaderTimeoutID);

  body = document.body;
  html = document.documentElement;

  iframe = document.createElement('iframe');
  populrme.elements.push(iframe);
  populrme.applySharedAttributes(iframe);
  iframe.style.top = '0';
  iframe.style.height = String(populrme.getViewportHeight()) + 'px';
  iframe.style.border = '0';
  iframe.frameborder = 0;
  // iframe.border = 0;
  iframe.src = populrme.protocol + '//' + populrme.appHost + '/asset_collector?id=' + populrme.id;
  populrme.iframe = iframe;
  document.body.appendChild(iframe);

  populrme.setupCallback();
}

populrme.displayCollector = function () {
  populrme.originalDocOverflowStyle = document.documentElement.style.overflow;
  populrme.originalBodyScroll = document.body.scroll;
  document.documentElement.style.overflow = 'hidden';
  document.body.scroll = 'no'; // ie

  var imageData = populrme.mineImages();
  var messages = populrme.constructMessages(imageData);
  populrme.sendMessages(messages);
}

populrme.displayCollector();
