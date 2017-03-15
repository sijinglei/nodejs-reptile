var superagent =  require('superagent-charset')(require('superagent'));
var cheerio = require('cheerio');
var fs= require('fs');
var path = require('path');
var request=require('request');
var main_url  = 'http://www.mzitu.com/';
var meiziURL  = 'http://www.mzitu.com/71235';

function catch_list(url,callback) {
	superagent
	.get(url)
	.set('Connection','close')
	.set('User-Agent','Paw/2.1 (Macintosh; OS X/10.11.6) GCDHTTPRequest')
	.set('Host', 'www.mzitu.com')
	.end(function (err,sres) {
		if(err){
			console.error(err)
		}
		var items = []
		var $ = cheerio.load(sres.text)
		$('#pins').find('li').each(function (idx,element) {
			$element = $(element)
			var url = $element.find('span:nth-child(2) > a').attr('href')
			var title = $element.find('img').attr('alt')
			console.log(title,url)
			items.push({
				title:title,
				url:url
			})
		})
		callback(items)
	})
}

function write_to_file_in_JSON(items,dir,filename) {
	console.log('完成'+items.length +'个抓取');
	var fs= require('fs');
	var dirname = dir +filename+'.json';
	var path = require('path');
	fs.writeFile(dirname, JSON.stringify(items));
}
function get_max_number(url,callback) {
    superagent
        .get(url)
        .set('Connection','close')
        .set('User-Agent','Paw/2.1 (Macintosh; OS X/10.11.6) GCDHTTPRequest')
        .set('Host', 'www.mzitu.com')
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                console.error(err)
            }
            var $ = cheerio.load(sres.text);
            var $element = $('body > div.main > div.content > div.pagenavi').find('a').last().prev()
            var max = $element.attr('href').split('/').pop()
            callback(max)
        });
}
function download_img(uri, pathurl, filename, callback){
    request.head(uri, function(err, res, body){
        // console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
        // console.log('content-length:', res.headers['content-length']);  //图片大小
        if (err) {
            console.log('err:'+ err);
            downloadImg(uri, pathurl, filename ,callback);
            return false;
        }
        console.log('下载地址***************************');
        console.log(path);
        console.log(uri);
        fixname = path.basename(uri).split('.').pop()
        var file = pathurl + filename + '.' + fixname
        if(fs.existsSync(file)) {
            console.log('文件已存在:'+file)
            callback()
        }else{
            request(uri).pipe(fs.createWriteStream(file)).on('close', callback);  //调用request的管道来下载到 images文件夹下
        }
    });
};
function load_girl_image(url_base,dir_base,callback) {
    var dir_path = dir_base + url_base.split('/').pop()
    var folder_exists = fs.existsSync(dir_path);
    if (folder_exists) {
        console.log(dir_path + '存在')
        callback()
        return
    }else{
        get_max_number(url_base,function (max) {
            var index = 1
            var downloaded = 0
            while (index <= max){
                if (index != 1) url = url_base +'/'+ String(index)
                else url = url_base
                index ++;
                console.log('开始抓取 '+ url)

                superagent
                    .get(url)
                    .set('Connection','close')
                    .set('User-Agent','Paw/2.1 (Macintosh; OS X/10.11.6) GCDHTTPRequest')
                    .set('Host', 'www.mzitu.com')
                    //.charset('gb2312')
                    .end(function (err, sres) {
                        // 常规的错误处理
                        if (err) {
                            return //next(err);
                        }
                        var $ = cheerio.load(sres.text);
                        var data = $('body > div.main > div.content > div.main-image > p > a > img');
                        var title = $('body > div.main > div.content > h2').text()
                        var image_url = data.attr('src')

                            var title = title.replace(' ','')
                            var folder_exists = fs.existsSync(dir_path);
                            if (!folder_exists) fs.mkdir(dir_path);
                            download_img(image_url,dir_path  + '/',title,function () {
                                console.log('完成'+title)
                                downloaded++
                                if (downloaded == max) callback()
                            })

                    });
            }
        })
    }
}

function getImgList(){
	for (var i = 1;i<=127;i++){
		var success = 1
		var data = []
		catch_list(main_url+'page/'+String(i),function (items) {
			console.log(items.length)
			data = data.concat(items)
			success++
			if (success == 2) write_to_file_in_JSON(data,'E:/img/','mzit')
		})
	}
}
getImgList();
var target = 10000
function catchImage(items,begin,offset){
    load_girl_image(items[begin+offset].url,'E:/img/mzt/',function () {
        if (offset < target&&begin+offset<items.length) {
            catchImage(items,begin,offset+1);
        }
    })
}
getImgList();
var dirname = 'E:/img/'+'mzit'+'.json';
var data=JSON.parse(fs.readFileSync(dirname));
catchImage(data,0,0);