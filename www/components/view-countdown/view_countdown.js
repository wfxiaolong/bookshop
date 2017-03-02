/**
 * 示例（注意：remain_time的默认单位是s）
 * <p>倒计时：<em view-countdown remain-time="{{remain_time}}"></em></p>
 */

define(
  [ 'app'],
  function(app) {
    app.directive('viewCountdown', viewCountdown);

    viewCountdown.$inject = ['$parse'];
    function viewCountdown($parse) {

      return {
        restrict: 'A',
        scope: {
          type: '@',  //倒计时单位，可选ms/s，默认是s
          timeoutCallback: '&'  //时间截止时的回调
        },
        compile: function conpile(tElem, tAttrs) {

          return {
            pre: function preLink() {},
            post: function postLink(scope, elem, attrs) {
              var remainTime = $parse(attrs.remainTime)(scope, remainTime);
              var type = (typeof(attrs.type) == 'undefined') ? 's' : attrs.type;
              var intervel = 10;
              if(type=='s') {
                remainTime *= 1000;
              } 
              var endTime = (+new Date()) + remainTime;
              showCurrentTime(remainTime);

              var timeID = setInterval(timeCount,intervel);
              function timeCount() {

                if(remainTime<=0) {
                  clearInterval(timeID);
                  elem.html('请稍后，正在计算...');
                  if(angular.isFunction(scope.timeoutCallback)) {
                    scope.timeoutCallback();
                  }
                  return;
                }
                remainTime = endTime - (+new Date());
                showCurrentTime(remainTime);
              }

              elem.bind('$destroy',function(){
                clearInterval(timeID);
              });

              function showCurrentTime(time) {
                elem.html(formatTime(time));
              }

              function formatTime(time) {
                var ms = (time>=0) ? time : 0;
                var s = parseInt(ms/1000);
                var m = parseInt(s/60);
                var h = parseInt(m/60);
                var d = parseInt(h/24);
                h = h%24;
                m = m%60;
                s = s%60;
                ms = ms%1000;

                var str_d = (d===0) ? '' : (d+'天 ');
                var str_h = (str_d==='' && h===0) ? '' : (addZero(h)+': ');
                var str_m = (str_h==='' && m===0) ? '00: ' : (addZero(m)+': ');
                var str_s = (str_m==='' && s===0) ? '00: ' : (addZero(s)+': ');
                var str_ms = addZero((ms/10).toFixed(0));
                if(Number(str_ms) >= 100) str_ms = '99';
                return (str_d+str_h+str_m+str_s+str_ms);
              }

              function addZero(num) {
                if(num<10) {
                  return ('0' + num)
                }else {
                  return ('' + num);
                }
              }

            }
          }
        }
      }
    }
  })
