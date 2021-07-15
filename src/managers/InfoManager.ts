import fetch from "isomorphic-fetch"
import { ManagerOptions } from "../types/types"
import { Webhook } from "fagc-api-types"
import BaseManager from "./BaseManager"
import { GenericAPIError } from "../types"

export default class InfoManager extends BaseManager<Webhook> {
	public apikey?: string
	private apiurl: string
	constructor(apiurl: string, apikey?: string, opts: ManagerOptions = {}) {
		super(opts)
		if (apikey) this.apikey = apikey
		this.apiurl = apiurl
	}
	async addWebhook(webhookid: string, webhooktoken: string, guildid: string): Promise<Webhook> {
		const add = await fetch(`${this.apiurl}/informatics/addwebhook`, {
			method: "POST",
			body: JSON.stringify({
				id: webhookid,
				token: webhooktoken,
				guildId: guildid
			}),
			headers: { "content-type": "application/json" },
		}).then(w=>w.json())
		console.log({add})
		if (add.error) throw new GenericAPIError(`${add.error}: ${add.description}`)
		return add
	} 
	async removeWebhook(webhookid: string, webhooktoken: string, guildid: string): Promise<Webhook> {
		const add = await fetch(`${this.apiurl}/informatics/removewebhook`, {
			method: "DELETE",
			body: JSON.stringify({
				id: webhookid,
				token: webhooktoken,
				guildId: guildid
			}),
			headers: { "content-type": "application/json" },
		}).then(w=>w.json())
		return add
	} 
}