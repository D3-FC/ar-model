import { toKebabCase } from '../Helper/StringHelpers'
import ArModel from '../Model/ArModel'
import { Pagination } from './Pagination'
import { Dao } from '../DAO/Dao'
import { ApiContract } from '../Api/ApiContract'
import { QueryContract } from '../Model/QueryContract'
import { ModelContract } from './ModelContract'

export default class LaravelQuery implements QueryContract {
  private readonly $api: ApiContract

  private $resource: string = ''
  private $criteria: Dao = {}
  private $payload: Dao = {}
  private $pagination: Dao = {}
  private $urlWasExpanded = false

  constructor (api: ApiContract) {
    this.$api = api
  }

  to (resource: string | ModelContract): this {
    if (resource instanceof ArModel) {
      if (resource.getResource()) {
        this.$resource = `/${resource.getResource()}`
        return this
      }
      this.$resource = `/${toKebabCase(resource.constructor.name)}s`
      return this
    }

    this.$resource = resource as string
    return this
  }

  private getResource (): string {
    return this.$resource
  }

  expandUrl (url?: string | number | null): this {
    this.$resource = this.makeUrl(url)
    return this
  }

  makeUrl (urlPartial?: string | number | null) {
    let baseUrl = this.getResource()

    if (urlPartial) {
      baseUrl = `${baseUrl}/${urlPartial}`
    }
    return baseUrl
  }

  setCriteria (criteria: Dao): this {
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

  async get (payload?: Dao, url?: string): Promise<any> {
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

  async first (): Promise<Dao | null> {
    const result = await this.get()
    if (!Array.isArray(result)) {
      return result
    }
    if (result.length) {
      return result[0]
    }
    return null
  }

  async post (payload?: object, url?: string): Promise<any> {
    if (!payload) {
      payload = this.$payload
    }
    if (!url) {
      url = this.makeUrl()
    }
    return this.$api.post(url, payload)
  }

  async put (payload?: object, url?: string): Promise<any> {
    if (!payload) {
      payload = this.$payload
    }
    if (!url) {
      url = this.makeUrl()
    }
    return this.$api.put(url, payload)
  }

  async delete (payload?: object, url?: string): Promise<any> {
    if (!payload) {
      payload = this.$payload
    }
    if (!url) {
      url = this.makeUrl()
    }
    return this.$api.delete(url, payload)
  }

  setPagination (pagination: Pagination) {
    this.$pagination = pagination
    return this
  }

  setPayload (payload: object): this {
    this.$payload = payload
    return this
  }
}
