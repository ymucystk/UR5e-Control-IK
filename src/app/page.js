"use client";
import * as React from 'react'
import Controller from './controller.js'

export default function Home() {
  const [rendered,set_rendered] = React.useState(false)
  const robotNameList = ["UR5e"]
  const [robotName,set_robotName] = React.useState(robotNameList[0])

  const [j1_rotate,set_j1_rotate] = React.useState(0)
  const [j2_rotate,set_j2_rotate] = React.useState(0)
  const [j3_rotate,set_j3_rotate] = React.useState(0)
  const [j4_rotate,set_j4_rotate] = React.useState(0)
  const [j5_rotate,set_j5_rotate] = React.useState(0)
  const [j6_rotate,set_j6_rotate] = React.useState(0)
  const [j7_rotate,set_j7_rotate] = React.useState(0)

  const [j1_object,set_j1_object] = React.useState()
  const [j2_object,set_j2_object] = React.useState()
  const [j3_object,set_j3_object] = React.useState()
  const [j4_object,set_j4_object] = React.useState()
  const [j5_object,set_j5_object] = React.useState()
  const [j6_object,set_j6_object] = React.useState()

  const [j1_pos,set_j1_pos] = React.useState({x:0,y:0,z:0})
  const [j1_rot,set_j1_rot] = React.useState({x:0,y:0,z:0})
  const [j2_pos,set_j2_pos] = React.useState({x:0,y:0,z:0})
  const [j2_rot,set_j2_rot] = React.useState({x:0,y:0,z:0})
  const [j3_pos,set_j3_pos] = React.useState({x:0,y:0,z:0})
  const [j3_rot,set_j3_rot] = React.useState({x:0,y:0,z:0})
  const [j4_pos,set_j4_pos] = React.useState({x:0,y:0,z:0})
  const [j4_rot,set_j4_rot] = React.useState({x:0,y:0,z:0})
  const [j5_pos,set_j5_pos] = React.useState({x:0,y:0,z:0})
  const [j5_rot,set_j5_rot] = React.useState({x:0,y:0,z:0})
  const [j6_pos,set_j6_pos] = React.useState({x:0,y:0,z:0})
  const [j6_rot,set_j6_rot] = React.useState({x:0,y:0,z:0})

  const [j1_q,set_j1_q] = React.useState({x:0,y:0,z:0,w:1})
  const [j2_q,set_j2_q] = React.useState({x:0,y:0,z:0,w:1})
  const [j3_q,set_j3_q] = React.useState({x:0,y:0,z:0,w:1})
  const [j4_q,set_j4_q] = React.useState({x:0,y:0,z:0,w:1})
  const [j5_q,set_j5_q] = React.useState({x:0,y:0,z:0,w:1})
  const [j6_q,set_j6_q] = React.useState({x:0,y:0,z:0,w:1})


  const [c_pos_x,set_c_pos_x] = React.useState(0)
  const [c_pos_y,set_c_pos_y] = React.useState(0.6)
  const [c_pos_z,set_c_pos_z] = React.useState(1.0)
  const [c_deg_x,set_c_deg_x] = React.useState(0)
  const [c_deg_y,set_c_deg_y] = React.useState(0)
  const [c_deg_z,set_c_deg_z] = React.useState(0)

  const [target,set_target] = React.useState({x:0,y:1.2,z:0})

  const toolNameList = ["No tool","Gripper","E-Pick"]
  const [toolName,set_toolName] = React.useState(toolNameList[0])
  let registered = false

  const robotChange = ()=>{
    const get = (robotName)=>{
      let changeIdx = robotNameList.findIndex((e)=>e===robotName) + 1
      if(changeIdx >= robotNameList.length){
        changeIdx = 0
      }
      return robotNameList[changeIdx]
    }
    set_robotName(get)
  }

  React.useEffect(() => {
    if (j1_object !== undefined) {
      const yAxis = new THREE.Vector3(0,1,0);
      j1_object.quaternion.setFromAxisAngle(yAxis,j1_rotate*(Math.PI/180))
//      const oj1 = document.getElementById('oj1').object3D
//      const cj1 = document.getElementById('cj1').object3D

    }
  }, [j1_rotate])

  React.useEffect(() => {
    if (j2_object !== undefined) {
      const yAxis = new THREE.Vector3(1,0,0);
      j2_object.quaternion.setFromAxisAngle(yAxis,j2_rotate*(Math.PI/180))
    }
  }, [j2_rotate])

  React.useEffect(() => {
    if (j3_object !== undefined) {
      const yAxis = new THREE.Vector3(1,0,0);
      j3_object.quaternion.setFromAxisAngle(yAxis,j3_rotate*(Math.PI/180))
    }
  }, [j3_rotate])

  React.useEffect(() => {
    if (j4_object !== undefined) {
      const yAxis = new THREE.Vector3(1,0,0);
      j4_object.quaternion.setFromAxisAngle(yAxis,j4_rotate*(Math.PI/180))
    }
  }, [j4_rotate])

  React.useEffect(() => {
    if (j5_object !== undefined) {
      const yAxis = new THREE.Vector3(0,1,0);
      j5_object.quaternion.setFromAxisAngle(yAxis,j5_rotate*(Math.PI/180))
    }
  }, [j5_rotate])

  React.useEffect(() => {
    if (j6_object !== undefined) {
      const yAxis = new THREE.Vector3(1,0,0);
      j6_object.quaternion.setFromAxisAngle(yAxis,j6_rotate*(Math.PI/180))
    }
  }, [j6_rotate])

  const round = (x,d=5)=>{
    const v = 10 ** (d|0)
    return Math.round(x*v)/v
  }

  const getposq = (parts_obj)=>{
    const mat = parts_obj.matrixWorld
    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();
    let scale = new THREE.Vector3()
    mat.decompose(position, quaternion, scale)
    return {position, quaternion, scale}
  }

  const getquaternion_Euler = (quaternion)=>{
    const euler = new THREE.Euler();
    euler.setFromQuaternion(quaternion);
    const wkrot = {x:round(euler.x*(180/Math.PI)),y:round(euler.y*(180/Math.PI)),z:round(euler.z*(180/Math.PI))}
    return wkrot
  }

  const getpos = (position)=>{
    const wkpos = {x:round(position.x),y:round(position.y),z:round(position.z)}
    return wkpos
  }

  React.useEffect(() => {
    if (j1_object !== undefined && j2_object !== undefined && j3_object !== undefined &&
      j4_object !== undefined && j5_object !== undefined && j6_object !== undefined) {

      const j1_result = getposq(j1_object)
      const j1_wkq = new THREE.Quaternion();
      j1_wkq.copy(j1_object.quaternion).normalize()
      const j1_rot = getquaternion_Euler(j1_wkq)
      set_j1_q({x:j1_wkq.x,y:j1_wkq.y,z:j1_wkq.z,w:j1_wkq.w})
      const j1_pos = getpos(j1_result.position)
      set_j1_pos(j1_pos)
      set_j1_rot(j1_rot)

      // やりたいことは、グローバル座標における J2 姿勢の取得
      // J2 の姿勢は、J1 の姿勢に J2 の回転を掛けたもの
      const j2_result = getposq(j2_object)
      const j2_wkq = new THREE.Quaternion();
      // これ逆じゃない？
//      j2_wkq.multiplyQuaternions(j2_object.quaternion,j1_wkq).normalize()
      j2_wkq.multiplyQuaternions(j1_wkq,j2_object.quaternion).normalize()

      set_j2_q({x:j2_wkq.x,y:j2_wkq.y,z:j2_wkq.z,w:j2_wkq.w}) 
      const j2_pos = getpos(j2_result.position)
      set_j2_pos(j2_pos)
      set_j2_rot(j2_rot)

      const j3_result = getposq(j3_object)
      const j3_wkq = new THREE.Quaternion();
//      j3_wkq.multiplyQuaternions(j3_object.quaternion,j2_wkq).normalize()
      j3_wkq.multiplyQuaternions(j2_wkq,j3_object.quaternion).normalize()
      set_j3_q({x:j3_wkq.x,y:j3_wkq.y,z:j3_wkq.z,w:j3_wkq.w})

      const j3_rot = getquaternion_Euler(j3_wkq)
      const j3_pos = getpos(j3_result.position)
      set_j3_pos(j3_pos)
      set_j3_rot(j3_rot)

      const j4_result = getposq(j4_object)
      const j4_wkq = new THREE.Quaternion();
//      j4_wkq.multiplyQuaternions(j4_object.quaternion,j3_wkq).normalize()
      j4_wkq.multiplyQuaternions(j3_wkq,j4_object.quaternion).normalize()
      set_j4_q({x:j4_wkq.x,y:j4_wkq.y,z:j4_wkq.z,w:j4_wkq.w})

      const j4_rot = getquaternion_Euler(j4_wkq)
      const j4_pos = getpos(j4_result.position)
      set_j4_pos(j4_pos)
      set_j4_rot(j4_rot)

      const j5_result = getposq(j5_object)
      const j5_wkq = new THREE.Quaternion();
//      j5_wkq.multiplyQuaternions(j5_object.quaternion,j4_wkq).normalize()
      j5_wkq.multiplyQuaternions(j4_wkq,j5_object.quaternion).normalize()
      set_j5_q({x:j5_wkq.x,y:j5_wkq.y,z:j5_wkq.z,w:j5_wkq.w})
      
      const j5_rot = getquaternion_Euler(j5_wkq)
      const j5_pos = getpos(j5_result.position)
      set_j5_pos(j5_pos)
      set_j5_rot(j5_rot)

      const j6_result = getposq(j6_object)
      const j6_wkq = new THREE.Quaternion();
//      j6_wkq.multiplyQuaternions(j6_object.quaternion,j5_wkq).normalize()
      j6_wkq.multiplyQuaternions(j5_wkq,j6_object.quaternion).normalize()
      set_j6_q({x:j6_wkq.x,y:j6_wkq.y,z:j6_wkq.z,w:j6_wkq.w})

      const j6_rot = getquaternion_Euler(j6_wkq)
      const j6_pos = getpos(j6_result.position)
      //  console.log(`Q x:${result.rot.x} y:${result.rot.y} z:${result.rot.z}`)
      //  console.log(`P x:${result.pos.x} y:${result.pos.y} z:${result.pos.z}`)
      set_j6_pos(j6_pos)
      set_j6_rot(j6_rot)
    }
  },[target,j1_rotate,j2_rotate,j3_rotate,j4_rotate, j5_rotate])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      require("aframe");
      setTimeout(set_rendered(true),1000)
      console.log('set_rendered')

      if(!registered){
        registered = true
        AFRAME.registerComponent('robot-click', {
          init: function () {
            this.el.addEventListener('click', (evt)=>{
              robotChange()
              console.log('robot-click')
            });
          }
        });
        AFRAME.registerComponent('setq', {
          schema: {type: 'vec4', default: { x:0 , y:0,z:0,w:1}}
          ,
          init: function () {
              this.el.object3D.quaternion.set(this.data.x,this.data.y,this.data.z,this.data.w)
          },
          update: function () {
            this.el.object3D.quaternion.set(this.data.x,this.data.y,this.data.z,this.data.w)
          }
        });



        AFRAME.registerComponent('j1', {
          init: function () {
            set_j1_object(this.el.object3D)
          }
        });
        AFRAME.registerComponent('j2', {
          init: function () {
            set_j2_object(this.el.object3D)
          }
        });
        AFRAME.registerComponent('j3', {
          init: function () {
            set_j3_object(this.el.object3D)
          }
        });
        AFRAME.registerComponent('j4', {
          init: function () {
            set_j4_object(this.el.object3D)
          }
        });
        AFRAME.registerComponent('j5', {
          init: function () {
            set_j5_object(this.el.object3D)
          }
        });
        AFRAME.registerComponent('j6', {
          init: function () {
            set_j6_object(this.el.object3D)
          }
        });
      }
    }
  }, [typeof window])

  const edit_pos = (posxyz)=>`${posxyz.x} ${posxyz.y} ${posxyz.z}`

  const controllerProps = {
    robotName, robotNameList, set_robotName,
    target, set_target,
    toolName, toolNameList, set_toolName,
    j1_rotate,set_j1_rotate,j2_rotate,set_j2_rotate,j3_rotate,set_j3_rotate,
    j4_rotate,set_j4_rotate,j5_rotate,set_j5_rotate,j6_rotate,set_j6_rotate,j7_rotate,set_j7_rotate,
    c_pos_x,set_c_pos_x,c_pos_y,set_c_pos_y,c_pos_z,set_c_pos_z,
    c_deg_x,set_c_deg_x,c_deg_y,set_c_deg_y,c_deg_z,set_c_deg_z
  }

  const robotProps = {
    robotNameList, robotName, j1_rotate, j2_rotate, j3_rotate, j4_rotate, j5_rotate, j6_rotate, j7_rotate,
    toolNameList, toolName,
  }

  if(rendered){
    return (
    <>
      <a-scene>
        <a-plane position="0 0 0" rotation="-90 0 0" width="10" height="10" color="#7BC8A4" shadow></a-plane>
        <Assets/>
        <Select_Robot {...robotProps}/>
        <a-entity light="type: directional; color: #EEE; intensity: 0.7" position="1 1 1"></a-entity>
        <a-entity light="type: directional; color: #EEE; intensity: 0.7" position="-1 1 1"></a-entity>
        <a-entity id="rig" position={`${c_pos_x} ${c_pos_y} ${c_pos_z}`} rotation={`${c_deg_x} ${c_deg_y} ${c_deg_z}`}>
          <a-camera id="camera" cursor="rayOrigin: mouse;" position="0 0 0"></a-camera>
        </a-entity>
        <a-sphere position={edit_pos(target)} scale="0.012 0.012 0.012" color="yellow" visible={true}></a-sphere>
        <Cursor3dp id="cj1" pos={j1_pos} rot={j1_rot} visible={false}></Cursor3dp>
        <Cursor3dpQ id="qj1" pos={j1_pos} q={j1_q} visible={true}></Cursor3dpQ>
        <Cursor3dpQ id="qj2" pos={j2_pos} q={j2_q} visible={true}></Cursor3dpQ>
        <Cursor3dpQ id="qj3" pos={j3_pos} q={j3_q} visible={true}></Cursor3dpQ>
        <Cursor3dpQ id="qj4" pos={j4_pos} q={j4_q} visible={true}></Cursor3dpQ>
        <Cursor3dpQ id="qj5" pos={j5_pos} q={j5_q} visible={true}></Cursor3dpQ>
        <Cursor3dpQ id="qj6" pos={j6_pos} q={j6_q} visible={true}></Cursor3dpQ>
        <Cursor3dp pos={j2_pos} rot={j2_rot} visible={false}></Cursor3dp>
        <Cursor3dp pos={j3_pos} rot={j3_rot} visible={false}></Cursor3dp>
        <Cursor3dp pos={j4_pos} rot={j4_rot} visible={false}></Cursor3dp>
        <Cursor3dp pos={j5_pos} rot={j5_rot} visible={false}></Cursor3dp>
        <Cursor3dp pos={j6_pos} rot={j6_rot} visible={false}></Cursor3dp>
        <Line pos1={j1_pos} pos2={j2_pos} visible={true}></Line>
        <Line pos1={j2_pos} pos2={j3_pos} visible={true}></Line>
        <Line pos1={j3_pos} pos2={j4_pos} visible={true}></Line>
        <Line pos1={j4_pos} pos2={j5_pos} visible={true}></Line>
        <Line pos1={j5_pos} pos2={j6_pos} visible={true}></Line>
        <Line pos1={j1_pos} pos2={j6_pos} visible={true} color="yellow"></Line>
{//        <a-box color="magenta" scale="0.12 0.12 0.12" position="0 1.1 0" rotation={edit_pos(j5_rot)} visible={true}></a-box>
//        <Cursor3dp pos={{x:0,y:1.1,z:0}} rot={j5_rot} visible={true}></Cursor3dp>
}
        <a-box color="magenta" scale="0.12 0.12 0.12" position="0 1.1 0" setq={`${j5_q.x} ${j5_q.y} ${j5_q.z} ${j5_q.w}`} visible={true}></a-box>
        <Cursor3dpQ pos={{x:0,y:1.1,z:0}} q={j5_q} visible={true}></Cursor3dpQ>
      </a-scene>
      <Controller {...controllerProps}/>
    </>
    );
  }else{
    return(
      <a-scene>
        <Assets/>
      </a-scene>
    )
  }
}

