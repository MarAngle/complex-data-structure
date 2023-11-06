import { hasProp } from "complex-utils-next"
import Data from "../data/Data"
import AttributeValue, { AttributeValueInitOption } from "../lib/AttributeValue"
import InterfaceValue, { InterfaceValueInitOption } from "../lib/InterfaceValue"
import TipValue, { TipValueInitOption } from "../lib/TipValue"
import DictionaryValue, { functionType } from "./DictionaryValue"
import { ObserveValueItem } from "./ObserveList"

export interface DefaultEditInitOption {
  prop?: string
  trim?: string // 字段意义不明？
  colon?: boolean
  required?: InterfaceValueInitOption<boolean>
  disabled?: InterfaceValueInitOption<boolean>
  placeholder?: InterfaceValueInitOption<string>
  width?: string | number | {
    data: string | number
    main: string | number
  }
  local?: {
    parent?: AttributeValueInitOption
    target?: AttributeValueInitOption
    child?: AttributeValueInitOption
  }
  value?: {
    default?: unknown
    init?: unknown
    reset?: unknown
    [prop: PropertyKey]: unknown
  }
  on?: Record<PropertyKey, (...args: unknown[]) => unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: InterfaceValueInitOption<any>
  edit?: false | functionType<unknown> // 数据=>编辑 格式化
  post?: false | functionType<unknown> // 编辑=>来源 格式化
  observe?: ObserveValueItem['$observe']
  tip?: TipValueInitOption
  slot?: {
    type?: string
    name?: string
    label?: string
    render?: (...args: unknown[]) => unknown
  }
}

class DefaultEdit extends Data {
  static $name = 'DefaultEdit'
  static $config = {
    defaultValue: undefined,
    placeholder: function (name: InterfaceValue<string>) {
      const data: Record<PropertyKey, string> = {}
      name.map((value, prop) => {
        data[prop] = `请输入${value[prop]}`
      })
      return data
    }
  }
  $prop: string
  trim: boolean
  colon: boolean
  required: InterfaceValue<boolean>
  disabled: InterfaceValue<boolean>
  placeholder?: InterfaceValue<string>
  $width: {
    data?: string
    main?: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $rules!: InterfaceValue<any>
  $value!: {
    default: unknown
    init: unknown
    reset: unknown
    [prop: PropertyKey]: unknown
  }
  $local: {
    parent: AttributeValue
    target: AttributeValue
    child: AttributeValue
  }
  edit?: false | functionType<unknown>
  post?: false | functionType<unknown>
  $on: Record<PropertyKey, (...args: unknown[]) => unknown>
  $observe?: ObserveValueItem['$observe']
  tip: TipValue
  $slot!: {
    type: 'auto' | 'main' | 'item' | 'model'
    name: string
    label: string
    render?: (...args: unknown[]) => unknown
  }
  constructor(initOption: DefaultEditInitOption, modName?: string, parent?: DictionaryValue) {
    super()
    this.$setParent(parent)
    this.$prop = initOption.prop || (parent ? parent.$prop : '')
    this.trim = !!initOption.trim
    this.colon = initOption.colon === undefined ? true : initOption.colon
    this.required = new InterfaceValue(initOption.required || false)
    this.disabled = new InterfaceValue(initOption.disabled || false)
    this.tip = new TipValue(initOption.tip)
    // 组件事件监控
    this.edit = initOption.edit
    this.post = initOption.post
    this.$on = initOption.on || {}
    // 插件单独的设置，做特殊处理时使用，尽可能的将所有能用到的数据通过option做兼容处理避免问题
    // main = { props: {} } item = { props: {} }
    const local = initOption.local || {}
    this.$local = {
      parent: new AttributeValue(local.parent),
      target: new AttributeValue(local.target),
      child: new AttributeValue(local.child)
    }
    const $config = (this.constructor as typeof DefaultEdit).$config
    if (initOption.placeholder === undefined && parent) {
      this.placeholder = new InterfaceValue($config.placeholder(parent.$getInterfaceData('name')))
    }
    // 宽度设置
    const width = initOption.width
    if (width !== undefined || width !== null) {
      switch (typeof width) {
        case 'object':
          this.$width = {
            data: typeof width.data === 'number' ? width.data + 'px' : width.data,
            main: typeof width.main === 'number' ? width.main + 'px' : width.main
          }
          break;
        case 'number':
          this.$width = {
            data: width + 'px'
          }
          break;
        default:
          this.$width = {
            data: width
          }
          break;
      }
    } else {
      this.$width = {}
    }
    const initOptionValue = initOption.value || {}
    const defaultValue = hasProp(initOptionValue, 'default') ? initOptionValue.default : $config.defaultValue
    const initValue = hasProp(initOptionValue, 'init') ? initOptionValue.init : defaultValue
    const resetValue = hasProp(initOptionValue, 'reset') ? initOptionValue.reset : defaultValue
    this.$value = {
      default: defaultValue,
      init: initValue,
      reset: resetValue
    }
    const slot = initOption.slot || {}
    if (!slot.type) { // slot类型 auto/main/item/model
      slot.type = 'auto'
    }
    if (!slot.name) { // name=>插槽默认名
      slot.name = this.$prop
    }
    if (!slot.label) { // label=>title
      slot.label = slot.name + '-label'
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.$slot = slot as any
    this.$observe = initOption.observe
  }
}

export default DefaultEdit
