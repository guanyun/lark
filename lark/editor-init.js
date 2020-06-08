require.config({ paths: { vs: VSPATH } });

let html = '';
let inFocus = false;

require(['vs/editor/editor.main'], function () {
  const editor = monaco.editor.create(document.getElementById('container'), {
    theme: 'vs-dark',
    value: html,
    language: 'html',
  });

  editor.onDidFocusEditorText(() => {
    console.log('focus on editor!');
    inFocus = true;
  });
  editor.onDidBlurEditorText(() => {
    console.log('blur on editor!');
    inFocus = false;
  });

  editor.onDidChangeModelContent((e) => {
    const value = editor.getValue();
    if (value !== html) {
      html = value;
      window.top.postMessage(
        { type: 'larkChanged', payload: html },
        'https://mp.weixin.qq.com'
      );
    }
  });

  window.onresize = function () {
    editor.layout();
  };

  console.log('The Lark ascending...');
  window.top.postMessage({ type: 'larkCreated' }, 'https://mp.weixin.qq.com');

  function receiveMessage(event) {
    console.log('outer >> inner message', JSON.stringify(event.data));
    const { type, payload } = event.data;
    switch (type) {
      case 'initState':
        html = payload;
        editor.setValue(html);
        break;
      case 'htmlChanged':
        console.log('is changed?', payload !== html, payload, html);
        if (!inFocus && payload !== html) {
          html = payload;
          editor.setValue(html);
        }
      default:
        break;
    }
  }
  window.addEventListener('message', receiveMessage, false);
});
