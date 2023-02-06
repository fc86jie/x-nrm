## npm registry tool like nrm

### npm pack

执行命令会在当前目录下生成一个 x.tgz 的压缩包（x-nrm-1.0.0.tgz）,该包可以通过`npm install -g ./x.tgz`安装到全局，`package.json`中的 bin 配置中的命令就会变成命令行工具的命令，执行命令会执行相应的代码

:warning: `#!/usr/bin/env node` 一定要放在第一行
