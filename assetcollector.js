populrme = window.populrme || { env: 't' };
// populrme.appHosts = { d: '10.1.10.79:3000', p: 'populr.me', s: 'staging.populr.me', t: 'populr.me' };
populrme.appHosts = { d: 'lvh.me:3000', p: 'populr.me', s: 'staging.populr.me', t: 'populr.me' };
populrme.appHost = populrme.appHosts[populrme.env];
populrme.protocol = populrme.env == 'd' ? 'http:' : window.location.protocol;

populrme.close = function() {
  var i;
  if (typeof window.postMessage == 'function') {
    window.removeEventListener('message', populrme.receiveMessage, false);
  } else if (typeof window.postMessage == 'object') {
    window.detachEvent('onmessage', populrme.receiveMessage);
  }
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
  populrme.images = [];

  for (i=0; i<images.length; i++) {
    img = images[i];
    tempImage = new Image();
    tempImage.src = img.src;
    width = tempImage.width;
    height = tempImage.height;

    if (img.src.length < 1700 && width >= 100 && height >= 75) {
      populrme.images.push({ width: width, height: height, source: img.src });
    }

  }
}

populrme.sendMessage = function(message) {
  if (typeof(window.postMessage) == 'function') {
    window.frames['populrme_asset_collector'].postMessage(message, '*');
  } else if (typeof(window.postMessage) == 'object') {
    window.setTimeout(function() {
      window.frames['populrme_asset_collector'].postMessage(message, '*')
    }, 0);
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

populrme.populateCollector = function () {
  var i, data;

  for (i=0; i<populrme.images.length; i++) {
    data = populrme.images[i];
    populrme.sendMessage(data.width + '|' + data.height + '|' + data.source);
  }
  populrme.sendMessage('done');
}

populrme.receiveMessage = function(event) {
  if (event.origin == 'https://populr.me' ||
      event.origin == 'https://staging.populr.me' ||
      event.origin == 'http://lvh.me:3000') {
    if (event.data == 'populr_asset_collector_ready') {
      populrme.populateCollector()
    } else if (event.data == 'close_populr_asset_collector') {
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
    alert('The Push2Pop bookmarklet does not support this browser');
    populrme.close();
  }
}

populrme.showIFrame = function() {
  var iframe, body, html;

  populrme.originalDocOverflowStyle = document.documentElement.style.overflow;
  populrme.originalBodyScroll = document.body.scroll;
  document.documentElement.style.overflow = 'hidden';
  document.body.scroll = 'no'; // ie


  body = document.body;
  html = document.documentElement;

  iframe = document.createElement('iframe');
  populrme.elements.push(iframe);
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.zIndex = 99999;
  iframe.style.top = '0';
  iframe.style.height = String(populrme.getViewportHeight()) + 'px';
  iframe.style.border = '0';
  iframe.frameborder = 0;
  // iframe.border = 0;
  iframe.src = populrme.protocol + '//' + populrme.appHost + '/asset_collector';
  iframe.name = 'populrme_asset_collector'
  populrme.iframe = iframe;
  document.body.appendChild(iframe);
}

populrme.initializeCollector = function() {
  populrme.mineImages();
  if (populrme.images.length == 0) {
    alert("Couldn't find any images on this page that are large enough to capture");
  } else {
    populrme.setupCallback();
    populrme.showIFrame();
  }
}

populrme.initializeCollector();
