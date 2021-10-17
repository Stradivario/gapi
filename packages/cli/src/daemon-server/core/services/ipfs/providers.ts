export const IPFS_PROVIDERS: { name: IPFS_PROVIDERS; link: string }[] = [
  {
    name: 'cloudflare',
    link: 'https://cloudflare-ipfs.com/ipfs/',
  },
  {
    name: 'main-ipfs-node',
    link: 'https://ipfs.io/ipfs/',
  },
  {
    name: 'infura',
    link: 'https://ipfs.infura.io/ipfs/',
  },
  {
    name: 'local',
    link: 'http://127.0.0.1:8080/ipfs/',
  },
];

export type IPFS_PROVIDERS =
  | 'cloudflare'
  | 'main-ipfs-node'
  | 'local'
  | 'infura';
