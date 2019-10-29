import ReactDOM from 'react-dom'
import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { Vector3 } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { Canvas, useLoader } from 'react-three-fiber'
import { useTransition, a } from 'react-spring/three'
import './styles.css'

const Scene = React.memo(({ urls }) => {
  const svgs = useLoader(SVGLoader, urls)
  const shapes = useMemo(
    () =>
      svgs.map(({ paths }) =>
        paths.flatMap((path, index) =>
          path.toShapes(true).map(shape => ({ shape, color: path.color, fillOpacity: path.userData.style.fillOpacity, index }))
        )
      ),
    [svgs]
  )

  const [page, setPage] = useState(0)
  useEffect(() => void setInterval(() => setPage(i => (i + 1) % urls.length), 3000), [])

  const transitions = useTransition(shapes[page], item => item.shape.uuid, {
    from: { rotation: [0, 0.2, 0], position: [0, 0, 0], opacity: 0 },
    enter: { rotation: [0, 0, 0], position: [0, 0, 0], opacity: 1 },
    leave: { rotation: [0, -0.2, 0], position: [0, 0, 0], opacity: 0 },
    order: ['leave', 'enter', 'update'],
    config: { mass: 4, tension: 500, friction: 100 },
    trail: 5,
    lazy: true,
    unique: true,
    reset: true
  })
  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight intensity={0.5} position={[300, 300, 4000]} />
      <a.group position={[300, 190, page]} rotation={[0, 0, Math.PI]}>
        {transitions.map(({ item: { shape, color, fillOpacity, index }, key, props: { opacity, position, rotation } }) => (
          <a.mesh key={key} rotation={rotation} position={position.interpolate((x, y, z) => [x, y, z + index])}>
            <a.meshPhongMaterial
              attach="material"
              color={color}
              opacity={opacity.interpolate(o => o * fillOpacity)}
              depthWrite={false}
              transparent
            />
            <shapeBufferGeometry attach="geometry" args={[shape]} />
          </a.mesh>
        ))}
      </a.group>
    </>
  )
})

function App() {
  return (
    <div className="main">
      <Canvas
        invalidateFrameloop
        camera={{ fov: 90, position: [0, 0, 350], near: 0.1, far: 20000 }}
        onCreated={({ camera }) => camera.lookAt(new Vector3(0, 0, 0))}>
        <Suspense fallback={null}>
          <Scene urls={['/1.svg', '/2.svg', '/4.svg', '/5.svg', '/6.svg', '/7.svg']} />
        </Suspense>
      </Canvas>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
