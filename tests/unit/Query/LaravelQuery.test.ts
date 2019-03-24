import LaravelQuery from '../../../src/modules/Query/LaravelQuery'
import ArModel from '../../../src/modules/Model/ArModel'
import { ApiMock } from './ApiMock'

describe('LaravelQuery', () => {
  describe('"to" should set $resource and return query itself', () => {
    test('$resource from string', () => {
      const q = new LaravelQuery(new ApiMock())

      const result = q.to('/resource')

      expect(result).toMatchObject({ $resource: '/resource' })
    })
    test('$resource from "ArModel" class name', () => {
      class MyModel extends ArModel {
        constructor () {
          super(new ApiMock())
        }
      }

      const q = new LaravelQuery(new ApiMock())

      const result = q.to(new MyModel())
      expect(result).toMatchObject({ $resource: '/my-models' })
    })
    test('$resource from "ArModel" "$resource"', () => {
      class MyModel extends ArModel {
        protected readonly $resource = 'resource'
        constructor () {
          super(new ApiMock())
        }
      }
      const q = new LaravelQuery(new ApiMock())

      const result = q.to(new MyModel())

      expect(result).toMatchObject({ $resource: '/resource' })
    })
  })
  describe('"expandUrl" should set $resource and return query itself', () => {
    test('without to', () => {
      const q = new LaravelQuery(new ApiMock())

      const result = q.expandUrl('1')

      expect(result).toMatchObject({ $resource: '/1' })
    })
    test('with to', () => {
      const q = new LaravelQuery(new ApiMock())

      const result = q.to('/url').expandUrl('1')

      expect(result).toMatchObject({ $resource: '/url/1' })
    })
  })
  describe('makeUrl', () => {
    test(' from "name" should return url "/name', () => {
      const q = new LaravelQuery(new ApiMock())

      const result = q.makeUrl('name')

      expect(result).toEqual('/name')
    })
    test(' after expandUrl from "name" should return url "/1/name', () => {
      const q = new LaravelQuery(new ApiMock())

      const result = q.expandUrl(1).makeUrl('name')

      expect(result).toEqual('/1/name')
    })
    test(' after to from "name" should return url "/resource/name', () => {
      const q = new LaravelQuery(new ApiMock())

      const result = q.to('/resource').makeUrl('name')

      expect(result).toEqual('/resource/name')
    })
    test(' after extendUrl from "name" should return url "/resource/name', () => {
      const q = new LaravelQuery(new ApiMock())

      const result = q.expandUrl('resource').makeUrl('name')

      expect(result).toEqual('/resource/name')
    })
    test(' after to -> expandUrl -> expandUrl -> expandUrl  from "name" should return url "/to/1/expanded/2/name',
      () => {
        const q = new LaravelQuery(new ApiMock())

        const result = q.to('/to').expandUrl('1').expandUrl('expanded').expandUrl('2').makeUrl('name')

        expect(result).toEqual('/to/1/expanded/2/name')
      })
  })

  test('setCriteria should set $criteria, keep reactivity for object and return query itself', () => {
    const q = new LaravelQuery(new ApiMock())
    const criteria = {
      filter: ''
    }
    const result = q.setCriteria(criteria)
    criteria.filter = 'search'
    expect(result).toMatchObject({
      $criteria: {
        filter: 'search'
      }
    })
  })

  describe('get ', () => {
    test(' should request with correct url', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/resource').get()

      expect(api.url).toEqual('/resource')
    })
    test(' should request with correct criteria and url given as args', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.setCriteria({ id: 1 }).get({ id: 2 }, '/resource')
      expect(api.payload).toEqual({ id: 2 })
      expect(api.url).toEqual('/resource')
    })
    test(' should request with correct criteria', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.setCriteria({ id: 1 }).get()
      expect(api.payload).toEqual({ id: 1 })
    })
    test(' should request with correct criteria after pagination', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.setPagination({ page: 1, perPage: 15 }).setCriteria({ id: 1 }).get()
      expect(api.payload).toEqual({ id: 1, page: 1, perPage: 15 })
    })
    test(' should return "response"', async () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = await q.setPagination({ page: 1, perPage: 15 }).setCriteria({ id: 1 }).get()
      expect(result).toEqual('response') // is hardcoded response in ApiMock
    })
  })

  describe('delete ', () => {
    test(' should request with correct url after to', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/resource').delete()

      expect(api.url).toEqual('/resource')
    })
    test(' should request with correct url and payload from args', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/to').delete({ id: 1 }, '/resource')

      expect(api.url).toEqual('/resource')
      expect(api.payload).toEqual({ id: 1 })
    })
    test(' should request with correct payload after setPayload', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/to').setPayload({ id: 1 }).delete()
      expect(api.url).toEqual('/to')
      expect(api.payload).toEqual({ id: 1 })
    })
    test(' should return "response"', async () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = await q.delete()
      expect(result).toEqual('response') // is hardcoded response in ApiMock
    })
  })

  describe('post ', () => {
    test(' should request with correct url after to', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/resource').post()

      expect(api.url).toEqual('/resource')
    })
    test(' should request with correct url and payload from args', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/to').post({ id: 1 }, '/resource')

      expect(api.url).toEqual('/resource')
      expect(api.payload).toEqual({ id: 1 })
    })
    test(' should request with correct payload after setPayload', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/to').setPayload({ id: 1 }).post()
      expect(api.url).toEqual('/to')
      expect(api.payload).toEqual({ id: 1 })
    })
    test(' should return "response"', async () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = await q.post()
      expect(result).toEqual('response') // is hardcoded response in ApiMock
    })
  })

  describe('put ', () => {
    test(' should request with correct url after to', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/resource').put()

      expect(api.url).toEqual('/resource')
    })
    test(' should request with correct url and payload from args', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/to').put({ id: 1 }, '/resource')

      expect(api.url).toEqual('/resource')
      expect(api.payload).toEqual({ id: 1 })
    })
    test(' should request with correct payload after setPayload', () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = q.to('/to').setPayload({ id: 1 }).put()
      expect(api.url).toEqual('/to')
      expect(api.payload).toEqual({ id: 1 })
    })
    test(' should return "response"', async () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = await q.put()
      expect(result).toEqual('response') // is hardcoded response in ApiMock
    })
  })

  describe('first ', () => {
    test(' should return response if api response is not array', async () => {
      const api = new ApiMock()
      const q = new LaravelQuery(api)
      const result = await q.first()

      expect(result).toEqual('response')
    })
    test(' should return null if api response is empty array', async () => {
      const api = new ApiMock()
      api.get = async () => {
        return []
      }
      const q = new LaravelQuery(api)
      const result = await q.first()

      expect(result).toBeNull()
    })
    test(' should return firs element if api response is array', async () => {
      const api = new ApiMock()
      api.get = async () => {
        return [1]
      }
      const q = new LaravelQuery(api)
      const result = await q.first()

      expect(result).toBe(1)
    })
  })
})
