import { observe } from "./observe/index";
import Watcher from "./observe/wacher";

export function initState(vm) {
  const opts = vm.$options; //获取所有的选项
  // ...opts.props...
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
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

//这样性能要走三次----走缓存
function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {}); //将计算属性watcher保存到vm上
  for (const key in computed) {
    let userDef = computed[key];

    //我们需要监控计算属性中的get变化
    let fn = typeof userDef === "function" ? userDef : userDef.get;

    //如果直接 new Watcher 默认就会执行fn 将属性和watcher对应起来
    watchers[key] = new Watcher(vm, fn, { lazy: true });

    defineComputed(vm, key, userDef);
  }
}
function defineComputed(target, key, userDef) {
  const setter = userDef.get || (() => {});
  //通过实力拿到对应的属性
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter,
  });
}

function createComputedGetter(key) {
  //检测是否要执行getter这个函数
  return function () {
    const watcher = this._computedWatchers[key]; //获取到对应属性的watcher
    if (watcher.dirty) {
      //如果是脏的就去执行 用户传入的函数
      watcher.evaluate(); //球之后dirty 变为了false 下刺就不取值了
    }
    return watcher.value;
  };
}
