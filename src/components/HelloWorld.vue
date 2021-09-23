<script>
import { getOffsetTop, getOffsetLeft, isEmpty } from "@/utils/common.js";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { log } from "three";
const OrbitControls = require("three-orbit-controls")(THREE);
export default {
  name: "HelloWorld",
  data() {
    return {
      objUrl: "./11803_Airplane_v1_l1.obj", // 模型地址
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
      timer: null,
      mixer: null,
      AnimationAction: null
    };
  },
  methods: {
    /**
     * 初始化场景
     */
    initScene() {
      this.scene = new THREE.Scene();
    },
    /**
     * 初始化灯光
     */
    initLight() {
      // 平行光，模拟远处类似太阳的光源
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
      directionalLight.color.setHSL(0.1, 1, 0.95);
      directionalLight.position.set(0, 200, 0).normalize();
      this.scene.add(directionalLight);
      // 环境光AmbientLight,影响整个场景的光源
      const ambient = new THREE.AmbientLight(0xffffff, 1);
      ambient.position.set(0, 0, 0);
      this.scene.add(ambient);
    },
    /**
     * 初始化相机
     */
    initCamera() {
      this.camera = new THREE.PerspectiveCamera(
        50,
        this.containerWidth / this.containerHeight,
        0.1,
        10000
      );
      this.camera.position.set(-250, 0, 0);
    },
    /**
     * 初始化渲染器
     */
    initRenderer() {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      // 设置渲染区域尺寸
      this.renderer.setSize(this.containerWidth, this.containerHeight);
      // 设置背景颜色
      this.renderer.setClearColor(0x4682b4, 1.0);
      this.container.appendChild(this.renderer.domElement);
    },
    /**
     * 初始化控制器
     */
    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.5;
      // 平移速度
      this.controls.panSpeed = 3;
      // 缩放速度
      this.controls.zoomSpeed = 3;
      // 视角最小距离
      this.controls.minDistance = 50;
      // 视角最远距离
      this.controls.maxDistance = 5000;
      // 上下翻转的最大角度
      this.controls.maxPolarAngle = 1.5;
      // this.controls.maxPolarAngle = Math.PI / 2
      //   this.controls.target = new THREE.Vector3(50, 50, 0);
    },
    /**
     * 动画
     */
    animate() {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.animate);
    },
    /**
     * 添加背景
     * @param {*} size 盒子大小  */
    addSkybox(size) {
      const urls = [
        require("@/assets/img/skybox/远山_RT.jpg"), // right
        require("@/assets/img/skybox/远山_LF.jpg"), // left
        require("@/assets/img/skybox/远山_UP.jpg"), // top
        require("@/assets/img/skybox/远山_DN.jpg"), // bottom
        require("@/assets/img/skybox/远山_BK.jpg"), // back
        require("@/assets/img/skybox/远山_FR.jpg") // front
      ];
      new THREE.CubeTextureLoader().load(urls, oj => {
        this.scene.background = oj;
      });
    },
    /**
     * 创建网格模型
     */
    createMesh() {
      this.clock = new THREE.Clock();
      // 加载模型路径
      const MODEL_PATH = this.objUrl;
      // 加载模型
      const loader = new OBJLoader();
      loader.load(
        MODEL_PATH,
        loadedMesh => {
          // 加载图片贴图
          const loader1 = new THREE.TextureLoader();
          loader1.load(require("@/assets/img/airplane_body.jpg"), texture => {
            const bodymaterial = new THREE.MeshPhongMaterial({
              map: texture,
              color: 0xe3e4df
            });
            // 另一种方法，分开写
            bodymaterial.map.matrix.scale(1, 1); // 缩放
            // material.transparent = true
            bodymaterial.opacity = 1;
            const othermaterial = new THREE.MeshPhongMaterial({
              color: 0xe3e4df
            });
            const wheelmaterial = new THREE.MeshPhongMaterial({
              color: 0x000000
            });
            // 加载完obj文件是一个场景组，遍历它的子元素，赋值纹理并且更新面和点的发现了
            loadedMesh.children.forEach(child => {
              // console.log(child.name)
              if (
                [
                  "11803_Airplane_body",
                  "11803_Airplane_wing_details_L",
                  "11803_Airplane_wing_details_R"
                ].includes(child.name)
              ) {
                child.material = bodymaterial;
                // child.geometry.computeFaceNormals()
                // child.geometry.computeVertexNormals()
              } else if (
                [
                  "11803_Airplane_wing_holder_L",
                  "11803_Airplane_wing_holder_R"
                ].includes(child.name)
              ) {
                child.material = wheelmaterial;
              } else {
                child.material = othermaterial;
              }
            });
            // themodel为加载的模型实例
            // console.log(loadedMesh)
            this.theModel1 = loadedMesh;
            // 模型位置改变
            this.theModel1.position.set(0, 0, 0);
            // 模型大小改变
            const smallNnm = 0.05;
            this.theModel1.scale.set(smallNnm, smallNnm, smallNnm);
            this.theModel1.rotation.set(-Math.PI / 2, 0, 0);
            // this.theModel1.rotateX(-Math.PI / 2);
            // this.theModel1.rotateY(-Math.PI / 4);
            // console.log(this.theModel1.size);
            // this.scene.add(this.theModel1)
            this.scene.add(this.theModel1);
          });
          // var material = new THREE.MeshLambertMaterial({ color: 0x5c3a21 })
          // const material = new THREE.MeshPhongMaterial({ color: 0x5c3a21 })
        },
        undefined,
        function(error) {
          console.log(error, "error");
        }
      );
    },
    /*
    创建地板/跑道
    */
    createFloor() {
      const loader = new THREE.TextureLoader();
      loader.load(require("@/assets/img//skybox/远山_DN.jpg"), texture => {
        // wrapS是x轴方向的行为，wrapT是y轴方向的行为
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping// THREE.RepeatWrapping:允许重复自己
        // texture.repeat.set(10, 10)
        const floorGeometry = new THREE.BoxGeometry(2000, 5, 2000);
        const floorMaterial = new THREE.MeshBasicMaterial({
          map: texture
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.name = "地面草地";
        floor.scale.set(10, 1, 20);
        // floor.rotateY(-Math.PI / 2)
        floor.position.set(0, -15, 0);
        this.scene.add(floor);
      });
      loader.load(require("@/assets/img/跑道.png"), texture => {
        // wrapS是x轴方向的行为，wrapT是y轴方向的行为
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping// THREE.RepeatWrapping:允许重复自己
        // texture.repeat.set(10, 10)
        const floorGeometry = new THREE.BoxGeometry(30, 5, 100);
        const floorMaterial = new THREE.MeshBasicMaterial({
          map: texture
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.name = "地面";
        floor.scale.set(10, 1, 20);
        floor.rotateY(-Math.PI / 2);
        floor.position.set(850, -10, 0);
        this.scene.add(floor);
      });
    },
    /**
     * 创建管道
     *
     */
    createCube() {
      /**
       * 创建一个设置重复纹理的管道
       */
      this.curve = new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(500, 100, 0),
          new THREE.Vector3(1000, 400, 0),
          new THREE.Vector3(2000, 470, 0),
          new THREE.Vector3(3000, 400, 0),
          new THREE.Vector3(3500, 100, 0),
          new THREE.Vector3(4000, 0, 0)
        ],
        false /* 是否闭合 */
        // 'centripetal',
        // 0.9
      );
      var tubeGeometry = new THREE.TubeGeometry(
        this.curve,
        100,
        0.6,
        30,
        false
      );
      var textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(require("@/assets/img/logo.png"));
      // 设置阵列模式为 RepeatWrapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // 设置x方向的偏移(沿着管道路径方向)，y方向默认1
      // 等价texture.repeat= new THREE.Vector2(20,1)
      texture.repeat.x = 20;
      var tubeMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        transparent: true
      });
      this.texture = texture;
      var tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      this.scene.add(tube);
      /**
       * 创建一个半透明管道
       */
      //   var tubeGeometry2 = new THREE.TubeGeometry(this.curve, 100, 2, 50, false)
      //   var tubeMaterial2 = new THREE.MeshPhongMaterial({
      //     color: 0x4488ff,
      //     transparent: true,
      //     opacity: 0.3
      //   })
      //   var tube2 = new THREE.Mesh(tubeGeometry2, tubeMaterial2)
      //   this.scene.add(tube2)

      //   this.scene.add(new THREE.AxesHelper(300))
    },
    /**
     * 全部初始化
     */
    initAll() {
      this.initScene();
      this.initLight();
      this.addSkybox();
      this.createFloor();
      this.createMesh();
      this.createCube();
      this.initCamera();
      this.initRenderer();
      this.initControls();
      this.animate();
    },
    /**
     * 窗口变动触发的方法
     */
    onWindowResize() {
      // 获取当前画布容器的长宽（不可使用this.container，其不是实时更新下的容器大小
      const container = document.querySelector(".container");
      const containerHeight = container.clientHeight;
      const containerWidth = container.clientWidth;
      // 修改镜头比例
      this.camera.aspect = containerWidth / containerHeight;
      this.camera.updateProjectionMatrix();
      // 修改渲染的画布的大小
      this.renderer.setSize(containerWidth, containerHeight);
      this.animate();
    },
    startMove() {
      this.progress = 0;
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.progress > 1.0) {
          return; // 停留在管道末端,否则会一直跑到起点 循环再跑
        }
        this.progress += 0.0009;
        if (this.curve) {
          const point = this.curve.getPoint(this.progress);
          if (point && point.x) {
            this.theModel1.position.set(point.x, point.y, point.z);
            console.log(this.theModel1);
            // this.theModel1.lookAt(point.x, point.y, point.z);
            this.theModel1.rotation.set(-Math.PI / 2, 0, 0);
          }
        }
      });
    }
  },
  mounted() {
    // 创建画布容器
    this.container = document.querySelector(".container");
    // 初始化全部场景、灯光、相机、模型、渲染器、控制器等
    this.initAll();
    // const axesHelper = new THREE.AxesHelper(1000);
    // this.scene.add(axesHelper);
    // 监听窗口的大小改变
    window.onresize = this.onWindowResize;
  },
  computed: {
    /**
     * mounted时的container的宽
     */
    containerWidth() {
      return this.container.clientWidth;
    },
    /**
     * mounted时的container的高
     */
    containerHeight() {
      return this.container.clientHeight;
    },
    windowWidth() {
      return window.innerWidth;
    },
    windowHeight() {
      return window.innerHeight;
    }
  },
  render() {
    return (
      <div class="threed-wrapper">
        {/** 3d画布 */}
        <div class="container"></div>
        <button class="btn" onClick={this.startMove}>
          开始运动
        </button>
      </div>
    );
  }
};
</script>
<style lang="css">
.threed-wrapper {
  height: 100vh;
  width: 100vw;
  position: relative;
}
.container {
  height: 100%;
  width: 100%;
}
.btn {
  position: fixed;
  left: 10px;
  bottom: 10px;
}
</style>
