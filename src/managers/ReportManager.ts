import fetch from "isomorphic-fetch"
import {
	ManagerOptions,
	RequestConfig,
	WrapperOptions,
	DefaultProps,
	GenericAPIError,
	NoAuthError,
	UnsuccessfulRevocationError,
} from "../types"
import { Revocation, Report, CreateReport, ApiID } from "fagc-api-types"
import BaseManager from "./BaseManager"
import strictUriEncode from "strict-uri-encode"

export default class ReportManager extends BaseManager<Report> {
	private apiurl: string
	private createRevocation: (revocationObject: Revocation) => void

	constructor(
		options: WrapperOptions,
		createRevocation: (revocationObject: Revocation) => void,
		managerOptions: ManagerOptions = {}
	) {
		super(managerOptions)
		if (options.apikey) this.apikey = options.apikey
		this.apiurl = options.apiurl
		this.createRevocation = createRevocation
	}

	async fetchReport({
		reportid,
		cache = true,
		force = false,
	}: {
		reportid: ApiID
		cache?: boolean
		force?: boolean
	}): Promise<Report | null> {
		if (!force) {
			const cached =
				this.cache.get(reportid) || this.fetchingCache.get(reportid)
			if (cached) return cached
		}

		let promiseResolve: (value: unknown) => void
		const fetchingPromise: Promise<Report | null> = new Promise(
			(resolve) => {
				promiseResolve = resolve
			}
		)

		this.fetchingCache.set(reportid, fetchingPromise)

		const fetched = await fetch(
			`${this.apiurl}/reports/${strictUriEncode(reportid)}`,
			{
				credentials: "include",
			}
		).then((c) => c.json())

		if (!fetched) return null // return null if the fetch is empty
		if (fetched.error)
			throw new GenericAPIError(`${fetched.error}: ${fetched.message}`)
		fetched.reportedTime = new Date(fetched.reportedTime)
		if (cache) this.add(fetched)
		promiseResolve(fetched)
		setTimeout(() => {
			this.fetchingCache.sweep((data) => typeof data.then === "function")
		}, 0)
		return fetched
	}
	async fetchAllName({
		playername,
		cache,
	}: {
		playername: string
		cache?: boolean
	}): Promise<Report[]> {
		const allReports = await fetch(
			`${this.apiurl}/reports/getplayer/${strictUriEncode(playername)}`,
			{
				credentials: "include",
			}
		).then((c) => c.json())

		if (allReports.error)
			throw new GenericAPIError(
				`${allReports.error}: ${allReports.message}`
			)

		if (cache && allReports[0]) {
			allReports.forEach((report) => {
				report.reportedTime = new Date(report.reportedTime)
				this.add(report)
			})
		}
		return allReports
	}

	async fetchModifiedSince({
		timestamp,
		cache = true,
	}: {
		timestamp: Date
		cache?: boolean
	}): Promise<Report[]> {
		const reports = await fetch(
			`${this.apiurl}/reports/modifiedSince/${timestamp.toISOString()}`,
			{
				credentials: "include",
			}
		).then((c) => c.json())

		if (reports.error)
			throw new GenericAPIError(`${reports.error}: ${reports.message}`)

		if (cache) {
			reports.forEach((report) => {
				report.reportedTime = new Date(report.reportedTime)
				report.timestamp = new Date(report.timestamp)
				this.add(report)
			})
		}
		return reports
	}

