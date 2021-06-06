import { Snowflake } from "discord-api-types"

export type ApiID = string


export interface Common {
  id: ApiID
  // here, there should be everything that keys can be
  [key: string]: string|boolean|Snowflake|Date|Violation[]
}

// export interface Community & Common {
// 	id: ApiID
// 	name: string
// 	contact: Snowflake
// 	guildid: Snowflake
// }
// export interface CreateViolation {
// 	playername: string
// 	brokenRule: ApiID
// 	proof?: string
// 	description?: string
// 	automated?: boolean
// 	violatedTime?: Date
// 	adminid: string
// }


// This exists so that creating a violation doesn't need an ID and some stuff is optional
export interface CreateViolation {
	playername: string
	brokenRule: ApiID
	proof?: string
	description?: string
	automated?: boolean
	violatedTime?: Date
	adminid: string
}
interface _Violation extends Common, CreateViolation {}
export type Violation = Required<_Violation>

export interface Revocation extends Violation {
	revokedTime: Date
	revokedBy: string
}

export interface Offense extends Common {
	playername: string
	communityid: ApiID
	id: ApiID
	violations: Violation[]
}

export interface Community extends Common {
	name: string
	contact: Snowflake
	guildid: Snowflake
}
export interface Rule extends Common {
	shortdesc: string
	longdesc: string
}

export interface CommunityConfig {
	trustedCommunities?: ApiID[]
	ruleFilters?: ApiID[]
	guildid: string
	contact: string,
	moderatorroleId: string,
	communityname: string
}
export interface SetCommunityConfig {
	trustedCommunities?: ApiID[]
	ruleFilters?: ApiID[]
	guildid?: string
	contact?: string,
	moderatorroleId?: string,
	communityname?: string
}