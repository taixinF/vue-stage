import { initMixin } from "./init";

//将所有的方法都耦合在一起
function Vue(options) {
  this._init(options); //默认就调用了init
}
initMixin(Vue); //扩展了 init方法

export default Vue;
