import { exec } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

let pexec = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pkgData = await readFile(resolve(__dirname, '../package.json'));
const PKG = JSON.parse(pkgData.toString());

let registryData = await readFile(resolve(__dirname, '../bin/registries.json'));
registryData = JSON.parse(registryData.toString());

expect.extend({
  /**
   * 自定义匹配器
   * @param {expect对象入参} received
   * @param {预计结果数组} resArr
   * @returns
   */
  anyContain: (received, resArr) => {
    let res = resArr.filter(item => received.includes(item));
    if (res.length > 0) {
      return {
        message: () => `${received} success`,
        pass: true,
      };
    } else {
      return {
        message: () => `${received} error`,
        pass: false,
      };
    }
  },
});

test('x-nrm -v', async () => {
  const { name, version } = PKG;
  const { err, stdout, stderr } = await pexec('node bin/index.js -v');
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }

  expect(stdout).toContain(`${name}：v${version}`);
});

test('x-nrm ls', async () => {
  const { err, stdout, stderr } = await pexec('node bin/index.js ls');
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }

  Object.values(registryData)
    .map(item => item.registry)
    .forEach(url => {
      expect(stdout).toContain(url);
    });
});

test('x-nrm add key value', async () => {
  const key = 'local';
  const value = 'http://locahost:8888';
  const { err, stdout, stderr } = await pexec(`node bin/index.js add ${key} ${value}`);

  if (err) {
    console.log(`exec error: ${err}`);
    return;
  }

  expect(stdout).anyContain(['success added registry', `${key} has already been in list`]);

  const { err: err2, stdout: stdout2, stderr: stderr2 } = await pexec('node bin/index.js ls');
  if (err2) {
    console.error(`exec error: ${err2}`);
    return;
  }
  expect(stdout2).toContain(value);
});

test('x-nrm del key', async () => {
  const key = 'local';
  const { err, stdout, stderr } = await pexec(`node bin/index.js del ${key}`);
  if (err) {
    console.log(`exec error: ${err}`);
    return;
  }
  expect(stdout).toContain('success deleted registry');

  const { err: err2, stdout: stdout2, stderr: stderr2 } = await pexec('node bin/index.js ls');
  if (err2) {
    console.error(`exec error: ${err2}`);
    return;
  }
  expect(stdout2).not.toContain(key);
});

// test('x-nrm use key', async () => {
//   const key = 'taobao';
//   const { err, stdout, stderr } = await pexec(`node bin/index.js use ${key}`);
//   console.log(1, stdout);
//   if (err) {
//     console.error(`exec error: ${err}`);
//     return;
//   }
//   expect(stdout).anyContain(['set registry success', `${key} is not in x-nrm list`]);
//   const { err: err2, stdout: stdout2, stderr: stderr2 } = await pexec('npm config get registry');
//   // TODO:上面设置成功之后，此处获取到的stdout2还是老的???
//   if (err2) {
//     console.error(`exec error: ${err2}`);
//     return false;
//   }
//   let registryData = await readFile(resolve(__dirname, '../bin/registries.json'));
//   registryData = JSON.parse(registryData.toString());
//   let res = Object.entries(registryData).filter(item => item[0] === key);
//   if (res.length > 0) {
//     expect(stdout2).toContain(res[0][1].registry);
//   } else {
//     throw `${key} is not in x-nrm list`;
//   }
// });
