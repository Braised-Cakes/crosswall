#!/usr/bin/env node

var fs = require('fs');
var os = require('os');

var isMac = os.platform() == 'darwin' ? true : false;
if(!isMac || process.getuid() === 0 || typeof process.env.SUDO_USER !== 'undefined'){
}else{
    console.log('please use sudo to exec the command')
    return;
}

var request = require('request');
var exec = require('child_process').exec;
//host路径
var hostsPath = os.platform() == 'darwin' ? '/etc/hosts' : 'C:/Windows/System32/drivers/etc/hosts';
//引入付强的hosts管理js
var hostGroup = require('hosts-group');

var program = require('commander');

var pkg = require('./package.json');

function remove() {
    hostGroup.removeGroup('crosswall');
    console.log('删除成功')
}

function update() {

    request('https://raw.githubusercontent.com/racaljk/hosts/master/hosts', function(err, res, body) {
        if (err) {
            throw err;
        }
        if (res.statusCode != 200) {
            return;
        }
        hostGroup.removeGroup('crosswall');

        var hostsArr = [];
        var lines = body.split('\n');

        for (var i = 0; i < lines.length; i++) {
            if (lines[i] !== '' && !/\#/.test(lines[i]) && !/localhost/.test(lines[i])) {
                hostsArr.push(lines[i]);
            }
        }
        body = hostsArr.join('\n');

        hostGroup.addGroup('crosswall', '获取最新https://github.com/racaljk/hosts并应用hosts');
        fs.appendFile(hostsPath, body, function() {
            isMac ? exec('sudo killall -HUP mDNSResponder') : exec('ipconfig /flushdns')
            console.log('更新成功');
        })

    })
}


program.version(pkg.version);
program.command('update').description('update hosts').action(function() {
    update();
});
program.command('remove').description('remove vpn hosts').action(function() {
    remove();
});
program.parse(process.argv);
