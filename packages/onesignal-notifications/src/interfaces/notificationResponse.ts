import { SendNotificationDataResponse } from './notificationDataResponse';
import { SendNotificationHttpResponse } from './notificationHttpResponse';

export interface SendNotificationResponse {
  data: SendNotificationDataResponse;
  httpResponse: SendNotificationHttpResponse;
}
