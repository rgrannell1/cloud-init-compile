
# cloud-init-compile

Clic (cloud-init-compile) bundles several scripts and data files into a single cloud-init-friendly script. The program's output can be embedded in VM-provisioning scripts for DigitalOcean or other cloud provider.

## Why?

I've ran into this problem too often in work when working with VM provisioning. In particular, I wanted to send and run multiple files & scripts without resorting to a complex build-tool like Ansible.

## Usage

For both examples, I'll use the following local file layout:

```
./
  installer.sh
  main.sh
```

With the files:

```bash
# installer.sh
sudo apt-get install htop --assume-yes
```

```bash
# main.sh

source ./installer.sh
echo "done."
```

### CLI Usage

```bash
clic -zr main.sh -- installer.sh main.sh
```

```
H4sIAAAAAAACA3WNywrCMBBF9/MVYwrdSJofKG58QEHsRtclpoMpNEnpJKJ/76YBi7g7lwvnFBuVeFb3wSvyT2QLRkesa9yf29uhay7NtTu2J9yhGDxHPY40V2wFFPi9gVMfUE9RPijmB20ME0qpmZMj+SYGgLX3f83pwS+hBQE4pNkQVmqVJmMDij54qsSv37rQ4/aVJViWGT8HVaT++wAAAA==
```

### API Usage

```js
const content = await clic.api({
  gzip: true,
  fpaths: [
    'installer.sh',
    'main.sh'
  ],
  toRun: 'main.sh'
})
```


## Installation

```bash
npm install rgrannell1/cloud-init-compile --global
```

## License

Cloud-init-compile is released under the MIT licence.

The MIT License (MIT)

Copyright (c) 2020 Róisín Grannell

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
