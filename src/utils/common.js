import * as THREE from 'three/build/three.module'
/**
 * 获取元素节点的左边距
 * @param {Object} elementObj 元素节点
 * @param {Boolean} isRoot 是否获取当前元素相对于浏览器（html节点）的左边距
 */
export function getOffsetLeft (elementObj, isRoot = true) {
  let tmp = elementObj.offsetLeft
  if (isRoot) {
    let val = elementObj.offsetParent
    while (val != null) {
      tmp += val.offsetLeft
      val = val.offsetParent
    }
  }
  return tmp
}

/**
 * 获取元素节点距离浏览器的上边距
 * @param {Object} elementObj 元素节点
 *  * @param {Boolean} isRoot 是否获取当前元素相对于浏览器（html节点）的上边距
 */
export function getOffsetTop (elementObj, isRoot = true) {
  let tmp = elementObj.offsetTop
  if (isRoot) {
    let val = elementObj.offsetParent
    while (val != null) {
      tmp += val.offsetTop
      val = val.offsetParent
    }
  }
  return tmp
}

/**
 * 判空
 * ---
 * @param {String | Array} data    校验内容
 * @param {Boolean}        strict  严格模式
 * @param {Array}          exclude 严格模式下, 略过校验的字段
 * ---
 */
export function isEmpty (data, strict, exclude = []) {
  if (Object.prototype.toString.call(data) === '[object Array]') {
    return data.length === 0
  }
  if (Object.prototype.toString.call(data) === '[object Object]') {
    if (Object.values(data).length === 0) {
      return true
    }
    if (strict) {
      return (
        Object.keys(data).findIndex(field =>
          exclude.includes(field) ? false : !this.isEmpty(data[field])
        ) === -1
      )
    }
    return false
  }
  return data === null || data === undefined ? true : /^[\s\xa0]*$/.test(data)
}
export class ResourceTracker {
  constructor () {
    this.resources = new Set()
  }

  track (resource) {
    if (!resource) {
      return resource
    }
    // handle children and when material is an array of materials or
    // uniform is array of textures
    if (Array.isArray(resource)) {
      resource.forEach(resource => this.track(resource))
      return resource
    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource)
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry)
      this.track(resource.material)
      this.track(resource.children)
    } else if (resource instanceof THREE.Material) {
      // We have to check if there are any textures on the material
      for (const value of Object.values(resource)) {
        if (value instanceof THREE.Texture) {
          this.track(value)
        }
      }
      // We also have to check if any uniforms reference textures or arrays of textures
      if (resource.uniforms) {
        for (const value of Object.values(resource.uniforms)) {
          if (value) {
            const uniformValue = value.value
            if (
              uniformValue instanceof THREE.Texture ||
              Array.isArray(uniformValue)
            ) {
              this.track(uniformValue)
            }
          }
        }
      }
    }
    return resource
  }

  untrack (resource) {
    this.resources.delete(resource)
  }

  dispose () {
    this.resources.forEach(resource => {
      if (resource instanceof THREE.Object3D) {
        if (resource.parent) {
          resource.parent.remove(resource)
        }
      }
      if (resource.dispose) {
        resource.dispose()
      }
    })
    this.resources.clear()
  }
}
