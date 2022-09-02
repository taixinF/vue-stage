// 重写数组中的部分方法

let oldArrayProto = Array.prototype; //获取数组的原型-不能直接去修改 我们要保证原来的还在

//newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto);
//这样就不会影响数组上原型的方法了
let methods = [
  //找到所有的变异方法-能修改原素组
  "push",
  "pop",
  "shift",
  "unshift",
  "reverse",
  "sort",
  "splice",
]; //concat slice 都不会改变原来的数组

methods.forEach((method) => {
  // Array.push(1,2,3)
  newArrayProto[method] = function (...args) {
    //这里重写了数组的方法
    //push()
    //todo......
    //this里的this 谁调用的方法就是指向谁的
    const result = oldArrayProto[method].call(this, ...args); //内部调用原来的方法 函数的劫持 切片编程

    //我们需要对新增的数据 再次进行劫持
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      case "unshift": //arr.puwsh(1,2,3)
        inserted = args;
        break;
      case "splice": //arr.splice(0,1)
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    console.log(inserted); //新增的内容
    if (inserted) {
      //对新增的内容再次进行观测
      console.log(this);
      console.log(ob);
      ob.observeArray(inserted);
    }
    return result;
  };
});
