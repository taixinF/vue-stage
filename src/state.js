import { observe } from "./observe/index";

export function initState(vm) {
  const opts = vm.$options; //获取所有的选项
  // ...opts.props...
  if (opts.data) {
    initData(vm);
  }
}
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key]; //vm._data.name
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}

function initData(vm) {
  let data = vm.$options.data; //data也可能是个函数和对象
  //vue2 中根实例可以是对象也可以是函数 组件中必须是函数
  data = typeof data === "function" ? data.call(vm) : data; //这样执行的话可能this就有问题了 我们就用call改变一下
  //这样给其中的数据都增加了get set
  
  vm._data = data; //及把它放到原型对象上又把进行数据观测
  //对数据进行劫持;-vue2中采用defineProperty
  observe(data); //观测-响应式模块-写在外面

  //   将vm._data 用来vm代理就可以了--再一次重新代理
  for (const key in data) {
    proxy(vm, "_data", key);
  }
}
