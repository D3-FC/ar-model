import { ApiContract } from '../Api/ApiContract'
import { ValidationError } from '../Error/Validation/ValidationError'
import HoldExecutor from '../Executor/HoldExecutor'
import { Dto } from '../DAO/Dto'
import { QueryContract } from './QueryContract'
import LaravelQuery from '../Query/LaravelQuery'
import { ArCollection } from '../Collection/ArCollection'
import { clone } from '../Helper/CloneHelpers'
import { ModelContract } from '../Query/ModelContract'
import { objectPropsToCamelCase } from '../Helper/ObjectHelper'

export default class ArModel implements ModelContract {
  [key: string]: any

  protected readonly $resource: string = ''
  protected $snapshot: Dto = {}
  protected readonly $api: ApiContract

  protected readonly $idKey: string = 'id'
  protected $validation: ValidationError = new ValidationError()

  protected readonly $updateExecutor: HoldExecutor = new HoldExecutor(this.updateAction)
  protected readonly $storeExecutor: HoldExecutor = new HoldExecutor(() => this.storeAction())
  protected readonly $destroyExecutor: HoldExecutor = new HoldExecutor(this.destroyAction)

  constructor (api: ApiContract) {
    this.$api = api
  }

  fill (data: Dto | ArModel): this {
    if (data instanceof ArModel) {
      Object.assign(this, data.toObject())
      return this
    }
    Object.assign(this, objectPropsToCamelCase(data))
    return this
  }

  getResource (): string {
    return this.$resource
  }

  map (data: Dto): this {
    return this.fill(clone(data))
  }

  mapOrNull (data?: Dto): this | null {
    if (!(data && typeof data === 'object')) return null
    this.map(data)
    return this
  }

  public getId (): string | number | null {
    const self = this as Dto
    return self[this.$idKey] ? self[this.$idKey] : null
  }

  get isExisting (): boolean {
    return !!this.getId()
  }

  public toObject (): Dto {
    const result: Dto = {}
    const self = this as Dto
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

  public toRequest (): Dto {
    return this.toObject()
  }

  protected getAttributes () {
    return Object.keys(this).filter((key: string) => {
      return !key.startsWith('$')
    })
  }

  errorsFor (attribute: string): string[] {
    const error = this.$validation.getError(attribute)
    if (typeof error === 'string') return [error]
    if (!error) return []
    return error
  }

  errorFor (attribute: string): string {
    return this.errorsFor(attribute)[0] || ''
  }

  get hasError () {
    return this.$validation.hasErrors
  }

  clearErrors (): this {
    this.$validation.clear()
    return this
  }

  toString () {
    return JSON.stringify(this.toObject(), null, '\t')
  }

  get () {
    return this.query().get()
  }

  all () {
    return this.get()
  }

  paginate () {
    return this.query().paginate()
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

  protected query (): QueryContract {
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
        this.$validation = e
      }
      throw e
    }
  }

  protected async post (url?: string, data: any = this.toRequest()): Promise<any> {
    const q = this.query()
    if (url) q.to(url)
    q.setPayload(data)
    return this.handleAction(() => q.post())
  }

  protected async put (url?: string, data: any = this.toRequest()): Promise<any> {
    const id = this.getId()
    const q = this.query()
    if (url) q.to(url)
    if (!url && id) q.expandUrl(id)
    q.setPayload(data)
    return this.handleAction(() => q.put())
  }

  protected async delete (url?: string): Promise<void> {
    const id = this.getId()
    const q = this.query()
    if (url) q.to(url)
    if (!url && id) q.expandUrl(id)
    await q.delete()
  }

  merge (modelData: ArModel | Dto): this {
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

  snapshot (): this {
    this.$snapshot = clone(this.toObject())
    return this
  }

  reset (): this {
    return this.map(this.$snapshot)
  }
}
