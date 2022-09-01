export function initState(vm) {
  const opts = vm.$options; //获取所有的选项
  // ...opts.props...
  if (opts.data) {
    initData(vm);
  }
}

function initData(vm) {
  let data = vm.$options.data; //data也可能是个函数和对象
  //vue2 中根实例可以是对象也可以是函数 组件中必须是函数
  data = typeof data === "function" ? data.call(vm) : data; //这样执行的话可能this就有问题了 我们就用call改变一下
  //对数据进行劫持;
}
