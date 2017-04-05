/**
 * 请求封装类
 * Created by luliang on 2015/11/19.
 */
//The response object has these properties:
//
//  data – {string|Object} – The response body transformed with the transform functions.
//  status – {number} – HTTP status code of the response.
//  headers – {function([headerName])} – Header getter function.
//config – {Object} – The configuration object that was used to generate the request.
//  statusText – {string} – HTTP status text of the response.
define(['app', 'js/utils/tips', 'js/utils/httpRequestBase', 'js/utils/md5'], function(app, Tips) {
    app
        .factory('httpRequest', ['$http', '$q', 'httpRequestBase', 'md5Utils', '$httpParamSerializerJQLike', '$state','$rootScope', 'Storage', '$ionicLoading',
            function($http, $q, httpRequestBase, md5Utils, $httpParamSerializerJQLike, $state,$rootScope,Storage, $ionicLoading) {

                var getBaseUrl = function() {
                    return APP.baseUrl;
                };
                /**
                 *http请求
                 * @param {Object} config
                 * @param{function}[onSuccess]
                 * @param{function}[onFailed]
                 * @param{function}[onFinal]
                 * @returns {object}promise
                 */
                function requestMethod(config, onSuccess, onFailed, onFinal) {
                    return httpRequestBase.request(config, function(response, data, status, headers, config, statusText) {
                        try {
                            var code = data.code;
                            //在这里处理公共错误
                            if (code == 308) {
                                if (APP.isInApp) {
                                    Tips.showTips(data.msg);
                                    Storage.remove('vrsm_auth');
                                    $state.go('login')
                                } else { //微信版要清楚cookie
                                    document.cookie = '';
                                    if(APP.is_wechat){
                                        // location.reload();
                                        // location.href = location.href.replace(location.hash,'');
                                        //重新登录
                                        $rootScope.goWechatLogin();
                                    }
                                }
                                return;
                            }
                            if (angular.isFunction(onSuccess)) {
                                onSuccess(response, data, status, headers, config, statusText);
                            }
                        } catch (e) {
                            // ssjjLog.error("response Error："+e.name+"："+ e.message);
                            if (angular.isFunction(onFailed)) {
                                onFailed(response, data, status, headers, config, statusText);
                            }
                        }
                    }, onFailed, onFinal);
                }
                return {
                    /**
                     *Get请求
                     * @param {Object.<string|Object>} extraUrl 接口地址 不包括其他参数 例子?c=user&a=login 不要包括最后面的'&'
                     * @param {Object.<string|Object>}[extraParams] 请求参数 拼接到url后面
                     * @param {function}[onSuccess]
                     * @param {function}[onFailed]
                     * @param {function}[onFinal]
                     * @returns {object}promise
                     */
                    get: function(extraUrl, extraParams, onSuccess, onFailed, onFinal) {

                        var httpConfig = {};
                        httpConfig.method = 'GET';
                        var url = getBaseUrl();
                        if (extraUrl.indexOf("http") >= 0) {
                            if (angular.isString(extraUrl)) {
                                url = extraUrl;
                                httpConfig.url = url;
                            }
                        } else {
                            if (angular.isString(extraUrl)) {
                                url += extraUrl;
                                httpConfig.url = url;
                            }
                        }
                        // var params = MyUrl.getDefaultParams();
                        var params = {};
                        for (var key in extraParams) {
                            params[key] = extraParams[key];
                        }
                        if (angular.isString(params) || angular.isObject(params)) {
                            httpConfig.params = this.getPostParam(params);
                        }
                        return requestMethod(httpConfig, onSuccess, onFailed, onFinal);
                    },
                    /**
                     * POST请求
                     * @param {string}extraUrl 接口地址 不包括其他参数 例子?c=user&a=login 不要包括最后面的'&'
                     * @param {string|Object}[data] post 表单提交的数据 post请求附带参数
                     * @param {function}[onSuccess]
                     * @param {function}[onFailed]
                     * @param {function}[onFinal]
                     * @returns {object}promise
                     */
                    post: function(extraUrl, data, onSuccess, onFailed, onFinal, headers) {
                        var httpConfig = {};
                        httpConfig.method = 'POST';
                        var url = getBaseUrl();
                        if (extraUrl.indexOf("http") >= 0) {
                            if (angular.isString(extraUrl)) {
                                url = extraUrl;
                                httpConfig.url = url;
                            }
                        } else {
                            if (angular.isString(extraUrl)) {
                                url += extraUrl;
                                httpConfig.url = url;
                            }
                        }
                        if (headers) {
                            httpConfig.headers = headers;
                        }
                        // if(angular.isString(params) || angular.isObject(params)){
                        //   httpConfig.params = params;
                        // }
                        if ( !headers && (angular.isString(data) || angular.isObject(data))) {
                            httpConfig.data = $httpParamSerializerJQLike(this.getPostParam(data));
                        } else if (headers) {
                            // Content-Type:multipart/form-data
                            httpConfig.data = data;
                            httpConfig.transformRequest = angular.identity;
                        }

                        return requestMethod(httpConfig, onSuccess, onFailed, onFinal);
                    },

                    // attend to the task, concat the alertView and auth msg
                    postWithUI: function($scope, extraUrl, data, onSuccess, onFailed, onFinal) {
                        // 发送请求
                        $scope.$emit('loadding', 'noBackdrop', '加载中...');
                        this.post(extraUrl, data, function(re) {
                            if (onSuccess) onSuccess(re);
                            if (!re.data.result.isSuccess) {
                                Tips.showTips(re.data.result.errorMessage);
                            };
                        }, function(re) {
                            if (onFailed) onFailed(re);
                        }, function(re) {
                            $scope.$emit('loadding', 'false');
                            if (onFailed) onFinal(re);
                        });
                    },
                    postWithAuth: function($scope, extraUrl, data, onSuccess, onFailed, onFinal) {
                        var auth = Storage.get('vrsm_auth');
                        // 发送请求
                        $scope.$emit('loadding', 'noBackdrop', '加载中...');
                        this.post(extraUrl, data, function(re) {
                            if (onSuccess) onSuccess(re);
                        }, function(re) {
                            if (onFailed) onFailed(re);
                        }, function(re) {
                            $scope.$emit('loadding', 'false');
                            $ionicLoading.hide();
                            if (onFailed) onFinal(re);
                        });
                    },
                    postWithAuthUser: function($scope, extraUrl, data, onSuccess, onFailed, onFinal) {  // 在主页面不出现正在加载模态框
                        var auth = Storage.get('vrsm_auth');

                        data.uid = auth.uid || '';
                        data.token = auth.token || '';
                        // 发送请求
                        this.post(extraUrl, data, function(re) {
                            if (onSuccess) onSuccess(re);
                        }, function(re) {
                            if (onFailed) onFailed(re);
                        }, function(re) {
                            $scope.$emit('loadding', 'false');
                            $ionicLoading.hide();
                            if (onFailed) onFinal(re);
                        });
                    },
                    getPostParam: function(postData) {
                        delete postData.sign;
                        var arr = [];
                        for (var i in postData) {
                            arr.push(i + '=' + encodeURIComponent(postData[i]));
                        }
                        arr.sort();
                        var result = arr.join('&');
                        delete postData.app_key;
                        return postData;
                    },
                    getBaseUrl: getBaseUrl
                };
            }
        ]);
});
