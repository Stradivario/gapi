/* eslint-disable @typescript-eslint/no-explicit-any */
import { SendNotificationResponse } from './notificationResponse';

export interface OneSignalClient {
  setRootUrl(rootUrl: string): void;
  setApp(app): void;
  sendNotification(notification, callback?): Promise<SendNotificationResponse>;
  cancelNotification(notificationId, callback): Promise<any>;
  viewNotification(notificationId, callback): Promise<any>;
  viewNotifications(query, callback): Promise<any>;
  viewApps(callback): Promise<any>;
  viewApp(appId, callback): Promise<any>;
  createApp(body, callback): Promise<any>;
  updateApp(body, callback): Promise<any>;
  viewDevices(query, callback): Promise<any>;
  viewDevice(deviceId, callback): Promise<any>;
  addDevice(body, callback): Promise<any>;
  editDevice(deviceId, body, callback): Promise<any>;
  trackOpen(notificationId, body, callback): Promise<any>;
  csvExport(body, callback): Promise<any>;
}
