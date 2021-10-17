/* eslint-disable @typescript-eslint/no-explicit-any */
export type ModuleFormat = 'esm' | 'cjs' | 'amd' | 'global' | 'register';

export interface MetaConfig {
  /**
   * Sets in what format the module is loaded.
   */
  format?: ModuleFormat;

  /**
   * For the global format, when automatic detection of exports is not enough, a custom exports meta value can be set.
   * This tells the loader what global name to use as the module's export value.
   */
  exports?: string;

  /**
   * Dependencies to load before this module. Goes through regular paths and map normalization.
   * Only supported for the cjs, amd and global formats.
   */
  deps?: string[];

  /**
   * A map of global names to module names that should be defined only for the execution of this module.
   * Enables use of legacy code that expects certain globals to be present.
   * Referenced modules automatically becomes dependencies. Only supported for the cjs and global formats.
   */
  globals?: string;

  /**
   * Set a loader for this meta path.
   */
  loader?: string;

  /**
   * For plugin transpilers to set the source map of their transpilation.
   */
  sourceMap?: any;

  /**
   * Load the module using <script> tag injection.
   */
  scriptLoad?: boolean;

  /**
   * The nonce attribute to use when loading the script as a way to enable CSP.
   * This should correspond to the 'nonce-' attribute set in the Content-Security-Policy header.
   */
  nonce?: string;

  /**
   * The subresource integrity attribute corresponding to the script integrity,
   * describing the expected hash of the final code to be executed.
   * For example, System.config({ meta: { 'src/example.js': { integrity: 'sha256-e3b0c44...' }});
   * would throw an error if the translated source of src/example.js doesn't match the expected hash.
   */
  integrity?: string;

  /**
   * When scripts are loaded from a different domain (e.g. CDN) the global error handler (window.onerror)
   * has very limited information about errors to prevent unintended leaking. In order to mitigate this,
   * the <script> tags need to set crossorigin attribute and the server needs to enable CORS.
   * The valid values are 'anonymous' and 'use-credentials'.
   */
  crossOrigin?: string;

  /**
   * When loading a module that is not an ECMAScript Module, we set the module as the default export,
   * but then also iterate the module object and copy named exports for it a well.
   * Use this option to disable this iteration and copying of the exports.
   */
  esmExports?: boolean;

  /**
   * To ignore resources that shouldn't be traced as part of the build.
   * Use with the SystemJS Builder. (https://github.com/systemjs/builder#ignore-resources)
   */
  build?: boolean;

  /**
   * A truthy value enables sending credentials to the server on every request. Additionally, a string value adds
   * an 'Authorization' header with that value to all requests.
   */
  authorization?: string | boolean;
}

export interface PackageConfig {
  /**
   * The main entry point of the package (so import 'local/package' is equivalent to import 'local/package/index.js')
   */
  main?: string;

  /**
   * The module format of the package. See Module Formats.
   */
  format?: ModuleFormat;

  /**
   * The default extension to add to modules requested within the package. Takes preference over defaultJSExtensions.
   * Can be set to defaultExtension: false to optionally opt-out of extension-adding when defaultJSExtensions is enabled.
   */
  defaultExtension?: boolean | string;

  /**
   * Local and relative map configurations scoped to the package. Apply for subpaths as well.
   */
  map?: ConfigMap;

  /**
   * Module meta provides an API for SystemJS to understand how to load modules correctly.
   * Package-scoped meta configuration with wildcard support. Modules are subpaths within the package path.
   * This also provides an opt-out mechanism for defaultExtension, by adding modules here that should skip extension adding.
   */
  meta?: ConfigMeta;
}

export type ConfigMeta = PackageList<MetaConfig>;

export interface ModulesList {
  [bundleName: string]: string[];
}

export interface PackageList<T> {
  [packageName: string]: T;
}

export type ConfigMap = PackageList<string | PackageList<string>>;

export type Transpiler =
  | 'plugin-traceur'
  | 'plugin-babel'
  | 'plugin-typescript'
  | 'traceur'
  | 'babel'
  | 'typescript'
  | false;

export interface TraceurOptions {
  properTailCalls?: boolean;
  symbols?: boolean;
  arrayComprehension?: boolean;
  asyncFunctions?: boolean;
  asyncGenerators?: any;
  forOn?: boolean;
  generatorComprehension?: boolean;
}

export interface Config {
  /**
   * For custom config names
   */
  [customName: string]: any;

  /**
   * The baseURL provides a special mechanism for loading modules relative to a standard reference URL.
   */
  baseURL?: string;

  /**
   * Set the Babel transpiler options when System.transpiler is set to babel.
   */
  // TODO: Import BabelCore.TransformOptions
  babelOptions?: any;

  /**
   * undles allow a collection of modules to be downloaded together as a package whenever any module from that collection is requested.
   * Useful for splitting an application into sub-modules for production. Use with the SystemJS Builder.
   */
  bundles?: ModulesList;

  /**
   * Backwards-compatibility mode for the loader to automatically add '.js' extensions when not present to module requests.
   * This allows code written for SystemJS 0.16 or less to work easily in the latest version:
   */
  defaultJSExtensions?: boolean;

  /**
   * An alternative to bundling providing a solution to the latency issue of progressively loading dependencies.
   * When a module specified in depCache is loaded, asynchronous loading of its pre-cached dependency list begins in parallel.
   */
  depCache?: ModulesList;

  /**
   * The map option is similar to paths, but acts very early in the normalization process.
   * It allows you to map a module alias to a location or package:
   */
  map?: ConfigMap;

  /**
   * Module meta provides an API for SystemJS to understand how to load modules correctly.
   * Meta is how we set the module format of a module, or know how to shim dependencies of a global script.
   */
  meta?: ConfigMeta;

  /**
   * Packages provide a convenience for setting meta and map configuration that is specific to a common path.
   * In addition packages allow for setting contextual map configuration which only applies within the package itself.
   * This allows for full dependency encapsulation without always needing to have all dependencies in a global namespace.
   */
  packages?: PackageList<PackageConfig>;

  /**
   * The ES6 Module Loader paths implementation, applied after normalization and supporting subpaths via wildcards.
   * It is usually advisable to use map configuration over paths unless you need strict control over normalized module names.
   */
  paths?: PackageList<string>;

  /**
   * Set the Traceur compilation options.
   */
  traceurOptions?: TraceurOptions;

  /**
   * Sets the module name of the transpiler to be used for loading ES6 modules.
   */
  transpiler?: Transpiler;

  trace?: boolean;

  /**
   * Sets the TypeScript transpiler options.
   */
  // TODO: Import Typescript.CompilerOptions
  typescriptOptions?: {
    /**
     * A boolean flag which instructs the plugin to load configuration from 'tsconfig.json'.
     * To override the location of the file set this option to the path of the configuration file,
     * which will be resolved using normal SystemJS resolution.
     * Note: This setting is specific to plugin-typescript.
     */
    tsconfig?: boolean | string;

    [key: string]: any;
  };
}