const Assets = ()=>{
  return (
    <a-assets>
      {/*UR5e*/}
      <a-asset-items id="base" src="UR5e_Base.gltf" ></a-asset-items>
      <a-asset-items id="j1" src="UR5e_j1.gltf" ></a-asset-items>
      <a-asset-items id="j2" src="UR5e_j2.gltf" ></a-asset-items>
      <a-asset-items id="j3" src="UR5e_j3.gltf" ></a-asset-items>
      <a-asset-items id="j4" src="UR5e_j4.gltf" ></a-asset-items>
      <a-asset-items id="j5" src="UR5e_j5.gltf" ></a-asset-items>
      <a-asset-items id="j6" src="UR5e_j6.gltf" ></a-asset-items>
      <a-asset-items id="GripperBase" src="GripperBase.gltf" ></a-asset-items>
      <a-asset-items id="GripperFinger1" src="GripperFinger1.gltf" ></a-asset-items>
      <a-asset-items id="GripperFinger2" src="GripperFinger2.gltf" ></a-asset-items>
      <a-asset-items id="E-Pick" src="E-Pick.gltf" ></a-asset-items>
    </a-assets>
  )
}

const UR5e = (props)=>{
  const {visible, j1_rotate, j2_rotate, j3_rotate, j4_rotate, j5_rotate, j6_rotate} = props
  return (<>{visible?
    <a-entity robot-click gltf-model="#base" position="0 0 0" rotation="0 0 0" visible={visible}>
      <a-entity id="oj1" j1 gltf-model="#j1" position="0 0 0">
        <a-entity j2 gltf-model="#j2" position="0 0.1626 0">
          <a-entity j3 gltf-model="#j3" position="0 0.4251\ 0">
            <a-entity j4 gltf-model="#j4" position="0 0.3922 0">
              <a-entity j5 gltf-model="#j5" position="0.1325 0.1008 0">
                <a-entity j6 gltf-model="#j6" position="0 0 0">
                  <UR5e_Tool {...props}/>
                </a-entity>
              </a-entity>
            </a-entity>
          </a-entity>
        </a-entity>
      </a-entity>
    </a-entity>:null}</>
  )
}

