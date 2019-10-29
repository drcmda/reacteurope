import ReactDOM from 'react-dom'
import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { Vector3 } from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { Canvas, useLoader } from 'react-three-fiber'
import { useTransition, a } from 'react-spring/three'
import styled from 'styled-components'
import './styles.css'

const Scene = React.memo(({ urls, page, setPage }) => {
  const svgs = useLoader(SVGLoader, urls)
  const shapes = useMemo(
    () =>
      svgs.map(({ paths }) =>
        paths.flatMap((path, index) =>
          path
            .toShapes(true)
            .map(shape => ({ shape, color: path.color, fillOpacity: path.userData.style.fillOpacity, index })),
        ),
      ),
    [svgs],
  )

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
    reset: true,
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight intensity={0.5} position={[300, 300, 4000]} />
      <a.group position={[300, 250, page]} rotation={[0, 0, Math.PI]}>
        {transitions.map(
          ({ item: { shape, color, fillOpacity, index }, key, props: { opacity, position, rotation } }) => (
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
          ),
        )}
      </a.group>
    </>
  )
})

const TextContainer = styled.div`
  position: absolute;
  top: 77%;
  left: 50%;
  color: black;
  width: 60%;
  font-weight: 800;
  font-size: 4em;
  transform: translate3d(-50%,0,0);
  font-family: 'Roboto', sans-serif;
`

const Text = styled.div`
  position: absolute;
  text-align: center;
  width: 100%;
  transition: all 1s;
`

function App() {
  const [page, setPage] = useState(0)
  const text = [
    '1 Hackathon',
    'Beautiful Paris',
    'French buffet',
    '6 Workshops',
    '+18 talks and 12 lightning talks',
    'All your favorite projects and tools as well as new ones',
    'Bar night',
  ]
  return (
    <div className="main">
      <Canvas
        invalidateFrameloop
        camera={{ fov: 90, position: [0, 0, 350], near: 0.1, far: 20000 }}
        onCreated={({ camera }) => camera.lookAt(new Vector3(0, 0, 0))}>
        <Suspense fallback={null}>
          <Scene page={page} setPage={setPage} urls={['/1.svg', '/2.svg', '/4.svg', '/5.svg', '/6.svg', '/7.svg']} />
        </Suspense>
      </Canvas>
      <TextContainer>
        {text.map((text, index) => (
          <Text
            style={{
              opacity: page !== index ? 0 : 1,
              transform: `translate3d(0,${page !== index ? 0 : -20}px, 0)`,
            }}
            key={index}>
            {text}
          </Text>
        ))}
      </TextContainer>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
