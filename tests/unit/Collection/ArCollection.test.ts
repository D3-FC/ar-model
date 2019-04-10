import { ArCollection } from '../../../src/modules/Collection/ArCollection'
import ArModel from '../../../src/modules/Model/ArModel'
import { Dto } from '../../../src/modules/DAO/Dto'
import { ApiMock } from '../Query/ApiMock'

describe('ArCollection', () => {
  class Model extends ArModel {
    id!: number

    constructor (data: Dto = {}) {
      super(new ApiMock())
      this.fill(data)
    }
  }

  const m1 = new Model({ id: 1 })
  const m2 = new Model({ id: 2 })
  const m3 = new Model({ id: 3 })

  const col = new ArCollection([
    m1,
    m2,
    m3
  ])
  describe('find', () => {
    test('should return model found by criteria object', () => {
      const result = col.find({ id: 1 })
      expect(result).toEqual(m1)
    })
    test('should return model found by criteria function', () => {
      const result = col.find((model) => {
        return model.id === 1
      })
      expect(result).toEqual(m1)
    })
  })
  describe('remove', () => {
    test('should remove model found by criteria object', () => {
      const col = new ArCollection([
        m1,
        m2,
        m3
      ])
      col.remove({ id: 1 })
      expect(col.toObject()).toEqual([
        { id: 2 },
        { id: 3 }
      ])
    })
    test('should remove model found by criteria function', () => {
      const col = new ArCollection([
        m1,
        m2,
        m3
      ])
      col.remove((model) => {
        return model.id === 1
      })
      expect(col.toObject()).toEqual([
        { id: 2 },
        { id: 3 }
      ])
    })
    test('should remove model found by given model', () => {
      const col = new ArCollection([
        m1,
        m2,
        m3
      ])
      col.remove(m1)
      expect(col.toObject()).toEqual([
        { id: 2 },
        { id: 3 }
      ])
    })
  })
  describe('add', () => {
    test('should add item to given position', () => {
      const col = new ArCollection([
        m1,
        m3
      ])
      col.add(m2, 1)
      expect(col.toObject()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    })
  })
  describe('push', () => {
    test('should push item to the end', () => {
      const col = new ArCollection([
        m1,
        m3
      ])
      col.push(m2)
      expect(col.toObject()).toEqual([{ id: 1 }, { id: 3 }, { id: 2 }])
    })
  })
  describe('push', () => {
    test('should push item to the end', () => {
      const col = new ArCollection([
        m1,
        m3
      ])
      col.prepend(m2)
      expect(col.toObject()).toEqual([{ id: 2 }, { id: 1 }, { id: 3 }])
    })
  })
})
