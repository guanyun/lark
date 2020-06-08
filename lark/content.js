function injectJs(jsPath, options = {}) {
  return new Promise((resolve, reject) => {
    const { external, callback = () => {}, doc = document } = options;
    var node = doc.createElement('script');
    node.setAttribute('type', 'text/javascript');
    node.src = external ? jsPath : chrome.extension.getURL(jsPath);
    doc.body.appendChild(node);
    node.onload = node.onreadystatechange = function () {
      if (
        !this.readyState ||
        this.readyState === 'loaded' ||
        this.readyState === 'complete'
      ) {
        node.onload = node.onreadystatechange = null;
        resolve();
      }
    };
    node.onerror = function () {
      reject('load error');
    };
  });
}

localStorage.setItem('basepath', chrome.runtime.getURL('.'));
localStorage.setItem('vspath', chrome.runtime.getURL('monaco/vs'));

document.addEventListener('DOMContentLoaded', async () => {
  await injectJs('inject.js');
});
