import { parseHTML } from "./parse";

function genProps(attrs) {
  let str = ""; //{name:value}
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      //color:red,background:red => {color:'red'}
      let obj = {};
      attr.value.split(";").forEach((item) => {
        //qs库
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`; //a:b,c:d,
  }
  return `{${str.split(0, -1)}}`;
}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function gen(node) {
  if (node.type === 1) {
    return codegen(node);
  } else {
    //文本
    let text = node.text;
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      //_V(_s(name)+'hello'+_s(name))
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;
      //split
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index; //匹配的位置·{{name}} hellow {{name}}  hello
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}
function genChildren(children) {
  return children.map((child) => gen(child)).join(",");
}
//元素 属性 孩子
function codegen(ast) {
  let children = genChildren(ast.children);
  let code = `_C('${ast.tag},${
    ast.attrs.length > 0 ? genProps(ast.attrs) : "null"
  }${ast.children.length ? `,${children}` : ""})`;
  return code;
}

//对模板进行编译处理
export function compileToFuncrion(template) {
  // 1 就是将template 转化成ast语法树
  // 2 生成render 方法 render 方法执行执行后的返回结果·就是虚拟DOM
  let ast = parseHTML(template);
  console.log(ast);
  console.log(codegen(ast));
}
