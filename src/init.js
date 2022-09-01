import { initState } from "./state"; //迁移出去再导入实用就好了

export function initMixin(Vue) {
  //就是给Vue增加init方法
  Vue.prototype._init = function (options) {
    //用于初始化
    //vue vm $options 就是获取用户的配置-VuE的时候所有$都是自己的属性
    const vm = this;
    vm.$options = options; //将用户的选项挂载到实例上

    //初始化状态
    initState(vm);
    //todo....
  };
}
