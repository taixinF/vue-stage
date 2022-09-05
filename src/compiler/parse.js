const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); //他匹配道分组是一个标签名<div 开始
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配</xxx>最终匹配到的分组就是结束标签的名字
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/;
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

// vue3 采用的不是使用正则
//对模板进行编译处理
// {
// tag:'div',
// type:1, //元素类型1
// attrs:[{name,age,address}],
// parent:null,
// children:[
//   {
// tag:'div',
// type:1, //元素类型1
// attrs:[{name,age,address}],
// parent:null,
// children:[
// ]
// },]
// }
//栈型结构   [div ]
export function parseHTML(html) {
  //while循环抛出到这三个方法   ----   到时候可以方便暴露出去
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; //用于存放元素的
  let currentParent; //指向的是栈中的最后一个
  let root; // 树根

  //最终需要转化成一颗抽象语法树 --- 这就是颗ast树
  function creatASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }
  //div span a
  //利用栈型结构 来构造一棵树
  function start(tag, attrs) {
    let node = creatASTElement(tag, attrs); //创造一个ast节点
    //看一下是否是空树
    if (!root) {
      //如果为空则但是树的根节点
      root = node;
    }
    if (currentParent) {
      node.parent = currentParent; //值赋予了parent数据
      currentParent.children.push(node);
    }
    stack.push(node);
    currentParent = node; //currentParent 为栈中的最后一个
  }
  function chars(text) {
    text = text.replace(/\s/g, "");
    //文本直接放到当前指向的节点中
    text &&
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: currentParent,
      });
  }
  function end(tag) {
    let node = stack.pop(); //弹出最后一个,校验标签 是否合法
    currentParent = stack[stack.length - 1];
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], //标签名
        attrs: [],
      };
      //前进匹配标签
      advance(start[0].length);
      //如果不是开始标签的结束就一直匹配
      let attr, end;
      while (
        !(end = html.match(startTagClose)) && //不是开始标签同时赋值给end
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        });
      }

      if (end) {
        advance(end[0].length);
      }
      return match;
    }
    return false; //不是开始标签
  }
  //html 最开始肯定是一个<
  while (html) {
    //如果textEnd说明是个开始标签或者结束标签
    //如果textEnd 说明就是文本结束位置
    let textEnd = html.indexOf("<"); //如果indexOf 中的索引是0 则说明是个标签、
    if (textEnd == 0) {
      const startTagMatch = parseStartTag(); //开始标签的匹配结果
      //解析到了开始标签
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue; //终止本次循环
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    if (textEnd >= 0) {
      let text = html.substring(0, textEnd); //文本内容
      if (text) {
        chars(text);
        advance(text.length); //解析到的文本
      }
    }
  }
  return root;
  console.log(root);
}
