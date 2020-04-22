/* eslint-disable @typescript-eslint/no-explicit-any */
const ALLOWED_FIELDS = [
  'contents',
  'included_segments',
  'excluded_segments',
  'filters',
  'include_player_ids',
  'app_id',
  'app_ids',
  'headings',
  'subtitle',
  'template_id',
  'content_available',
  'mutable_content',
  'data',
  'url',
  'ios_attachments',
  'big_picture',
  'adm_big_picture',
  'chrome_big_picture',
  'buttons',
  'web_buttons',
  'ios_category',
  'android_background_layout',
  'small_icon',
  'large_icon',
  'adm_small_icon',
  'adm_large_icon',
  'chrome_web_icon',
  'chrome_web_image',
  'firefox_icon',
  'chrome_icon',
  'ios_sound',
  'android_sound',
  'android_led_color',
  'android_accent_color',
  'android_visibility',
  'adm_sound',
  'ios_badgeType',
  'ios_badgeCount',
  'collapse_id',
  'send_after',
  'delayed_option',
  'delivery_time_of_day',
  'ttl',
  'priority',
  'android_group',
  'android_group_message',
  'adm_group',
  'adm_group_message',
  'isIos',
  'isAndroid',
  'isAnyWeb',
  'isChromeWeb',
  'isFirefox',
  'isSafari',
  'isWP',
  'isWP_WNS',
  'isAdm',
  'isChrome',
  'android_channel_id',
  'existing_android_channel_id',
];

export interface PostBody {
  contents: {
    [key: string]: string;
  };
  data: any;
  content_available: any;
  template_id: any;
  included_segments: any;
  excluded_segments: any;
  filters: any;
  app_ids;
  app_id;
  include_player_ids: string[];
}

interface ClientNotification {
  postBody: PostBody;
  setContent(contents): void;
  setExcludedSegments(excludedSegments: string[]): void;
  setFilters(filters: string): void;
  setIncludedSegments(includedSegments: string[]): void;
  setParameter(name: string, value: any): void;
  setTargetDevices(include_player_ids: string[]): void;
}

export class Notification {
  public initialBody: {
    contents?: any;
    content_available?: any;
    template_id?: any;
  };
  public postBody: PostBody;
  public allowed_fields: string[] = ALLOWED_FIELDS;

  constructor(initialBody: {
    contents?: any;
    content_available?: any;
    template_id?: any;
  }) {
    this.initialBody = initialBody;
    this.postBody = {} as never;

    if (initialBody.constructor !== Object) {
      throw new Error('Body must be a JSON object');
    }

    if ('contents' in initialBody) {
      this.postBody.contents = this.initialBody.contents;
      return;
    }

    if ('content_available' in initialBody) {
      this.postBody.content_available = this.initialBody.content_available;
      return;
    }

    if ('template_id' in initialBody) {
      this.postBody.template_id = this.initialBody.template_id;
      return;
    }

    throw new Error(
      'Body must include one of the following fields: contents, content_available, template_id'
    );
  }

  setParameter(name: string, value) {
    if (name && name[0] === '!') {
      name = name.substring(1);
    } else if (ALLOWED_FIELDS.indexOf(name) === -1) {
      throw new Error(
        '"' +
          name +
          '" is not present in documentation. You should add a ' +
          'exclamation mark to the begging of the name, if you want to set it : !' +
          name
      );
    }
    this.postBody[name] = value;
    return this;
  }

  setContent(contents) {
    this.postBody.contents = contents;
    return this;
  }

  setIncludedSegments<T>(included_segments: T[]) {
    this.postBody.included_segments = included_segments;
    return this;
  }

  setExcludedSegments<T>(excluded_segments: T[]) {
    this.postBody.excluded_segments = excluded_segments;
    return this;
  }

  setFilters(filters: any) {
    this.postBody.filters = filters;
    return this;
  }

  setTargetDevices(include_player_ids: string[]) {
    this.postBody.include_player_ids = include_player_ids;
    return this;
  }
}
