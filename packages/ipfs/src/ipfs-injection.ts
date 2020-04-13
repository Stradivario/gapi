/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-misused-new */
import { InjectionToken } from '@rxdi/core';

export type Callback<T> = (error: Error, result?: T) => void;

export interface IPFS {
  types: Types;

  repo: RepoAPI;
  bootstrap: any;
  config: any;
  block: any;
  object: ObjectAPI;
  dag: DagAPI;
  libp2p: any;
  swarm: SwarmAPI;
  files: FilesAPI;
  bitswap: any;

  pubsub: any;
  // tslint:disable-next-line: no-misused-new
  constructor(options: Options);

  init(options: InitOptions, callback: Callback<boolean>): void;
  init(callback: Callback<boolean>): void;

  preStart(callback: Callback<any>): void;
  start(callback?: Callback<any>): void;
  stop(callback?: (error?: Error) => void): void;
  isOnline(): boolean;

  version(
    options: any,
    callback: (error: Error, version: Version) => void
  ): void;
  // tslint:disable-next-line: unified-signatures
  version(options: any): Promise<Version>;
  version(callback: (error: Error, version: Version) => void): void;
  version(): Promise<Version>;

  id(options: any, callback: (error: Error, version: Id) => void): void;
  // tslint:disable-next-line: unified-signatures
  id(options: any): Promise<Id>;
  id(callback: (error: Error, version: Id) => void): void;
  id(): Promise<Id>;

  ping(callback: (error: Error) => void): void;
  ping(): Promise<void>;

  on(event: string, callback: (e) => void): void;
}

export interface ExperimentalFeatures {
  pubsub: true;
}
export class Options {
  init?: boolean;
  start?: boolean;
  EXPERIMENTAL?: ExperimentalFeatures;
  repo?: string;
  config?: {
    Addresses?: {
      API?: string;
      Announce?: Array<any>;
      Gateway?: string;
      NoAnnounce?: Array<any>;
      Swarm?: Array<string>;
    };
  };
}

export class InitOptions {
  emptyRepo?: boolean;
  bits?: number;
  log?: Function;
}

export class Multiaddr {
  buffer: Uint8Array;
}

export type Multihash = any | string;
export type CID = any;

export class Types {
  Buffer: any;
  PeerId: any;
  PeerInfo: any;
  multiaddr: Multiaddr;
  multihash: Multihash;
  CID: CID;
}

export class Version {
  version: string;
  repo: string;
  commit: string;
}

export class Id {
  id: string;
  publicKey: string;
  addresses: Multiaddr[];
  agentVersion: string;
  protocolVersion: string;
}

export interface RepoAPI {
  init(bits: number, empty: boolean, callback: Callback<any>): void;

  version(options: any, callback: Callback<any>): void;
  version(callback: Callback<any>): void;

  gc(): void;
  path(): string;
}

export type FileContent = Record<string, any> | Blob | string;

export class IPFSFile {
  path: string;
  hash: string;
  size: number;
  content?: FileContent;
}

export interface FilesAPI {
  createAddStream(options: any, callback: Callback<any>): void;
  createAddStream(callback: Callback<any>): void;

  createPullStream(options: any): any;

  add(data: FileContent, options: any, callback: Callback<IPFSFile[]>): void;
  // tslint:disable-next-line: unified-signatures
  add(data: FileContent, options: any): Promise<IPFSFile[]>;
  add(data: FileContent, callback: Callback<IPFSFile[]>): void;
  add(data: FileContent): Promise<IPFSFile[]>;

  cat(hash: Multihash, callback: Callback<FileContent>): void;
  cat(hash: Multihash): Promise<FileContent>;

  get(hash: Multihash, callback: Callback<IPFSFile>): void;
  get(hash: Multihash): Promise<IPFSFile>;

  getPull(hash: Multihash, callback: Callback<any>): void;
}

export class PeersOptions {
  v?: boolean;
  verbose?: boolean;
}

export type PeerId = any;

export interface PeerInfo {
  id: PeerId;
  multiaddr: Multiaddr;
  multiaddrs: Multiaddr[];
  distinctMultiaddr(): Multiaddr[];
}

export class Peer {
  addr: Multiaddr;
  peer: PeerInfo;
}

export interface SwarmAPI {
  peers(options: PeersOptions, callback: Callback<Peer[]>): void;
  // tslint:disable-next-line: unified-signatures
  peers(options: PeersOptions): Promise<Peer[]>;
  peers(callback: Callback<Peer[]>): void;
  peers(): Promise<Peer[]>;

  addrs(callback: Callback<PeerInfo[]>): void;
  addrs(): Promise<PeerInfo[]>;

  localAddrs(callback: Callback<Multiaddr[]>): void;
  localAddrs(): Promise<Multiaddr[]>;

  connect(maddr: Multiaddr | string, callback: Callback<any>): void;
  connect(maddr: Multiaddr | string): Promise<any>;

  disconnect(maddr: Multiaddr | string, callback: Callback<any>): void;
  disconnect(maddr: Multiaddr | string): Promise<any>;

  filters(callback: Callback<void>): never;
}

export type DAGNode = any;
export type DAGLink = any;
export type DAGLinkRef = DAGLink | any;
export type Obj = BufferSource | Record<string, any>;

export class ObjectStat {
  Hash: Multihash;
  NumLinks: number;
  BlockSize: number;
  LinksSize: number;
  DataSize: number;
  CumulativeSize: number;
}

export class PutObjectOptions {
  enc?: any;
}

export class GetObjectOptions {
  enc?: any;
}

