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
