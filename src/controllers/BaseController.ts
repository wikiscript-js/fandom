import type { BaseEndpoint, RequestManager } from '@wikiscript/core'
import type { Fandom } from '../strategies'

export abstract class BaseController<Endpoint extends BaseEndpoint<Fandom>> {
	public abstract readonly controller: string
	public readonly endpoint: Endpoint
	public readonly request: RequestManager

	public static readonly attachmentsDefault = Object.freeze( {
		atMentions: [],
		contentImages: [],
		openGraphs: []
	} )

	public constructor( endpoint: Endpoint ) {
		this.endpoint = endpoint
		this.request = endpoint.wiki.request
	}

	protected get( searchParams: Record<string, string> ): ReturnType<RequestManager[ 'raw' ]> {
		const usp = new URLSearchParams( {
			controller: this.controller,
			...searchParams
		} ).toString()
		const url = new URL( `?${ usp }`, this.endpoint.url )
		return this.raw( url, {
			method: 'GET'
		} )
	}

	protected getUrl( params: Record<string, string> ): URL {
		const searchParams = new URLSearchParams( params ).toString()
		return new URL( `?${ searchParams }`, this.endpoint.url )
	}

	protected post( body: Record<string, unknown>, contentType?: 'application/json' ): ReturnType<RequestManager[ 'raw' ]>
	protected post( body: Record<string, string>, contentType?: string ): ReturnType<RequestManager[ 'raw' ]>
	protected post( body: Record<string, string> | Record<string, unknown>, contentType?: string ): ReturnType<RequestManager[ 'raw' ]> {
		let requestBody: string | FormData
		const headers: Record<string, string | undefined> = {
			'content-type': contentType ?? 'application/x-www-form-urlencoded'
		}

		let { url } = this.endpoint
		if ( contentType === 'application/json' && !( body instanceof FormData ) ) {
			const { method, ...json } = body
			requestBody = JSON.stringify( json )
			url = new URL( `?controller=${ this.controller }&method=${ method }`, url )
		} else {
			requestBody = new URLSearchParams( body as Record<string, string> ).toString()
		}

		return this.raw( url, {
			body: requestBody,
			headers,
			method: 'POST'
		} )
	}

	protected raw( url: string | URL, fetchOptions: NonNullable<Parameters<RequestManager[ 'raw' ]>[ 1 ]> ): ReturnType<RequestManager[ 'raw' ]> {
		return this.request.raw(
			url,
			{
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				...fetchOptions
			},
			{ cookieUrl: this.endpoint.wiki.platform.services }
		)
	}
}