export interface ObjectPatchAPI {
  addLink(
    multihash: Multihash,
    link: DAGLink,
    options: GetObjectOptions,
    callback: Callback<any>
  ): void;
  addLink(
    multihash: Multihash,
    link: DAGLink,
    // tslint:disable-next-line: unified-signatures
    options: GetObjectOptions
  ): Promise<any>;
  addLink(multihash: Multihash, link: DAGLink, callback: Callback<any>): void;
  addLink(multihash: Multihash, link: DAGLink): Promise<any>;

  rmLink(
    multihash: Multihash,
    linkRef: DAGLinkRef,
    options: GetObjectOptions,
    callback: Callback<any>
  ): void;
  rmLink(
    multihash: Multihash,
    linkRef: DAGLinkRef,
    // tslint:disable-next-line: unified-signatures
    options: GetObjectOptions
  ): Promise<any>;
  rmLink(
    multihash: Multihash,
    linkRef: DAGLinkRef,
    callback: Callback<any>
  ): void;
  rmLink(multihash: Multihash, linkRef: DAGLinkRef): Promise<any>;

  appendData(
    multihash: Multihash,
    data: any,
    options: GetObjectOptions,
    callback: Callback<any>
  ): void;
  appendData(
    multihash: Multihash,
    data: any,
    // tslint:disable-next-line: unified-signatures
    options: GetObjectOptions
  ): Promise<any>;
  appendData(multihash: Multihash, data: any, callback: Callback<any>): void;
  appendData(multihash: Multihash, data: any): Promise<any>;

  setData(
    multihash: Multihash,
    data: any,
    options: GetObjectOptions,
    callback: Callback<any>
  ): void;
  setData(
    multihash: Multihash,
    data: any,
    // tslint:disable-next-line: unified-signatures
    options: GetObjectOptions
  ): Promise<any>;
  setData(multihash: Multihash, data: any, callback: Callback<any>): void;
  setData(multihash: Multihash, data: any): Promise<any>;
}

export interface ObjectAPI {
  patch: ObjectPatchAPI;
  'new'(template: 'unixfs-dir', callback: Callback<DAGNode>): void;
  'new'(callback: Callback<DAGNode>): void;
  'new'(): Promise<DAGNode>;

  put(obj: Obj, options: PutObjectOptions, callback: Callback<any>): void;
  // tslint:disable-next-line:unified-signatures
  put(obj: Obj, options: PutObjectOptions): Promise<any>;
  put(obj: Obj, callback: Callback<any>): void;
  put(obj: Obj): Promise<any>;

  get(
    multihash: Multihash,
    options: GetObjectOptions,
    callback: Callback<any>
  ): void;
  // tslint:disable-next-line: unified-signatures
  get(multihash: Multihash, options: GetObjectOptions): Promise<any>;
  get(multihash: Multihash, callback: Callback<any>): void;
  get(multihash: Multihash): Promise<any>;

  data(
    multihash: Multihash,
    options: GetObjectOptions,
    callback: Callback<any>
  ): void;
  // tslint:disable-next-line: unified-signatures
  data(multihash: Multihash, options: GetObjectOptions): Promise<any>;
  data(multihash: Multihash, callback: Callback<any>): void;
  data(multihash: Multihash): Promise<any>;

  links(
    multihash: Multihash,
    options: GetObjectOptions,
    callback: Callback<DAGLink[]>
  ): void;
  // tslint:disable-next-line: unified-signatures
  links(multihash: Multihash, options: GetObjectOptions): Promise<DAGLink[]>;
  links(multihash: Multihash, callback: Callback<DAGLink[]>): void;
  links(multihash: Multihash): Promise<DAGLink[]>;

  stat(
    multihash: Multihash,
    options: GetObjectOptions,
    callback: Callback<ObjectStat>
  ): void;
  // tslint:disable-next-line: unified-signatures
  stat(multihash: Multihash, options: GetObjectOptions): Promise<ObjectStat>;
  stat(multihash: Multihash, callback: Callback<ObjectStat>): void;
  stat(multihash: Multihash): Promise<ObjectStat>;
}

export interface DagAPI {
  put(dagNode: any, options: any, callback: Callback<any>): void;
  put(dagNode: any, options: any): Promise<any>;

  get(
    cid: string | CID,
    path: string,
    options: any,
    callback: Callback<any>
  ): void;
  // tslint:disable-next-line: unified-signatures
  get(cid: string | CID, path: string, options: any): Promise<any>;
  get(cid: string | CID, path: string, callback: Callback<any>): void;
  // tslint:disable-next-line:unified-signatures
  get(cid: string | CID, path: string): Promise<any>;
  get(cid: string | CID, callback: Callback<any>): void;
  get(cid: string | CID): Promise<any>;

  tree(
    cid: string | CID,
    path: string,
    options: any,
    callback: Callback<any>
  ): void;
  // tslint:disable-next-line: unified-signatures
  tree(cid: string | CID, path: string, options: any): Promise<any>;
  tree(cid: string | CID, path: string, callback: Callback<any>): void;
  // tslint:disable-next-line:unified-signatures
  tree(cid: string | CID, path: string): Promise<any>;
  // tslint:disable-next-line:unified-signatures
  tree(cid: string | CID, options: any, callback: Callback<any>): void;
  // tslint:disable-next-line:unified-signatures
  tree(cid: string | CID, options: any): Promise<any>;
  tree(cid: string | CID, callback: Callback<any>): void;
  tree(cid: string | CID): Promise<any>;
}

export const IPFS = new InjectionToken<IPFS>('gapi-ipfs-node-injection');
export const IPFS_NODE_READY = new InjectionToken<IPFS>(
  'gapi-ipfs-ready-injection'
);
