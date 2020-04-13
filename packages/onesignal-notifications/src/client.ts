/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from '@rxdi/core';
import * as request from 'request';

import { Constants } from './constants';
import { OneSignalClient } from './interfaces/client';
import { SendNotificationResponse } from './interfaces/notificationResponse';
import { Notification } from './notification';
import { OneSignalConfig } from './onesignal.config';

function checkCredential(credentialName, credential): boolean {
  const ALLOWED_CREDENTIALS: any = [
    { name: 'userAuthKey', type: 'string' },
    { name: 'app', type: 'object', requiredFields: ['appAuthKey', 'appId'] },
    { name: 'apps', type: 'object' }
  ];
  for (let i = 0; i < ALLOWED_CREDENTIALS.length; i++) {
    if (ALLOWED_CREDENTIALS[i].name === credentialName) {
      if (typeof credential !== ALLOWED_CREDENTIALS[i].type) {
        throw new Error(
          credentialName + ' must be a ' + ALLOWED_CREDENTIALS[i].type
        );
      }
      if (ALLOWED_CREDENTIALS[i].requiredFields) {
        for (let j = 0; j < ALLOWED_CREDENTIALS[i].requiredFields.length; j++) {
          if (!(ALLOWED_CREDENTIALS[i].requiredFields[j] in credential)) {
            throw new Error(
              credentialName +
                ' must contain ' +
                ALLOWED_CREDENTIALS[i].requiredFields[j]
            );
          }
        }
      }
      return true;
    }
  }
  return false;
}

export interface DevicesData<T> {
  players: Player<T>[];
}

export interface Player<T> {
  id: string;
  identifier: string;
  session_count: number;
  language: string;
  timezone: number;
  game_version: string;
  device_os: string;
  device_type: number;
  device_model: string;
  ad_id: string;
  tags: T;
  last_active: number;
  playtime: number;
  amount_spend: number;
  created_at: number;
  invalid_identifier: boolean;
  badge_count: number;
  sdk: string;
  test_type: any;
  ip: any;
}

@Service()
export class OneSignalClientService implements OneSignalClient {
  API_URI: string;
  app: any;
  apps: any;
  userAuthKey: string;

  constructor(credentials: OneSignalConfig) {
    if (typeof credentials !== 'object') {
      throw new Error('credentials parameter must be a JSON object');
    }

    this.API_URI = Constants.API_ROOT;

    for (const key in credentials) {
      if (
        credentials.hasOwnProperty(key) &&
        checkCredential(key, credentials[key])
      ) {
        this[key] = credentials[key];
      }
    }
  }

  basicRequest(
    url: string,
    apiKey: string,
    method: 'PUT' | 'POST' | 'GET' | 'DELETE',
    body
  ): Promise<any> {
    const options = {
      url: url,
      method: method
    } as any;
    if (apiKey) {
      options.headers = {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: 'Basic ' + apiKey
      };
    }
    if (body) {
      options.body = body;
      options.json = true;
    }

    return new Promise(function(resolve, reject) {
      request(options, function(err, httpResponse, data) {
        if (err) {
          return reject(err);
        }
        return resolve({ httpResponse: httpResponse, data: data });
      });
    });
  }
  setRootUrl(rootUrl: string) {
    if (!rootUrl) {
      throw new Error('You must set a valid rootUsrl.');
    }
    this.API_URI = rootUrl;
  }

  setApp(app) {
    checkCredential('app', app);
    this.app = app;
  }

  async sendNotification(
    notification: Notification
  ): Promise<SendNotificationResponse> {
    if (!notification || !notification.postBody) {
      throw new Error(
        'notification parameter must be a typeof Notification object.'
      );
    }
    const postBody = notification.postBody;
    if (this.apps && this.apps.length > 0) {
      postBody.app_ids = this.apps;
      return await this.basicRequest(
        this.API_URI + Constants.NOTIFICATIONS_PATH,
        this.userAuthKey,
        'POST',
        postBody
      );
    }
    if (this.app) {
      postBody.app_id = this.app.appId;
      return await this.basicRequest(
        this.API_URI + Constants.NOTIFICATIONS_PATH,
        this.app.appAuthKey,
        'POST',
        postBody
      );
    }
    throw new Error('You must set either an "app" or "apps" on Client');
  }

