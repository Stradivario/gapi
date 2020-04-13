export function getContractAddress(abi): string {
  return abi.networks[Object.keys(abi.networks)[0]].address;
}
