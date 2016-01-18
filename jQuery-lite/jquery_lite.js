(function () {
  function DOMNodeCollection(elArray) {
    this.els = elArray;
  }
  var queue = [];
  var fired = false;

  document.addEventListener("DOMContentLoaded", function(e) {
    fired = true;
    queue.forEach(function (callback) {
      callback();
    });
  });

  window.$l = function (param) {
    var arr;

    if (typeof param === "function") {
      if(!fired) {
        queue.push(param);
      } else {
        param();
      }
      return;
    } else if (param instanceof HTMLElement) {
      arr = [param];
    } else {
      console.log(param);
      arr = [].slice.call(document.querySelectorAll(param));
    }
    return new DOMNodeCollection(arr);
  };

  window.$l.extend = function() {
    var args = [].slice.call(arguments, 1);
    var target = arguments[0];
    args.forEach( function(arg) {
      for (var attrname in arg) {
        target[attrname] = arg[attrname];
      }
    });
    return target;
  };

  window.$l.ajax = function (options) {
    var defaults = {
      success: function () {},
      error: function () {},
      url: document.URL,
      method: 'GET',
      data: {},
      contentType: "application/x-www-form-urlencoded; charset=UTF-8"
    };
    window.$l.extend(defaults, options);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function(e) {
      if (xmlhttp.readyState === XMLHttpRequest.DONE ) {
        var content = JSON.parse(e.currentTarget.response);
        if(xmlhttp.status === 200){
          defaults.success(content);
        } else {
          defaults.error(content);
        }
      }
    };
    xmlhttp.open(defaults.method, defaults.url, true);
    xmlhttp.send(defaults.data);
  };

  DOMNodeCollection.prototype = {
    html: function (string) {
      if (typeof string === 'undefined') {
        return this.els[0].innerHTML;
      } else {
        this.els.forEach(function (el) {
          el.innerHTML = string;
        });
      }
      return this;
    },

    empty: function () {
      this.html("");
      return this;
    },

    append: function (content) {
      if (content instanceof DOMNodeCollection) {
        var that = this;
        content.els.forEach(function (el) {
          that.append(el);
        });
      } else if (typeof content === "string") {
        this.els.forEach(function (el) {
          el.innerHTML += content;
        });
      } else {
        console.log(typeof content);
        this.els.forEach( function (el) {
          el.appendChild(content);
        });
      }
      return this;
    },

    attr: function(name, attribute) {
      if (typeof attribute === 'undefined'){
        for (var i = 0; i < this.els.length; ++i) {
          if (typeof this.els[i].getAttribute(name) === 'string' ) {
            return this.els[i].getAttribute(name);
          }
        }
      } else {
        this.els.forEach( function(el) {
          el.setAttribute(name, attribute);
        });
        return this;
      }
    },

    addClass: function (name) {
      this.els.forEach(function (el) {
        el.className += " " + name;
        el.className = el.className.trim();
      });
      return this;
    },

    removeClass: function (name) {
      if (typeof name === "undefined") {
        this.els.forEach(function (el) {
          el.className = ""; // leaves <el class></el>
        });
      } else if (name === ".") {
        return console.log("INVALID REMOVECLASS INPUT");
      } else {
        var re = "(^|\\s)" + name + "($|\\s)";
        re = new RegExp(re, "g");
        this.els.forEach(function (el) {
          el.className = el.className.replace(re, " ");
          el.className = el.className.trim();
        });
      }
      return this;
    },

    children: function() {
      var answer = [];
      this.els.forEach( function(el) {
        answer.push(el.children);
      });
      return new DOMNodeCollection(answer);
    },

    parent: function(){
      var answer = [];
      this.els.forEach( function(el) {
        answer.push(el.parentElement);
      });
      return new DOMNodeCollection(answer);
    },

    find: function(selector) {
      var answer = [];
      this.els.forEach( function(el) {
        var results = [].slice.call(el.querySelectorAll(selector));
        answer = answer.concat(results);
      });
      return new DOMNodeCollection(answer);
    },

    remove: function () {
      this.els.forEach(function (el) {
        el.parentNode.removeChild(el);
      });
      return this;
    },

    on: function (type, callback) {
      this.els.forEach(function (el) {
        el.addEventListener(type, callback);
      });
    },

    off: function (type, callback) {
      this.els.forEach(function (el) {
        el.removeEventListener(type, callback);
      });
    }
  };
})();
