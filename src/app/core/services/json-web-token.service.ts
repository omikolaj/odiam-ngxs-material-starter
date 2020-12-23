import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { JsonWebTokenModel } from '../models/json-web-token-model';
import { LogService } from '../logger/log.service';

@Injectable({
	providedIn: 'root'
})
export class JsonWebTokenService {
	constructor(private log: LogService) {}

	getSubClaim(access_token: string): string {
		const decoded = this._getRawJwt(access_token);
		if (decoded === null) {
			return '';
		}
		return decoded.sub;
	}

	private _getRawJwt(jwt: string): JsonWebTokenModel {
		return this._decodeJwt(jwt);
	}

	private _decodeJwt(jwt: string): JsonWebTokenModel {
		try {
			return jwt_decode(jwt);
		} catch (error) {
			this.log.error('Failed to decode jwt.', this, error);
			return null;
		}
	}
}
