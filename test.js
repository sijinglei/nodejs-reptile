var http = require('https');
var express = require('express');
var app = express();
var request = require('request');
var cheerio = require('cheerio');
const hostname = '127.0.0.1';
const port = 5000;

http.get('https://cnodejs.org/', (res) => {
	const statusCode = res.statusCode;
	const contentType = res.headers['content-type'];

	let error;
	if (statusCode !== 200) {
		error = new Error(`请求失败。\n` +
			`状态码: ${statusCode}`);
	} else if (!/^text\/html/.test(contentType)) {
		error = new Error(`无效的 content-type.\n` +
			`期望 application/json 但获取的是 ${contentType}`);
	}
	if (error) {
		console.log(error.message);
    // 消耗响应数据以释放内存
    res.resume();
    return;
}

res.setEncoding('utf8');
let rawData = '';

var items = [];
res.on('data', (chunk) => rawData += chunk);
res.on('end', () => {
	try {
      // let parsedData = JSON.parse(rawData);
      var $ = cheerio.load(rawData);
      $('#topic_list .topic_title').each(function (idx, element) {
      	var $element = $(element);
      	items.push({
      		title: $element.attr('title'),
      		href: $element.attr('href')
      	});
      });
       console.log(items);
  } catch (e) {
  	console.log(e.message);
  }
});
}).on('error', (e) => {
	console.log(`错误: ${e.message}`);
});
app.listen(port, hostname,()=>{
	console.log(`服务器运行在 http://${hostname}:${port}/`);
});