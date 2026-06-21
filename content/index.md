---
title: 维岳的闲杂记录
---
最小闭环 ： 思考,记录,复习,致用 

> 五线谱渲染已可用，见 [[五线谱测试]]

```mermaid
%% 最小闭环：思考 → 记录 → 复习 → 致用 →（回到）思考
flowchart LR
    A([思考]) --> B([记录])
    B --> C([复习])
    C --> D([致用])
    D -.-> A
```



> [!TIP] 
> 我是一个TIP 

> [!NOTE] 
> 我是一个NOTE 


> [!WARNING] 
> 我是一个WARNING 


> [!DANGER] 
> > 我是一个DANGER

---

## 🎲 Three.js 测试

<canvas id="three-canvas" style="width:100%; height:400px; border-radius:12px;"></canvas>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"
  }
}
</script>

<script type="module">
import * as THREE from 'three';

function initThree() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas || canvas.dataset.initialized) return;

  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 600;
  const h = rect.height || 400;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
  camera.position.z = 3;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x00bfff, metalness: 0.3, roughness: 0.4 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 2, 2);
  scene.add(light);

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;
    renderer.render(scene, camera);
  }
  animate();

  canvas.dataset.initialized = 'true';

  window.addEventListener('resize', () => {
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThree);
} else {
  initThree();
}
document.addEventListener('nav', initThree);
</script>