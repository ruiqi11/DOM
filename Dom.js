window.dom = {
  //create(){}   == create:function(){}
  //   create(tagName) {
  //     return document.createElement(tagName);}

  //1创建节点
  create(string) {
    const container = document.createElement("template"); //template 可以存放任意标签并显示，div不能显示<td>元素
    container.innerHTML = string.trim(); //trim()可以去掉字符串两边的空格
    return container.content.firstChild;
  },

  //增

  //在node节点后面插入node2节点
  after(node, node2) {
    node.parentNode.insertBefore(node2, node.nextSibling);
  },
  //在node节点前面插入node2节点
  before(node, node2) {
    node.parentNode.insertBefore(node2, node);
  },
  //添加子元素
  append(parent, node) {
    parent.appendChild(node);
  },
  //添加父元素
  wrap(node, parent) {
    dom.before(node, parent); //先把要添加的父元素parent变成哥哥
    dom.append(parent, node); //在把node放到parent里面
    // a.需要清除原来的元素？
  },

  //2删

  //删除该节点
  remove(node) {
    node.parentNode.removeChild(node);
    return node; //删除了节点，但为了不妨碍其引用所以返回
  },
  //删除全部子节点 
  empty(node) {
    //const childNodes = node.childNodes,可以简写成下面的形式
    const { childNodes } = node;
    const array = [];
    //下面的代码存在bug，因为每次移除一个元素以后长度就变了，比如第一次7个元素，移除一个剩下6个，但是这时访问要移除下标为[1]的元素
    //也就是6个元素中的第二个相当于原数组的第三个，所以是跳着移除的不是挨个移除的
    // for (let i = 0; i < childNodes.length; i++) {
    //   dom.remove(childNodes[i]);
    //   array.push(childNodes[i]);
    // }
    // return array;

    //调整后的代码如下
    let x = node.firstChild;
    while (x) {
      array.push(dom.remove(node.firstChild));
      x = node.firstChild; //移除后新数组的第一个元素
    }
    return array;
  },

  //3改

  //改属性和获取属性
  attr(node, name, value) {
    //重载// arguments为参数
    if (arguments.length === 3) {
      //三个变量就添加属性
      node.setAttribute(name, value);
    } else if (arguments.length === 2) {
      //两个变量就获取属性
      return node.getAttribute(name);
    }
  },
  //改文本内容
  text(node, string) {
    //如果想获取某个元素的text内容
    if (arguments.length === 2) {
      if (node.innerText in node) {
        //适配
        node.innerText = string; //innerText是ie发明的，只有很古老的ie只识别innerText
      } else {
        node.textContent = string; //textContent适用于Firefox/Chrome等
      }
    } else if (arguments.length === 1) {
      // 获取文本内容
      if (node.innerText in node) {
        //适配
        return node.innerText; //innerText是ie发明的，只有很古老的ie只识别innerText
      } else {
        return node.textContent; //textContent适用于Firefox/Chrome等
      }
    }
  },
  //改html内容
  html(node, string) {
    if (arguments.length === 2) {
      node.innerHTML = string;
    } else if (arguments.length === 1) {
      return node.innerHTML;
    }
  },
  //改style属性
  style(node, name, value) {
    if (arguments.length === 3) {
      //dom.style(div,'color','red')
      node.style[name] = value;
    } else if (arguments.length === 2) {
      // 获取属性值
      if (typeof name === "string") {
        //dom.style(div,'color')//获取color值
        return node.style[name];
      } else if (name instanceof Object) {
        // 以对象的形式多个修改属性值
        //dom.style(div,{color:'red'})
        const object = name;
        for (let key in object) {
          node.style[key] = object[key];
        }
      }
    }
  },
  class: {
    add(node, className) {
      node.classList.add(className);
    },
    remove(node, className) {
      node.classList.remove(className);
    },
    has(node, className) {
      return node.classList.contains(className);
    },
  },
  //添加事件监听
  on(node, eventName, fn) {
    node.addEventListener(eventName, fn);
  },
  //移除事件监听
  off(node, eventName, fn) {
    node.removeEventListener(eventName, fn);
  },
  //4查找元素
  // find(selector) {
  //   return document.querySelectorAll(selector);
  // },
  //如果加上查找范围

  find(selector, scope) {
    return (scope || document).querySelectorAll(selector); //如果有范围就在scope里找，否则在document里找
  },
  parent(node) {
    return node.parentNode;
  },
  children(node) {
    return node.children;
  },
  siblings(node) {
    return Array.from(node.parentNode.children).filter((n) => n !== node); //node.parentNode.children是个伪数组必须变幻成数组才能用filter
  },
  next(node) {
    let x = node.nextSibling;
    while (x.nodeType === 3) {
      x = x.nextSibling;
    }
    return x;
  },
  previous(node) {
    let x = node.previousSibling;
    while (x.nodeType === 3) {
      x = x.previousSibling;
    }
    return x;
  },
  each(nodeList, fn) {
    for (let i = 0; i < nodeList.length; i++) {
      fn.call(null, nodeList[i]);
    }
  },
  index(node) {
    const list = dom.children(node.parentNode);
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i] === node) {
        break;
      }
    }
    return i;
  },
};


//绑定事件
function on(ele,type,fn) {
  if(ele.addEventListener) {
      ele.addEventListener(type,fn,false);
  } else{
      if (!ele['myEvent' + type]) {
          ele['myEvent' + type] = [];
          ele.attachEvent('on' + type,function(){//在这里绑定run方法
              run.call(ele);
          })
      }
      let arr = ele['myEvent' + type];
      for(let i = 0; i < arr.length; i++) {
          if (arr[i] == fn) {
              return;
          }
      }
      arr.push(fn);
  }    
}

//解决IE下事件执行顺序的run方法
function run() {
  let e = window.event;//在IE6-8下，事件对象是存储在全局的event属性上的
  e.target = e.srcElement;
  e.preventDefault = function () {
      e.returnValue = false ;
  }
  e.stopPropagation = function () {
      e.cancleBubble = true ;
  }
  let arr = this['myEvent' + event.type];
  for(let i = 0; i < arr.length; i++) {
      if(arr[i] == null) {//在这里删除被解绑的方法
          arr.splice(i,1);
          i--;
      }
      arr[i].call(this,event);
  }
}

//解除事件
function off(ele,type,fn) {
  if (ele.removeEventListener) {
      ele.removeEventListener(type,fn,false);
  } else {
      let arr = ele["myEvent" + type];
      for(let i = 0; i < arr.length; i++) {
          if (arr[i] == fn) {
              arr[i] = null;
              //arr.splice(i,1);这里为什么不能直接删除掉，而是要用null来占位。答案是：为了不改变arr的长度。使run能正确执行。
              return;
          }
      }
  }
}
