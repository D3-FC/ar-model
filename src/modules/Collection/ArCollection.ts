import ArModel from '../Model/ArModel'
import { Dto } from '../DAO/Dto'
import { arrayFindByCriteria, arrayRemoveByCriteria } from '../Helper/ArrayHelpers'

type Criteria = Dto | ((item: ArModel) => boolean)

export class ArCollection<T> {
  protected $items: (T & ArModel)[] = []

  constructor (items: (T & ArModel)[] = []) {
    this.$items = items
  }

  toObject (): Dto {
    return this.$items.map((item) => item.toObject())
  }

  find (criteria: Dto | Criteria): T | null {
    return arrayFindByCriteria(this.$items, criteria)
  }

  protected removeItem (item: ArModel, key: string = item.getIdName()) {
    this.removeByCriteria({ [key]: item.getId() })
  }

  protected removeByCriteria (criteria: Criteria) {
    arrayRemoveByCriteria(this.$items, criteria)
  }

  remove (itemOrCriteria: ArModel | Criteria, key?:string) {
    if (itemOrCriteria instanceof ArModel) return this.removeItem(itemOrCriteria, key)

    return this.removeByCriteria(itemOrCriteria)
  }

  clone () {
    return this.$items.map((m) => {
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
}
