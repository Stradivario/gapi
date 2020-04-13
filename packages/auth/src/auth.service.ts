import { Inject, Service } from '@rxdi/core';
import { createCipheriv, createDecipheriv } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import * as Moment from 'moment';

import { AUTH_MODULE_CONFIG, AuthModuleConfig, TokenData } from './auth.config';

@Service()
export class AuthInternalService {
  constructor(@Inject(AUTH_MODULE_CONFIG) private config: AuthModuleConfig) {}

  verifyToken(token): TokenData {
    return verify(token, this.config.cert, { algorithm: 'HS256' });
  }

  decrypt(password: string) {
    const decipher = createDecipheriv(
      this.config.cyper.algorithm,
      this.config.cyper.privateKey,
      this.config.cyper.iv
    );
    let dec = decipher.update(password, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }

  encrypt(password: string) {
    const cipher = createCipheriv(
      this.config.cyper.algorithm,
      this.config.cyper.privateKey,
      this.config.cyper.iv
    );
    let crypted = cipher.update(password, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  validate(token, callback) {
    // Check token timestamp
    const ttl = 30 * 1000 * 60;
    const diff = Moment().diff(Moment(token.iat * 1000));
    if (diff > ttl) {
      return callback(null, false);
    }
    callback(null, true, token);
  }

  sign(tokenData: TokenData): string {
    return sign(tokenData, this.config.cert, {
      algorithm: this.config.algorithm
    });
  }
}
