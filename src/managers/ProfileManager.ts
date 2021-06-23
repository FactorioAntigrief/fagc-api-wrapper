import fetch from "isomorphic-fetch"
import { ManagerOptions } from "../types/types"
import { ApiID, Profile, Report } from "../types/apitypes"
import BaseManager from "./BaseManager"
import strictUriEncode from "strict-uri-encode"

export default class ProfileManager extends BaseManager<Report> {
	public apikey?: string
	private apiurl: string
	constructor(apiurl: string, apikey?: string, options: ManagerOptions = {}) {
		super(options)
		if (apikey) this.apikey = apikey
		this.apiurl = apiurl
	}
	async fetchCommunity(playername: string, communityId: ApiID): Promise<Profile> {
		const fetched = await fetch(`${this.apiurl}/profiles/getcommunity?playername=${strictUriEncode(playername)}&communityId=${strictUriEncode(communityId)}`)
			.then(o=>o.json())
		return fetched
	}
	async fetchAll(playername: string): Promise<Profile[]> {
		const fetched = await fetch(`${this.apiurl}/profiles/getall?playername=${strictUriEncode(playername)}`)
			.then(o=>o.json())
		return fetched
	}
}