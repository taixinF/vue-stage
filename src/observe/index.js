import { newArrayProto } from "./array";

class Observer {
  //观测数据
  constructor(data) {
    //Object.defineProperty只能劫持已经存在的属性
    // 后增的或者删除的是不知道的
    // （vue里面会为此单独写一些api $set $delete 是为了来弥补这个缺陷）
    Object.defineProperty(data, "__ob__", {
      value: this, //⚠⚠⚠⚠⚠⚠⚠这里使用不可枚举是为了防止出现炸栈⚠⚠⚠⚠⚠⚠
      enumerable: false, //将__ob__变成不可枚举(循环的时候无法获取到)
    });
    // data.__ob__ = this; //数据添加了一个表示-有————ob————说明被观测过 炸 栈
    if (Array.isArray(data)) {
      //直接this这里-。-
      //我们可以重写数组中的方法7个变异方法 是可以修改数组本身
      //数组侦测
      data.__proto__ = newArrayProto; //保留数组原有的特性 并且可以重写部分方法
      this.observeArray(data); //如果数组中放置的是对象 可以监控到变化
    } else {
      this.walk(data);
    }
  }
  walk(data) {
    //迭代
    // 👇👇👇👇👇👇👇👇👇👇👇👇👇👇重新定义属性添加getset缺点
    //循环对象 对属性依次劫持
    //重新定义属性⚠⚠⚠⚠⚠重新定义性能也差瓶颈也在这⚠⚠⚠⚠⚠⚠
    //这个方法之所以不放在this中是为了之后可以导出
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  //观测数组
  observeArray(data) {
    data.forEach((item) => observe(item));
  }
}

export function defineReactive(target, key, value) {
  observe(value); //对所有的属性都进行数据劫持
  //属性劫持
  //闭包-不会销毁
  Object.defineProperty(target, key, {
    get() {
      console.log("取值", key);
      //取值的时候执行get
      return value;
    },
    set(newValue) {
      console.log("设置值");
      //修改的时候会执行set
      if (newValue === value) return;
      observe(newValue);
      value = newValue;
    },
  });
}

//主要部分
export function observe(data) {
  //对这个对象进行劫持--重点是对象
  if (typeof data !== "object" || data == null) {
    return; //只对对象进行劫持
  }
  if (data.__ob__ instanceof Observer) {
    //说明这个对象被代理过
    return data.__ob__;
  }
  //如果一个对象被劫持过了 那就不需要再被劫持了
  //   -（要判断一个对象被劫持过 可以新增一个实例 来判断是否被劫持过）
  return new Observer(data); //一个类
}
