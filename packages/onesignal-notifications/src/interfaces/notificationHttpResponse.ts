/* eslint-disable @typescript-eslint/no-explicit-any */
import { Domain } from 'domain';
import { ClientRequest } from 'http';
import { TLSSocket } from 'tls';

import { SendNotificationDataResponse } from './notificationDataResponse';

export interface SendNotificationHttpResponse {
  _consuming: boolean;
  _dumped: boolean;
  _events: any;
  _eventsCount: number;
  _maxListeners: number;
  _readableState: any;
  body: SendNotificationDataResponse;
  caseless: { dict: Record<string, any> };
  client: TLSSocket;
  complete: true;
  connection: TLSSocket;
  destroyed: boolean;
  domain: Domain;
  headers: Record<string, any>;
  httpVersion: string;
  httpVersionMajor: number;
  httpVersionMinor: number;
  method: any;
  rawHeaders: Array<{ [key: string]: string }>;
  rawTrailers: Array<any>;
  read: (size?: number) => Buffer | null;
  readable: boolean;
  req: ClientRequest;
  request: Request;
  socket: TLSSocket;
  statusCode: number;
  statusMessage: string;
  trailers: Record<string, any>;
  toJSON: () => Record<string, any>;
  upgrade: boolean;
  url: string;
}
