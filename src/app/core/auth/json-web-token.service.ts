import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { JsonWebToken } from '../models/json-web-token.model';
import { LogService } from '../logger/log.service';

/**
 * Json web token service.
 */
@Injectable({
	providedIn: 'root'
})
export class JsonWebTokenService {
	/**
	 * Creates an instance of json web token service.
	 * @param _log
	 */
	constructor(private _log: LogService) {}

	/**
	 * Gets subject claim from the access_token.
	 * @param access_token
	 * @returns sub claim
	 */
	getSubClaim(access_token: string): string {
		this._log.trace('getSubClaim executed.', this);
		const decoded = this._getRawJwt(access_token);
		if (decoded === null) {
			this._log.debug('[getSubClaim] decoded value is null.', this);
			return '';
		}
		return decoded.sub;
	}

	/**
	 * Gets raw jwt.
	 * @param jwt
	 * @returns raw jwt
	 */
	private _getRawJwt(jwt: string): JsonWebToken {
		return this._decodeJwt(jwt);
	}

	/**
	 * Decodes jwt.
	 * @param jwt
	 * @returns jwt
	 */
	private _decodeJwt(jwt: string): JsonWebToken {
		this._log.trace('_getRawJwt executed.', this);
		try {
			this._log.debug('jwt_decode executing.', this);
			return jwt_decode(jwt);
		} catch (error) {
			this._log.error('Failed to decode jwt.', this, error);
			return null;
		}
	}
}
