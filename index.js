/**
 * @Author: wangrenjie86@gmail.com
 * @Date: 2023-02-05 15:59:08
 * @LastEditors: wangrenjie86@gmail.com
 * @LastEditTime: 2023-02-06 22:49:52
 * @FilePath: \index.js
 * @Description:
 */

import { exec } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import util from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let pexec = util.promisify(exec);

const { err, stdout, stderr } = await pexec(`node bin/index.js use taobao`);
console.log('---------', stdout);
const { err: err2, stdout: stdout2, stderr: stderr2 } = await pexec('npm config get registry');
console.log('=========', stdout2);
