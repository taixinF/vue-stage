import Dep from "./dep";

let id = 0;
//组件化 服用好维护 局部更新

//每一个属性有一个dep(属性就是被观察者),wathcer就是观察者(属性变化了会通知观察者来更新)-> 观察者模式
class Watcher {
  //不同的组件有不同的watcher 目前只有一个实例
  constructor(vm, fn, options) {
    this.id = id++;
    this.renderWatcher = options;
    this.getter = fn;
    this.deps = []; //比如组件卸载 后续我们实现计算属性和一些清理工作需要用到
    this.depsId = new Set();
    this.get();
  }
  addDep(dep) {
    //一个组件 对应着 多个属性 重复的属性也不用记录
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id);
      dep.addSub(this); //wathcaer已经记住了dep
    }
  }
  get() {
    Dep.target = this; //静态属性只有一份
    this.getter(); //回去vm上取值
    Dep.target = null;
  }
  updata() {
    //缓存更新
    queueWatcher(this); //把当前的watcher暂存起来
    // this.get(); //重新渲染    //多次渲染
  }
  run() {
    this.get(); //缓存渲染
  }
}
let queue = [];
let has = {};
let pending = false; //防抖
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach((q) => q.run()); //刷新过沉重可能还有新的wathcer 放到queue中
}
function queueWatcher(wathcer) {
  const id = wathcer.id;
  if (!has[id]) {
    queue.push(wathcer);
    has[id] = true;
    if (!pending) {
      setTimeout(flushSchedulerQueue, 0);
      pending = true;
    }
  }
}
//Vue核心异步批处理

let callback = [];
let waiting = false;
function flushCallbacks() {
  let cbs = callback.slice(0);
  waiting = false;
  callback = [];
  cbs.forEach((cb) => cb()); //按照顺序依次执行
}

//nextTick中没有直接使用某个api 而是采用优雅降级的方式
//内部先采用的是promise ie不兼容 mutationObserver(h5的api) 可以考虑ie专享 setImmediate setTimeout

//nextTick 是同步还是异步
//放到队列中是同步 开启定时器是异步

let timerFunc;
// if (Promise) {
//   timerFunc = () => {
//     Promise.resolve().then(flushCallbacks);
//   };
// } else if (MutationObserver) {
//   let observer = new MutationObserver(flushCallbacks); //这里传入的回调是异步执行的
//   let textNode = document.createTextNode(1);
//   observer.observe(textNode, {
//     characterData: true,
//   });
//   timerFunc = () => {
//     textNode.textContent = 2;
//   };
// } else if (setImmediate) {
//   timerFunc = () => {
//     setImmediate(flushCallbacks);
//   };
// } else {
timerFunc = () => {
  setTimeout(flushCallbacks);
};
// }

export function nextTick(cb) {
  callback.push(cb); //维护nextTick中的callback方法
  if (!waiting) {
    timerFunc();
    waiting = true;
  }
}
export default Watcher;
