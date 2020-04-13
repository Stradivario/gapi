// import {
//   Container,
//   createWebsocketLink,
//   HAPI_SERVER,
//   sendRequest,
//   subscribeToTopic
// } from '@gapi/core';
// import { gql } from 'apollo-server-core';
// // import { ISubscription } from './api-introspection';

// Container.set(HAPI_SERVER, { info: { port: '42001' } });

// const subscription = subscribeToTopic<{ data: any }>(gql`
//   subscription {
//     statusSubscription {
//       repoPath
//     }
//   }
// `).subscribe(stream => {
//   console.log(stream.data);
// }, console.error.bind(console));

// sendRequest({
//   query: `
//         query {
//             status {
//                 status
//             }
//         }
//     `
// }).then(stat => console.log(stat));
// // setTimeout(() => {
// //   subscription.unsubscribe();
// // }, 5000);
