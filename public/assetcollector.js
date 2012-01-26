// http://github.com/rgrove/lazyload
var Populr = {};
Populr.lazyLoad = function(k){function p(b,a){var g=k.createElement(b),c;for(c in a)a.hasOwnProperty(c)&&g.setAttribute(c,a[c]);return g}function l(b){var a=m[b],c,f;if(a)c=a.callback,f=a.urls,f.shift(),h=0,f.length||(c&&c.call(a.context,a.obj),m[b]=null,n[b].length&&j(b))}function w(){var b=navigator.userAgent;c={async:k.createElement("script").async===!0};(c.webkit=/AppleWebKit\//.test(b))||(c.ie=/MSIE/.test(b))||(c.opera=/Opera/.test(b))||(c.gecko=/Gecko\//.test(b))||(c.unknown=!0)}function j(b,a,g,f,h){var j=
function(){l(b)},o=b==="css",q=[],d,i,e,r;c||w();if(a)if(a=typeof a==="string"?[a]:a.concat(),o||c.async||c.gecko||c.opera)n[b].push({urls:a,callback:g,obj:f,context:h});else{d=0;for(i=a.length;d<i;++d)n[b].push({urls:[a[d]],callback:d===i-1?g:null,obj:f,context:h})}if(!m[b]&&(r=m[b]=n[b].shift())){s||(s=k.head||k.getElementsByTagName("head")[0]);a=r.urls;d=0;for(i=a.length;d<i;++d)g=a[d],o?e=c.gecko?p("style"):p("link",{href:g,rel:"stylesheet"}):(e=p("script",{src:g}),e.async=!1),e.className="lazyload",
e.setAttribute("charset","utf-8"),c.ie&&!o?e.onreadystatechange=function(){if(/loaded|complete/.test(e.readyState))e.onreadystatechange=null,j()}:o&&(c.gecko||c.webkit)?c.webkit?(r.urls[d]=e.href,t()):(e.innerHTML='@import "'+g+'";',u(e)):e.onload=e.onerror=j,q.push(e);d=0;for(i=q.length;d<i;++d)s.appendChild(q[d])}}function u(b){var a;try{a=!!b.sheet.cssRules}catch(c){h+=1;h<200?setTimeout(function(){u(b)},50):a&&l("css");return}l("css")}function t(){var b=m.css,a;if(b){for(a=v.length;--a>=0;)if(v[a].href===
b.urls[0]){l("css");break}h+=1;b&&(h<200?setTimeout(t,50):l("css"))}}var c,s,m={},h=0,n={css:[],js:[]},v=k.styleSheets;return{css:function(b,a,c,f){j("css",b,a,c,f)},js:function(b,a,c,f){j("js",b,a,c,f)}}}(this.document);

Populr.params = window.location.href.split('?').pop().split('&');
Populr.environment = Populr.params[0].split('=')[1];

Populr.s3Hosts = { d: 'dfiles.populr.me', s: 'stagingfiles.populr.me', p: 'files.populr.me' };
Populr.s3Host = Populr.s3Hosts[environment];

Populr.appHosts = { d: 'lvh.me', s: 'staging.populr.me', p: 'populr.me' };
Populr.appHost = Populr.appHosts[environment];

// change s3Host to appHost when the iframe source is included in the main project
Populr.iframeUrl = request.protocol + '//s3.amazonaws.com/' + Populr.s3Host + '/asset_collection/index.htm?h=' + window.location.host;

Populr.lazyLoad.js([request.protocol + '//s3.amazonaws.com/' + Populr.s3Host + '/asset_collection/porthole.min.js'],
  function () {

    var windowProxy = new Porthole.WindowProxy(request.protocol + '//s3.amazonaws.com/' + Populr.s3Host + '/proxy.html', 'populr_asset_collector');
    windowProxy.addEventListener(function(event) {
      if (event.data == 'ready') {
        for (var image in document.getElementsByTagName('img') ) {
          image.src
        }
      }
    });

    var body = document.getElementsByTagName('body')[0];
    body.append('<iframe name="populr_asset_collector" width="1" height="1" seamless="seamless" style="position:absolute; width:1px; height:1px; left:-99px;" src="' + Populr.iframeUrl + '"></iframe>');

  }
);