  async cancelNotification(notificationId: string): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    const notificationUri =
      this.API_URI +
      Constants.NOTIFICATIONS_PATH +
      '/' +
      notificationId +
      '?app_id=' +
      this.app.appId;
    return await this.basicRequest(
      notificationUri,
      this.app.appAuthKey,
      'DELETE',
      null
    );
  }

  async viewNotification(notificationId: string): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    const notificationUri =
      this.API_URI +
      Constants.NOTIFICATIONS_PATH +
      '/' +
      notificationId +
      '?app_id=' +
      this.app.appId;
    return await this.basicRequest(
      notificationUri,
      this.app.appAuthKey,
      'GET',
      null
    );
  }

  async viewNotifications(query: {
    limit: number;
    offset: number;
  }): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    const appUri =
      this.API_URI +
      Constants.NOTIFICATIONS_PATH +
      '?app_id=' +
      this.app.appId +
      '&' +
      query;
    return await this.basicRequest(appUri, this.app.appAuthKey, 'GET', null);
  }

  async viewApps(): Promise<any> {
    if (!this.userAuthKey) {
      throw new Error('You must define "userAuthKey" on Client');
    }
    return await this.basicRequest(
      this.API_URI + Constants.APPS_PATH,
      this.userAuthKey,
      'GET',
      null
    );
  }

  async viewApp(appId: string): Promise<any> {
    if (!this.userAuthKey) {
      throw new Error('You must define "userAuthKey" on Client');
    }
    return await this.basicRequest(
      this.API_URI + Constants.APPS_PATH + '/' + appId,
      this.userAuthKey,
      'GET',
      null
    );
  }

  async createApp(body): Promise<any> {
    if (!body.name) {
      throw new Error('You must specify a name in body');
    }
    if (!this.userAuthKey) {
      throw new Error('You must define "userAuthKey" on Client');
    }
    return await this.basicRequest(
      this.API_URI + Constants.APPS_PATH,
      this.userAuthKey,
      'POST',
      body
    );
  }

  async updateApp(body): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    if (!this.userAuthKey) {
      throw new Error('You must define "userAuthKey" on Client');
    }
    return await this.basicRequest(
      this.API_URI + Constants.APPS_PATH + '/' + this.app.appId,
      this.userAuthKey,
      'PUT',
      body
    );
  }

  async viewDevices<T>(query: {
    limit: number;
    offset: number;
  }): Promise<{ data: DevicesData<T> }> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    const viewUri =
      this.API_URI +
      Constants.DEVICES_PATH +
      '?app_id=' +
      this.app.appId +
      '&' +
      query;
    return await this.basicRequest(viewUri, this.app.appAuthKey, 'GET', null);
  }

  async viewDevice(deviceId: string): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    const viewUri =
      this.API_URI +
      Constants.DEVICES_PATH +
      '/' +
      deviceId +
      '?app_id=' +
      this.app.appId;
    return await this.basicRequest(viewUri, this.app.appAuthKey, 'GET', null);
  }

  async addDevice(body): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    if (!('app_id' in body)) {
      body.app_id = this.app.appId;
    }
    return await this.basicRequest(
      this.API_URI + Constants.DEVICES_PATH,
      this.app.appAuthKey,
      'POST',
      body
    );
  }

  async editDevice(deviceId: string, body): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    return await this.basicRequest(
      this.API_URI + Constants.DEVICES_PATH + '/' + deviceId,
      this.app.appAuthKey,
      'PUT',
      body
    );
  }

  async trackOpen(notificationId: string, body): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    if (!('app_id' in body)) {
      body.app_id = this.app.appId;
    }
    return await this.basicRequest(
      this.API_URI + Constants.NOTIFICATIONS_PATH + '/' + notificationId,
      this.app.appAuthKey,
      'PUT',
      body
    );
  }

  async csvExport(body): Promise<any> {
    if (!this.app) {
      throw new Error('You must define an "app" object.');
    }
    const csvUri =
      this.API_URI +
      Constants.DEVICES_PATH +
      '/csv_export' +
      '?app_id=' +
      this.app.appId;
    return await this.basicRequest(csvUri, this.app.appAuthKey, 'POST', body);
  }
}
