import { objectPropsToCamelCase, objectPropsToSnakeCase } from '../../../src/modules/Helper/ObjectHelper'

describe('ObjectHelpers', () => {
  test('objectPropsToCamelCase', () => {
    const data = {
      some_name: 'some name',
      nullable: null,
      relation_one: {
        some_name: 'some name'
      },
      relation_list: [
        {
          some_name: 'some name'
        }
      ]
    }
    const expected = {
      someName: 'some name',
      nullable: null,
      relationOne: {
        someName: 'some name'
      },
      relationList: [
        {
          someName: 'some name'
        }
      ]
    }

    const result = objectPropsToCamelCase(data)
    expect(result).toEqual(expected)
  })
  test('objectPropsToSnakeCase', () => {
    const data = {
      someName: 'some name',
      nullable: null,
      relationOne: {
        someName: 'some name'
      },
      relationList: [
        {
          someName: 'some name'
        }
      ]
    }
    const expected = {
      some_name: 'some name',
      nullable: null,
      relation_one: {
        some_name: 'some name'
      },
      relation_list: [
        {
          some_name: 'some name'
        }
      ]
    }

    const result = objectPropsToSnakeCase(data)
    expect(result).toEqual(expected)
  })
})