const UR5e_Tool = (props)=>{
  const {j7_rotate} = props
  const return_table = [
    <></>,
    <a-entity gltf-model="#GripperBase" position="0.1037 0 0" rotation={`0 0 0`}>
    <a-entity gltf-model="#GripperFinger1" position="0 0 0" rotation={`0 ${j7_rotate} 0`}></a-entity>
    <a-entity gltf-model="#GripperFinger2" position="0 0 0" rotation={`0 ${-j7_rotate} 0`}></a-entity>  
    </a-entity>,
    <a-entity gltf-model="#E-Pick" position="0.09254 0 0" rotation={`0 0 0`}></a-entity>
  ]
  const {toolNameList, toolName} = props
  const findindex = toolNameList.findIndex((e)=>e===toolName)
  if(findindex >= 0){
    return (return_table[findindex])
  }
  return null
}

const Select_Robot = (props)=>{
  const {robotNameList, robotName, ...rotateProps} = props
  const visibletable = robotNameList.map(()=>false)
  // const robotNameList = ["DOBOT Nova 2","Cobotta PRO 900","JAKA Zu 5"]
  const findindex = robotNameList.findIndex((e)=>e===robotName)
  if(findindex >= 0){
    visibletable[findindex] = true
  }
  return (<>
    <UR5e visible={visibletable[0]} {...rotateProps}/>
  </>)
}

