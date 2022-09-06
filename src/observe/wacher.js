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
    this.get(); //重新渲染
  }
}

export default Watcher;