	resolveID(reportid: ApiID): Report | null {
		const cached = this.cache.get(reportid)
		if (cached) return cached
		return null
	}
	async fetchByRule({
		ruleid,
		cache = true,
	}: {
		ruleid: ApiID
		cache?: boolean
	}): Promise<Report[]> {
		const ruleReports = await fetch(
			`${this.apiurl}/reports/rule/${strictUriEncode(ruleid)}`,
			{
				credentials: "include",
			}
		).then((c) => c.json())
		if (cache) {
			ruleReports.forEach((report) => {
				report.reportedTime = new Date(report.reportedTime)
				this.add(report)
			})
		}
		return ruleReports
	}
	async create({
		report,
		cache = true,
		reqConfig = {},
	}: {
		report: CreateReport
		cache?: boolean
	} & DefaultProps): Promise<Report> {
		if (
			!reqConfig.masterapikey &&
			!this.masterapikey &&
			!reqConfig.communityId &&
			!this.communityId
		)
			throw new NoAuthError()
		const authentication =
			reqConfig?.communityId || this.communityId
				? `Cookie ${reqConfig?.communityId || this.communityId}` // auth method is cookie
				: `Token ${reqConfig?.apikey || this.apikey}` // auth method is api key

		const create = await fetch(`${this.apiurl}/reports`, {
			method: "POST",
			body: JSON.stringify(report),
			credentials: "include",
			headers: {
				authorization: authentication,
				"content-type": "application/json",
			},
		}).then((u) => u.json())

		if (create.error)
			throw new GenericAPIError(`${create.error}: ${create.message}`)
		create.reportedTime = new Date(create.reportedTime)
		if (cache) this.add(create)
		return create
	}
	async revoke({
		reportid,
		adminId,
		cache = true,
		reqConfig = {},
	}: {
		reportid: ApiID
		adminId: string
		cache?: boolean
	} & DefaultProps): Promise<Revocation> {
		if (
			!reqConfig.masterapikey &&
			!this.masterapikey &&
			!reqConfig.communityId &&
			!this.communityId
		)
			throw new NoAuthError()
		const authentication =
			reqConfig?.communityId || this.communityId
				? `Cookie ${reqConfig?.communityId || this.communityId}` // auth method is cookie
				: `Token ${reqConfig?.apikey || this.apikey}` // auth method is api key

		const revoked = await fetch(`${this.apiurl}/reports`, {
			method: "DELETE",
			body: JSON.stringify({
				id: reportid,
				adminId: adminId,
			}),
			credentials: "include",
			headers: {
				authorization: authentication,
				"content-type": "application/json",
			},
		}).then((u) => u.json())

		if (revoked.error)
			throw new GenericAPIError(`${revoked.error}: ${revoked.message}`)

		if (!revoked?.revokedTime) throw new UnsuccessfulRevocationError()
		revoked.reportedTime = new Date(revoked.reportedTime)
		revoked.revokedTime = new Date(revoked.revokedTime)
		if (cache) this.createRevocation(revoked)
		this.cache.sweep((report) => report.id === reportid) // remove the revoked report from cache as it isnt working anymore
		return revoked
	}
	async revokeAllName({
		playername,
		adminId,
		cache = true,
		reqConfig,
	}: {
		playername: string
		adminId: string
		cache?: boolean
	} & DefaultProps): Promise<Revocation[] | null> {
		if (
			!reqConfig.masterapikey &&
			!this.masterapikey &&
			!reqConfig.communityId &&
			!this.communityId
		)
			throw new NoAuthError()
		const authentication =
			reqConfig?.communityId || this.communityId
				? `Cookie ${reqConfig?.communityId || this.communityId}` // auth method is cookie
				: `Token ${reqConfig?.apikey || this.apikey}` // auth method is api key

		const revoked = await fetch(`${this.apiurl}/reports/revokeallname`, {
			method: "DELETE",
			body: JSON.stringify({
				playername: playername,
				adminId: adminId,
			}),
			credentials: "include",
			headers: {
				authorization: authentication,
				"content-type": "application/json",
			},
		}).then((u) => u.json())

		if (revoked.error)
			throw new GenericAPIError(`${revoked.error}: ${revoked.message}`)

		revoked.forEach((revocation) => {
			if (!revocation?.reportedTime)
				throw new UnsuccessfulRevocationError()
			revocation.reportedTime = new Date(revocation.reportedTime)
			revocation.revokedTime = new Date(revocation.revokedTime)
			if (cache) this.createRevocation(revocation)
		})
		this.cache.sweep((report) => report.playername === playername) // remove the revoked report from cache as it isnt working anymore
		return revoked
	}
}
