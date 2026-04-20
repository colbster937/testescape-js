const container = document.querySelector('.container');
const btn = container.querySelector('.btn');
const log = container.querySelector('.log');

let dev;
let buf;
let len;

function hex (arr) {
  return Array.from(arr).slice(0, 80).map(b => b.toString(16).padStart(2, '0')).join(' ');
}

function print (txt) {
  const p = document.createElement('p');
  p.textContent = txt;
  p.className = 'line';
  log.appendChild(p);
}

async function send (dat) {
  await dev.transferOut(2, dat);
  print(`send ${dat.length}: [ ${hex(dat)} ]`);
}

async function recv () {
  const result = await dev.transferIn(1, 4096);
  buf = new Uint8Array(result.data.buffer);
  len = buf.length;
  print(`recv ${len}: [ ${hex(buf)} ]`);
}

function ack () {
  send(new Uint8Array([0x00, 0x00, 0x00, 0x02, 0x05, 0xe0, 0x00]));
}

btn.addEventListener('click', async () => {
  try {
    log.innerHTML = '';

    dev = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0451, productId: 0xE008 }] });
    await dev.open();
    await dev.claimInterface(0);

    print('starting...');

    await send(new Uint8Array([0x00, 0x00, 0x00, 0x04, 0x01, 0x00, 0x00, 0x04, 0x00]));
    await recv();

    await send(new Uint8Array([0x00, 0x00, 0x00, 0x10, 0x04, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x01, 0x00, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x07, 0xd0]));
    await recv();
    await recv();
    await ack();

    await send(new Uint8Array([0x00, 0x00, 0x00, 0x13, 0x04, 0x00, 0x00, 0x00, 0x0f, 0x00, 0x07, 0x00, 0x04, 0x05, 0x41, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]));
    await recv();
    await recv();
    await ack();

    await send(new Uint8Array([0x00, 0x00, 0x00, 0x0a, 0x04, 0x00, 0x00, 0x00, 0x06, 0x00, 0x0d, 0x00, 0x02, 0x00, 0x00]));
    await recv();
    await recv();
    await ack();

    while (buf[9] === 0xBB) {
      await recv();
      await ack();
    }

    await send(new Uint8Array([0x00, 0x00, 0x00, 0x06, 0x04, 0x00, 0x00, 0x00, 0x02, 0xDD, 0x00]));
    await recv();

    print('done.');

    await dev.releaseInterface(0);
    await dev.close();
  } catch (e) {
    print('error: ' + e.message);
  }
});
