"use client";
import * as React from 'react'
import Controller from './controller.js'

export default function Home() {
  const [now, setNow] = React.useState(new Date())
  const [rendered,set_rendered] = React.useState(false)
  const robotNameList = ["UR5e"]
  const [robotName,set_robotName] = React.useState(robotNameList[0])
  const [cursor_vis,set_cursor_vis] = React.useState(true)
  const [box_vis,set_box_vis] = React.useState(true)

  const [j1_rotate,set_j1_rotate] = React.useState(0)
  const [j2_rotate,set_j2_rotate] = React.useState(0)
  const [j3_rotate,set_j3_rotate] = React.useState(0)
  const [j4_rotate,set_j4_rotate] = React.useState(0)
  const [j5_rotate,set_j5_rotate] = React.useState(0)
  const [j6_rotate,set_j6_rotate] = React.useState(0)
  const [j7_rotate,set_j7_rotate] = React.useState(0) //指用

  const [j1_object,set_j1_object] = React.useState()
  const [j2_object,set_j2_object] = React.useState()
  const [j3_object,set_j3_object] = React.useState()
  const [j4_object,set_j4_object] = React.useState()
  const [j5_object,set_j5_object] = React.useState()
  const [j6_object,set_j6_object] = React.useState()

  const [p11_object,set_p11_object] = React.useState()
  const [p12_object,set_p12_object] = React.useState()
  const [p13_object,set_p13_object] = React.useState()
  const [p14_object,set_p14_object] = React.useState()
  const [p15_object,set_p15_object] = React.useState()
  const [p16_object,set_p16_object] = React.useState()
  const [p20_object,set_p20_object] = React.useState()
  const [p21_object,set_p21_object] = React.useState()
  const [p22_object,set_p22_object] = React.useState()

  const [p11_pos,set_p11_pos] = React.useState({x:0,y:0,z:0})
  const [p12_pos,set_p12_pos] = React.useState({x:0,y:0,z:0})
  const [p13_pos,set_p13_pos] = React.useState({x:0,y:0,z:0})
  const [p14_pos,set_p14_pos] = React.useState({x:0,y:0,z:0})
  const [p15_pos,set_p15_pos] = React.useState({x:0,y:0,z:0})
  const [p16_pos,set_p16_pos] = React.useState({x:0,y:0,z:0})
  const [p20_pos,set_p20_pos] = React.useState({x:0,y:0,z:0})
  const [p21_pos,set_p21_pos] = React.useState({x:0,y:0,z:0})
  const [p22_pos,set_p22_pos] = React.useState({x:0,y:0,z:0})

  const [test_pos,set_test_pos] = React.useState({x:0,y:0,z:0})

  const [c_pos_x,set_c_pos_x] = React.useState(0)
  const [c_pos_y,set_c_pos_y] = React.useState(0.5)
  const [c_pos_z,set_c_pos_z] = React.useState(1.0)
  const [c_deg_x,set_c_deg_x] = React.useState(0)
  const [c_deg_y,set_c_deg_y] = React.useState(0)
  const [c_deg_z,set_c_deg_z] = React.useState(0)

  const [wrist_rot_x,set_wrist_rot_x] = React.useState(0)
  const [wrist_rot_y,set_wrist_rot_y] = React.useState(0)
  const [wrist_rot_z,set_wrist_rot_z] = React.useState(0)
  const [wrist_degree,set_wrist_degree] = React.useState({direction:0,angle:0})
  const [p15_16_len,set_p15_16_len] = React.useState(1)

  const toolNameList = ["No tool","Gripper","E-Pick"]
  const [toolName,set_toolName] = React.useState(toolNameList[0])
  let registered = false

  const [x_vec_base,set_x_vec_base] = React.useState()
  const [y_vec_base,set_y_vec_base] = React.useState()
  const [z_vec_base,set_z_vec_base] = React.useState()

  const joint_pos = {
    base:{x:0,y:0,z:0},
    j1:{x:0,y:0,z:0},
    j2:{x:0,y:0.1626,z:0},
    j3:{x:0,y:0.4251,z:0},
    j4:{x:0,y:0.3922,z:0},
    j5:{x:0.1325,y:0.1008,z:0},
    j6:{x:0,y:0,z:0},
    j7:{x:0,y:0,z:0.15},
  }

  const [target,set_target] = React.useState({x:0.3,y:0.7,z:0.3})

  /*const [target,set_target] = React.useState({x:joint_pos.j5.x,
    y:(joint_pos.j2.y+joint_pos.j3.y+joint_pos.j4.y+joint_pos.j5.y),
    z:joint_pos.j7.z})*/
 
  const [p14_maxlen,set_p14_maxlen] = React.useState(0)
 
  React.useEffect(function() {
    const intervalId = setInterval(function() {
      setNow(new Date());
    }, 10);
    return function(){clearInterval(intervalId)};
  }, [now]);

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
      j1_object.quaternion.setFromAxisAngle(y_vec_base,j1_rotate*(Math.PI/180))
    }
  }, [j1_rotate])

  React.useEffect(() => {
    if (j2_object !== undefined) {
      j2_object.quaternion.setFromAxisAngle(x_vec_base,j2_rotate*(Math.PI/180))
    }
  }, [j2_rotate])

  React.useEffect(() => {
    if (j3_object !== undefined) {
      j3_object.quaternion.setFromAxisAngle(x_vec_base,j3_rotate*(Math.PI/180))
    }
  }, [j3_rotate])

  React.useEffect(() => {
    if (j4_object !== undefined) {
      j4_object.quaternion.setFromAxisAngle(x_vec_base,j4_rotate*(Math.PI/180))
    }
  }, [j4_rotate])

  React.useEffect(() => {
    if (j5_object !== undefined) {
      j5_object.quaternion.setFromAxisAngle(y_vec_base,j5_rotate*(Math.PI/180))
    }
  }, [j5_rotate])

  React.useEffect(() => {
    if (j6_object !== undefined) {
      j6_object.quaternion.setFromAxisAngle(z_vec_base,j6_rotate*(Math.PI/180))
    }
  }, [j6_rotate])

  React.useEffect(() => {
    if(rendered){
      const wkq = new THREE.Quaternion();
      const wkqwk = new THREE.Quaternion();
      wkqwk.setFromAxisAngle(z_vec_base,wrist_rot_z*(Math.PI/180))
      wkq.multiply(wkqwk)
      wkqwk.setFromAxisAngle(y_vec_base,wrist_rot_y*(Math.PI/180))
      wkq.multiply(wkqwk)
      wkqwk.setFromAxisAngle(x_vec_base,wrist_rot_x*(Math.PI/180))
      wkq.multiply(wkqwk)
      p20_object.quaternion.copy(wkq)
    }
  },[wrist_rot_x,wrist_rot_y,wrist_rot_z])

  React.useEffect(() => {
    if(rendered){
      const dir_sign1 = p21_pos.x < 0 ? -1 : 1
      const xz_vector = new THREE.Vector3(p21_pos.x,0,p21_pos.z).normalize()
      const direction = round((z_vec_base.angleTo(xz_vector))*(180/Math.PI))*dir_sign1
      if(isNaN(direction)){
        console.log("p21_pos 指定可能範囲外！")
        return
      }
      const dir_sign2 = p21_pos.z < 0 ? -1 : 1
      const y_vector = new THREE.Vector3(p21_pos.x,p21_pos.y,p21_pos.z).normalize()
      const angle = round((y_vec_base.angleTo(y_vector))*(180/Math.PI))*dir_sign2
      if(isNaN(angle)){
        console.log("p21_pos 指定可能範囲外！")
        return
      }
      set_wrist_degree({direction,angle})

      const p15_16_offset_pos = {...p21_pos}
      const new_p15_pos = {x:(target.x - p15_16_offset_pos.x),y:(target.y - p15_16_offset_pos.y),z:(target.z - p15_16_offset_pos.z)}
      target15_update(new_p15_pos,direction)
    }
  },[p21_pos.x,p21_pos.y,p21_pos.z,target])

  const target15_update = (target15,direction)=>{
    const distance_center_t15 = round(distance({x:0,y:0,z:0},{x:target15.x,y:0,z:target15.z}))
    const {k:kakudo_t15} = calc_side_4(distance_center_t15,joint_pos.j5.x)

    const dir_sign_t15 = target15.x < 0 ? -1 : 1
    const xz_vector_t15 = new THREE.Vector3(target15.x,0,target15.z).normalize()
    const direction_t15 = round((z_vec_base.angleTo(xz_vector_t15))*(180/Math.PI))*dir_sign_t15
    if(isNaN(direction_t15)){
      console.log("target15 指定可能範囲外！")
      return
    }
    let wk_j1_rotate = round(direction_t15 - (90 - kakudo_t15))
    wk_j1_rotate = wk_j1_rotate<-180?(180+(wk_j1_rotate+180)):wk_j1_rotate
    set_j1_rotate(wk_j1_rotate)

    const direction_offset = normalize180(direction - wk_j1_rotate)
    const distance_target_t15 = round(distance({x:target.x,y:0,z:target.z},{x:target15.x,y:0,z:target15.z}))
    const elevation_target_t15 =  target15.y - target.y
    const {a:teihen} = calc_side_1(distance_target_t15,direction_offset)
    const {s:syahen,k:kakudo} = calc_side_2(teihen, elevation_target_t15)
    const wk_j4_rotate = normalize180(round(((j2_rotate + j3_rotate) * -1) + (90 - kakudo)))
    set_j4_rotate(wk_j4_rotate)

    const distance_target_t15_2 = round(distance(target,target15))
    const {k:wk_j5_rotate} = calc_side_4(distance_target_t15_2,syahen)

    const {a:p14_offset_y,b:p14_offset_distance} = calc_side_1(joint_pos.j5.y,(90 - kakudo))
    const {a:p14_offset_z,b:p14_offset_x} = calc_side_1(p14_offset_distance,wk_j1_rotate)

    set_j5_rotate(normalize180(wk_j5_rotate*(direction_offset<0?-1:1)))

    const new_p14_pos = {...target15}
    new_p14_pos.x -= p14_offset_x
    new_p14_pos.y -= p14_offset_y
    new_p14_pos.z -= p14_offset_z
    target14_update(new_p14_pos)
  }

  const target14_update = (target14)=>{
    const syahen_t14 = round(distance({x:0,y:0,z:0},{x:target14.x,y:0,z:target14.z}))
    const takasa_t14 = round(distance(joint_pos.j2,{x:0,y:target14.y,z:0}))
    const {t:teihen_t14} = calc_side_4(syahen_t14,joint_pos.j5.x)
    const {s:side_c,k:angle_base} = calc_side_2(teihen_t14,takasa_t14)

    const side_a = joint_pos.j3.y
    const side_b = joint_pos.j4.y
    const max_dis = side_a + side_b
    const min_dis = Math.abs(joint_pos.j3.y - joint_pos.j4.y)

    if(min_dis > side_c){
      set_j2_rotate(angle_base)
      set_j3_rotate(180)
    }else
    if(side_c >= max_dis){
      set_j2_rotate(angle_base)
      set_j3_rotate(0)
    }else{
      let angle_B = Math.acos((side_a ** 2 + side_c ** 2 - side_b ** 2) / (2 * side_a * side_c))*180/Math.PI
      let angle_C = Math.acos((side_a ** 2 + side_b ** 2 - side_c ** 2) / (2 * side_a * side_b))*180/Math.PI

      if(isNaN(angle_B)) angle_B = 0
      if(isNaN(angle_C)) angle_C = 0

      const angle_j2 = normalize180(round(angle_base - angle_B))
      const angle_j3 = normalize180(round(angle_C === 0 ? 0 : 180 - angle_C))

      set_j2_rotate(angle_j2)
      set_j3_rotate(angle_j3)
    }
  }

  const round = (x,d=5)=>{
    const v = 10 ** (d|0)
    return Math.round(x*v)/v
  }

  const normalize180 = (angle)=>{
    if(Math.abs(angle) <= 180){
      return angle
    }
    const amari = angle % 180
    if(amari < 0){
      return (180 + amari)
    }else{
      return (-180 + amari)
    }
  }

  const getposq = (parts_obj)=>{
    const mat = parts_obj.matrixWorld
    let position = new THREE.Vector3();
    let quaternion = new THREE.Quaternion();
    let scale = new THREE.Vector3()
    mat.decompose(position, quaternion, scale)
    return {position, quaternion, scale}
  }

  const getpos = (position)=>{
    const wkpos = {x:round(position.x),y:round(position.y),z:round(position.z)}
    return wkpos
  }

  const distance = (s_pos, t_pos)=>{
    return round(Math.sqrt((t_pos.x - s_pos.x) ** 2 + (t_pos.y - s_pos.y) ** 2 + (t_pos.z - s_pos.z) ** 2))
  }

  const calc_side_1 = (syahen, kakudo)=>{
    const teihen = round(Math.abs(kakudo)===90  ? 0:(syahen * Math.cos(kakudo/180*Math.PI)))
    const takasa = round(Math.abs(kakudo)===180 ? 0:(syahen * Math.sin(kakudo/180*Math.PI)))
    return {a:teihen, b:takasa}
  }

  const calc_side_2 = (teihen, takasa)=>{
    const syahen = round(Math.sqrt(teihen ** 2 + takasa ** 2))
    const kakudo = normalize180(round(Math.atan2(teihen, takasa)*180/Math.PI))
    return {s:syahen, k:kakudo}
  }

  const calc_side_4 = (syahen, teihen)=>{
    const wk_rad = Math.acos(teihen / syahen)
    const takasa = round(teihen * Math.tan(wk_rad))
    const kakudo = normalize180(round(wk_rad*180/Math.PI))
    return {k:kakudo, t:takasa}
  }

  const calc_pos = (hankei, angle, direction)=>{
    const {a:pos_y, b:radius} = calc_side_1(hankei, angle)
    const {a:pos_z, b:pos_x} = calc_side_1(radius, direction)
    return {x:pos_x, y:pos_y, z:pos_z}
  }

  React.useEffect(() => {
    if(rendered){
      const box11_result = getposq(p11_object)
      const p11_pos = getpos(box11_result.position)
      set_p11_pos(p11_pos)

      const box12_result = getposq(p12_object)
      const p12_pos = getpos(box12_result.position)
      set_p12_pos(p12_pos)

      const box13_result = getposq(p13_object)
      const p13_pos = getpos(box13_result.position)
      set_p13_pos(p13_pos)

      const box14_result = getposq(p14_object)
      const p14_pos = getpos(box14_result.position)
      set_p14_pos(p14_pos)

      const box15_result = getposq(p15_object)
      const p15_pos = getpos(box15_result.position)
      set_p15_pos(p15_pos)

      const box16_result = getposq(p16_object)
      const p16_pos = getpos(box16_result.position)
      set_p16_pos(p16_pos)

      const box20_result = getposq(p20_object)
      const p20_pos = getpos(box20_result.position)
      set_p20_pos(p20_pos)

      const box22_result = getposq(p22_object)
      const p22_pos = getpos(box22_result.position)
      set_p22_pos(p22_pos)

      const box21_result = getposq(p21_object)
      const p21_pos = getpos(box21_result.position)
      set_p21_pos((before)=>{
        if(before.x !== p21_pos.x || before.y !== p21_pos.y || before.z !== p21_pos.z){
          set_p15_16_len(distance(p15_pos,p16_pos))
        }
        return p21_pos
      })
    }
  },[now])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      require("aframe");
      setTimeout(set_rendered(true),1000)
      console.log('set_rendered')

      if(!registered){
        registered = true

        const teihen = joint_pos.j5.x
        const takasa = joint_pos.j3.y + joint_pos.j4.y
        const result = calc_side_2(teihen, takasa)
        set_p14_maxlen(result.s)

        set_x_vec_base(new THREE.Vector3(1,0,0).normalize())
        set_y_vec_base(new THREE.Vector3(0,1,0).normalize())
        set_z_vec_base(new THREE.Vector3(0,0,1).normalize())
      
        AFRAME.registerComponent('robot-click', {
          init: function () {
            this.el.addEventListener('click', (evt)=>{
              robotChange()
              console.log('robot-click')
            });
          }
        });
        AFRAME.registerComponent('j_id', {
          schema: {type: 'number', default: 0},
          init: function () {
            if(this.data === 1){
              set_j1_object(this.el.object3D)
            }else
            if(this.data === 2){
              set_j2_object(this.el.object3D)
            }else
            if(this.data === 3){
              set_j3_object(this.el.object3D)
            }else
            if(this.data === 4){
              set_j4_object(this.el.object3D)
            }else
            if(this.data === 5){
              set_j5_object(this.el.object3D)
            }else
            if(this.data === 6){
              set_j6_object(this.el.object3D)
            }else
            if(this.data === 11){
              set_p11_object(this.el.object3D)
            }else
            if(this.data === 12){
              set_p12_object(this.el.object3D)
            }else
            if(this.data === 13){
              set_p13_object(this.el.object3D)
            }else
            if(this.data === 14){
              set_p14_object(this.el.object3D)
            }else
            if(this.data === 15){
              set_p15_object(this.el.object3D)
            }else
            if(this.data === 16){
              set_p16_object(this.el.object3D)
            }else
            if(this.data === 20){
              set_p20_object(this.el.object3D)
            }else
            if(this.data === 21){
              set_p21_object(this.el.object3D)
            }else
            if(this.data === 22){
              set_p22_object(this.el.object3D)
            }
          },
          remove: function () {
            if(this.data === 16){
              set_p16_object(this.el.object3D)
            }
          }
        });
        AFRAME.registerComponent('quaternion', {
          schema: {type: 'vec4', default: {x:0,y:0,z:0,w:1}},
          init: function () {
            const q = new THREE.Quaternion(this.data.x,this.data.y,this.data.z,this.data.w).normalize()
            this.el.object3D.quaternion.copy(q)
          },
          update: function () {
            const q = new THREE.Quaternion(this.data.x,this.data.y,this.data.z,this.data.w).normalize()
            this.el.object3D.quaternion.copy(q)
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
    c_deg_x,set_c_deg_x,c_deg_y,set_c_deg_y,c_deg_z,set_c_deg_z,
    wrist_rot_x,set_wrist_rot_x,wrist_rot_y,set_wrist_rot_y,wrist_rot_z,set_wrist_rot_z
  }

  const robotProps = {
    robotNameList, robotName, joint_pos, j2_rotate, j3_rotate, j4_rotate, j5_rotate, j6_rotate, j7_rotate,
    toolNameList, toolName, cursor_vis, box_vis, edit_pos
  }

  if(rendered){
    return (
    <>
      <a-scene>
        <a-plane position="0 0 0" rotation="-90 0 0" width="10" height="10" color="#7BC8A4"></a-plane>
        <Assets/>
        <Select_Robot {...robotProps}/>
        <Cursor3dp j_id="20" pos={{x:0,y:0,z:0}} visible={true}>
          <Cursor3dp j_id="21" pos={{x:0,y:0,z:p15_16_len}} visible={true}></Cursor3dp>
          <Cursor3dp j_id="22" pos={{x:0,y:-joint_pos.j5.y,z:0}} rot={{x:0,y:j1_rotate,z:0}} visible={true}></Cursor3dp>
        </Cursor3dp>
        <a-entity light="type: directional; color: #EEE; intensity: 0.7" position="1 1 1"></a-entity>
        <a-entity light="type: directional; color: #EEE; intensity: 0.7" position="-1 1 1"></a-entity>
        <a-entity id="rig" position={`${c_pos_x} ${c_pos_y} ${c_pos_z}`} rotation={`${c_deg_x} ${c_deg_y} ${c_deg_z}`}>
          <a-camera id="camera" cursor="rayOrigin: mouse;" position="0 0 0"></a-camera>
        </a-entity>
        <a-sphere position={edit_pos(target)} scale="0.012 0.012 0.012" color="yellow" visible={true}></a-sphere>
        <a-box position={edit_pos(test_pos)} scale="0.03 0.03 0.03" color="green" visible={box_vis}></a-box>
        <Line pos1={p11_pos} pos2={p12_pos} visible={cursor_vis}></Line>
        <Line pos1={p12_pos} pos2={p13_pos} visible={cursor_vis}></Line>
        <Line pos1={p13_pos} pos2={p14_pos} visible={cursor_vis}></Line>
        <Line pos1={p14_pos} pos2={p15_pos} visible={cursor_vis}></Line>
        <Line pos1={p15_pos} pos2={p16_pos} visible={cursor_vis}></Line>
        <Line pos1={p11_pos} pos2={p16_pos} visible={cursor_vis} color="yellow"></Line>
        <Line pos1={{x:1,y:0.0001,z:1}} pos2={{x:-1,y:0.0001,z:-1}} visible={cursor_vis} color="white"></Line>
        <Line pos1={{x:1,y:0.0001,z:-1}} pos2={{x:-1,y:0.0001,z:1}} visible={cursor_vis} color="white"></Line>
        <Line pos1={{x:1,y:0.0001,z:0}} pos2={{x:-1,y:0.0001,z:0}} visible={cursor_vis} color="white"></Line>
        <Line pos1={{x:0,y:0.0001,z:1}} pos2={{x:0,y:0.0001,z:-1}} visible={cursor_vis} color="white"></Line>
      </a-scene>
      <Controller {...controllerProps}/>
      <div className="footer" >
        <div>{`wrist_degree:{direction:${wrist_degree.direction},angle:${wrist_degree.angle}}`}</div>
      </div>
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
  const {visible, cursor_vis, edit_pos, joint_pos} = props
  return (<>{visible?
    <a-entity robot-click="" gltf-model="#base" position={edit_pos(joint_pos.base)} visible={visible}>
      <a-entity j_id="1" gltf-model="#j1" position={edit_pos(joint_pos.j1)}>
        <a-entity j_id="2" gltf-model="#j2" position={edit_pos(joint_pos.j2)}>
          <a-entity j_id="3" gltf-model="#j3" position={edit_pos(joint_pos.j3)}>
            <a-entity j_id="4" gltf-model="#j4" position={edit_pos(joint_pos.j4)}>
              <a-entity j_id="5" gltf-model="#j5" position={edit_pos(joint_pos.j5)}>
                <a-entity j_id="6" gltf-model="#j6" position={edit_pos(joint_pos.j6)}>
                  <UR5e_Tool {...props}/>
                </a-entity>
                <Cursor3dp j_id="15" visible={cursor_vis}/>
              </a-entity>
              <Cursor3dp j_id="14" pos={{x:joint_pos.j5.x,y:0,z:0}} visible={cursor_vis}/>
              <Cursor3dp j_id="13" visible={cursor_vis}/>
            </a-entity>
            <Cursor3dp j_id="12" visible={cursor_vis}/>
          </a-entity>
          <Cursor3dp j_id="11" visible={cursor_vis}/>
        </a-entity>
      </a-entity>
    </a-entity>:null}</>
  )
}

const UR5e_Tool = (props)=>{
  const Gripperpos = {x:0,y:0,z:0.1037}
  const Pickpos = {x:0,y:0,z:0.09254}
  const {j7_rotate, joint_pos:{j7:j7pos}, cursor_vis, box_vis, edit_pos} = props
  const return_table = [
    <>
      <Cursor3dp j_id="16" pos={j7pos} visible={cursor_vis}/>
      <a-box color="yellow" scale="0.02 0.02 0.02" position={edit_pos(j7pos)} visible={box_vis}></a-box>
    </>,
    <a-entity gltf-model="#GripperBase" position={edit_pos(Gripperpos)} rotation={`0 0 0`}>
    <a-entity gltf-model="#GripperFinger1" position="0 0 0" rotation={`0 ${j7_rotate} 0`}></a-entity>
    <a-entity gltf-model="#GripperFinger2" position="0 0 0" rotation={`0 ${-j7_rotate} 0`}></a-entity>  
      <Cursor3dp j_id="16" pos={{x:0,y:0,z:0.14}} visible={cursor_vis}/>
      <a-box color="yellow" scale="0.02 0.02 0.02" position={edit_pos({x:0,y:0,z:0.14})} visible={box_vis}></a-box>
    </a-entity>,
    <a-entity gltf-model="#E-Pick" position={edit_pos(Pickpos)} rotation={`0 0 0`}>
      <Cursor3dp j_id="16" pos={{x:0,y:0,z:0.15}} visible={cursor_vis}/>
      <a-box color="yellow" scale="0.02 0.02 0.02" position={edit_pos({x:0,y:0,z:0.15})} visible={box_vis}></a-box>
    </a-entity>
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
  // const robotNameList = ["UR5e"]
  const findindex = robotNameList.findIndex((e)=>e===robotName)
  if(findindex >= 0){
    visibletable[findindex] = true
  }
  return (<>
    <UR5e visible={visibletable[0]} {...rotateProps}/>
  </>)
}

const Cursor3dp = (props) => {
  const { pos={x:0,y:0,z:0}, rot={x:0,y:0,z:0}, len=0.3, opa=1, children, visible=false, ...otherprops } = props;

  const line_x = `start: 0 0 0; end: ${len} 0 0; color: red; opacity: ${opa};`
  const line_y = `start: 0 0 0; end: 0 ${len} 0; color: green; opacity: ${opa};`
  const line_z = `start: 0 0 0; end: 0 0 ${len}; color: blue; opacity: ${opa};`

  return <a-entity
      {...otherprops}
      line={line_x}
      line__1={line_y}
      line__2={line_z}
      position={`${pos.x} ${pos.y} ${pos.z}`}
      rotation={`${rot.x} ${rot.y} ${rot.z}`}
      visible={visible}
  >{children}</a-entity>
}

const Line = (props) => {
  const { pos1={x:0,y:0,z:0}, pos2={x:0,y:0,z:0}, color="magenta", opa=1, visible=false, ...otherprops } = props;

  const line_para = `start: ${pos1.x} ${pos1.y} ${pos1.z}; end: ${pos2.x} ${pos2.y} ${pos2.z}; color: ${color}; opacity: ${opa};`

  return <a-entity
      {...otherprops}
      line={line_para}
      position={`0 0 0`}
      visible={visible}
  ></a-entity>
}
