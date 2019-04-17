import { ApiContract } from '../Api/ApiContract'
import { ValidationError } from '../Error/Validation/ValidationError'
import { Dto } from '../DAO/Dto'
import { QueryContract } from './QueryContract'
import LaravelQuery from '../Query/LaravelQuery'
import { ArCollection } from '../Collection/ArCollection'
import { clone } from '../Helper/CloneHelpers'
import { ModelContract } from '../Query/ModelContract'
import { objectPropsToCamelCase } from '../Helper/ObjectHelper'
import { getUIID } from '../Helper/StringHelpers'
import HoldExecutor from '../Executor/HoldExecutor'

type ExecutorCommand = (...args: any[]) => Promise<any>
// TODO: think how to make auto tests for api response and mapping
export default class ArModel implements ModelContract {
  [key: string]: any

  protected readonly $resource: string = ''
  protected $snapshot: Dto = {}
  protected readonly $api: ApiContract

  protected $hash: string = getUIID()
  protected readonly $idKey: string = 'id'
  protected $validation: ValidationError = new ValidationError()

  protected readonly $updateExecutor: HoldExecutor = new HoldExecutor((...args: any) => this.updateAction(...args))
  protected readonly $storeExecutor: HoldExecutor = new HoldExecutor((...args: any) => this.storeAction(...args))
  protected readonly $destroyExecutor: HoldExecutor = new HoldExecutor((...args: any) => this.destroyAction(...args))
  public $findExecutor: HoldExecutor = this.makeExecutor((...args: any) => this.findAction(...args))

  makeExecutor (cb: ExecutorCommand) {
    return new HoldExecutor(cb)
  }

  constructor (api: ApiContract) {
    this.$api = api
  }

  get isFinding () {
    return this.$findExecutor.isRunning
  }

  // TODO: test
  fill (data: Dto | ArModel): this {
    Object.assign(this, data)
    return this
  }

  // TODO: test
  fillAndTransform (data: Dto | ArModel): this {
    Object.assign(this, objectPropsToCamelCase(data))
    return this
  }

  getResource (): string {
    return this.$resource
  }

  /**
   * TODO: sometimes we might want to not map some data from request;
   * So would be good to have attributes scheme of attributes and its defaults
   * $attributes = {
   *   id: null
   * }
   * if attributes are defined we will map from them, if not we will map everything from given data
   *
   * we also want to have methods with relations like in Laravel
   * for "practice" we will have practice() method.
   * this methods will help us make nested queries like:
   * this.practice().find(id) will generate url - "/resources/{id}/practices/{id}"
   * @param data
   */
  map (data: Dto): this {
    this.fill(data)
    return this
  }

  mapOrNull (data?: Dto): this | null {
    if (!(data && typeof data === 'object')) return null
    this.map(data)
    return this
  }

  public getIdName (): string {
    return this.$idKey
  }

  public getHash (): string {
    return this.$hash
  }

  public getId (): string | number | null {
    const self = this as Dto
    return self[this.$idKey] ? self[this.$idKey] : null
  }

  // TODO: tests
  public getIndentifier (): string | number {
    const id = this.getId()
    return id || this.$hash
  }

  // TODO: tests
  public getIndentifierName (): string {
    const id = this.getId()
    return id ? this.getIdName() : '$hash'
  }

  get isExisting (): boolean {
    return !!this.getId()
  }

  // TODO: add new type for dates
  public toObject (): Dto {
    const result: Dto = {}
    const self = this as Dto
    this.getAttributes().forEach(attribute => {
      const attributeValue = self[attribute]
      if (attributeValue instanceof ArModel) {
        result[attribute] = attributeValue.toObject()
        return
      }
      if (attributeValue instanceof ArCollection) {
        result[attribute] = attributeValue.toArray()
        return
      }

      if (Array.isArray(attributeValue) && attributeValue.some((av) => (av instanceof ArModel))) {
        result[attribute] = attributeValue.map((element) => {
          if (element instanceof ArModel) {
            return element.toObject()
          }
          if (element instanceof ArCollection) {
            return element.toArray()
          }

          return clone(element)
        })
        return
      }

      if (attributeValue instanceof Date) {
        result[attribute] = attributeValue.toString()
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

  // TODO: tests
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

  public async updateAction (url?: string, data?: any): Promise<this> {
    const updated: this = await this.put(url, data)
    this.merge(updated)
    return this
  }

  public async storeAction (url?: string, data?: any): Promise<this> {
    const created = await this.post(url, data)
    this.merge(created)
    return this
  }

  public async destroyAction (url?: string): Promise<void> {
    await this.delete(url)
  }

  // TODO: tests
  public async findAction (id?: string | number, url?: string): Promise<this> {
    const fetched: this = await this.get(id, url)
    this.merge(fetched)
    return this
  }

  find (id: string | number | Dto, url?: string) {
    return this.$findExecutor.run(id, url)
  }

  public async fresh (url?: string): Promise<this> {
    await this.waitForStoring()
    return this.$findExecutor.run(this.id, url)
  }

  public async update (url?: string, data?: any) {
    // TODO: tests
    await this.waitForStoring()
    return this.$updateExecutor.run(url, data)
  }

  public store (url?: string, data?: any) {
    return this.$storeExecutor.run(url, data)
  }

  public async destroy (url?: string) {
    await this.waitForStoring()
    return this.$destroyExecutor.run(url)
  }

  protected async waitForStoring () {
    if (this.$storeExecutor.isRunning) {
      await this.$storeExecutor.promise
    }
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

  // TODO: write tests
  protected async get (id?: number | string, url?: string): Promise<this> {
    const q = this.query()

    if (url) q.to(url)
    if (!url && id) q.expandUrl(id)
    if (id && ((typeof id === 'string') || (typeof id === 'number'))) {
      q.setPayload({ id })
    }
    if (id && (typeof id === 'object')) {
      q.setPayload(id)
    }

    return this.handleAction(() => q.get())
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

  /**
   * add new props from given model and replace existing.
   * NOTE: we also use that to clone model as temp solution
   */
  merge (modelData: ArModel | Dto): this {
    let data = modelData
    if (modelData instanceof ArModel) {
      data = modelData.toObject()
      this.$hash = modelData.$hash
    }
    if (!(modelData instanceof ArModel)) {
      data = clone(data)
    }
    this.map(data)
    return this
  }

  snapshot (): this {
    this.$snapshot = clone(this.toObject())
    return this
  }

  reset (): this {
    this.map(this.$snapshot)
    return this
  }

  clone (...args: any[]): this {
    /**
     * TODO: overload
     * clone = new Model()
     * clone.merge(this)
     * return clone
     */
    return this.newStatic(...args).merge(this)
  }

  newStatic (...args: any[]) {
    // @ts-ignore
    return new this.constructor(...args)
  }
}
