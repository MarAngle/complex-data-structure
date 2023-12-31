import BaseData from '../data/BaseData'
import AttributeValue, { AttributeValueInitOption } from '../lib/AttributeValue'
import ForceValue from '../lib/ForceValue'
import Data from './../data/Data'

type resetOptionValue = {
  [prop: string]: boolean
}

type resetOption = {
  [prop: string]: boolean | resetOptionValue
}

export type resetFromOption = {
  from: string
  act?: string
}

export type ChoiceDataData = {
  id: PropertyKey[]
  list: Record<PropertyKey, unknown>[]
}

export interface ChoiceDataInitOption {
  reset?: resetOption
  local?: {
    parent?: AttributeValueInitOption
    target?: AttributeValueInitOption
    child?: AttributeValueInitOption
    [prop: string]: undefined | AttributeValueInitOption
  }
}

class ChoiceData extends Data {
  static $name = 'ChoiceData'
  idProp: string
  data: ChoiceDataData
  $resetOption: resetOption
  $local?: {
    parent?: AttributeValue
    target?: AttributeValue
    child?: AttributeValue
    [prop: string]: undefined | AttributeValue
  }
  constructor (initOption: ChoiceDataInitOption) {
    super()
    this.idProp = 'id'
    this.data = {
      id: [],
      list: []
    }
    this.$resetOption = {
      load: false,
      reload: false,
      search: {
        set: true,
        reset: true
      },
      pagination: {
        page: false,
        size: false
      }
    }
    if (initOption.reset) {
      for (const n in initOption.reset) {
        const resetInitValue = initOption.reset[n]
        if (typeof resetInitValue === 'object') {
          if (typeof this.$resetOption[n] !== 'object') {
            this.$resetOption[n] = {}
          }
          for (const i in resetInitValue) {
            (this.$resetOption[n] as resetOptionValue)[i] = resetInitValue[i]
          }
        } else {
          this.$resetOption[n] = resetInitValue
        }
      }
    }
    if (initOption.local) {
      // 插件单独的设置，做特殊处理时使用，尽可能的将所有能用到的数据通过option做兼容处理避免问题
      this.$local = {}
      for (const prop in initOption.local) {
        this.$local[prop] = new AttributeValue(initOption.local[prop])
      }
    }
  }
  /**
   * 获取数据
   */
  getData() {
    return this.data
  }
  getId() {
    return this.data.id
  }
  getList() {
    return this.data.list
  }
  pushData(idList: PropertyKey[], list: Record<PropertyKey, unknown>[]) {
    for (let i = 0; i < idList.length; i++) {
      const id = idList[i]
      if (this.data.id.indexOf(id) === -1) {
        this.data.id.push(id)
        this.data.list.push(list[i])
      }
    }
  }
  /**
   * 设置选项列表数据
   * @param {string[]} idList ID列表
   * @param {object[]} list ITEM列表
   */
  setData(idList: PropertyKey[], list: Record<PropertyKey, unknown>[]) {
    this.data.id = idList
    this.data.list = list
  }
  $resetByFrom(option?: boolean | string | resetFromOption, from = 'load') {
    let force: undefined | boolean
    switch (typeof option) {
      case 'object':
        force = this._parseFrom(option.from, option.act)
        break;
      case 'string':
        force = this._parseFrom(option)
        break;
      case 'boolean':
        force = option
        break;
      // case 'undefined':
      //   force = this._parseFrom(from)
      //   break;
      default:
        force = this._parseFrom(from)
        break;
    }
    this.reset(force)
  }
  protected _parseFrom(from: string, act?: string) {
    const targetOption = this.$resetOption[from]
    if (targetOption !== undefined) {
      if (typeof targetOption === 'object') {
        if (!act) {
          this.$exportMsg(`$resetByFrom函数中对应的from:${from}未定义act,可定义:${Object.keys(targetOption)}`)
        } else if (targetOption[act] !== undefined) {
          return targetOption[act]
        } else {
          this.$exportMsg(`$resetByFrom函数中对应的from:${from}中不存在act:${act},可定义:${Object.keys(targetOption)}`)
        }
      } else {
        return targetOption as boolean
      }
    } else {
      this.$exportMsg(`$resetByFrom函数未找到对应的from:${from}`)
    }
    return undefined
  }
  /**
   * 重置操作
   * @param {boolean} force 重置判断值
   */
  reset(force?: boolean) {
    if (force) {
      this.setData([], [])
    }
  }
  $reset(option?: boolean) {
    if (option !== false) {
      this.reset(true)
    }
  }
  $destroy(option?: boolean) {
    if (option !== false) {
      this.$reset(option)
    }
  }
  /**
   * 模块加载
   * @param {object} target 加载到的目标
   */
  $install (target: BaseData) {
    super.$install(target)
    if (target.$module.dictionary) {
      this.idProp = target.$module.dictionary.$getProp('id')
    }
    target.$onLife('beforeReload', {
      id: this.$getId('BeforeReload'),
      data: (instantiater, force: ForceValue) => {
        this.$resetByFrom(force.module.choice, 'reload')
      }
    })
  }
  /**
   * 模块卸载
   * @param {object} target 卸载到的目标
   */
  $uninstall(target: BaseData) {
    super.$uninstall(target)
    target.$offLife('beforeReload', this.$getId('BeforeReload'))
  }
}

export default ChoiceData
