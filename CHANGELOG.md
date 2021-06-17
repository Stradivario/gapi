## [1.8.120](https://github.com/Stradivario/gapi/compare/v1.8.28...v1.8.120) (2021-06-17)


### Bug Fixes

* **ac:** added type safety features ([ab2da32](https://github.com/Stradivario/gapi/commit/ab2da32087f70fb217e55675612dc868c62e32ff))
* **ac:** typo error ([fc89bfe](https://github.com/Stradivario/gapi/commit/fc89bfe06f064b82a5f9d9630a7df646d46c09f3))
* **cli:** added headers field to schema introspection in order to put authorization token ([17feddf](https://github.com/Stradivario/gapi/commit/17feddf91f7816ac1d6e14ef160739b33c175846))
* **cli:** collect fragments when generating schema was hitting wrong endpoint ([dcf7778](https://github.com/Stradivario/gapi/commit/dcf77786e542d548c149c9ce52b35e759ef55f17))
* **cli:** enums was not exported inside index.ts ([312ddeb](https://github.com/Stradivario/gapi/commit/312ddeb3262e38b064604d88918d53ac9ae6d47c))
* **cli:** if not defined headers property it throws error and intrupting previews flow without headers ([8518683](https://github.com/Stradivario/gapi/commit/85186831a08200b584ab39dcf8548ab085fd5daa))
* **cli:** lint removed from generated files ([8a75cf4](https://github.com/Stradivario/gapi/commit/8a75cf4b6e6132f1c4cbad9256eb7a981e9ec757))
* **cli-builder:** added correct generation of system file ([2b3bd5b](https://github.com/Stradivario/gapi/commit/2b3bd5b23b754fea88c0d670d987db0d07281d4f))
* **cli-builder:** added executable environment variable ([9352fcb](https://github.com/Stradivario/gapi/commit/9352fcb37ba9771c6de2cda6e5c155c64f6123c8))
* **cli-builder:** added handler for error uncaughtException since the workers are stopping for some reason ([a846ea4](https://github.com/Stradivario/gapi/commit/a846ea46060ff3b2210f0df38d1b465f35fbbd04))
* **cli-builder:** added label fix ([5055bbb](https://github.com/Stradivario/gapi/commit/5055bbbc96dc1583c6b8e315d956d2cba88ac485))
* **cli-builder:** correct adds environment variables to service worker ([29c8eff](https://github.com/Stradivario/gapi/commit/29c8eff132d7b883f8e193d2b3d621f9f92f92d5))
* **cli-builder:** correct subscription service imported ([0fa9785](https://github.com/Stradivario/gapi/commit/0fa9785cc0a671e5d55ed98696d1bd483e98b72d))
* **cli-builder:** data added to params ([b2c205d](https://github.com/Stradivario/gapi/commit/b2c205d4ed09e10138da0bb14d49c7ade98b8acf))
* **cli-builder:** exported ProcessReturn since it is private property ([a57f156](https://github.com/Stradivario/gapi/commit/a57f156dfcf8722b915d4aa459e36c7e7214d358))
* **cli-builder:** fallback to empty string instead of true ([f7c3298](https://github.com/Stradivario/gapi/commit/f7c32981e721db29271d880e6bcd6078e09003eb))
* **cli-builder:** modified GenericEnum type to be any instead of predefined types ([a44c699](https://github.com/Stradivario/gapi/commit/a44c699cfeb5e364014d5c506a95e65d93e54ad7))
* **cli-builder:** registerWorker command now has label or machne hash but not requred ([8666ccb](https://github.com/Stradivario/gapi/commit/8666ccbea482cc9f87430c7cae5f2c932a7c517b))
* **cli-builder:** removed default runner type ([c6c5c39](https://github.com/Stradivario/gapi/commit/c6c5c39aae3040fbbbd71c954782329a790ecb4f))
* **cli-builder:** system executable filename added to empty string since it was braking ([193df28](https://github.com/Stradivario/gapi/commit/193df28abb42b06df6189ee10ee0f6c93778a87e))
* **cli-builder:** when we have authorization and init query we need to drop authorization for this particular query ([b7b26e9](https://github.com/Stradivario/gapi/commit/b7b26e9f6e036e8ecf739c209c3340417ed28f44))
* **core:** added export for graphql-subscriptions ([7c6e42f](https://github.com/Stradivario/gapi/commit/7c6e42f15de5c4d841d009cc9a57e6531e4fa63b))
* **core:** enum-to-graphql enum ([a87b5cf](https://github.com/Stradivario/gapi/commit/a87b5cf724c233c25abe3dcea9484ba12f3288da))
* **core:** graphql added to dependencies since 15.0.0 is broken ([7f740bf](https://github.com/Stradivario/gapi/commit/7f740bfa8f68275516359d12e945c18c7e5a0bd9))
* **federation:** full headers are resend to the appropriate service ([c62d273](https://github.com/Stradivario/gapi/commit/c62d273ccf4811e213222711f3d5c8892621f087))
* **federation:** readme ([1d8b2c8](https://github.com/Stradivario/gapi/commit/1d8b2c89f6dba9a75e892309fd3dc76b8492a9de))
* **InitQuery:** reverted ([f500c5b](https://github.com/Stradivario/gapi/commit/f500c5b8e9ed8b227be93d91e4856c548b10e72b))
* **sendgrid:** added partial data to options ([0501b12](https://github.com/Stradivario/gapi/commit/0501b12325d5b9ce562dc2d4c704d8ec465a9fce))
* **sendgrid:** fixed wrong async assignment ([aca38f6](https://github.com/Stradivario/gapi/commit/aca38f6c565131b0e22630f4fe24fd2b1b0780d1))
* **sendgrid:** html property removed from type and re assigned like it needs to be ([648d411](https://github.com/Stradivario/gapi/commit/648d411171268f55b568c264af96b2949ee6e9b2))
* **SystemdDaemon:** removed export from helpers ([77a7c1a](https://github.com/Stradivario/gapi/commit/77a7c1aedb4081d65a07a08929b777d686f797ae))


### Features

* **AsyncTemplate:** added async template with parameters ([e1643e8](https://github.com/Stradivario/gapi/commit/e1643e8b76d60cb01d0ff9030ba57c194f9228d5))
* **cli:** added more options for parcel in order to customize behaviour ([ec2b040](https://github.com/Stradivario/gapi/commit/ec2b040d0e3c7381ca3578c2deef8d709ce1a286))
* **cli:** compressed documents exported in order to reduce bundle size using lzw codec and json-url library ([96d1fd7](https://github.com/Stradivario/gapi/commit/96d1fd732cf9995ec80f3aff860fd40927f4be2f))
* **cli-builder:** added console.log on subscriptions ([a252177](https://github.com/Stradivario/gapi/commit/a2521772f5c28ca638ec18dd22fdb57606e93867))
* **cli-builder:** introduced ip behind NAT can be specified ([8aa1f12](https://github.com/Stradivario/gapi/commit/8aa1f125901672ee118bd348e09acd1376e66956))
* **cli-builder:** notifiy result based on label in order to track machine with label ([bc837a6](https://github.com/Stradivario/gapi/commit/bc837a6e80bebe48b1feb9c396ee895740ee941c))
* **federation:** added missing apollo server configs ([b049560](https://github.com/Stradivario/gapi/commit/b049560af645f1a4acf51afb3204efe145217722))
* **federation:** added willSendRequest and context lambdas in order to manage authentication outside the scope of the library ([ea45b5e](https://github.com/Stradivario/gapi/commit/ea45b5ee5e2831b4ce375c17817e5024eb96f798))
* **Federation:** removed _service and status from schema sdl when processing _service graph, removed ethereum, ipfs related modules with packages ([7b5781b](https://github.com/Stradivario/gapi/commit/7b5781bcc2fcf0578b0aaf57d2cbcd027d8d2b85))
* **rxdi:** global prefetch count for rabbitmq pubsub ([a939f01](https://github.com/Stradivario/gapi/commit/a939f01fa3c83ee330ca8affa7ccee1c970be613))
* **rxdi:** whole infrastructure bumped ([53f68cb](https://github.com/Stradivario/gapi/commit/53f68cb1f0240553da1ac73108edee6cd26c9cf8))
* **sandgrid:** added options to last parameter in order to create attachment for the email and add s missing functionalities which restrict this library to be used as a extender of original sendgrid library ([4d7b649](https://github.com/Stradivario/gapi/commit/4d7b6492dee0f038dfbc033465ff8fa57c52d514))
* **Sendgrid:** added default email from injection ([8a2ab11](https://github.com/Stradivario/gapi/commit/8a2ab119cc88897bd8290abc860e3e20dd113dd0))
* **Sendgrid:** added sendgrid module to stack ([3cc32e3](https://github.com/Stradivario/gapi/commit/3cc32e37dd0205db91e2f4eee31a566651d547f1))



## [1.8.28](https://github.com/Stradivario/gapi/compare/v1.8.27...v1.8.28) (2020-04-14)



## [1.8.27](https://github.com/Stradivario/gapi/compare/v1.8.24...v1.8.27) (2020-04-14)



## [1.8.24](https://github.com/Stradivario/gapi/compare/v1.2.54...v1.8.24) (2020-04-14)


### Bug Fixes

* **cli:** added initial object for local and prod environments ([e0d1a63](https://github.com/Stradivario/gapi/commit/e0d1a63b3cefbe8e84d630fa1555002389f820b9))
* **Core:** core module was decorating values before real implementation thus injecting containers ([571be92](https://github.com/Stradivario/gapi/commit/571be926d44a29d12268c0460ffe7def75bb035a))
* **core, cli:** important daemon config fix when destructuring object config forRoot ([3a1bfb8](https://github.com/Stradivario/gapi/commit/3a1bfb88819d6bfbb228cca86143abbf105399a8))
* **gapi-cli:** unable to work with gapi schema introspection ([4c9fdf7](https://github.com/Stradivario/gapi/commit/4c9fdf7b22f6859702a4677fbc3277187b011c2d))
* **Gapi-cli:** schema introspection type export ([5a4b31e](https://github.com/Stradivario/gapi/commit/5a4b31ea811411e9aacc6b89f11df3e21b7caae6))
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



