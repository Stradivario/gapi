import { createConnection } from 'net';

export const getIpAdresses = (
  network: Record<
    string,
    { family: string; internal: boolean; address: string }[]
  >
) =>
  Object.values(network).reduce((acc, interfaces) => {
    let alias = 0;

    interfaces.forEach(iface => {
      if (
        'IPv4' !== iface.family ||
        iface.internal !== false
      ) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }
      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        acc.push(iface.address);
      } else {
        // this interface has only one ipv4 adress
        acc.push(iface.address);
      }
      ++alias;
    });
    return acc;
  }, [] as string[]);

export const getNetworkIP = (): Promise<string> =>
  new Promise((resolve, reject) => {
    const socket = createConnection(80, 'www.google.com');
    socket.on('connect', function() {
      let addressInfo = socket.address() as {
        address: string;
      };
      if (typeof addressInfo === 'string') {
        addressInfo = JSON.parse(addressInfo);
      }
      resolve(addressInfo.address);
      socket.end();
    });
    socket.on('error', function(e) {
      reject(e);
    });
  });
