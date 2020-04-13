import { homedir } from 'os';

export const GAPI_MAIN_FOLDER = `${homedir()}/.gapi`;
export const GAPI_DAEMON_FOLDER = `${GAPI_MAIN_FOLDER}/daemon`;
export const GAPI_DAEMON_PROCESS_LIST_FOLDER = `${GAPI_DAEMON_FOLDER}/process-list`;
export const GAPI_DAEMON_PLUGINS_FOLDER = `${GAPI_DAEMON_FOLDER}/plugins`;
export const GAPI_DAEMON_IPFS_PLUGINS_FOLDER = `${GAPI_DAEMON_FOLDER}/ipfs-plugins`;
export const GAPI_DAEMON_HTTP_PLUGINS_FOLDER = `${GAPI_DAEMON_FOLDER}/http-plugins`;
export const GAPI_DAEMON_CACHE_FOLDER = `${GAPI_DAEMON_FOLDER}/.cache`;
export const IPFS_HASHED_MODULES = `${GAPI_DAEMON_FOLDER}/ipfs-hash-list`;
export const IPFS_HASHED_MODULES_MAP = `${GAPI_DAEMON_FOLDER}/ipfs-hash-map`;
