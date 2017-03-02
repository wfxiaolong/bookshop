/**
 * Created by Administrator on 2015/12/15.
 */

var PhotoUtils = function(obj) {
    if (obj instanceof PhotoUtils) return obj;
    if (!(this instanceof PhotoUtils)) return new PhotoUtils(obj);
    this.PhotoUtilswrapped = obj;
};



/**
 * 从浏览器打开图片选择
 * @param onSuccess {string} base64图片
 * @param onFail {string}
 */
PhotoUtils.takePictureByHtml5 = function(onSuccess,beforeTransformImg) {
    var input = document.createElement('input');
    input.type = 'file';
    input.name = 'files[]';
    input.accept = 'image/*';

    input.onchange = function(inputEvent) {
        if (inputEvent.target.files.length > 0) {
            beforeTransformImg(); //加载中提示
            var file = inputEvent.target.files[0];
            var rotation = 0;
            EXIF.getData(file, function() {
                var orientation = EXIF.getTag(this, 'Orientation');
                switch (orientation) { //根据exif中照片的旋转信息对图片进行旋转
                    case 3:
                        rotation = 180;
                        break;
                    case 6:
                        rotation = 90;
                        break;
                    case 8:
                        rotation = -90;
                        break;
                    default:
                        rotation = 0;
                }
                var reader = new FileReader();
                reader.onload = function(readerEvent) {
                    input.parentNode.removeChild(input);
                    var image = new Image();
                    image.src = readerEvent.target.result;
                    image.onload = function() {
                        var rotatedImage = rotateImage(image, rotation); //旋转图片
                        rotatedImage.onload = function() {
                            var data = compress(rotatedImage); //压缩图片
                            return onSuccess(data);
                        };
                    };
                };
                reader.readAsDataURL(file);
            });
        }
    };
    document.body.appendChild(input);
    input.click();
};


/**
 * 通过app客户端拍照
 * @param isAllowEdit {boolean} 图片选择完成后是否可编辑
 * @param onSuccess {string} base64图片
 * @param onFail {string}
 */
PhotoUtils.takePhotoByApp = function(isAllowEdit, onSuccess, onFail) {
    navigator.camera.Direction = Camera.Direction.FRONT;
    navigator.camera.getPicture(function(imgData) {
        var imgDataBase64 = imgData;
        if (imgData.indexOf('data:image/') === -1) { //没有图片base64标识
            imgDataBase64 = "data:image/jpeg;base64," + imgData;
        }
        onSuccess(imgDataBase64);
    }, function(message) {
        onFail(message);
    }, {
        quality: 100,
        targetWidth: 1280,
        targetHeight: 720,
        allowEdit: isAllowEdit || false,
        destinationType: navigator.camera.DestinationType.DATA_URL
    });
};


/**
 * 从客户端打开本地相册
 * @param isAllowEdit {boolean} 图片选择完成后是否可编辑
 * @param onSuccess {string} base64图片
 * @param onFail {string}
 */
PhotoUtils.getLocalPictureByApp = function(isAllowEdit, onSuccess, onFail) {
    navigator.camera.getPicture(function(imgData) {
        var imgDataBase64 = imgData;
        if (imgData.indexOf('data:image/') === -1) { //没有图片base64标识
            imgDataBase64 = "data:image/jpeg;base64," + imgData;
        }
        onSuccess(imgDataBase64);
    }, function(message) {
        onFail(message);
    }, {
        quality: 100,
        targetWidth: 1280,
        targetHeight: 720,
        allowEdit: isAllowEdit || false,
        destinationType: navigator.camera.DestinationType.DATA_URL,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
    });
};

/**
 * 将以base64的图片url数据转换为Blob
 * @param urlData
 *            用url方式表示的base64图片数据
 */
PhotoUtils.convertBase64UrlToBlob = function(urlData){

    var bytes=window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte

    //处理异常,将ascii码小于0的转换为大于0
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }

    return new Blob( [ab] , {type : 'image/png'});
}


/**
 * 旋转图片
 * @param image {image}
 * @param rotation
 * @param imageType
 * @return {image}
 */
function rotateImage(image, rotation, imageType) {
    var mimeType = imageType || 'image/jpeg';
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');

    var imageWidth = image.width;
    var imageHeight = image.height;
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    var startX = 0;
    var startY = 0;
    if (rotation == 90) {
        canvas.width = imageHeight;
        canvas.height = imageWidth;
        startX = 0;
        startY = -imageHeight;
    } else if (rotation == -90) {
        canvas.width = imageHeight;
        canvas.height = imageWidth;
        startX = -imageWidth;
        startY = 0;
    } else if (rotation == 180 || rotation == -180) {
        startX = -imageWidth;
        startY = -imageHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(image, startX, startY, imageWidth, imageHeight);
    var imageData = canvas.toDataURL(mimeType, 1);
    var rotatedImage = new Image();
    rotatedImage.src = imageData;
    return rotatedImage;
}


/**
 *  压缩图片
 * @param img
 * @param maxWidth
 * @param maxHeight
 * @param quality
 * @returns {string} {string} 返回base64的压缩图片
 */
function compress(img, maxWidth, maxHeight, quality) {

    var mWidth = maxWidth || 1280;
    var mHeight = maxHeight || 720;
    var mQuality = quality || 0.3;
    //用于压缩图片的canvas
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');
    //瓦片canvas
    var tCanvas = document.createElement("canvas");
    var tctx = tCanvas.getContext("2d");

    var initSize = img.src.length;
    var width = img.width;
    var height = img.height;

    //alert('压缩前,width: ' + img.width +　' , height:' + img.height);
    console.log('压缩前,width: ' + img.width + 　' , height:' + img.height);

    //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
    var ratio = 1;
    if (width > mWidth) {
        ratio = width / mWidth;
    }
    if (height > mHeight) {
        var hRatio = height / mHeight;
        ratio = hRatio > ratio ? hRatio : ratio;
    }
    width /= ratio;
    height /= ratio;
    //alert('压缩,ratio: ' + ratio);
    console.log('压缩,ratio: ' + ratio);

    canvas.width = width;
    canvas.height = height;

    //alert('压缩后,  width: ' +   canvas.width +　' , height:' + canvas.height);
    console.log('压缩后,  width: ' + canvas.width + 　' , height:' + canvas.height);

    //铺底色
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //如果图片像素大于100万则使用瓦片绘制
    var count;
    if ((count = width * height / (1000 * 1000)) > 1) {
        count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片

        // 计算每块瓦片的宽和高
        var nw = ~~(width / count);
        var nh = ~~(height / count);

        tCanvas.width = nw;
        tCanvas.height = nh;

        for (var i = 0; i < count; i++) {
            for (var j = 0; j < count; j++) {
                tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
            }
        }
    } else {
        ctx.drawImage(img, 0, 0, width, height);
    }

    //进行最小压缩
    var ndata = canvas.toDataURL('image/jpeg', mQuality); //采用质量压缩
    ndata = ndata.replace('data:image/jpeg;base64,', '');
    if (ndata.indexOf('data:image/') === -1) { //没有图片base64标识
        ndata = "data:image/jpeg;base64," + ndata;
    }
    tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;

    return ndata;
}