const Cursor3dp = (props) => {
  const { id, pos={x:0,y:0,z:0}, rot={x:0,y:0,z:0}, len=0.5, opa=1, children, visible=false } = props;

  const line_x = `start: 0 0 0; end: ${len} 0 0; color: red; opacity: ${opa};`
  const line_y = `start: 0 0 0; end: 0 ${len} 0; color: green; opacity: ${opa};`
  const line_z = `start: 0 0 0; end: 0 0 ${len}; color: blue; opacity: ${opa};`

  return <a-entity id={id}
      line={line_x}
      line__1={line_y}
      line__2={line_z}
      position={`${pos.x} ${pos.y} ${pos.z}`}
      rotation={`${rot.x} ${rot.y} ${rot.z}`}
      visible={visible}
  >{children}</a-entity>
}

const Cursor3dpQ = (props) => {
  const { id, pos={x:0,y:0,z:0}, q, len=0.5, opa=1, children, visible=false } = props;

  const line_x = `start: 0 0 0; end: ${len} 0 0; color: olive; opacity: ${opa};`
  const line_y = `start: 0 0 0; end: 0 ${len} 0; color: lime; opacity: ${opa};`
  const line_z = `start: 0 0 0; end: 0 0 ${len}; color: aqua; opacity: ${opa};`

  return <a-entity id={id}
      line={line_x}
      line__1={line_y}
      line__2={line_z}
      position={`${pos.x} ${pos.y} ${pos.z}`}
      setq={`${q.x} ${q.y} ${q.z} ${q.w}`}
      visible={visible}
  >{children}</a-entity>
}

const Line = (props) => {
  const { pos1={x:0,y:0,z:0}, pos2={x:0,y:0,z:0}, color="magenta", opa=1, visible=false } = props;

  const line_para = `start: ${pos1.x} ${pos1.y} ${pos1.z}; end: ${pos2.x} ${pos2.y} ${pos2.z}; color: ${color}; opacity: ${opa};`

  return <a-entity
      line={line_para}
      position={`0 0 0`}
      visible={visible}
  ></a-entity>
}
