<script>
import { getOffsetTop, getOffsetLeft, isEmpty } from '@/utils/common.js'
import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
const OrbitControls = require('three-orbit-controls')(THREE)
export default {
  name: 'HelloWorld',
  data () {
    return {
      objUrl: './11803_Airplane_v1_l1.obj', // 模型地址
      container: null, // 画布容器
      scene: null, // 场景
      theModel1: null, // 网格模型
      camera: null, // 相机
      renderer: null, // 渲染器
      controls: null, // 控制器
      curve: null,
      progress: 0,
      texture: null,
      clock: null,
      group: null
    }
  },
  methods: {
    /**
     * 初始化场景
     */
    initScene () {
      this.scene = new THREE.Scene()
    },
    /**
     * 初始化灯光
     */
    initLight () {
      // 平行光，模拟远处类似太阳的光源
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
      directionalLight.color.setHSL(0.1, 1, 0.95)
      directionalLight.position.set(0, 200, 0).normalize()
      this.scene.add(directionalLight)
      // 环境光AmbientLight,影响整个场景的光源
      const ambient = new THREE.AmbientLight(0xffffff, 1)
      ambient.position.set(0, 0, 0)
      this.scene.add(ambient)
    },
    /**
     * 初始化相机
     */
    initCamera () {
      this.camera = new THREE.PerspectiveCamera(
        45,
        this.containerWidth / this.containerHeight,
        0.1,
        10000
      )
      this.camera.position.set(-250, 50, 50)
    },
    /**
     * 初始化渲染器
     */
    initRenderer () {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      })
      // 设置渲染区域尺寸
      this.renderer.setSize(this.containerWidth, this.containerHeight)
      // 设置背景颜色
      this.renderer.setClearColor(0x4682b4, 1.0)
      this.container.appendChild(this.renderer.domElement)
    },
    /**
     * 初始化控制器
     */
    initControls () {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableDamping = true
      this.controls.dampingFactor = 0.5
      // 平移速度
      this.controls.panSpeed = 3
      // 缩放速度
      this.controls.zoomSpeed = 3
      // 视角最小距离
      this.controls.minDistance = 50
      // 视角最远距离
      this.controls.maxDistance = 2000
      // 上下翻转的最大角度
      this.controls.maxPolarAngle = 1.5
      // this.controls.maxPolarAngle = Math.PI / 2
      this.controls.target = new THREE.Vector3(50, 50, 0)
    },
    /**
     * 动画
     */
    animate () {
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      requestAnimationFrame(this.animate)
      // 设置纹理偏移
      // this.texture.offset.x -= 0.06
      var delta = this.clock.getDelta()

      if (this.group) this.group.update(delta)
    },
    /**
     * 放置天空盒
     * @param {*} size 盒子大小  */
    addSkybox (size) {
      const urls = [
        require('@/assets/img/skybox/远山_RT.jpg'), // right
        require('@/assets/img/skybox/远山_LF.jpg'), // left
        require('@/assets/img/skybox/远山_UP.jpg'), // top
        require('@/assets/img/skybox/远山_DN.jpg'), // bottom
        require('@/assets/img/skybox/远山_BK.jpg'), // back
        require('@/assets/img/skybox/远山_FR.jpg') // front
      ]
      // 方法一
      new THREE.CubeTextureLoader().load(urls, (oj) => {
        this.scene.background = oj
      })
      // 方法二

      // new THREE.CubeTextureLoader().load(urls, (oj) => {
      // console.log(65)
      // const skyboxCubemap = {}
      // skyboxCubemap.format = THREE.RGBFormat

      // const skyboxShader = THREE.ShaderLib.cube
      // console.log(skyboxShader.uniforms)
      // skyboxShader.uniforms.tCube = {}
      // skyboxShader.uniforms.tCube.value = skyboxCubemap
      // console.log(skyboxShader)
      // const obj = new THREE.Mesh(
      //   new THREE.BoxGeometry(size, size, size),
      // new THREE.ShaderMaterial({
      //   fragmentShader: skyboxShader.fragmentShader,
      //   vertexShader: skyboxShader.vertexShader,
      //   uniforms: {
      //     tCube: {
      //       value: {
      //         format: THREE.RGBFormat
      //       }
      //     },
      //     envMap: {
      //       value: oj
      //     }
      //   },
      //   depthWrite: false,
      //   side: THREE.BackSide
      // })
      //   )
      //   console.log(obj)
      //   this.scene.add(obj)
      // }, () => {
      //   console.log('加载中')
      // }, () => {
      //   console.log('失败')
      // })
    },
    /**
     * 创建网格模型
     */
    createMesh () {
      this.clock = new THREE.Clock()
      // 加载模型路径
      const MODEL_PATH = this.objUrl
      // 加载模型
      const loader = new OBJLoader()
      loader.load(
        MODEL_PATH,
        loadedMesh => {
          // 加载图片贴图
          const loader1 = new THREE.TextureLoader()
          loader1.load(require('@/assets/img/airplane_body.jpg'), (texture) => {
            const bodymaterial = new THREE.MeshPhongMaterial({
              map: texture,
              color: 0xE3E4DF
            })
            // 另一种方法，分开写
            bodymaterial.map.matrix.scale(1, 1) // 缩放
            // material.transparent = true
            bodymaterial.opacity = 1
            const othermaterial = new THREE.MeshPhongMaterial({ color: 0xE3E4DF })
            const wheelmaterial = new THREE.MeshPhongMaterial({ color: 0X000000 })
            // 加载完obj文件是一个场景组，遍历它的子元素，赋值纹理并且更新面和点的发现了
            loadedMesh.children.forEach((child) => {
              // console.log(child.name)
              if (['11803_Airplane_body', '11803_Airplane_wing_details_L', '11803_Airplane_wing_details_R'].includes(child.name)) {
                child.material = bodymaterial
                // child.geometry.computeFaceNormals()
                // child.geometry.computeVertexNormals()
              } else if (['11803_Airplane_wing_holder_L', '11803_Airplane_wing_holder_R'].includes(child.name)) {
                child.material = wheelmaterial
              } else {
                child.material = othermaterial
              }
            })
            // themodel为加载的模型实例
            // console.log(loadedMesh)
            // this.theModel1 = loadedMesh.scene
            this.theModel1 = loadedMesh
            // 模型位置改变
            this.theModel1.position.set(0, 0, 0)
            // 模型大小改变
            const smallNnm = 0.05
            this.theModel1.scale.set(smallNnm, smallNnm, smallNnm)
            this.theModel1.rotateX(-Math.PI / 2)
            console.log(this.theModel1.size)
            this.group = new THREE.Group()
            this.group.add(this.theModel1)
            // this.scene.add(this.theModel1)
            this.scene.add(this.group)
            setTimeout(() => {
              setInterval(() => {
                if (this.progress > 1.0) {
                  return // 停留在管道末端,否则会一直跑到起点 循环再跑
                }
                this.progress += 0.0009
                // console.log(this.progress)
                console.log(this.curve)
                if (this.curve) {
                  const point = this.curve.getPoint(this.progress)
                  const point1 = this.curve.getPoint(this.progress + 0.001)
                  console.log(point)
                  if (point && point.x) {
                    this.group.position.set(point.x, point.y, point.z)
                    this.group.lookAt(point1.x, point1.y, point1.z)
                  }
                }
              })
            })
          })
          // var material = new THREE.MeshLambertMaterial({ color: 0x5c3a21 })
          // const material = new THREE.MeshPhongMaterial({ color: 0x5c3a21 })
        },
        undefined,
        function (error) {
          console.log(error, 'error')
        }
      )
    },
    /*
    创建地板/跑道
    */
    createFloor () {
      const loader = new THREE.TextureLoader()
      loader.load(require('@/assets/img//skybox/远山_DN.jpg'), (texture) => {
      // wrapS是x轴方向的行为，wrapT是y轴方向的行为
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping// THREE.RepeatWrapping:允许重复自己
        // texture.repeat.set(10, 10)
        const floorGeometry = new THREE.BoxGeometry(1000, 5, 1000)
        const floorMaterial = new THREE.MeshBasicMaterial({
          map: texture
        })
        const floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.name = '地面草地'
        floor.scale.set(10, 1, 20)
        // floor.rotateY(-Math.PI / 2)
        floor.position.set(0, -15, 0)
        this.scene.add(floor)
      })
      loader.load(require('@/assets/img/跑道.png'), (texture) => {
      // wrapS是x轴方向的行为，wrapT是y轴方向的行为
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping// THREE.RepeatWrapping:允许重复自己
        // texture.repeat.set(10, 10)
        const floorGeometry = new THREE.BoxGeometry(30, 5, 100)
        const floorMaterial = new THREE.MeshBasicMaterial({
          map: texture
        })
        const floor = new THREE.Mesh(floorGeometry, floorMaterial)
        floor.name = '地面'
        floor.scale.set(10, 1, 20)
        floor.rotateY(-Math.PI / 2)
        floor.position.set(850, -10, 0)
        this.scene.add(floor)
      })
    },
    /**
     * 创建管道
     *
    */
    createCube () {
      /**
     * 创建一个设置重复纹理的管道
     */
      this.curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-80, -40, 0),
        new THREE.Vector3(-70, 40, 0),
        new THREE.Vector3(70, 40, 0),
        new THREE.Vector3(80, -40, 0)
      ], false/* 是否闭合 */)
      var tubeGeometry = new THREE.TubeGeometry(this.curve, 100, 0.6, 50, false)
      var textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load(require('@/assets/img/logo.png'))
      // 设置阵列模式为 RepeatWrapping
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      // 设置x方向的偏移(沿着管道路径方向)，y方向默认1
      // 等价texture.repeat= new THREE.Vector2(20,1)
      texture.repeat.x = 20
      var tubeMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true
      })
      this.texture = texture
      var tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
      this.scene.add(tube)
      /**
     * 创建一个半透明管道
     */
      var tubeGeometry2 = new THREE.TubeGeometry(this.curve, 100, 2, 50, false)
      var tubeMaterial2 = new THREE.MeshPhongMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.3
      })
      var tube2 = new THREE.Mesh(tubeGeometry2, tubeMaterial2)
      this.scene.add(tube2)

      this.scene.add(new THREE.AxesHelper(300))
    },
    /**
     * 全部初始化
     */
    initAll () {
      this.initScene()
      this.initLight()
      this.addSkybox(1000)
      this.createFloor()
      this.createMesh()
      this.createCube()
      this.initCamera()
      // 天空盒
      // addSkybox(10000, this.scene);

      this.initRenderer()
      this.initControls()
      this.animate()
    },
    /**
     * 点击模型
     */
    // clickModel (event) {
    //   // 清空之前选中的模型信息
    //   this.selectedObjects = {}
    //   const raycaster = new THREE.Raycaster()
    //   const mouse = new THREE.Vector2()
    //   // 获取container元素的左边距和上边距
    //   const leftDistance = getOffsetLeft(this.container, true)
    //   const topDistance = getOffsetTop(this.container, true)
    //   // 获取相对于浏览器位置的鼠标坐标
    //   let x, y
    //   if (event.changedTouches) {
    //     x = event.changedTouches[0].pageX
    //     y = event.changedTouches[0].pageY
    //   } else {
    //     x = event.clientX
    //     y = event.clientY
    //   }
    //   // 将相对于浏览器位置的鼠标坐标转换成画布中的坐标（去除container元素的上边距和左边距）
    //   mouse.x = ((x - leftDistance) / this.containerWidth) * 2 - 1
    //   mouse.y = -((y - topDistance) / this.containerHeight) * 2 + 1
    //   // 设置射线的角度
    //   raycaster.setFromCamera(mouse, this.camera)
    //   // 获取射线中的所有模型
    //   const intersects = raycaster.intersectObjects([this.scene], true)
    //   if (isEmpty(intersects)) return
    //   // 获取射线中的第一个模型(用户点击的模型)并获取详情
    //   const firstObj = intersects[0].object
    //   // 点击的模型是否为商品
    //   if (!isEmpty(firstObj.goodsInfo)) {
    //     this.selectedObjects.goodsInfo = cloneDeep(firstObj.goodsInfo)
    //   }
    //   // 点击的模型是否为货架
    //   else if (!isEmpty(firstObj.shelfInfo)) {
    //     this.selectedObjects.shelfInfo = cloneDeep(firstObj.shelfInfo)
    //   }
    //   // 点击的模型是否为设施
    //   else if (!isEmpty(firstObj.name)) {
    //     this.selectedObjects.others = firstObj.name
    //   }
    //   this.$forceUpdate()
    // },
    /**
     * 窗口变动触发的方法
     */
    onWindowResize () {
      // 获取当前画布容器的长宽（不可使用this.container，其不是实时更新下的容器大小
      const container = document.querySelector('.container')
      const containerHeight = container.clientHeight
      const containerWidth = container.clientWidth
      // 修改镜头比例
      this.camera.aspect = containerWidth / containerHeight
      this.camera.updateProjectionMatrix()
      // 修改渲染的画布的大小
      this.renderer.setSize(containerWidth, containerHeight)
      this.animate()
    }
  },
  mounted () {
    // 创建画布容器
    this.container = document.querySelector('.container')
    // 初始化全部场景、灯光、相机、模型、渲染器、控制器等
    this.initAll()
    const axesHelper = new THREE.AxesHelper(250)
    this.scene.add(axesHelper)
    // this.$nextTick(() => {
    //   const container = document.querySelector('.container')
    // })
    // 监听窗口的大小改变
    window.onresize = this.onWindowResize
    // 仅监听3D部分的模型点击事件
    // this.container.addEventListener('click', this.clickModel, false)
  },
  watch: {
    loading: {
      handler (newV) {
        if (!newV) {
          this.animate()
        }
      }
    }
  },
  computed: {
    /**
     * mounted时的container的宽
     */
    containerWidth () {
      return this.container.clientWidth
    },
    /**
     * mounted时的container的高
     */
    containerHeight () {
      return this.container.clientHeight
    },
    windowWidth () {
      return window.innerWidth
    },
    windowHeight () {
      return window.innerHeight
    }
  },
  render () {
    return (
      <div class="threed-wrapper">
        {/** 3d画布 */}
        <div class="container"></div>
      </div>
    )
  }
}
</script>
<style lang="scss">
.threed-wrapper {
  height: 80vh;
  width: 100vh;
  position: relative;
}
.container {
  height: 100%;
  width: 100%;
}
</style>
