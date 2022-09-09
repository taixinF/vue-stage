let id = 0;
class Dep {
  constructor() {
    this.id = id++; //dep要收集watcher
    this.subs = []; //存放对应的watcher
  }
  depend() {
    //这里我们不希望防止重复的watcher 而且刚才只是一个但单向的关系 dep->wathcer
    //watcher记录dep
    // this.subs.push(Dep.target);
    Dep.target.addDep(this);

    //dep和wathcer是一个多对多的关系（一个属性可以在多个组件中使用dep 多个wathcer）
    // 一个组件中有多个属性组成 一个wahter 对应多个dep
  }
  addSub(wathcer) {
    this.subs.push(wathcer);
  }
  notify() {
    this.subs.forEach((watcher) => watcher.updata());
  }
}

Dep.target = null;

let stack = [];
export function pushTarget(watcher) {
  stack.push(watcher);
  Dep.target = watcher;
}

export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}

export default Dep;
