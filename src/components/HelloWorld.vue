<script>
import {
  getOffsetTop,
  getOffsetLeft,
  isEmpty,
  ResourceTracker
} from "@/utils/common.js";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
// import Stats from "three/examples/js/libs/stats.min.js";
const OrbitControls = require("three-orbit-controls")(THREE);

// 在外层定义resMgr和track
let resMgr = new ResourceTracker();
const track = resMgr.track.bind(resMgr);

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
      AnimationAction: null,
    //   stats: null,
      planeInfo: null,
      animationTimer: null,
      raycaster: null,
      mouse: null
    };
  },
  methods: {
    initStats() {
      //stats对象初始化
      this.stats = new Stats();
      this.stats.domElement.style.position = "absolute"; //绝对坐标
      this.stats.domElement.style.left = "0px"; // (0,0)px,左上角
      this.stats.domElement.style.top = "0px";
      document
        .querySelector(".canvas-frame")
        .appendChild(this.stats.domElement);
      // document.body.appendChild(this.stats.domElement)
    },
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
      const directionalLight = track(new THREE.DirectionalLight(0xffffff, 0.3));
      directionalLight.color.setHSL(0.1, 1, 0.95);
      directionalLight.position.set(0, 200, 0).normalize();
      this.scene.add(directionalLight);
      // 环境光AmbientLight,影响整个场景的光源
      const ambient = track(new THREE.AmbientLight(0xffffff, 1));
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
//       this.controls.mouseButtons = {
// 	LEFT: THREE.MOUSE.ROTATE,
// 	MIDDLE: THREE.MOUSE.DOLLY,
// 	// RIGHT: THREE.MOUSE.RIGHT
// 	RIGHT: null
// }
// this.controls.enablePan=true;// 允许平移 只有这个设为true时，下面两个参数才有意义

// this.controls.hylMovePanY=false;//关闭垂直平移相机

// this.controls.hylMovePanX=true;// 开启水平移动相机

      // this.controls.maxPolarAngle = Math.PI / 2
      //   this.controls.target = new THREE.Vector3(50, 50, 0);
    },
    /**
     * 动画
     */
    animate() {
      cancelAnimationFrame(this.animationTimer);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    //   this.stats.update();
      this.animationTimer = requestAnimationFrame(this.animate);
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
      track(new THREE.CubeTextureLoader()).load(urls, oj => {
        this.scene.background = oj;
      });
    },
    /**
     * 创建网格模型
     */
    createMesh() {
      this.clock = track(new THREE.Clock());
      // 加载模型路径
      const MODEL_PATH = this.objUrl;
      // 加载模型
      const loader = track(new OBJLoader());
      loader.load(
        MODEL_PATH,
        loadedMesh => {
          // 加载图片贴图
          const loader1 = track(new THREE.TextureLoader());
          loader1.load(require("@/assets/img/airplane_body.jpg"), texture => {
            const bodymaterial = track(
              new THREE.MeshPhongMaterial({
                map: texture,
                color: 0xe3e4df
              })
            );
            // 另一种方法，分开写
            bodymaterial.map.matrix.scale(1, 1); // 缩放
            // material.transparent = true
            bodymaterial.opacity = 1;
            const othermaterial = track(
              new THREE.MeshPhongMaterial({
                color: 0xe3e4df
              })
            );
            const wheelmaterial = track(
              new THREE.MeshPhongMaterial({
                color: 0x000000
              })
            );
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

            // 添加圆形模型
            // let tipCircle = new THREE.CircleGeometry(guiControls.radius, guiControls.segments, guiControls.thetaStart, guiControls.thetaLength)

            /**
             * 创建点精灵模型
             */
            var canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 180;
            var c = canvas.getContext("2d");
            // 矩形区域填充背景
            c.fillStyle = "#ffffff";
            c.fillRect(0, 0, 512, 180);
            c.beginPath();
            // 文字
            c.beginPath();
            c.translate(250, 20);
            c.fillStyle = "#000000"; //文本填充颜色
            c.font = "bold 48px 宋体"; //字体样式设置
            c.textBaseline = "middle"; //文本与fillText定义的纵坐标
            c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
            c.fillText(`航班号： CA1234`, 0, 10);
            c.fillText(`计划时间： 10:45`, 0, 65);
            c.fillText(`目的地： 重庆`, 0, 120);

            document.body.appendChild(canvas);
            // canvas画布可以理解为一张图片
            var texture = track(new THREE.CanvasTexture(canvas));
            document.body.removeChild(canvas)
            // 创建精灵材质对象SpriteMaterial
            var spriteMaterial = track(
              new THREE.SpriteMaterial({
                map: texture, //设置精灵纹理贴图
                transparent: true //开启透明(纹理图片png有透明信息)
              })
            );
            // 创建精灵模型对象，不需要几何体geometry参数
            var sprite = track(new THREE.Sprite(spriteMaterial));
            sprite.position.set(20, 20, 20);
            sprite.scale.set(50, 30, 10); //精灵大小
            // 把精灵模型插入到模型对象的父对象下面
            this.theModel1.add(sprite);
            // 父对象group位置变化,网格模型及其对象的标签同样发生变化
            // group.position.set(10, 0, -80);
            // 表示标签信息的精灵模型对象相对父对象设置一定的偏移
            // sprite.translateY(30);
            // this.scene.add(sprite)
            // console.log(this.theModel1);
            // sprite.position.set(20, 20, 20);
            // sprite.scale.set(50, 30, 10); //精灵大小
            this.scene.add(this.theModel1);
            this.theModel1.children[
              this.theModel1.children.length - 1
            ].translateZ(1000);
            this.theModel1.children[
              this.theModel1.children.length - 1
            ].scale.set(1000, 600, 200);
            this.theModel1.children.map(item => {
              item.info = {
                name: "CA1234",
                time: "10:45",
                aim: "重庆"
              };
              return item;
            });
            this.theModel1.info = {
              name: "CA1234",
              time: "10:45",
              aim: "重庆"
            };
          });
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
      const loader = track(new THREE.TextureLoader());
      loader.load(require("@/assets/img//skybox/远山_DN.jpg"), texture => {
        // wrapS是x轴方向的行为，wrapT是y轴方向的行为
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping// THREE.RepeatWrapping:允许重复自己
        // texture.repeat.set(10, 10)
        const floorGeometry = track(new THREE.BoxGeometry(2000, 5, 2000));
        const floorMaterial = track(
          new THREE.MeshBasicMaterial({
            map: texture
          })
        );
        const floor = track(new THREE.Mesh(floorGeometry, floorMaterial));
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
        const floorGeometry = track(new THREE.BoxGeometry(30, 5, 100));
        const floorMaterial = track(
          new THREE.MeshBasicMaterial({
            map: texture
          })
        );
        const floor = track(new THREE.Mesh(floorGeometry, floorMaterial));
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
      this.curve = track(
        new THREE.CatmullRomCurve3(
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
        )
      );
      let tubeGeometry = track(
        new THREE.TubeGeometry(this.curve, 100, 0.6, 30, false)
      );
      var textureLoader = track(new THREE.TextureLoader());
      const texture = textureLoader.load(require("@/assets/img/logo.png"));
      // 设置阵列模式为 RepeatWrapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // 设置x方向的偏移(沿着管道路径方向)，y方向默认1
      // 等价texture.repeat= new THREE.Vector2(20,1)
      texture.repeat.x = 20;
      var tubeMaterial = track(
        new THREE.MeshPhongMaterial({
          map: texture,
          transparent: true
        })
      );
      this.texture = texture;
      var tube = track(new THREE.Mesh(tubeGeometry, tubeMaterial));
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
    initMouse() {
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();
    },
    /**
     * 全部初始化
     */
    initAll() {
    //   this.initStats();
      this.initScene();
      this.initLight();
      this.addSkybox();
      this.createFloor();
      this.createMesh();
      this.createCube();
    //   this.initMouse();
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
        if (this.curve&&this.theModel1) {
            this.progress += 0.0009;
          const point = this.curve.getPoint(this.progress);
          if (point && point.x) {
            this.theModel1.position.set(point.x, point.y, point.z);
            // console.log(this.theModel1);
            // this.theModel1.lookAt(point.x, point.y, point.z);
            this.theModel1.rotation.set(-Math.PI / 2, 0, 0);
          }
        }
      });
    },
    /**
     * 点击模型
     */
    clickModel(event) {
      // 清空之前选中的模型信息
      this.planeInfo = null;
      // 获取container元素的左边距和上边距
      let leftDistance = getOffsetLeft(this.container, true);
      let topDistance = getOffsetTop(this.container, true);
      console.log(leftDistance, topDistance);
      // 获取相对于浏览器位置的鼠标坐标
      let x, y;
      if (event.changedTouches) {
        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;
      } else {
        x = event.clientX;
        y = event.clientY;
      }
      // 将相对于浏览器位置的鼠标坐标转换成画布中的坐标（去除container元素的上边距和左边距）
      this.mouse.x = ((x - leftDistance) / this.containerWidth) * 2 - 1;
      this.mouse.y = -((y - topDistance) / this.containerHeight) * 2 + 1;
      console.log(this.mouse.x, this.mouse.y);
      // 设置射线的角度
      this.raycaster.setFromCamera(this.mouse, this.camera);
      // 获取射线中的所有模型
      let intersects = this.raycaster.intersectObjects([this.scene], true);
      console.log(intersects);
      if (isEmpty(intersects)) return;
      // 获取射线中的第一个模型(用户点击的模型)并获取详情
      let firstObj = intersects[0].object;
      // 点击的模型是否为商品
      this.planeInfo = firstObj.info ? firstObj.info : null;
      this.$forceUpdate();
    },
    disposeAll() {
      try {
        this.theModel1.traverse(item => {
          if (item instanceof THREE.Mesh) {
            item.geometry.dispose(); // 删除几何体
            item.material.dispose(); // 删除材质
          }else if(item instanceof THREE.Sprite){
            console.log(item.geometry.dispose,item.material.dispose);
          }
        });
        this.raycaster = null;
        this.mouse = null;
        console.log(this.scene.dispose);
        this.scene.dispose();
        resMgr && resMgr.dispose();
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer.content = null;
        cancelAnimationFrame(this.animationTimer);
        this.renderer.domElement = null;
        this.renderer = null;
        // let gl = renderer.domElement.getContext("webgl");
        // gl && gl.getExtension("WEBGL_lose_context").loseContext();
        // console.log(renderer.info)   //查看memery字段即可
        console.log('ok');
        
      } catch (e) {
        console.log(e);
      }
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
    // 仅监听3D部分的模型点击事件
    // this.container.addEventListener("click", this.clickModel, false);
    window.addEventListener("beforeunload", (e)=> {
      this.disposeAll();
    });
  },
  beforeDestroy() {
    this.disposeAll();
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
        <div class="canvas-frame"></div>
        {/** 属性展示面板内容 */}
        {false ? (
          <div class="threed-property-content">
            {this.planeInfo ? (
              <div>
                <div class="single">
                  <div>航班号：</div>
                  <div>{this.planeInfo.name}</div>
                </div>
                <div class="single">
                  <div>计划时间：</div>
                  <div>{this.planeInfo.time}</div>
                </div>
                <div class="single">
                  <div>目的地：</div>
                  <div>{this.planeInfo.aim}</div>
                </div>
              </div>
            ) : (
              <span>暂无数据</span>
            )}
          </div>
        ) : null}
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
.threed-property-content {
  position: fixed;
  padding: 10px 15px;
  width: 200px;
  height: 80px;
  font-size: 20px;
  right: 10px;
  top: 10px;
  background-color: white;
}
.single {
  display: flex;
  justify-content: space-between;
}
.btn {
  position: fixed;
  padding: 10px 15px;
  font-size: 20px;
  left: 10px;
  bottom: 10px;
}
</style>
