import Watcher from "./observe/wacher";
import { createElementVNode, createTextVNode } from "./vdom";

function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    //标签
    vnode.el = document.createElement(tag); //这里将真是节点和虚拟节点对应起来,后续如果修改属性了
    patchProps(vnode.el, data);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function patchProps(el, props) {
  for (const key in props) {
    if (key === "style") {
      //style{color:'red'}
      for (const sytleName in props.sytle) {
        el.style[sytleName] = props.style[sytleName];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patch(oldVNode, vnode) {
  //写的是初渲染流程
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    const elm = oldVNode; //获取真实元素
    const parentElm = elm.parentNode; //拿到父元素
    let newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibling);
    parentElm.removeChild(elm); //删除老节点
    return newElm;
  } else {
    //diff算法
  }
}
export function initLifeCycle(Vue) {
  Vue.prototype._updata = function (vnode) {
    const vm = this;
    const el = vm.$el;
    vm.$el = patch(el, vnode);
  };
  //_c('div',{},...children)
  Vue.prototype._c = function () {
    console.log(this, ...arguments);
    return createElementVNode(this, ...arguments);
  };
  //_v(text)
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };
  Vue.prototype._render = function () {
    //让with中的this指向vm 当渲染的时候实例中取值 我们就可以将属性和视图绑定在一起

    return vm.$options.render.call(this); //通过ast语转义后生成的render方法
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;
  //1 调用render方法产生虚拟节点 虚拟DOM
  const updateComponent = () => {
    vm._updata(vm._render()); //vm.$options.render()虚拟节点
  };
  new Watcher(vm, updateComponent, true); //true用于标识是一个渲染wathcer
  //2根据虚拟DOM产生真是DOM

  //3插入到el元素中
}
//Vue核心流程
// 1 创造了响应式函数 2模板转换成ast语法树
// 3 将ast语法树转换成render函数 4 后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）
//render函数会去产生虚拟节点(使用响应式数据)
//更具生成的虚拟节点创造了真实的DOM

export function callHook(vm, hook) {
  //调用钩子函数
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
