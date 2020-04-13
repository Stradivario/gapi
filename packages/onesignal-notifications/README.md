# @gapi/onesignal-notifications

#### @Gapi OneSignal Notifications module @StrongTyped forked and re-written with typescript from [onesignal-node](https://github.com/KolektifLabs/onesignal-node)

##### For questions/issues you can write ticket [here](http://gitlab.youvolio.com/gapi/onesignal-notifications/issues)
##### This module is intended to be used with [GAPI](https://github.com/Stradivario/gapi)

## Installation and basic examples:
##### To install this Gapi module, run:

```bash
$ npm install @gapi/onesignal-notifications
```

## Consuming @gapi/onesignal-notifications

##### Import inside AppModule or CoreModule
```typescript

import { Module } from '@rxdi/core';
import { OneSignalModule } from '@gapi/onesignal-notifications';

@Module({
    imports: [
        OneSignalModule.forRoot({
            userAuthKey: 'ZmY2YjVkMjMtMjY0OC00Y2E2LTkxBTQtYTVmOWY1MmJhZDg1',
            app: {
                appAuthKey: 'MTa4NGIzNjQtNGFkMy00MzY4AWJjZTctNzNjYzYyODgzZDhh',
                appId: 'd856cd4h-f834-42cb-b541-22ee20bcf499'
            }
        })
    ],
    services: [NotificationService],
    effects: [YourCustomEffects]
})
export class CoreModule { }
```

##### Create NotificationService

```typescript

import { Service } from '@rxdi/core';
import { PurchasesType } from '../../../purchases/types/purchases.type';
import { OneSignalClientService, Notification } from '@gapi/onesignal-notifications';

@Service()
export class NotificationService {

    constructor(
        private client: OneSignalClientService
    ) { }

    async createNotification(purchaseData: PurchasesType) {
        const notification: Notification = new Notification({
            contents: {
                en: 'Test notification',
                tr: 'Test mesajı',
                bg: 'Съобщение за проба'
            }
        });
        notification.setTargetDevices(['b188dd55-7c70-4072-b696-8b66a56f9c4c']);
        notification.setParameter('data', { type: 'notification-created', data: {} });
        return await this.client.sendNotification(notification);
    }

    async sendNotification() {
        const firstNotification = new Notification({
            contents: {
                en: 'Test notification',
                tr: 'Test mesajı',
                bg: 'Съобщение за проба'
            }
        });
        firstNotification.setTargetDevices(['b188dd55-7c70-4072-b696-8b66a56f9c4c']);
        firstNotification.setParameter('data', { 'abc': '123', 'foo': 'bar' });
        return await this.client.sendNotification(firstNotification);
    }

}

```

##### Then use it inside your Gapi Application for example inside Effects:

```typescript

import { OfType, Effect } from '@rxdi/core';
import { GapiPubSubService } from '@gapi/core';
import { EffectTypes } from '../core/api-introspection/EffectTypes';
import { NotificationService } from '../core/services/notification/notification.service';

@Effect()
export class YourCustomEffects {

    constructor(
        private notificationService: NotificationService
    ) {}

    @OfType<EffectTypes>(EffectTypes.myevent)
    async myEventTrigger(result, {payload}, context) {
        await this.notificationService.createNotification(result);
    }
}
```

More detailed [DOCUMENTATION](https://github.com/KolektifLabs/onesignal-node) you can find inside original onesignal-node module 
Enjoy ! :)