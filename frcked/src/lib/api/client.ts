import PocketBase from 'pocketbase';
import { getPocketBaseInstance } from '../utils/config.svelte.js';
import { AuthCrudClient } from './auth/crud.js';

export class ApiClient {
	private pb: PocketBase;
	private _auth: AuthCrudClient;

	constructor() {
		// Use the shared PocketBase instance from config
		this.pb = getPocketBaseInstance();

		// Pass the shared PocketBase instance to each CRUD client
		this._auth = new AuthCrudClient(this.pb);
	}

	getPocketBase(): PocketBase {
		return this.pb;
	}

	get auth() {
		return this._auth;
	}
}
