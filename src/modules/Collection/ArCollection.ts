import ArModel from '../Model/ArModel'
import { Dto } from '../DAO/Dto'
import { arrayFindByCriteria, arrayRemoveByCriteria, arraySpliceOrNewByCriteria } from '../Helper/ArrayHelpers'

type Criteria = Dto | ((item: ArModel) => boolean)
type MapCb<T> = (value: (T & ArModel), index: number, array: (T & ArModel)[]) => (T & ArModel)

export class ArCollection<T> {
  $items: (T & ArModel)[] = []

  constructor (items: (T & ArModel)[] = []) {
    this.fill(items)
  }

  toArray (): Dto {
    return this.$items.map((item) => item.toObject())
  }

  find (criteria: Dto | Criteria): T | null {
    return arrayFindByCriteria(this.$items, criteria)
  }

  protected removeItem (item: ArModel, key: string = item.getIndentifierName()): this {
    this.removeByCriteria({ [key]: item.getIndentifier() })
    return this
  }

  protected removeByCriteria (criteria: Criteria) {
    arrayRemoveByCriteria(this.$items, criteria)
  }

  remove (itemOrCriteria: ArModel | Criteria, key?: string): this {
    if (itemOrCriteria instanceof ArModel) {
      this.removeItem(itemOrCriteria, key)
      return this
    }

    this.removeByCriteria(itemOrCriteria)
    return this
  }

  clone () {
    return this.map((m) => {
      return m.clone()
    })
  }

  add (item: T & ArModel, index: number = 0) {
    this.$items.splice(index, 0, item)
  }

  push (item: T & ArModel) {
    this.$items.push(item)
  }

  prepend (item: T & ArModel) {
    this.$items.unshift(item)
  }

  transform (cb: MapCb<T>) {
    this.$items = this.$items.map(cb)
    return this
  }

  map (cb: MapCb<T>): ArCollection<T> {
    return new ArCollection(this.$items.map(cb))
  }

  filter (cb: MapCb<T>) {
    return this.$items.filter(cb)
  }

  fill (items: (T & ArModel)[] = []): this {
    this.$items = items
    return this
  }

  /**
   * TODO: test with new index
   */
  addOrMerge (item: T & ArModel, newIndex: number = 0): this {
    let criteria: Dto = {}
    const itemId = item.getId()
    if (itemId) criteria.id = itemId
    if (!itemId) criteria.$hash = item.getHash()

    arraySpliceOrNewByCriteria(this.$items, criteria, item, newIndex)
    return this
  }

  get isEmpty () {
    return !this.length
  }

  get length () {
    return this.$items.length
  }

  toSnapshotString () {
    return this.$items.map(item => item.toSnapshotString())
  }

  get first () {
    return this.$items[0]
  }
}
