const storageHost = 'https://ipfs.exokit.org';

async function generatePreview(reqUrl, ext, type, width, height) {
  // check either first param is url or hash
  if (!isValidURL(reqUrl)) {
    reqUrl = `${storageHost}/ipfs/${reqUrl}`;
  }
  let origin = (window.location != window.parent.location)
  ? document.referrer
  : document.location.href;
  // create URL
  var ssUrl = `${origin}screenshot.html?url=${reqUrl}&ext=${ext}&type=${type}&width=${width}&height=${height}`;

  // check for existing iframe
  var iframe = document.querySelector(`iframe[src^="${ssUrl}"]`);

  // else create new iframe
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.width = '0px';
    iframe.height = '0px';
    document.body.appendChild(iframe);
  }

  // set src attr for iframe
  iframe.src = ssUrl;

  // event listener for postMessage from screenshot.js
  return new Promise(function(resolve, reject) {
    var f = function(event) {
      if (event.data.method === 'result') {
        window.removeEventListener('message', f, false);
        var blob = new Blob([event.data.result], {type: `image/${ext}`});
        iframe.remove();
        resolve({
          blob,
          url: URL.createObjectURL(blob),
        });
      }
    };
    window.addEventListener('message', f);
  });
}

// URL validate function
function isValidURL(string) {
  var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null);
}
window.generatePreview = generatePreview;