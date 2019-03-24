import { toKebabCase } from '../Helper/StringHelpers'
import ArModel from '../Model/ArModel'
import { Pagination } from './Pagination'
import { Dao } from '../DAO/Dao'
import { ApiContract } from '../Api/ApiContract'

export default class LaravelQuery {
  private readonly $api: ApiContract

  private $resource: string = ''
  private $criteria: Dao = {}
  private $payload: Dao = {}
  private $pagination: Dao = {}
  private $urlWasExpanded = false

  constructor (api: ApiContract) {
    this.$api = api
  }

  public to (resource: string | ArModel): this {
    if (resource instanceof ArModel) {
      if (resource.getResource()) {
        this.$resource = `/${resource.getResource()}`
        return this
      }
      this.$resource = `/${toKebabCase(resource.constructor.name)}s`
      return this
    }

    this.$resource = resource
    return this
  }

  private getResource (): string {
    return this.$resource
  }

  public expandUrl (url?: string | number | null): this {
    this.$resource = this.makeUrl(url)
    return this
  }

  public makeUrl (urlPartial?: string | number | null) {
    let baseUrl = this.getResource()

    if (urlPartial) {
      baseUrl = `${baseUrl}/${urlPartial}`
    }
    return baseUrl
  }

  public setCriteria (criteria: Dao): this {
    this.$criteria = criteria
    return this
  }

  paginate (page: number = 1, perPage: number = 30) {
    const payload = {
      ...this.$criteria,
      page,
      perPage
    }
    return this.get(payload)
  }

  public async get (payload?: Dao, url?: string): Promise<Dao> {
    if (!payload) {
      payload = {
        ...this.$criteria,
        ...this.$pagination
      }
    }
    if (!url) {
      url = this.makeUrl()
    }
    return this.$api.get(url, payload)
  }

  public async first (): Promise<Dao | null> {
    const result = await this.get()
    if (!Array.isArray(result)) {
      return result
    }
    if (result.length) {
      return result[0]
    }
    return null
  }

  public async post (payload?: object, url?: string): Promise<Dao> {
    if (!payload) {
      payload = this.$payload
    }
    if (!url) {
      url = this.makeUrl()
    }
    return this.$api.post(url, payload)
  }

  public async put (payload?: object, url?: string): Promise<Dao> {
    if (!payload) {
      payload = this.$payload
    }
    if (!url) {
      url = this.makeUrl()
    }
    return this.$api.put(url, payload)
  }

  public async delete (payload?: object, url?: string): Promise<void> {
    if (!payload) {
      payload = this.$payload
    }
    if (!url) {
      url = this.makeUrl()
    }
    return this.$api.delete(url, payload)
  }

  public setPagination (pagination: Pagination) {
    this.$pagination = pagination
    return this
  }

  public setPayload (payload: object): this {
    this.$payload = payload
    return this
  }
}
