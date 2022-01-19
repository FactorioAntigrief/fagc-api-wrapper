import { Common } from "fagc-api-types"
import { NoAuthError, RequestConfig } from "."
import BaseManager from "./managers/BaseManager"

/**
 * A function that checks whether an api key is set in the reqConfig object or on the class, if it isnt it throws an error.
 * 
 * @throws NoAuthError if the API key is not set
 * @returns String to use for the Authorization header, created from original `reqConfig` or the class
 */
export const authenticate = <X, T extends Common>(manager: X & BaseManager<T>, reqConfig: RequestConfig): string => {
	const apikey = reqConfig.apikey || manager.apikey
	if (!apikey) throw new NoAuthError()
	return `Token ${apikey}`
}

/**
 * A function that checks whether an api key is set in the reqConfig object or on the class, if it isnt it returns null.
 * 
 * @returns String to use for the Authorization header, created from original `reqConfig` or the class
 */
export const optionalAuthenticate = <X, T extends Common>(manager: X & BaseManager<T>, reqConfig: RequestConfig): string | null => {
	const apikey = reqConfig.apikey || manager.apikey
	if (!apikey) return null
	return `Token ${apikey}`
}

/**
 * A function that checks whether an api key is set in the reqConfig object or on the class, if it isnt it throws an error.
 * 
 * @throws NoAuthError if the API key is not set
 * @returns String to use for the Authorization header, created from original `reqConfig` or the class
 */
export const masterAuthenticate = <X, T extends Common>(manager: X & BaseManager<T>, reqConfig: RequestConfig): string => {
	const masterapikey = reqConfig.masterapikey || manager.masterapikey
	if (!masterapikey) throw new NoAuthError()
	return `Token ${masterapikey}`
}

/**
 * A function that checks whether an api key is set in the reqConfig object or on the class, if it isnt it throws an error.
 * 
 * @throws NoAuthError if the API key is not set
 * @returns String to use for the Authorization header, created from original `reqConfig` or the class
 */
export const optionalMasterAuthenticate = <X, T extends Common>(manager: X & BaseManager<T>, reqConfig: RequestConfig): string | null => {
	const masterapikey = reqConfig.masterapikey || manager.masterapikey
	if (!masterapikey) return null
	return `Token ${masterapikey}`
}