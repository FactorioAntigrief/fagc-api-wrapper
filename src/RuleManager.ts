import fetch from "node-fetch"
import { ManagerOptions } from "./types/types"
import { Rule, ApiID } from "./types/apitypes"
import BaseManager from "./BaseManager"
import strictUriEncode from "strict-uri-encode"

export class RuleManager extends BaseManager<Rule> {
	public apikey?: string
	private apiurl: string
	constructor(apiurl: string, apikey?: string, options: ManagerOptions = {}) {
		super(options)
		if (apikey) this.apikey = apikey
		this.apiurl = apiurl
	}
	async fetchRule(ruleid: ApiID, cache=true, force=false): Promise<Rule|null> {
		if (!force) {
			const cached = this.cache.get(ruleid)
			if (cached) return cached
		}
		
		const fetched = await fetch(`${this.apiurl}/rules/getid?id=${strictUriEncode(ruleid)}`).then(r=>r.json())

		if (!fetched || !fetched.id) return null // return null if the fetch is empty
		
		if (cache) this.add(fetched)
		if (fetched?.id === ruleid) return fetched
		return null
	}
	async fetchAll(cache=true): Promise<Rule[]> {
		const allRules = await fetch(`${this.apiurl}/rules/getall`).then(r=>r.json())
		
		if (cache && allRules[0])
			return allRules.map(rule => this.add(rule))
		
		return allRules
	}
	resolveID(ruleid: string): Rule {
		const cached = this.cache.get(ruleid)
		if (cached) return cached
		return null
	}
}