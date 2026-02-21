## [1.8.205](https://github.com/Stradivario/gapi/compare/v1.8.28...v1.8.205) (2026-02-21)


### Bug Fixes

* **ac:** added type safety features ([ab2da32](https://github.com/Stradivario/gapi/commit/ab2da32087f70fb217e55675612dc868c62e32ff))
* **ac:** typo error ([fc89bfe](https://github.com/Stradivario/gapi/commit/fc89bfe06f064b82a5f9d9630a7df646d46c09f3))
* **cli-builder:** added correct generation of system file ([1b082d5](https://github.com/Stradivario/gapi/commit/1b082d54a579f59f33da0a5ba9a7863a5d6bf04d))
* **cli-builder:** added executable environment variable ([a0737fc](https://github.com/Stradivario/gapi/commit/a0737fc58938bd64b87b6748488ff2f80cf9d4f2))
* **cli-builder:** added handler for error uncaughtException since the workers are stopping for some reason ([e20fbfc](https://github.com/Stradivario/gapi/commit/e20fbfcfc98b742d3d9a6ede80a0152d4281135f))
* **cli-builder:** added label fix ([b7b7da9](https://github.com/Stradivario/gapi/commit/b7b7da9485fe0124725ef66ec12ff4ffe6e46a08))
* **cli-builder:** added separated module for subscriptions @rxdi/graphql-pubsub-test instead directly exported from @gapi/core this reduces space on the main platform ([1b5c2bf](https://github.com/Stradivario/gapi/commit/1b5c2bf8c908c0ee1d038bb43471c97248b20ad2))
* **cli-builder:** correct adds environment variables to service worker ([8d60169](https://github.com/Stradivario/gapi/commit/8d601695dd8cbca46dd0eced131f238365e931a6))
* **cli-builder:** correct subscription service imported ([0fa9785](https://github.com/Stradivario/gapi/commit/0fa9785cc0a671e5d55ed98696d1bd483e98b72d))
* **cli-builder:** data added to params ([b2c205d](https://github.com/Stradivario/gapi/commit/b2c205d4ed09e10138da0bb14d49c7ade98b8acf))
* **cli-builder:** exported ProcessReturn since it is private property ([a57f156](https://github.com/Stradivario/gapi/commit/a57f156dfcf8722b915d4aa459e36c7e7214d358))
* **cli-builder:** fallback to empty string instead of true ([ad39d57](https://github.com/Stradivario/gapi/commit/ad39d57d3e919e7285c307525d27728bbff250b8))
* **cli-builder:** modified GenericEnum type to be any instead of predefined types ([a44c699](https://github.com/Stradivario/gapi/commit/a44c699cfeb5e364014d5c506a95e65d93e54ad7))
* **cli-builder:** registerWorker command now has label or machne hash but not requred ([3b738ec](https://github.com/Stradivario/gapi/commit/3b738ec8fcda4ef21ddba9cf4c96b0738074d8f2))
* **cli-builder:** removed default runner type ([c6c5c39](https://github.com/Stradivario/gapi/commit/c6c5c39aae3040fbbbd71c954782329a790ecb4f))
* **cli-builder:** system executable filename added to empty string since it was braking ([6c9eee6](https://github.com/Stradivario/gapi/commit/6c9eee6cd071965a337a3988a83efb44820fbc60))
* **cli-builder:** when we have authorization and init query we need to drop authorization for this particular query ([835172d](https://github.com/Stradivario/gapi/commit/835172d898c994160a7db5ac31b89dd5dddfd90b))
* **cli:** added headers field to schema introspection in order to put authorization token ([e64d34d](https://github.com/Stradivario/gapi/commit/e64d34d7ace5025daf2190cc507407be9d09b266))
* **cli:** added ipfs services to daemon server using it ([0c41d45](https://github.com/Stradivario/gapi/commit/0c41d45417c2d8416ff339f1d18dfe7f8553f796))
* **cli:** builded gcli in order to reflect new changes ([49bb567](https://github.com/Stradivario/gapi/commit/49bb5671429b40f26fee1845ec00e80922ce0640))
* **cli:** collect fragments when generating schema was hitting wrong endpoint ([00812fe](https://github.com/Stradivario/gapi/commit/00812fe584cd9158529112224c94fcd23845abdd))
* **cli:** enums was not exported inside index.ts ([441daa3](https://github.com/Stradivario/gapi/commit/441daa33ed42b0ef7761f78236b89415298b05b3))
* **cli:** humps added to dependencies updated rxdi to 136 ([4457ca1](https://github.com/Stradivario/gapi/commit/4457ca17cb89a5e082c1df62869f4b4051a44d76))
* **cli:** if it is windows use set to set env variables instead of export ([8ef00a6](https://github.com/Stradivario/gapi/commit/8ef00a66bbf399dbba933c1092d178e6637c4b60))
* **cli:** if not defined headers property it throws error and intrupting previews flow without headers ([178d5a6](https://github.com/Stradivario/gapi/commit/178d5a6d69ddae7ec00770a4767865ffafa36090))
* **cli:** lint removed from generated files ([8a75cf4](https://github.com/Stradivario/gapi/commit/8a75cf4b6e6132f1c4cbad9256eb7a981e9ec757))
* **cli:** removed daemon service from @gapi/cli and @gapi/core as a dependency ([3b7c655](https://github.com/Stradivario/gapi/commit/3b7c65563a0e03c6c5c7dcb53295de3ba843d236))
* **cli:** yaml parsing is broken in the new version 20.19 of nodejs ([5e82d52](https://github.com/Stradivario/gapi/commit/5e82d525e9ed8daa1ccc3b752a47510d6353638f))
* **commander:** bumped to latest version ([0b03e40](https://github.com/Stradivario/gapi/commit/0b03e401e0bdc54d039a23840b66f38b5761a47b))
* **core:** added export for graphql-subscriptions ([7c6e42f](https://github.com/Stradivario/gapi/commit/7c6e42f15de5c4d841d009cc9a57e6531e4fa63b))
* **core:** enum-to-graphql enum ([9a96b32](https://github.com/Stradivario/gapi/commit/9a96b32d0bbe2bfdb01abde13a39de5cd861bca7))
* **core:** federation replacer annoying error log removed ([4c87a07](https://github.com/Stradivario/gapi/commit/4c87a07c71d706cbc2c8bbae98ecf585b47b36ee))
* **core:** graphql added to dependencies since 15.0.0 is broken ([7f740bf](https://github.com/Stradivario/gapi/commit/7f740bfa8f68275516359d12e945c18c7e5a0bd9))
* **eslint:** bumped eslint to latest version leading to many many things... ([728b58a](https://github.com/Stradivario/gapi/commit/728b58a94968abb7f0109603964a54bdbbb855e1))
* **federation:** full headers are resend to the appropriate service ([c62d273](https://github.com/Stradivario/gapi/commit/c62d273ccf4811e213222711f3d5c8892621f087))
* **federation:** readme ([da4d035](https://github.com/Stradivario/gapi/commit/da4d0356720829e40ccd4061ae4fe587061e7203))
* **federation:** rebuilded module and re-deployed ([e4fe17e](https://github.com/Stradivario/gapi/commit/e4fe17ec857dd3fd876a51cf4fdc0751dd090670))
* **gcli:** added additional options ([dd4958a](https://github.com/Stradivario/gapi/commit/dd4958aa12305ea9cf7c35a43863eacc705c0b5e))
* **gcli:** added config extraction from the current api url ([1afdf6f](https://github.com/Stradivario/gapi/commit/1afdf6fc5cfadecab5fcc19a417d3939cb60c9dd))
* **gcli:** added secrets instead of secret due to api change in lamb forge ([9b4b2fe](https://github.com/Stradivario/gapi/commit/9b4b2fe0d1180b946897581bcf2355d84a0fecc5))
* **gcli:** async code refactored to rxjs [ci-skip] ([42cf603](https://github.com/Stradivario/gapi/commit/42cf6039547de01381c20db48bda760f3906987f))
* **gcli:** authorization token passed also to upload lambda logic ([26e5126](https://github.com/Stradivario/gapi/commit/26e512698fd471fb73ecf302e857631609eecc8e))
* **gcli:** builded again the package with namespace import from all ([f655951](https://github.com/Stradivario/gapi/commit/f6559518341065cef27d9404d8941480ff704ee0))
* **gcli:** decompress logs ([705241b](https://github.com/Stradivario/gapi/commit/705241b05fcba9d8375c4cf8a73710f1989323e3))
* **gcli:** default export of form data and stream to buffer ([94800cb](https://github.com/Stradivario/gapi/commit/94800cb9fa946b6843dd9a7517c987007b254821))
* **gcli:** documentation fix [ci-skip] ([8fd6a46](https://github.com/Stradivario/gapi/commit/8fd6a46c8cc2b417d8edc1121ef4178b7e7e7e29))
* **gcli:** environment update ([b1815c5](https://github.com/Stradivario/gapi/commit/b1815c599163dc8aeade8409f2941a3a3c4191db))
* **gcli:** esbuild marked as external but installable inside dependencies ([e8d6b72](https://github.com/Stradivario/gapi/commit/e8d6b72f217123da5e2445fe8987cbeda4fd371c))
* **gcli:** esbuild was not included into the npm package ([3e30711](https://github.com/Stradivario/gapi/commit/3e30711da0a38856ea82bf0cf60f6d2612a3c5de))
* **gcli:** load spec file default export fix ([1d1c71f](https://github.com/Stradivario/gapi/commit/1d1c71f96813aa59f883bced7e44f655849cb980))
* **gcli:** login to gcli using integration ci/cd pipeline ([56c2bdd](https://github.com/Stradivario/gapi/commit/56c2bddd73368cc20f21c2f7b819b79ea900b30b))
* **gcli:** mcp start function changes [ci-skip] ([46c615a](https://github.com/Stradivario/gapi/commit/46c615afc41681896c51cbc42665f1ff1669a3ed))
* **gcli:** re-build ([fc68cee](https://github.com/Stradivario/gapi/commit/fc68cee7c7d6f81aef54010899903ba8d4e685c1))
* **gcli:** removed console.log ([2889fb3](https://github.com/Stradivario/gapi/commit/2889fb30019c9a2b23360387fe0d5c8ff9e2f4a8))
* **gcli:** removed packages from dependencies since we don't want them when installing ([3efb328](https://github.com/Stradivario/gapi/commit/3efb328cd7734d14381d4c3248a28e325ee2fff4))
* **gcli:** reverted back logic for gcli ([7591194](https://github.com/Stradivario/gapi/commit/759119401dc43665ba45f6b3cc19f09439692995))
* **gcli:** reverted logic without options request ([f37f092](https://github.com/Stradivario/gapi/commit/f37f0922eaec5c060b80064a508ab12c3da3d48f))
* **gcli:** spread operator was breaking plugin initialization ([f2e6745](https://github.com/Stradivario/gapi/commit/f2e674513a29b9c13fdfe79fe8aba2b6e07e53a1))
* **gcli:** token authentication after expire fixed ([fc099eb](https://github.com/Stradivario/gapi/commit/fc099ebd5af0b5094e5b1919f875e9dbdfd035e3))
* **gcli:** upload lambda was not working due to attempt to use native node fetch but it does not handle very well multipart form data... ([9652c3b](https://github.com/Stradivario/gapi/commit/9652c3b7c5ac18b9242a3e18d250d54687eafbcb))
* **InitQuery:** reverted ([09a93da](https://github.com/Stradivario/gapi/commit/09a93da16f27e944703f0a99dd7aa2fd3d17f243))
* **login:** added method which converts number to string ([f3ca052](https://github.com/Stradivario/gapi/commit/f3ca0521ebf9cca22e711c6ec4c2154f181d0694))
* **network:** added ability to specify lambda purpose publicly exposed or privately exposed ([5bcb6bc](https://github.com/Stradivario/gapi/commit/5bcb6bcd838fc87c3b54ceb7dc96d56d72dc5094))
* new api introduced with small changes ([f893e44](https://github.com/Stradivario/gapi/commit/f893e44e18fdb5c05899e06fe7397bb6852b13a1))
* **package.json:** added @rxdi/core dependency ([76ee663](https://github.com/Stradivario/gapi/commit/76ee663d790f232fa13ae60693fe2dd1037fa0e7))
* **release:** added new job for releasing binary in gcli ([8e9f181](https://github.com/Stradivario/gapi/commit/8e9f181925fc3950b850cfc311fda3303aa6f502))
* removal of many things that are not needed ([270dbe5](https://github.com/Stradivario/gapi/commit/270dbe59c0b143f162a72e62561c1da1db5e38bf))
* **rxdi:** graphql was not checking when method is GET if payload exists which is for POST requests ([efc3984](https://github.com/Stradivario/gapi/commit/efc3984717025c321db60589c18228327be2c81d))
* **rxdi:** reverted back changes ([a10be18](https://github.com/Stradivario/gapi/commit/a10be18fe20b02aa686f43604f62484454aeeea7))
* **rxdi:** reverted back old logic ([1cabde3](https://github.com/Stradivario/gapi/commit/1cabde384fd589e53144316c141f6f29203cba31))
* **sendgrid:** added partial data to options ([a68473e](https://github.com/Stradivario/gapi/commit/a68473ebd49495ff19dbb84c5f3f8528af87d2ed))
* **sendgrid:** fixed wrong async assignment ([41ff781](https://github.com/Stradivario/gapi/commit/41ff781f9255e6b090ca539c807002f696f0e437))
* **sendgrid:** html property removed from type and re assigned like it needs to be ([a579e24](https://github.com/Stradivario/gapi/commit/a579e2446afbde2bd9d67a3fb8b2e6f66d6b90ac))
* **subscriptions:** bumped rxdi subscriptions packages to fix memory leak error ([b25cbb0](https://github.com/Stradivario/gapi/commit/b25cbb0ad1d3493568c271fcdcddac06875b0b13))
* **SystemdDaemon:** removed export from helpers ([bf53d92](https://github.com/Stradivario/gapi/commit/bf53d92664c8576d3fa8f1108fca998b8ef77966))
* **tests:** missing tests script ([b9f5cf5](https://github.com/Stradivario/gapi/commit/b9f5cf5ed2c28550b048045b6744f18025082433))
* **versions:** mismatched versions 140 instead ot 142 ([14e4d90](https://github.com/Stradivario/gapi/commit/14e4d9017f9b54fe4ab50e0e46668f2b3bc70c69))


### Features

* **ac:** validator is now a separated entity type so it can be referenced from outside of the library scope ([b9ccb94](https://github.com/Stradivario/gapi/commit/b9ccb944224efd0020ca4046127e22729aecd404))
* **altair:** added new module replacing graphiql called altair ([27c1632](https://github.com/Stradivario/gapi/commit/27c16322e9883d5d6d0b4621303127b3858add6f))
* **AsyncTemplate:** added async template with parameters ([cec4799](https://github.com/Stradivario/gapi/commit/cec4799973ba30c8955c9167f780ed2ea320056c))
* **bump:** graphql and other version bumps removed microservices since it is replaced by federation ([d567b82](https://github.com/Stradivario/gapi/commit/d567b8258c6dd974e272c1d26597df38b9d1c8aa))
* **cli-builder:** added console.log on subscriptions ([0394837](https://github.com/Stradivario/gapi/commit/0394837f537e6bf8ccc95a9d4b411e14c2fdbc6f))
* **cli-builder:** introduced ip behind NAT can be specified ([cfd5ba7](https://github.com/Stradivario/gapi/commit/cfd5ba7601e7bf0f5db87774f182cab6a9e486b0))
* **cli-builder:** notifiy result based on label in order to track machine with label ([5796b6e](https://github.com/Stradivario/gapi/commit/5796b6e6443dcc4e5f4878dcb6146d818c893ebf))
* **cli:** added more options for parcel in order to customize behaviour ([52d0a4d](https://github.com/Stradivario/gapi/commit/52d0a4d18c1c0634f79953d659f735fad39181d7))
* **cli:** compressed documents exported in order to reduce bundle size using lzw codec and json-url library ([ad0b43a](https://github.com/Stradivario/gapi/commit/ad0b43a50948d107eee89fdb4bf67bd52464c94d))
* **context7:** added ownership for context7 readme [ci-skip] ([28ededf](https://github.com/Stradivario/gapi/commit/28ededff4a7618f977e1f31efa629d22cb7a41a0))
* **dev:** added lambda logs commands ([905b9bf](https://github.com/Stradivario/gapi/commit/905b9bf68bf174e8cb11792e8bacb1eb4a5dc02c))
* **dev:** decompress the result from logs ([f33a6ab](https://github.com/Stradivario/gapi/commit/f33a6ab615a448155c57fc7ec1022e8db83b97f7))
* **dev:** loaded spec on single place and used all over the functions ([ab73876](https://github.com/Stradivario/gapi/commit/ab7387672b61f8ee1dc884e6424d1ebfb4e36d5a))
* **dev:** refresh token authentication added ([0262bc1](https://github.com/Stradivario/gapi/commit/0262bc18aeba5e9efae3b6913bc4926dfc5d338d))
* **dev:** test command introduced with few parameters ([f08078e](https://github.com/Stradivario/gapi/commit/f08078e2e088f5fa8b5799ce7a561cebd9f72d2b))
* **falkordb:** added new module to import falkordb client into the gapi system ([e82a4cc](https://github.com/Stradivario/gapi/commit/e82a4cc9d679db81e69c5f393bab0b57f0a9af2a))
* **federation:** added missing apollo server configs ([cc6edfe](https://github.com/Stradivario/gapi/commit/cc6edfecb02315ed11e156cf63616a983a5b82a7))
* **federation:** added willSendRequest and context lambdas in order to manage authentication outside the scope of the library ([5f597ab](https://github.com/Stradivario/gapi/commit/5f597ab2504b127ed9838ef84e2ea678927c6b32))
* **Federation:** removed _service and status from schema sdl when processing _service graph, removed ethereum, ipfs related modules with packages ([cd4d74d](https://github.com/Stradivario/gapi/commit/cd4d74d1296ac5a38416f9ced93ea2caf00f1be7))
* **gcli:** added esbuild as a script with decorators ([35148c7](https://github.com/Stradivario/gapi/commit/35148c72809a5aaef07947ad49cdb78b0b97e4c2))
* **gcli:** added exit strategies for the child process and added configuration for build scripts unified ([ea75254](https://github.com/Stradivario/gapi/commit/ea752545a4a805e8cfbe2d65b18647207c93d76d))
* **gcli:** added global auth token using a environment variable GCLI_AUTH_TOKEN ([511dd02](https://github.com/Stradivario/gapi/commit/511dd023ae9df4785fec13e57cce44a5a3bc76f5))
* **gcli:** added hasOptionsRequest to lambda creation ([a4f6d9c](https://github.com/Stradivario/gapi/commit/a4f6d9cf3dfe3c0671499d43aefa1bb5b6d9807d))
* **gcli:** added ignore folders so we can safely execute commands changing files without interrupting the server to restart for example for schema introspection of the graphql queries ([a5da7ba](https://github.com/Stradivario/gapi/commit/a5da7bad7e0153251b6cc3b9d6c4f282936cfb64))
* **gcli:** added multiple scaling options and some documentation inside the cli itself ([0efec0f](https://github.com/Stradivario/gapi/commit/0efec0f8f9221cd73168e6e3be50f6ec4d3376b0))
* **gcli:** added package command and prepared for rxjs migration by removing toPromise() and throwError accepts function () => error ([84c2cad](https://github.com/Stradivario/gapi/commit/84c2cad586c07e29d5626be714a16dd76f37b090))
* **gcli:** build script added outfile ([1bea705](https://github.com/Stradivario/gapi/commit/1bea7057543c37999ec2bd23983bc8a0401361f0))
* **gcli:** bundle binary ([e4ad1a0](https://github.com/Stradivario/gapi/commit/e4ad1a075bb468f014d5cc01cda31227775fe04a))
* **gcli:** environment crud operations added ([5c4bde8](https://github.com/Stradivario/gapi/commit/5c4bde864e328e97c21f616af5911e3ce0208edf))
* **gcli:** logging is now on a single place introduced new configuration lambforge.yaml and start bundling capabilities using esbuild really amazing commitgit add .! ([064cd2a](https://github.com/Stradivario/gapi/commit/064cd2a7bb1b33951869961624df81f3b4c097ad))
* **gcli:** npm ignore file added ([15530eb](https://github.com/Stradivario/gapi/commit/15530eb085653d26f53e01fd9d7902bdfd99b734))
* **gcli:** readme.md added correct link [ci-skip] ([ff79521](https://github.com/Stradivario/gapi/commit/ff7952137b93a50e57ca51f15d3dbd71565c348d))
* **gcli:** removed archiver as default export ([7ea3f62](https://github.com/Stradivario/gapi/commit/7ea3f6265dc58dc1f37d9177b1c8dd7ca2c91551))
* **gcli:** scaling options added to yml file ([3c01cdc](https://github.com/Stradivario/gapi/commit/3c01cdc7b3f7d0bce572b1a64af2b718075a93dc))
* **gcli:** single executable ([8697dc6](https://github.com/Stradivario/gapi/commit/8697dc63dd03f9a4247238f21a3d77e604f0c360))
* **gcli:** time triggers tools implemented ([8cbf633](https://github.com/Stradivario/gapi/commit/8cbf63325a15590c714e517a856fb9cca58b8767))
* **gcli:** updated mcp server to be with rxjs instead of imperative code ([4337cad](https://github.com/Stradivario/gapi/commit/4337cad4a5091700b1f31ab1e01028ee96b6a096))
* **geojson:** removed package geojson and instead re-exported from the library itself one less library for @gapi/core ([5d76d0f](https://github.com/Stradivario/gapi/commit/5d76d0f98ef70317bf82245512be9d0db8113d5b))
* **graphql-pubsub:** added compatibility between graphql v15 and graphql v16 we want to use v16 but subscriptions are not stable enough ([b94d7a7](https://github.com/Stradivario/gapi/commit/b94d7a748856d64a952ac4f837db1d5d1b0437a2))
* **GraphqlCli:** init graphql-server cli ([9819b46](https://github.com/Stradivario/gapi/commit/9819b46458e6f732443b8d4ea8822cfa8f776a89))
* **Lambda:** generation and deploy for lambda ([900e7dc](https://github.com/Stradivario/gapi/commit/900e7dcde5dc00af994adae9c8a5e808334b7bb9))
* **openai:** added more input parameters for the graphql endpoint ([9fdee60](https://github.com/Stradivario/gapi/commit/9fdee607ee26e2c9715768539c7079db6d206f43))
* **openai:** added new version of openai and modified a little bit the code to fit new api ([44f606b](https://github.com/Stradivario/gapi/commit/44f606bf44b6e470066701242bad91bb36a8b739))
* **openai:** added open ai module with simple graphql mutation ([ec660f9](https://github.com/Stradivario/gapi/commit/ec660f9542909f16b5b8bda19ae39dee00c48352))
* **openai:** created chat completion node ([e5f9635](https://github.com/Stradivario/gapi/commit/e5f96352b15617cd5faeb2f31e571ff3bde46806))
* removed every occurency for graphiql and replacement with altair ([5db6974](https://github.com/Stradivario/gapi/commit/5db69741ab12e2263c1bd30692f3e89308214a93))
* removed some more modules and altair ([e9fdcff](https://github.com/Stradivario/gapi/commit/e9fdcff0d920f0af3235feabe0375abf77c59dcc))
* **rxdi:** bumped many versions of rxdi infrastructure ([56cf598](https://github.com/Stradivario/gapi/commit/56cf5981ce2f5d14d514fdd88fafe753d802bc5d))
* **rxdi:** bumped rxdi for new feature AMQPSusbscribe decorator for complex dead letter queue scenarios ([ef0b247](https://github.com/Stradivario/gapi/commit/ef0b247db094623d790e2f53ad5969ac6706ceeb))
* **rxdi:** bumped rxdi versions due to recent ai changed with description field exposed to graphql query mutation and subscription better schema generation ([c6a4c35](https://github.com/Stradivario/gapi/commit/c6a4c35a007ba094c4bafc5c346ecc97a766181d))
* **rxdi:** bumped version of rxdi ([9abf554](https://github.com/Stradivario/gapi/commit/9abf5546fb3d5f84682026f427f68d6a99f45f8a))
* **rxdi:** bumped version of rxdi ([d998039](https://github.com/Stradivario/gapi/commit/d998039963d256391682b03e5f0dcc89bbf921d7))
* **rxdi:** bumped version with many removed unused functionalities ([637d781](https://github.com/Stradivario/gapi/commit/637d7814f9c906d75d7f42a8847417ed4d098ddd))
* **rxdi:** global prefetch count for rabbitmq pubsub ([95657c7](https://github.com/Stradivario/gapi/commit/95657c7be828623fc1d2ecd8119539f4ba84a743))
* **rxdi:** introduced options for altair ([b85ebb7](https://github.com/Stradivario/gapi/commit/b85ebb748859b0542d21c4da14109c06bce67866))
* **rxdi:** whole infrastructure bumped ([0a5c1c7](https://github.com/Stradivario/gapi/commit/0a5c1c7db76e4726e017da655aa5cd47cb36a7f1))
* **sandgrid:** added options to last parameter in order to create attachment for the email and add s missing functionalities which restrict this library to be used as a extender of original sendgrid library ([63dc5bf](https://github.com/Stradivario/gapi/commit/63dc5bf21eeac37f31755a4c21347260c00845d2))
* **Sendgrid:** added default email from injection ([59b8abf](https://github.com/Stradivario/gapi/commit/59b8abf0345629aff618b103151401c30d31c605))
* **Sendgrid:** added sendgrid module to stack ([98f7d0a](https://github.com/Stradivario/gapi/commit/98f7d0a7ccd162d51078ab3aeb6c2e34d8378ada))
* **withFilter:** added re exported withFilter since it was with messed typings not reflecting the actual framework ([83e1c45](https://github.com/Stradivario/gapi/commit/83e1c4526b1f6304225a48cd0ce575fd0f71bc68))
* **zip:** added zip upload ([1c240c0](https://github.com/Stradivario/gapi/commit/1c240c0f9e8df9612f88b8eb2b618d2d5904f21a))



## [1.8.28](https://github.com/Stradivario/gapi/compare/v1.8.27...v1.8.28) (2020-04-14)



## [1.8.27](https://github.com/Stradivario/gapi/compare/v1.8.24...v1.8.27) (2020-04-14)



## [1.8.24](https://github.com/Stradivario/gapi/compare/v1.2.54...v1.8.24) (2020-04-14)


### Bug Fixes

* **cli:** added initial object for local and prod environments ([e0d1a63](https://github.com/Stradivario/gapi/commit/e0d1a63b3cefbe8e84d630fa1555002389f820b9))
* **core, cli:** important daemon config fix when destructuring object config forRoot ([3a1bfb8](https://github.com/Stradivario/gapi/commit/3a1bfb88819d6bfbb228cca86143abbf105399a8))
* **Core:** core module was decorating values before real implementation thus injecting containers ([571be92](https://github.com/Stradivario/gapi/commit/571be926d44a29d12268c0460ffe7def75bb035a))
* **Gapi-cli:** schema introspection type export ([5a4b31e](https://github.com/Stradivario/gapi/commit/5a4b31ea811411e9aacc6b89f11df3e21b7caae6))
* **gapi-cli:** unable to work with gapi schema introspection ([4c9fdf7](https://github.com/Stradivario/gapi/commit/4c9fdf7b22f6859702a4677fbc3277187b011c2d))
* **gapi-ipfs-daemon:** added ability to start daemon with specific port ([c3fe75b](https://github.com/Stradivario/gapi/commit/c3fe75b6dc3f30fc7adb8b45d4dedd7f00d1c42c))
* **Headers:** added default headers ([13969ed](https://github.com/Stradivario/gapi/commit/13969ed1fe58b9f324b46e86c410403138f8b685))
* **ImportantVersionPatch:** rxdi graphql was not getting correct this for the resolvers ([d644b36](https://github.com/Stradivario/gapi/commit/d644b3605bb65c632c59f4914679923f5c32a57b))
* **Typo:** orbitdb module has typo ([89723fc](https://github.com/Stradivario/gapi/commit/89723fc6ca3eaf7d15328acabe06db8accdd3912))
* **Voyager:** added correct token import from @rxdi/core ([c0efc6b](https://github.com/Stradivario/gapi/commit/c0efc6baa863d584fdd17a6b48ae2a2378d6525c))


### Reverts

* **rxdi/graphql:** not working with new apollo server... ([7208669](https://github.com/Stradivario/gapi/commit/72086695062a0463f761cfe1654ba6020a794a95))



## [1.2.54](https://github.com/Stradivario/gapi/compare/v1.2.53...v1.2.54) (2018-09-02)



## [1.2.53](https://github.com/Stradivario/gapi/compare/v1.2.52...v1.2.53) (2018-09-02)



## [1.2.52](https://github.com/Stradivario/gapi/compare/v1.2.51...v1.2.52) (2018-09-02)



## [1.2.51](https://github.com/Stradivario/gapi/compare/v1.2.50...v1.2.51) (2018-09-02)



## [1.2.50](https://github.com/Stradivario/gapi/compare/v1.2.49...v1.2.50) (2018-09-01)



## [1.2.49](https://github.com/Stradivario/gapi/compare/v1.2.48...v1.2.49) (2018-09-01)



## [1.2.48](https://github.com/Stradivario/gapi/compare/v1.2.47...v1.2.48) (2018-09-01)



## [1.2.47](https://github.com/Stradivario/gapi/compare/v1.2.45...v1.2.47) (2018-09-01)



## [1.2.45](https://github.com/Stradivario/gapi/compare/v1.2.44...v1.2.45) (2018-09-01)



## [1.2.44](https://github.com/Stradivario/gapi/compare/v1.2.40...v1.2.44) (2018-09-01)



## [1.2.40](https://github.com/Stradivario/gapi/compare/v1.2.39...v1.2.40) (2018-09-01)



## [1.2.39](https://github.com/Stradivario/gapi/compare/v1.2.38...v1.2.39) (2018-08-31)



## [1.2.38](https://github.com/Stradivario/gapi/compare/v1.2.37...v1.2.38) (2018-08-31)



## [1.2.37](https://github.com/Stradivario/gapi/compare/v1.2.36...v1.2.37) (2018-08-31)



## [1.2.36](https://github.com/Stradivario/gapi/compare/v1.2.35...v1.2.36) (2018-08-19)



## [1.2.35](https://github.com/Stradivario/gapi/compare/v1.2.34...v1.2.35) (2018-08-19)



## [1.2.34](https://github.com/Stradivario/gapi/compare/v1.2.33...v1.2.34) (2018-08-15)



## [1.2.33](https://github.com/Stradivario/gapi/compare/v0.7.289...v1.2.33) (2018-08-15)


### Bug Fixes

* **gapi-core:** integrity for package-lock.json added ([0ee6bd9](https://github.com/Stradivario/gapi/commit/0ee6bd9eb72360057546d3fde140376d6d9f6b76))
* **peerDependencies:** peer dependencies removed due CI build failure from codeship ([5dbf12e](https://github.com/Stradivario/gapi/commit/5dbf12e71a3a5c1653d8a02763216545abf8784d))
* **siblings:** removed peer dependencies ([e82a821](https://github.com/Stradivario/gapi/commit/e82a82183883271ac5eed1994b6861282519b719))



## [0.7.289](https://github.com/Stradivario/gapi/compare/v0.7.287...v0.7.289) (2018-06-14)


### Bug Fixes

* **gapi-ipfs-pubsub:** little fix for lazy loading ([3104c2a](https://github.com/Stradivario/gapi/commit/3104c2abc8c958116b9a2a48891d82de50640bfc))



## [0.7.287](https://github.com/Stradivario/gapi/compare/v0.7.286...v0.7.287) (2018-06-14)



## [0.7.286](https://github.com/Stradivario/gapi/compare/v0.7.285...v0.7.286) (2018-06-14)



## [0.7.285](https://github.com/Stradivario/gapi/compare/v0.7.283...v0.7.285) (2018-06-14)



## [0.7.283](https://github.com/Stradivario/gapi/compare/v0.7.279...v0.7.283) (2018-06-14)



## [0.7.279](https://github.com/Stradivario/gapi/compare/v0.7.278...v0.7.279) (2018-06-12)



## [0.7.278](https://github.com/Stradivario/gapi/compare/v0.7.277...v0.7.278) (2018-06-11)



## [0.7.277](https://github.com/Stradivario/gapi/compare/v0.7.275...v0.7.277) (2018-06-11)



## [0.7.275](https://github.com/Stradivario/gapi/compare/v0.7.274...v0.7.275) (2018-06-11)



## [0.7.274](https://github.com/Stradivario/gapi/compare/v0.7.273...v0.7.274) (2018-06-10)



## [0.7.273](https://github.com/Stradivario/gapi/compare/v0.7.271...v0.7.273) (2018-06-10)



## [0.7.271](https://github.com/Stradivario/gapi/compare/v0.7.270...v0.7.271) (2018-06-10)



## [0.7.270](https://github.com/Stradivario/gapi/compare/v0.7.269...v0.7.270) (2018-06-09)



## [0.7.269](https://github.com/Stradivario/gapi/compare/v0.7.268...v0.7.269) (2018-06-09)



## [0.7.268](https://github.com/Stradivario/gapi/compare/v0.7.265...v0.7.268) (2018-06-09)



## [0.7.265](https://github.com/Stradivario/gapi/compare/v0.7.264...v0.7.265) (2018-06-09)



## [0.7.264](https://github.com/Stradivario/gapi/compare/v0.7.263...v0.7.264) (2018-06-09)



## [0.7.263](https://github.com/Stradivario/gapi/compare/v0.7.262...v0.7.263) (2018-06-08)



## [0.7.262](https://github.com/Stradivario/gapi/compare/v0.7.261...v0.7.262) (2018-06-08)



## [0.7.261](https://github.com/Stradivario/gapi/compare/v0.7.260...v0.7.261) (2018-06-08)



## [0.7.260](https://github.com/Stradivario/gapi/compare/v0.7.259...v0.7.260) (2018-06-08)



## [0.7.259](https://github.com/Stradivario/gapi/compare/v0.7.258...v0.7.259) (2018-06-08)



## [0.7.258](https://github.com/Stradivario/gapi/compare/v0.7.257...v0.7.258) (2018-06-08)



## [0.7.257](https://github.com/Stradivario/gapi/compare/v0.7.256...v0.7.257) (2018-05-26)



## [0.7.256](https://github.com/Stradivario/gapi/compare/v0.7.254...v0.7.256) (2018-05-26)



## [0.7.254](https://github.com/Stradivario/gapi/compare/v0.7.253...v0.7.254) (2018-05-24)



## [0.7.253](https://github.com/Stradivario/gapi/compare/v0.7.252...v0.7.253) (2018-05-24)



## [0.7.252](https://github.com/Stradivario/gapi/compare/v0.7.251...v0.7.252) (2018-05-24)



## [0.7.251](https://github.com/Stradivario/gapi/compare/v0.7.250...v0.7.251) (2018-05-24)



## [0.7.250](https://github.com/Stradivario/gapi/compare/v0.7.249...v0.7.250) (2018-05-23)



## [0.7.249](https://github.com/Stradivario/gapi/compare/v0.7.248...v0.7.249) (2018-05-23)



## [0.7.248](https://github.com/Stradivario/gapi/compare/v0.7.247...v0.7.248) (2018-05-23)



## [0.7.247](https://github.com/Stradivario/gapi/compare/v0.7.246...v0.7.247) (2018-05-23)



## [0.7.246](https://github.com/Stradivario/gapi/compare/v0.7.244...v0.7.246) (2018-05-23)



## [0.7.244](https://github.com/Stradivario/gapi/compare/v0.7.243...v0.7.244) (2018-05-23)


### Bug Fixes

* **gapi-core:** dependency injection fix on forRoot ([17a59e4](https://github.com/Stradivario/gapi/commit/17a59e441e590daa86e0b9f28cb3352288896184))



## [0.7.243](https://github.com/Stradivario/gapi/compare/v0.7.242...v0.7.243) (2018-05-22)



## [0.7.242](https://github.com/Stradivario/gapi/compare/v0.7.241...v0.7.242) (2018-05-22)



## [0.7.241](https://github.com/Stradivario/gapi/compare/v0.7.240...v0.7.241) (2018-05-22)



## [0.7.240](https://github.com/Stradivario/gapi/compare/v0.7.239...v0.7.240) (2018-05-22)



## [0.7.239](https://github.com/Stradivario/gapi/compare/v0.7.238...v0.7.239) (2018-05-22)



## [0.7.238](https://github.com/Stradivario/gapi/compare/v0.7.237...v0.7.238) (2018-05-22)



## [0.7.237](https://github.com/Stradivario/gapi/compare/v0.7.236...v0.7.237) (2018-05-22)



## [0.7.236](https://github.com/Stradivario/gapi/compare/v0.7.234...v0.7.236) (2018-05-22)



## [0.7.234](https://github.com/Stradivario/gapi/compare/v0.7.233...v0.7.234) (2018-05-21)


### Bug Fixes

* **gapi-cli:** removed --prod reserved environment ([142cef8](https://github.com/Stradivario/gapi/commit/142cef8044830bf2af20fc4090cf7b844bb83449))



## [0.7.233](https://github.com/Stradivario/gapi/compare/v0.7.232...v0.7.233) (2018-05-20)



## [0.7.232](https://github.com/Stradivario/gapi/compare/v0.7.231...v0.7.232) (2018-05-20)



## [0.7.231](https://github.com/Stradivario/gapi/compare/v0.7.230...v0.7.231) (2018-05-20)



## [0.7.230](https://github.com/Stradivario/gapi/compare/v0.7.229...v0.7.230) (2018-05-20)



## [0.7.229](https://github.com/Stradivario/gapi/compare/v0.7.228...v0.7.229) (2018-05-19)



## [0.7.228](https://github.com/Stradivario/gapi/compare/v0.7.227...v0.7.228) (2018-05-19)



## [0.7.227](https://github.com/Stradivario/gapi/compare/v0.7.226...v0.7.227) (2018-05-19)



## [0.7.226](https://github.com/Stradivario/gapi/compare/v0.7.225...v0.7.226) (2018-05-19)


### Bug Fixes

* **gapi-sequelize:** important fix with useFactory instead of dependency injected service providing configuration ([ee8fce8](https://github.com/Stradivario/gapi/commit/ee8fce81c8c3d06da454233a9a0c8f6510d4a16d))



## [0.7.225](https://github.com/Stradivario/gapi/compare/v0.7.224...v0.7.225) (2018-05-18)



## [0.7.224](https://github.com/Stradivario/gapi/compare/v0.7.223...v0.7.224) (2018-05-18)



## [0.7.223](https://github.com/Stradivario/gapi/compare/v0.7.222...v0.7.223) (2018-05-18)



## [0.7.222](https://github.com/Stradivario/gapi/compare/v0.7.221...v0.7.222) (2018-05-18)



## [0.7.221](https://github.com/Stradivario/gapi/compare/v0.7.220...v0.7.221) (2018-05-18)



## [0.7.220](https://github.com/Stradivario/gapi/compare/v0.7.219...v0.7.220) (2018-05-18)



## [0.7.219](https://github.com/Stradivario/gapi/compare/v0.7.218...v0.7.219) (2018-05-18)



## [0.7.218](https://github.com/Stradivario/gapi/compare/v0.7.217...v0.7.218) (2018-05-18)



## [0.7.217](https://github.com/Stradivario/gapi/compare/v0.7.216...v0.7.217) (2018-05-18)



## [0.7.216](https://github.com/Stradivario/gapi/compare/v0.7.215...v0.7.216) (2018-05-18)


### Bug Fixes

* **LittleFixes:** gapi-cli gapi-core modules ([91e8eea](https://github.com/Stradivario/gapi/commit/91e8eeac779cadb2c646432931770ba5c517ef3e))



## [0.7.215](https://github.com/Stradivario/gapi/compare/v0.7.214...v0.7.215) (2018-05-16)



## [0.7.214](https://github.com/Stradivario/gapi/compare/v0.7.213...v0.7.214) (2018-05-16)



## [0.7.213](https://github.com/Stradivario/gapi/compare/v0.7.212...v0.7.213) (2018-05-16)



## [0.7.212](https://github.com/Stradivario/gapi/compare/v0.7.211...v0.7.212) (2018-05-16)



## [0.7.211](https://github.com/Stradivario/gapi/compare/v0.7.210...v0.7.211) (2018-05-15)



## [0.7.210](https://github.com/Stradivario/gapi/compare/v0.7.209...v0.7.210) (2018-05-15)



## [0.7.209](https://github.com/Stradivario/gapi/compare/v0.7.208...v0.7.209) (2018-05-11)



## [0.7.208](https://github.com/Stradivario/gapi/compare/v0.7.207...v0.7.208) (2018-05-11)



## [0.7.207](https://github.com/Stradivario/gapi/compare/v0.7.206...v0.7.207) (2018-05-11)



## [0.7.206](https://github.com/Stradivario/gapi/compare/v0.7.205...v0.7.206) (2018-05-11)



## [0.7.205](https://github.com/Stradivario/gapi/compare/v0.7.204...v0.7.205) (2018-05-11)



## [0.7.204](https://github.com/Stradivario/gapi/compare/v0.7.203...v0.7.204) (2018-05-11)



## [0.7.203](https://github.com/Stradivario/gapi/compare/v0.7.202...v0.7.203) (2018-05-09)



## [0.7.202](https://github.com/Stradivario/gapi/compare/v0.7.201...v0.7.202) (2018-05-09)



## [0.7.201](https://github.com/Stradivario/gapi/compare/v0.7.199...v0.7.201) (2018-05-01)



## [0.7.199](https://github.com/Stradivario/gapi/compare/v0.7.198...v0.7.199) (2018-05-01)



## [0.7.198](https://github.com/Stradivario/gapi/compare/v0.7.197...v0.7.198) (2018-05-01)



## [0.7.197](https://github.com/Stradivario/gapi/compare/v0.7.196...v0.7.197) (2018-05-01)



## [0.7.196](https://github.com/Stradivario/gapi/compare/v0.7.193...v0.7.196) (2018-05-01)



## [0.7.193](https://github.com/Stradivario/gapi/compare/v0.7.192...v0.7.193) (2018-05-01)



## [0.7.192](https://github.com/Stradivario/gapi/compare/v0.7.191...v0.7.192) (2018-05-01)



## [0.7.191](https://github.com/Stradivario/gapi/compare/v0.7.190...v0.7.191) (2018-05-01)



## [0.7.190](https://github.com/Stradivario/gapi/compare/v0.7.189...v0.7.190) (2018-05-01)



## [0.7.189](https://github.com/Stradivario/gapi/compare/v0.7.188...v0.7.189) (2018-05-01)



## [0.7.188](https://github.com/Stradivario/gapi/compare/v0.7.187...v0.7.188) (2018-05-01)



## [0.7.187](https://github.com/Stradivario/gapi/compare/v0.7.186...v0.7.187) (2018-04-30)



## [0.7.186](https://github.com/Stradivario/gapi/compare/v0.7.184...v0.7.186) (2018-04-30)



## [0.7.184](https://github.com/Stradivario/gapi/compare/v0.7.183...v0.7.184) (2018-04-27)



## [0.7.183](https://github.com/Stradivario/gapi/compare/v0.7.182...v0.7.183) (2018-04-27)



## [0.7.182](https://github.com/Stradivario/gapi/compare/v0.7.181...v0.7.182) (2018-04-27)



## [0.7.181](https://github.com/Stradivario/gapi/compare/v0.7.180...v0.7.181) (2018-04-27)



## [0.7.180](https://github.com/Stradivario/gapi/compare/v0.7.179...v0.7.180) (2018-04-27)



## [0.7.179](https://github.com/Stradivario/gapi/compare/v0.7.178...v0.7.179) (2018-04-27)



## [0.7.178](https://github.com/Stradivario/gapi/compare/v0.7.177...v0.7.178) (2018-04-27)



## [0.7.177](https://github.com/Stradivario/gapi/compare/v0.7.176...v0.7.177) (2018-04-27)



## [0.7.176](https://github.com/Stradivario/gapi/compare/v0.7.175...v0.7.176) (2018-04-27)



## [0.7.175](https://github.com/Stradivario/gapi/compare/v0.7.174...v0.7.175) (2018-04-27)



## [0.7.174](https://github.com/Stradivario/gapi/compare/v0.7.173...v0.7.174) (2018-04-27)



## [0.7.173](https://github.com/Stradivario/gapi/compare/v0.7.172...v0.7.173) (2018-04-25)



## [0.7.172](https://github.com/Stradivario/gapi/compare/v0.7.171...v0.7.172) (2018-04-25)



## [0.7.171](https://github.com/Stradivario/gapi/compare/v0.7.170...v0.7.171) (2018-04-25)



## [0.7.170](https://github.com/Stradivario/gapi/compare/v0.7.169...v0.7.170) (2018-04-25)



## [0.7.169](https://github.com/Stradivario/gapi/compare/v0.7.168...v0.7.169) (2018-04-24)



## [0.7.168](https://github.com/Stradivario/gapi/compare/v0.7.167...v0.7.168) (2018-04-24)



## [0.7.167](https://github.com/Stradivario/gapi/compare/v0.7.166...v0.7.167) (2018-04-24)



## [0.7.166](https://github.com/Stradivario/gapi/compare/v0.7.165...v0.7.166) (2018-04-24)



## [0.7.165](https://github.com/Stradivario/gapi/compare/v0.7.164...v0.7.165) (2018-04-24)



## [0.7.164](https://github.com/Stradivario/gapi/compare/v0.7.163...v0.7.164) (2018-04-24)



## [0.7.163](https://github.com/Stradivario/gapi/compare/v0.7.162...v0.7.163) (2018-04-24)



## [0.7.162](https://github.com/Stradivario/gapi/compare/v0.7.161...v0.7.162) (2018-04-24)



## [0.7.161](https://github.com/Stradivario/gapi/compare/v0.7.160...v0.7.161) (2018-04-09)



## [0.7.160](https://github.com/Stradivario/gapi/compare/v0.7.159...v0.7.160) (2018-04-09)



## [0.7.159](https://github.com/Stradivario/gapi/compare/v0.7.158...v0.7.159) (2018-04-07)



## [0.7.158](https://github.com/Stradivario/gapi/compare/v0.7.157...v0.7.158) (2018-04-07)



## [0.7.157](https://github.com/Stradivario/gapi/compare/v0.7.155...v0.7.157) (2018-04-07)



## [0.7.155](https://github.com/Stradivario/gapi/compare/v0.7.123...v0.7.155) (2018-04-07)


### Bug Fixes

* **gapi-cli:** fixed start ([39239de](https://github.com/Stradivario/gapi/commit/39239de780c3a97975d53e28033d0493f9d83a3d))



## [0.7.123](https://github.com/Stradivario/gapi/compare/v0.7.122...v0.7.123) (2018-04-02)



## [0.7.122](https://github.com/Stradivario/gapi/compare/v0.7.121...v0.7.122) (2018-04-02)



## [0.7.121](https://github.com/Stradivario/gapi/compare/v0.7.120...v0.7.121) (2018-04-02)



## [0.7.120](https://github.com/Stradivario/gapi/compare/v0.7.119...v0.7.120) (2018-04-02)



## [0.7.119](https://github.com/Stradivario/gapi/compare/v0.7.118...v0.7.119) (2018-04-02)


### Bug Fixes

* **gapi-core:** effects are fixed and all left is to assign appropriate this ([57e5fff](https://github.com/Stradivario/gapi/commit/57e5fff2160c4310c4394d01809efd97887b930b))



## [0.7.118](https://github.com/Stradivario/gapi/compare/v0.7.117...v0.7.118) (2018-04-02)



## [0.7.117](https://github.com/Stradivario/gapi/compare/v0.7.115...v0.7.117) (2018-04-02)



## [0.7.115](https://github.com/Stradivario/gapi/compare/v0.7.114...v0.7.115) (2018-04-02)



## [0.7.114](https://github.com/Stradivario/gapi/compare/v0.7.113...v0.7.114) (2018-04-02)



## [0.7.113](https://github.com/Stradivario/gapi/compare/v0.7.112...v0.7.113) (2018-04-02)



## [0.7.112](https://github.com/Stradivario/gapi/compare/v0.7.111...v0.7.112) (2018-04-02)



## [0.7.111](https://github.com/Stradivario/gapi/compare/v0.7.110...v0.7.111) (2018-04-02)



## [0.7.110](https://github.com/Stradivario/gapi/compare/v0.7.108...v0.7.110) (2018-04-02)



## [0.7.108](https://github.com/Stradivario/gapi/compare/v0.7.107...v0.7.108) (2018-04-02)



## [0.7.107](https://github.com/Stradivario/gapi/compare/v0.7.106...v0.7.107) (2018-04-02)



## [0.7.106](https://github.com/Stradivario/gapi/compare/v0.7.105...v0.7.106) (2018-04-02)



## [0.7.105](https://github.com/Stradivario/gapi/compare/v0.7.104...v0.7.105) (2018-04-02)



## [0.7.104](https://github.com/Stradivario/gapi/compare/v0.7.103...v0.7.104) (2018-04-02)



## [0.7.103](https://github.com/Stradivario/gapi/compare/v0.7.102...v0.7.103) (2018-04-02)



## [0.7.102](https://github.com/Stradivario/gapi/compare/v0.7.101...v0.7.102) (2018-04-02)



## [0.7.101](https://github.com/Stradivario/gapi/compare/v0.7.100...v0.7.101) (2018-04-02)



## [0.7.100](https://github.com/Stradivario/gapi/compare/v0.7.95...v0.7.100) (2018-04-02)



## [0.7.95](https://github.com/Stradivario/gapi/compare/v0.7.94...v0.7.95) (2018-04-02)



## [0.7.94](https://github.com/Stradivario/gapi/compare/v0.7.91...v0.7.94) (2018-04-01)



## [0.7.91](https://github.com/Stradivario/gapi/compare/v0.7.90...v0.7.91) (2018-04-01)



## [0.7.90](https://github.com/Stradivario/gapi/compare/v0.7.82...v0.7.90) (2018-04-01)



## [0.7.82](https://github.com/Stradivario/gapi/compare/v0.7.81...v0.7.82) (2018-04-01)



## [0.7.81](https://github.com/Stradivario/gapi/compare/v0.7.80...v0.7.81) (2018-04-01)



## [0.7.80](https://github.com/Stradivario/gapi/compare/v0.7.70...v0.7.80) (2018-04-01)



## [0.7.70](https://github.com/Stradivario/gapi/compare/v0.7.64...v0.7.70) (2018-04-01)



## [0.7.64](https://github.com/Stradivario/gapi/compare/v0.7.63...v0.7.64) (2018-04-01)



## [0.7.63](https://github.com/Stradivario/gapi/compare/v0.7.62...v0.7.63) (2018-04-01)



## [0.7.62](https://github.com/Stradivario/gapi/compare/v0.7.60...v0.7.62) (2018-03-30)



## [0.7.60](https://github.com/Stradivario/gapi/compare/v0.7.52...v0.7.60) (2018-03-29)



## [0.7.52](https://github.com/Stradivario/gapi/compare/v0.7.51...v0.7.52) (2018-03-29)



## [0.7.51](https://github.com/Stradivario/gapi/compare/v0.7.44...v0.7.51) (2018-03-29)



## [0.7.44](https://github.com/Stradivario/gapi/compare/v0.7.43...v0.7.44) (2018-03-29)



## [0.7.43](https://github.com/Stradivario/gapi/compare/v0.7.41...v0.7.43) (2018-03-29)



## [0.7.41](https://github.com/Stradivario/gapi/compare/v0.7.40...v0.7.41) (2018-03-29)



## [0.7.40](https://github.com/Stradivario/gapi/compare/v0.7.32...v0.7.40) (2018-03-29)



## [0.7.32](https://github.com/Stradivario/gapi/compare/v0.7.31...v0.7.32) (2018-03-28)



## [0.7.31](https://github.com/Stradivario/gapi/compare/v0.7.29...v0.7.31) (2018-03-28)



## [0.7.29](https://github.com/Stradivario/gapi/compare/v0.7.28...v0.7.29) (2018-03-28)



## [0.7.28](https://github.com/Stradivario/gapi/compare/v0.7.27...v0.7.28) (2018-03-28)



## [0.7.27](https://github.com/Stradivario/gapi/compare/v0.7.26...v0.7.27) (2018-03-28)



## [0.7.26](https://github.com/Stradivario/gapi/compare/v0.7.25...v0.7.26) (2018-03-28)



## [0.7.25](https://github.com/Stradivario/gapi/compare/v0.7.22...v0.7.25) (2018-03-28)



## [0.7.22](https://github.com/Stradivario/gapi/compare/v0.7.21...v0.7.22) (2018-03-28)



## [0.7.21](https://github.com/Stradivario/gapi/compare/v0.7.20...v0.7.21) (2018-03-27)



## [0.7.20](https://github.com/Stradivario/gapi/compare/v0.7.19...v0.7.20) (2018-03-27)



## [0.7.19](https://github.com/Stradivario/gapi/compare/v0.7.18...v0.7.19) (2018-03-27)



## [0.7.18](https://github.com/Stradivario/gapi/compare/v0.7.17...v0.7.18) (2018-03-27)



## 0.7.17 (2018-03-27)



