/**
 * Created by suiman on 15/11/10.
 */

//存储全局信息

define(['app'],function(app){
  app
    .factory('Storage', function storageService() {

      var storage = window.localStorage;
      var json = window.JSON;

      return {
        set: set,
        get: get,
        clear: clear,
        remove: remove,
        setAttr: setAttr
      };

      function set(key, value) {
        storage.setItem(key, json.stringify(value));
      }

      function get(key, defaultValue) {
        // var value = json.parse(storage.getItem(key));
        // if(null != value) {
        //   return value;
        // }
        // return undefined;
        var stored = storage.getItem(key);
        try {
            stored = angular.fromJson(stored);
        } catch (error) {
            stored = null;
        }
        if (defaultValue && stored === null) {
            stored = defaultValue;
        }
        return stored;
      }

      function clear() {
        storage.clear();
      }

      function remove(key) {
        storage.removeItem(key);
      }

      function setAttr (key,attrName,value) {
         var auth = get(key);
         auth[attrName] = value;
         set(key,auth);
      }
    });
});


