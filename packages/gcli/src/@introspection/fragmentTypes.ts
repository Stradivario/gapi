/* tslint:disable */
/* eslint-disable prettier/prettier */ 
export const introspectionQueryResultData = {
  "__schema": {
    "types": [
      {
        "kind": "UNION",
        "name": "UnionMessagesType",
        "possibleTypes": [
          {
            "name": "ProjectNotifications"
          },
          {
            "name": "MachineNotifications"
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "ProjectNotificationsDataUnion",
        "possibleTypes": [
          {
            "name": "ProjectNotificationsInvite"
          },
          {
            "name": "ProjectNotificationsRemove"
          },
          {
            "name": "ProjectNotificationsMention"
          }
        ]
      },
      {
        "kind": "UNION",
        "name": "MachineNotificationsDataUnion",
        "possibleTypes": [
          {
            "name": "MachineNotificationsStarted"
          },
          {
            "name": "MachineNotificationsStopped"
          }
        ]
      }
    ]
  }
}
          