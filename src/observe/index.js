class Observer {
  //观测数据
  constructor(data) {
    //Object.defineProperty只能劫持已经存在的属性
    // 后增的或者删除的是不知道的
    // （vue里面会为此单独写一些api $set $delete 是为了来弥补这个缺陷）
    this.walk(data);
  }
  walk(data) {
    // 👇👇👇👇👇👇👇👇👇👇👇👇👇👇重新定义属性添加getset缺点
    //循环对象 对属性依次劫持
    //重新定义属性⚠⚠⚠⚠⚠重新定义性能也差瓶颈也在这⚠⚠⚠⚠⚠⚠
    //这个方法之所以不放在this中是为了之后可以导出
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
}

export function defineReactive(target, key, value) {
  observe(value); //对所有的属性都进行数据劫持
  //属性劫持
  //闭包-不会销毁
  Object.defineProperty(target, key, {
    get() {
      console.log("取值");
      //取值的时候执行get
      return value;
    },
    set(newValue) {
      console.log("设置值");
      //修改的时候会执行set
      if (newValue === value) {
        return;
      }
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
  //如果一个对象被劫持过了 那就不需要再被劫持了
  //   -（要判断一个对象被劫持过 可以新增一个实例 来判断是否被劫持过）

  return new Observer(data); //一个类
}
