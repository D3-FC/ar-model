import { ApiContract } from '../Api/ApiContract'
import { ValidationError } from '../Error/Validation/ValidationError'
import HoldExecutor from '../Executor/HoldExecutor'
import { Dao } from '../DAO/Dao'
import { QueryContract } from './QueryContract'
import LaravelQuery from '../Query/LaravelQuery'
import { ArCollection } from '../Collection/ArCollection'
import { clone } from '../Helper/CloneHelpers'
import { ModelContract } from '../Query/ModelContract'

export default class ArModel implements ModelContract {
  protected readonly $resource: string = ''
  protected readonly $api: ApiContract

  protected readonly $idKey: string = 'id'
  protected $error: ValidationError = new ValidationError()

  protected readonly $updateExecutor: HoldExecutor = new HoldExecutor(this.updateAction)
  protected readonly $storeExecutor: HoldExecutor = new HoldExecutor(() => this.storeAction())
  protected readonly $destroyExecutor: HoldExecutor = new HoldExecutor(this.destroyAction)

  constructor (api: ApiContract) {
    this.$api = api
  }

  fill (data: Dao | ArModel): this {
    Object.assign(this, data)
    return this
  }

  getResource (): string {
    return this.$resource
  }

  map (data: Dao) {
    this.fill(clone(data))
  }

  mapOrNull (data?: Dao): this | null {
    if (!(data && typeof data === 'object')) return null
    this.map(data)
    return this
  }

  public getId (): string | number | null {
    const self = this as Dao
    return self[this.$idKey] ? self[this.$idKey] : null
  }

  get isExisting (): boolean {
    return !!this.getId()
  }

  public toObject (): Dao {
    const result: Dao = {}
    const self = this as Dao
    this.getAttributes().forEach(attribute => {
      const attributeValue = self[attribute]
      if (attributeValue instanceof ArModel ||
        attributeValue instanceof ArCollection
      ) {
        result[attribute] = attributeValue.toObject()
        return
      }

      if (Array.isArray(attributeValue) && attributeValue.some((av) => (av instanceof ArModel))) {

        result[attribute] = attributeValue.map((element) => {
          if (element instanceof ArModel) {
            return element.toObject()
          }
          if (element instanceof ArCollection) {
            return element.toObject()
          }

          return clone(element)
        })
        return
      }

      if (typeof attributeValue === 'object' || Array.isArray(attributeValue)) {
        result[attribute] = clone(attributeValue)
        return
      }

      result[attribute] = self[attribute]
    })

    return result
  }

  get isSaving (): boolean {
    return this.isUpdating || this.isStoring
  }

  get isUpdating (): boolean {
    return this.$updateExecutor.isRunning
  }

  get isStoring (): boolean {
    return this.$storeExecutor.isRunning
  }

  get isDestroying (): boolean {
    return this.$destroyExecutor.isRunning
  }

  public newQuery (): QueryContract {
    return new LaravelQuery(this.$api).to(this)
  }

  public async save (): Promise<this> {
    return this.isExisting ? this.update() : this.store()
  }

  public async updateAction (): Promise<this> {
    const updated: this = await this.put()
    this.merge(updated)
    return this
  }

  public async storeAction (): Promise<this> {
    const created = await this.post()
    this.merge(created)
    return this
  }

  public async destroyAction (): Promise<void> {
    await this.delete()
  }

  public update () {
    return this.$updateExecutor.run()
  }

  public store () {
    return this.$storeExecutor.run()
  }

  public destroy () {
    return this.$destroyExecutor.run()
  }

  protected async handleAction (action: Function) {
    try {
      return await action()
    } catch (e) {
      if (e instanceof ValidationError) {
        this.$error = e
      }
      throw e
    }
  }

  async post (url?: string, data: any = this.toRequest()): Promise<any> {
    const q = this.newQuery()
    if (url) q.to(url)
    q.setPayload(data)
    return this.handleAction(() => q.post())
  }

  protected async put (url?: string, data: any = this.toRequest()): Promise<any> {
    const id = this.getId()
    const q = this.newQuery()
    if (url) q.to(url)
    if (!url && id) q.expandUrl(id)
    q.setPayload(data)
    return this.handleAction(() => q.put())
  }

  protected async delete (url?: string): Promise<void> {
    const id = this.getId()
    const q = this.newQuery()
    if (url) q.to(url)
    if (!url && id) q.expandUrl(id)
    await q.delete()
  }

  protected merge (modelData: ArModel | Dao): this {
    let data = {}
    if (modelData instanceof ArModel) {
      data = modelData.toObject()
    }
    if (typeof modelData === 'object') {
      data = clone(modelData)
    }
    this.map(data)
    return this
  }

  protected getAttributes () {
    return Object.keys(this).filter((key: string) => {
      return !key.startsWith('$') && !(<any>key instanceof ArCollection) && !(<any>key instanceof ArModel)
    })
  }

  public toRequest (): Dao {
    return this.toObject()
  }

  toString () {
    return JSON.stringify(this.toObject(), null, '\t')
  }

  get () {
    return this.newQuery().get()
  }

  all () {
    return this.get()
  }

  paginate () {
    return this.newQuery().paginate()
  }
}
