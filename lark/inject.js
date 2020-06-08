console.log('data', wx.cgiData.appmsg_data);

const BASEPATH = localStorage.getItem('basepath');
const VSPATH = localStorage.getItem('vspath');

function injectScript(content) {
  var node = document.createElement('script');
  node.innerText = content;
  document.head.appendChild(node);
}

function createEditor() {
  const editorEl = document.createElement('div');
  editorEl.id = 'larkEditor';
  editorEl.style =
    'flex: 1; min-width: 768px;height: auto;min-height: 400px;padding-top: 30px';
  const root = document.querySelector('.appmsg_edit_box');
  if (root) {
    document.querySelector('#js_mp_sidemenu').toggleAttribute('hidden');
    const mainBody = root.parentNode;
    mainBody.classList.add('flex');
    mainBody.style =
      'margin-left: 0 !important;padding-left: 30px;padding-right: 30px;justify-content: center';
    mainBody.insertBefore(editorEl, root);
  }
}

function createIframe() {
  const editor = document.querySelector('#larkEditor');
  if (editor) {
    const f = document.createElement('iframe');
    f.id = f.name = 'lark';
    f.style = 'width: 100%;height: 100%;border: 0; margin: 0; padding: 0';
    var html = `
 <style>body { margin: 0; padding: 0;}</style>
 <div id="container" style="width:100%;height:100%"></div>
 <script>var VSPATH = '${VSPATH}';</script>
 <script src="${VSPATH}/loader.js"></script>
 <script src="${BASEPATH}/editor-init.js"></script>
`;
    editor.appendChild(f);
    f.contentWindow.document.open();
    f.contentWindow.document.write(html);
    f.contentWindow.document.close();
  }
}

function initObserver() {
  const changeHandle = () => {
    console.log('html changed!!');
    const html = document.querySelector('#ueditor_0').contentDocument.body
      .innerHTML;
    console.log('html', html);
    document
      .querySelector('#lark')
      .contentWindow.postMessage({ type: 'htmlChanged', payload: html });
  };

  const createObserver = () => {
    const observer = new MutationObserver(changeHandle); // FIXME: 这里可以使用debounce节流

    observer.observe(
      document.querySelector('#ueditor_0').contentDocument.body,
      {
        attributes: true, // 是否监听 DOM 元素的属性变化
        attributeFilter: ['src', 'style', 'type', 'name'], // 只有在该数组中的属性值的变化才会监听
        characterData: true, // 是否监听文本节点
        childList: true, // 是否监听子节点
        subtree: true, // 是否监听后代元素
      }
    );
  };

  setTimeout(() => {
    if (window.UE && window.UE.instants && window.UE.instants.ueditorInstant0) {
      console.log('create observer');
      createObserver();
      return;
    }
    console.log('ue editor is not initialized');
  }, 1000);
}

function setLarkValue() {
  html = wx.cgiData.appmsg_data.content;
  if (html) {
    html = html.replace(/&lt;/g, '<');
    html = html.replace(/&gt;/g, '>');
    html = html.replace(/&quot;/g, '"');
    console.log('html', html);
    document
      .querySelector('#lark')
      .contentWindow.postMessage({ type: 'initState', payload: html });
  }
}

function receiveMessage(event) {
  console.log('inner >> outer message', JSON.stringify(event.data));
  const { type, payload } = event.data;
  switch (type) {
    case 'larkChanged':
      const el = document.querySelector('#ueditor_0');
      if (el) {
        el.contentDocument.body.innerHTML = payload;
      }
      break;
    case 'larkCreated':
      initObserver();
      setLarkValue();
    default:
      break;
  }
}

createEditor();
createIframe();

window.addEventListener('message', receiveMessage, false);
