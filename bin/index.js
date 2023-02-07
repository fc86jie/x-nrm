#!/usr/bin/env node
// 一定要放在第一行（包括注释）

/**
 * @Author: wangrenjie86@gmail.com
 * @Date: 2023-02-06 13:07:37
 * @LastEditors: wangrenjie86@gmail.com
 * @LastEditTime: 2023-02-07 10:26:51
 * @FilePath: \bin\index.js
 * @Description:
 */
import chalk from 'chalk';
import { exec } from 'child_process';
import { program } from 'commander';
import { readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

let pexec = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取json格式的文件转对象
async function json2obj(path) {
  let data = await readFile(resolve(__dirname, path));
  return JSON.parse(data.toString());
}

// 对象转写文件
async function obj2json(path, data) {
  await writeFile(resolve(__dirname, path), JSON.stringify(data, null, 2));
}

const registryData = await json2obj('./registries.json');
const PKG = await json2obj('../package.json');

const { name, version } = PKG;
let { argv } = process;
// 显示版本号
if (argv.includes('-v') || argv.includes('-V')) {
  console.log(chalk.white(`${name}：v${version}`));
}
// 显示当前所有的源
else if (argv.includes('ls')) {
  let { err, stdout, stderr } = await pexec('npm config get registry');

  if (err) {
    console.log(chalk.red(`exec error: ${err}`));
  }

  let res = [];
  Object.entries(registryData).forEach(item => {
    // stdout 返回的有换行符 https://registry.npmmirror.com/\n
    res.push(`${stdout.trim() === item[1].registry ? chalk.green('*') : ' '}${item[0]} => ${item[1].registry}`);
  });

  console.log(chalk.white(res.join('\n')));
} else if (argv.includes('add')) {
  let idx = argv.indexOf('add');
  let name = argv[idx + 1];
  let address = argv[idx + 2];
  let res = Object.keys(registryData).filter(key => key === name);
  // 添加新源
  if (res.length === 0) {
    try {
      await obj2json('./registries.json', {
        ...registryData,
        [name]: {
          home: address,
          registry: address,
        },
      });
      console.log(chalk.green('success added registry'));
    } catch (e) {
      console.log(chalk.red(`obj2json error: ${err}`));
    }
  } else {
    console.log(chalk.yellow(`${name} has already been in list`));
  }
} else if (argv.includes('del')) {
  let idx = argv.indexOf('del');
  let name = argv[idx + 1];
  let res = Object.keys(registryData).filter(key => key === name);
  // 删除新源
  if (res.length > 0) {
    let newRegistryData = {};
    for (let key in registryData) {
      if (key !== name) {
        newRegistryData[key] = registryData[key];
      }
    }

    try {
      await obj2json('./registries.json', newRegistryData);
      console.log(chalk.green(`success deleted registry`));
    } catch (e) {
      console.log(chalk.red(`obj2json error: ${err}`));
    }
  } else {
    console.log(chalk.yellow(`${name} not in list`));
  }
} else if (argv.includes('current')) {
  const { err, stdout, stderr } = await pexec('npm config get registry');
  if (err) {
    console.log(chalk.red(`exec error: ${err}`));
  }
  if (stdout) {
    console.log(chalk.green(stdout));
  }
} else if (argv.includes('use')) {
  let idx = argv.indexOf('use');
  let name = argv[idx + 1];
  let address = registryData[name]?.registry;
  if (address) {
    const { err, stdout, stderr } = await pexec(`npm config set registry ${address}`);
    if (err || stderr) {
      console.log(chalk.red(`exec error: ${err || stderr}`));
    } else {
      console.log(chalk.green(`set registry success`));
    }
  } else {
    console.log(chalk.red(`${name} is not in x-nrm list`));
  }
}
