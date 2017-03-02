// 表情包,依赖于以下样式
// .dm-expression-wrap {
//     display: inline-block;
//     position: relative;
//     width: 350px;
//     height: 132px;
//     .bg-wrap {
//         width: 100%;
//         height: 100%;
//     }
//     .slider-pager {
//         bottom: 0;
//     }
//     .click-wrap {
//         width: 100%;
//         height: 100%;
//         font-size: 0;
//         line-height: normal;
//         span {
//             display: inline-block;
//             float: left;
//             width: 14.22%;
//             height: 33.33%;
//         }
//     }
// }
//由于用到ion-slide-box，当加载页面默认隐藏时，将起显示要调用$ionicSlideBoxDelegate.update();
//YangGuang 2016-07-20
define(['app'], function(app) {
    app
        .directive("dmExpression", function() {
            return {
                restrict: 'EAC',
                replace: true,
                scope: {
                    dmInput: '='
                },
                template: [
                    '<div class="dm-expression-wrap">',
                    '        <ion-slide-box class="bg-wrap">',
                    '            <ion-slide ng-repeat="v in swiper track by $index">',
                    '                <div class="click-wrap clearfix" style="background-image: url({{v.background}});background-size: 100% 100%;">',
                    '                    <span ng-repeat="v2 in v.num track by $index" ng-click="enterFace({{$parent.$index * 20  + $index}})"></span>',
                    '                    <span ng-click="enterFace(-1)"></span>',
                    '                </div>',
                    '            </ion-slide>',
                    '        </ion-slide-box>',
                    '    </div>'
                ].join(""),
                link: function(scope, iElm, iAttrs, controller) {
                    initWAndH();
                    //写死的表情包背景等，按需求改
                    scope.swiper = [
                        { background: './img/test-face-bg1.png', num: new Array(20) },
                        { background: './img/test-face-bg2.png', num: new Array(20) },
                        { background: './img/test-face-bg3.png', num: new Array(20) },
                        { background: './img/test-face-bg4.png', num: new Array(20) },
                        { background: './img/test-face-bg5.png', num: new Array(20) }
                    ];
                    var cursor = [];
                    scope.$watch('dmInput', function(newValue, oldValue, scope) {
                        var length = newValue.length;
                        if (length == 0) {
                            cursor = [0];
                            return;
                        }
                        // 当使用键盘的backspace来删除字符时，将表情整个删除
                        if (oldValue.substr(length) == ']') {
                            scope.dmInput = newValue.substring(0, cursor[cursor.length - 2]);
                            cursor.pop();
                            return;
                        }
                        // 当监听到输入框的字符串长度在减少时，相应改变虚拟光标的位置
                        if (length <= cursor[cursor.length - 1]) {
                            cursor[cursor.length - 1] = length;
                            if (cursor[cursor.length - 1] == cursor[cursor.length - 2]) {
                                cursor.pop();
                            }
                            console.log(cursor);
                            return;
                        }
                        // 字符串长度增加时则将光标新位置写入数组
                        cursor.push(length);
                        console.log(cursor);
                    }, false);
                    scope.enterFace = function(index) {
                        // index为-1则是按下了X按钮
                        if (index == -1) {
                            var inputStr = scope.dmInput;
                            if (inputStr == '') return;
                            var strDelete = inputStr.substr(cursor[cursor.length - 2]); //将要删除的字符
                            var reg = /\[em_([0-9]*)\]$/g;
                            //若字符为表情的话就整个删除
                            if (reg.test(strDelete)) {
                                scope.dmInput = inputStr.substring(0, cursor[cursor.length - 2]);
                            } else {
                                scope.dmInput = inputStr.substring(0, inputStr.length - 1);
                            }
                            cursor.pop();
                            return;
                        }
                        var realIndex = index + 1;
                        scope.dmInput += '[em_' + realIndex + ']';
                    };

                    function initWAndH() {
                        var windowWidth = document.body.clientWidth;
                        if (windowWidth < 350) {
                            iElm.css('width', windowWidth + 'px');
                            iElm.css('height', windowWidth / (350 / 132) + 'px');
                        }
                    }
                }
            }
        })
        .directive("strWithExpression", function() {
            return {
                restrict: 'EAC',
                replace: false,
                scope: {
                    contentStr: '@'
                },
                template: '<span></span>',
                link: function(scope, iElm, iAttrs, controller) {
                    scope.$watch('contentStr', function(newValue, oldValue, scope) {
                        if (newValue != '') {
                            str = scope.contentStr;
                            str = str.replace(/\</g, '&lt;');
                            str = str.replace(/\>/g, '&gt;');
                            str = str.replace(/\n/g, '<br/>');
                            str = str.replace(/\[em_([0-9]*)\]/g, '<img src="img/qqface/$1.gif"/>');
                            str = str.replace(/&amp;nbsp;/g,' ');
                            iElm.html(str);
                        }
                    });
                }
            }
        });

        app.directive('viewCountdown', viewCountdown);

        viewCountdown.$inject = ['$parse'];

        function viewCountdown($parse) {

            return {
                restrict: 'A',
                scope: {
                    type: '@', //倒计时单位，可选ms/s，默认是s
                    timeoutCallback: '&' //时间截止时的回调
                },
                compile: function conpile(tElem, tAttrs) {

                    return {
                        pre: function preLink() {},
                        post: function postLink(scope, elem, attrs) {
                            var remainTime = $parse(attrs.remainTime)(scope, remainTime);
                            var type = (typeof(attrs.type) == 'undefined') ? 's' : attrs.type;
                            var intervel = 10;
                            if (type == 's') {
                                remainTime *= 1000;
                            }
                            var endTime = (+new Date()) + remainTime;
                            showCurrentTime(remainTime);

                            var timeID = setInterval(timeCount, intervel);

                            function timeCount() {

                                if (remainTime <= 0) {
                                    clearInterval(timeID);
                                    // elem.html('请稍后，正在计算...');
                                    if (angular.isFunction(scope.timeoutCallback)) {
                                        scope.timeoutCallback();
                                    }
                                    return;
                                }
                                remainTime = endTime - (+new Date());
                                showCurrentTime(remainTime);
                            }

                            elem.bind('$destroy', function() {
                                clearInterval(timeID);
                            });

                            function showCurrentTime(time) {
                                // if (formatTime(time)) {
                                //     elem.html(formatTime(time));
                                // } else {
                                //     elem.css("height": );
                                // }
                                elem.html(formatTime(time));
                            }

                            function formatTime(time) {
                                var ms = (time >= 0) ? time : 0;
                                var s = parseInt(ms / 1000);
                                var m = parseInt(s / 60);
                                var h = parseInt(m / 60);
                                var d = parseInt(h / 24);
                                h = h % 24;
                                m = m % 60;
                                s = s % 60;
                                ms = ms % 1000;

                                var str_d = (d === 0) ? '' : (d + '天 ');
                                var str_h = (str_d === '' && h === 0) ? '' : (addZero(h) + '时');
                                var str_m = (str_h === '' && m === 0) ? '' : (addZero(m) + '分');
                                // var str_s = (str_m === '' && s === 0) ? '00: ' : (addZero(s) + ': ');
                                var str_s = (str_m === '' && s === 0) ? '' : (addZero(s)+'秒');
                                var str_ms = addZero((ms / 10).toFixed(0));
                                if (Number(str_ms) >= 100) str_ms = '99';
                                return (str_d + str_h + str_m + str_s);
                            }

                            function addZero(num) {
                                if (num < 10) {
                                    return ('0' + num)
                                } else {
                                    return ('' + num);
                                }
                            }

                        }
                    }
                }
            }
        }
});
