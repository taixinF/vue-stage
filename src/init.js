import { compileToFuncrion } from "./compiler";
import { mountComponent } from "./lifecycle";
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

    //初始化模板
    if (options.el) {
      vm.$mount(options.el); //实现数据的挂在
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    let ops = vm.$options;
    //先进行查找有没有render函数
    if (!ops.render) {
      //没有render看一下是否写了template，没写template采用外部的template
      let template;
      if (!ops.template && el) {
        //没有写模板 但是写了el
        template = el.outerHTML;
      } else {
        if (el) {
          //如果有el 则采用模板的内容
          template = ops.template;
        }
      }
      //写了template 就用写了的template
      if (template && el) {
        //这里需要对模板进行编译--核心编译方法
        const render = compileToFuncrion(template);
        ops.render = render; //jsx最终会被编译成h('xxx')
      }
    }
    //最终就可以获取render方法
    mountComponent(vm, el); //组件挂载
    // 最终就可以获得render方法
    //script 标签应用的 vue.global.js 这个编译过程是在浏览器运行的
    //runtime 是不包含模板编译的,整个编译是打包的时候通过loader来转义.vue文件 只有永runtime的时候不能使用template
  };
}
