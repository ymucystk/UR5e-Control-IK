"use client";
import 'aframe'
import * as React from 'react'
import * as THREE from 'three';
import Controller from './controller.js'

const joint_pos = {
  base:{x:0,y:0,z:0},
  j1:{x:0,y:0,z:0},
  j2:{x:0,y:0.1626,z:0},
  j3:{x:0,y:0.4251,z:0},
  j4:{x:0,y:0.3922,z:0},
  j5:{x:0.1325,y:0.1008,z:0},
  j6:{x:0,y:0,z:0},
  j7:{x:0,y:0,z:0.12},
}

let registered = false
let trigger_on = false
const order = 'ZYX'

let start_rotation = new THREE.Euler(0.6654549523360951,0,0,order)
let save_rotation = new THREE.Euler(0.6654549523360951,0,0,order)
let current_rotation = new THREE.Euler(0.6654549523360951,0,0,order)
const joint_move_speed_ms = 20
const max_move_unit = (0.1/120)
const j1_rotate_table = []
const j2_rotate_table = []
const j3_rotate_table = []
const j4_rotate_table = []
const j5_rotate_table = []
const j6_rotate_table = []
let target_move_distance = 0.2
let real_target = {x:0.3,y:0.65,z:-0.3}

export default function Home() {
  const [now, setNow] = React.useState(new Date())
  const [rendered,set_rendered] = React.useState(false)
  const robotNameList = ["Model"]
  const [robotName,set_robotName] = React.useState(robotNameList[0])
  const cursor_vis = false
  const box_vis = false
  const [target_error,set_target_error] = React.useState(false)

  const [j1_rotate,set_j1_rotate] = React.useState(0)
  const [j2_rotate,set_j2_rotate] = React.useState(0)
  const [j3_rotate,set_j3_rotate] = React.useState(0)
  const [j4_rotate,set_j4_rotate] = React.useState(0)
  const [j5_rotate,set_j5_rotate] = React.useState(0)
  const [j6_rotate,set_j6_rotate] = React.useState(0)
  const [j7_rotate,set_j7_rotate] = React.useState(0) //指用

  const [rotate, set_rotate] = React.useState([0,0,0,0,0,0,0])  //出力用
  const [input_rotate, set_input_rotate] = React.useState([0,0,0,0,0,0,0])  //入力用

  const [j1_object,set_j1_object] = React.useState(new THREE.Object3D())
  const [j2_object,set_j2_object] = React.useState(new THREE.Object3D())
  const [j3_object,set_j3_object] = React.useState(new THREE.Object3D())
  const [j4_object,set_j4_object] = React.useState(new THREE.Object3D())
  const [j5_object,set_j5_object] = React.useState(new THREE.Object3D())
  const [j6_object,set_j6_object] = React.useState(new THREE.Object3D())

  const [p15_object,set_p15_object] = React.useState(new THREE.Object3D())
  const [p16_object,set_p16_object] = React.useState(new THREE.Object3D())
  const [p51_object,set_p51_object] = React.useState(new THREE.Object3D())

  const [controller_object,set_controller_object] = React.useState(new THREE.Object3D())
  const [start_pos,set_start_pos] = React.useState(new THREE.Vector4())
  const [save_target,set_save_target] = React.useState()

  const vrModeRef = React.useRef(false); // vr_mode はref のほうが使いやすい

  const [test_pos,set_test_pos] = React.useState(new THREE.Vector3())

  const [c_pos_x,set_c_pos_x] = React.useState(0)
  const [c_pos_y,set_c_pos_y] = React.useState(0.4)
  const [c_pos_z,set_c_pos_z] = React.useState(-1.0)
  const [c_deg_x,set_c_deg_x] = React.useState(0)
  const [c_deg_y,set_c_deg_y] = React.useState(180)
  const [c_deg_z,set_c_deg_z] = React.useState(0)

  const [wrist_rot_x,set_wrist_rot_x_org] = React.useState(180)
  const [wrist_rot_y,set_wrist_rot_y_org] = React.useState(0)
  const [wrist_rot_z,set_wrist_rot_z_org] = React.useState(0)
  const [tool_rotate,set_tool_rotate] = React.useState(0)
  const [wrist_degree,set_wrist_degree] = React.useState({direction:0,angle:0})
  const [dsp_message,set_dsp_message] = React.useState("")

  const toolNameList = ["No tool","Gripper","E-Pick"]
  const [toolName,set_toolName] = React.useState(toolNameList[0])

  const x_vec_base = new THREE.Vector3(1,0,0).normalize()
  const y_vec_base = new THREE.Vector3(0,1,0).normalize()
  const z_vec_base = new THREE.Vector3(0,0,1).normalize()

  const [target,set_target_org] = React.useState(real_target)
  const [p15_16_len,set_p15_16_len] = React.useState(joint_pos.j7.z)
 
  React.useEffect(function() {
    const intervalId = setInterval(function() {
      setNow(new Date());
    }, 10);
    return function(){clearInterval(intervalId)};
  }, [now]);

  const set_target = (new_pos)=>{
    set_target_org((prev_pos)=>{
      target_move_distance = distance(real_target,new_pos)
      return new_pos
    })
  }

  const set_wrist_rot_x = (new_rot)=>{
    set_wrist_rot_x_org((prev_rot)=>{
      target_move_distance = 0.0001
      return new_rot
    })
  }
  const set_wrist_rot_y = (new_rot)=>{
    set_wrist_rot_y_org((prev_rot)=>{
      target_move_distance = 0.0001
      return new_rot
    })
  }
  const set_wrist_rot_z = (new_rot)=>{
    set_wrist_rot_z_org((prev_rot)=>{
      target_move_distance = 0.0001
      return new_rot
    })
  }

  React.useEffect(() => {
    if(rendered && vrModeRef.current && trigger_on){
      const move_pos = pos_sub(start_pos,controller_object.position)
      move_pos.x = move_pos.x/5
      move_pos.y = move_pos.y/5
      move_pos.z = move_pos.z/5
      let target_pos
      if(save_target === undefined){
        set_save_target({...target})
        target_pos = pos_sub(target,move_pos)
      }else{
        target_pos = pos_sub(save_target,move_pos)
      }
      if(target_pos.y < 0.012){
        target_pos.y = 0.012
      }
      set_target((target_pos))
    }
  },[controller_object.position.x,controller_object.position.y,controller_object.position.z])

  React.useEffect(() => {
    if(rendered && vrModeRef.current && trigger_on){
      const quat_start = new THREE.Quaternion().setFromEuler(start_rotation);
      const quat_controller = new THREE.Quaternion().setFromEuler(controller_object.rotation);
      const quatDifference1 = quat_start.clone().invert().multiply(quat_controller);

      const quat_save = new THREE.Quaternion().setFromEuler(save_rotation);
      const quatDifference2 = quat_start.clone().invert().multiply(quat_save);

      const wk_mtx = quat_start.clone().multiply(quatDifference1).multiply(quatDifference2)
      current_rotation = new THREE.Euler().setFromQuaternion(wk_mtx,controller_object.rotation.order)

      wk_mtx.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            (0.6654549523360951*-1),  //x
            Math.PI,  //y
            Math.PI,  //z
            controller_object.rotation.order
          )
        )
      )

      const wk_euler = new THREE.Euler().setFromQuaternion(wk_mtx,controller_object.rotation.order)
      set_wrist_rot_x(round(toAngle(wk_euler.x)))
      set_wrist_rot_y(round(toAngle(wk_euler.y)))
      set_wrist_rot_z(round(toAngle(wk_euler.z)))
    }
  },[controller_object.rotation.x,controller_object.rotation.y,controller_object.rotation.z])

  React.useEffect(() => {
    if(rendered){
      target_update(true)
    }
  },[rendered])

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

  const getDivision = (start_quaternion,end_quaternion)=>{
    const move_unit_1 = ((target_move_distance*1000)/joint_move_speed_ms)
    const division_1 = Math.ceil(move_unit_1)+1

    const deff_quaternion = start_quaternion.clone().invert().multiply(end_quaternion)
    const wk_euler = new THREE.Quaternion().angleTo(deff_quaternion)
    const move_unit_2 = ((toAngle(wk_euler)*max_move_unit)*1000)/joint_move_speed_ms
    const division_2 = Math.ceil(move_unit_2)+1

    return Math.max(division_1,division_2)
  }

  const j_move_sub = (j_object,j_rotate_table,vec_base,idx,start_quaternion,end_quaternion,division,count=1)=>{
    j_object.quaternion.slerpQuaternions(start_quaternion,end_quaternion,(count/division))
    const wk_euler = new THREE.Quaternion().angleTo(j_object.quaternion)
    set_rotate((org)=>{
      org[idx] = round(toAngle(wk_euler),3)
      return org
    })
    if(count < division){
      setTimeout(()=>{
        j_move_sub(j_object,j_rotate_table,vec_base,idx,start_quaternion,end_quaternion,division,count+1)
      },joint_move_speed_ms)
    }else{
      setTimeout(()=>{
        j_rotate_table.shift()
        j_move(j_object,j_rotate_table,vec_base,idx)
      },0)
    }
  }

  const j_move = (j_object,j_rotate_table,vec_base,idx)=>{
    if(j_rotate_table.length > 0){
      const wk_j_rotate = j_rotate_table[0]
      const start_quaternion = j_object.quaternion.clone()
      const end_quaternion = new THREE.Quaternion().setFromAxisAngle(vec_base,toRadian(wk_j_rotate))
      const division = getDivision(start_quaternion,end_quaternion)
      if(division === 0){
        setTimeout(()=>{
          j_rotate_table.shift()
          j_move(j_object,j_rotate_table,vec_base,idx)
        },0)
      }else{
        setTimeout(()=>{
          j_move_sub(j_object,j_rotate_table,vec_base,idx,start_quaternion,end_quaternion,division)
        },joint_move_speed_ms)
      }
    }
  }

  React.useEffect(() => {
    if (j1_object !== undefined) {
      const wk_switch = j1_rotate_table.length === 0
      if(j1_rotate_table.length > 1){
        j1_rotate_table.pop()
      }
      j1_rotate_table.push(j1_rotate)
      if(wk_switch){
        setTimeout(()=>{
          j_move(j1_object,j1_rotate_table,y_vec_base,0)
        },0)
      }
    }
  }, [j1_rotate])

  React.useEffect(() => {
    if (j2_object !== undefined) {
      const wk_switch = j2_rotate_table.length === 0
      if(j2_rotate_table.length > 1){
        j2_rotate_table.pop()
      }
      j2_rotate_table.push(j2_rotate)
      if(wk_switch){
        setTimeout(()=>{
          j_move(j2_object,j2_rotate_table,x_vec_base,1)
        },0)
      }
    }
  }, [j2_rotate])

  React.useEffect(() => {
    if (j3_object !== undefined) {
      const wk_switch = j3_rotate_table.length === 0
      if(j3_rotate_table.length > 1){
        j3_rotate_table.pop()
      }
      j3_rotate_table.push(j3_rotate)
      if(wk_switch){
        setTimeout(()=>{
          j_move(j3_object,j3_rotate_table,x_vec_base,2)
        },0)
      }
    }
  }, [j3_rotate])

  React.useEffect(() => {
    if (j4_object !== undefined) {
      const wk_switch = j4_rotate_table.length === 0
      if(j4_rotate_table.length > 1){
        j4_rotate_table.pop()
      }
      j4_rotate_table.push(j4_rotate)
      if(wk_switch){
        setTimeout(()=>{
          j_move(j4_object,j4_rotate_table,x_vec_base,3)
        },0)
      }
    }
  }, [j4_rotate])

  React.useEffect(() => {
    if (j5_object !== undefined) {
      const wk_switch = j5_rotate_table.length === 0
      if(j5_rotate_table.length > 1){
        j5_rotate_table.pop()
      }
      j5_rotate_table.push(j5_rotate)
      if(wk_switch){
        setTimeout(()=>{
          j_move(j5_object,j5_rotate_table,y_vec_base,4)
        },0)
      }
    }
  }, [j5_rotate])

  React.useEffect(() => {
    if (j6_object !== undefined) {
      const wk_switch = j6_rotate_table.length === 0
      if(j6_rotate_table.length > 1){
        j6_rotate_table.pop()
      }
      j6_rotate_table.push(j6_rotate)
      if(wk_switch){
        setTimeout(()=>{
          j_move(j6_object,j6_rotate_table,z_vec_base,5)
        },0)
      }
    }
  }, [j6_rotate])

  React.useEffect(() => {
    if (j1_object !== undefined) {
      target_move_distance = 0.1
      const rotate_value = round(normalize180(input_rotate[0]))
      set_j1_rotate(rotate_value)
    }
  }, [input_rotate[0]])

  React.useEffect(() => {
    if (j2_object !== undefined) {
      target_move_distance = 0.1
      const rotate_value = round(normalize180(input_rotate[1]))
      set_j2_rotate(rotate_value)
    }
  }, [input_rotate[1]])

  React.useEffect(() => {
    if (j4_object !== undefined) {
      target_move_distance = 0.1
      const rotate_value = round(normalize180(input_rotate[2]))
      set_j3_rotate(rotate_value)
    }
  }, [input_rotate[2]])

  React.useEffect(() => {
    if (j4_object !== undefined) {
      target_move_distance = 0.1
      const rotate_value = round(normalize180(input_rotate[3]))
      set_j4_rotate(rotate_value)
    }
  }, [input_rotate[3]])

  React.useEffect(() => {
    if (j5_object !== undefined) {
      target_move_distance = 0.1
      const rotate_value = round(normalize180(input_rotate[4]-90))
      set_j5_rotate(rotate_value)
    }
  }, [input_rotate[4]])

  React.useEffect(() => {
    if (j6_object !== undefined) {
      target_move_distance = 0.1
      const rotate_value = round(normalize180(input_rotate[5]))
      set_j6_rotate(rotate_value)
    }
  }, [input_rotate[5]])

  React.useEffect(() => {
    if(rendered){
      const rotate_value = input_rotate[6]
      set_j7_rotate(rotate_value)
    }
  }, [input_rotate[6]])

  const get_j5_quaternion = (rot_x=wrist_rot_x,rot_y=wrist_rot_y,rot_z=wrist_rot_z)=>{
    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(toRadian(rot_x), toRadian(rot_y), toRadian(rot_z), order)
    )
  }

  const get_p21_pos = ()=>{
    const j5q = get_j5_quaternion()
    const p21_pos = quaternionToRotation(j5q,{x:0,y:0,z:p15_16_len})
    return p21_pos
  }

  React.useEffect(() => {
    if(rendered){
      target_update(false)
      p51_object.quaternion.copy(get_j5_quaternion())
    }
  },[wrist_rot_x,wrist_rot_y,wrist_rot_z])

  const quaternionToRotation = (q,v)=>{
    const q_conjugate = q.clone().conjugate()
    const q_vector = new THREE.Quaternion(v.x, v.y, v.z, 0)
    const result = q.clone().multiply(q_vector).multiply(q_conjugate)
    return new THREE.Vector3(result.x,result.y,result.z)
  }

  const quaternionToAngle = (q)=>{
    const wk_angle = 2 * Math.acos(q.w)
    if(wk_angle === 0){
      return {angle:round(toAngle(wk_angle)),axis:new THREE.Vector3(0,0,0)}
    }
    const angle = round(toAngle(wk_angle))
    const sinHalfAngle = Math.sqrt(1 - q.w * q.w)
    if (sinHalfAngle > 0) {
      const axisX = round(q.x / sinHalfAngle)
      const axisY = round(q.y / sinHalfAngle)
      const axisZ = round(q.z / sinHalfAngle)
      return {angle,axis:new THREE.Vector3(axisX,axisY,axisZ)}
    }else{
      return {angle,axis:new THREE.Vector3(0,0,0)}
    }
  }

  const quaternionDifference = (q1,q2)=>{
    return q1.clone().invert().multiply(q2).normalize()
  }

  const pos_sub = (pos1, pos2)=>{
    return {x:(pos1.x - pos2.x), y:(pos1.y - pos2.y), z:(pos1.z - pos2.z)}
  }

  React.useEffect(() => {
    if(rendered){
      target_update(true)
    }
  },[target,tool_rotate,p15_16_len])

  const target_update = (target_move)=>{
    const p21_pos = get_p21_pos()
    const dir_sign1 = p21_pos.x < 0 ? -1 : 1
    const xz_vector = new THREE.Vector3(p21_pos.x,0,p21_pos.z).normalize()
    const direction = round(toAngle(z_vec_base.angleTo(xz_vector)))*dir_sign1
    if(isNaN(direction)){
      console.log("p21_pos 指定可能範囲外！")
      set_dsp_message("p21_pos 指定可能範囲外！")
      return
    }
    const dir_sign2 = p21_pos.z < 0 ? -1 : 1
    const y_vector = new THREE.Vector3(p21_pos.x,p21_pos.y,p21_pos.z).normalize()
    const angle = round(toAngle(y_vec_base.angleTo(y_vector)))*dir_sign2*(Math.abs(direction)>90?-1:1)
    if(isNaN(angle)){
      console.log("p21_pos 指定可能範囲外！")
      set_dsp_message("p21_pos 指定可能範囲外！")
      return
    }
    set_wrist_degree({direction,angle})

    const p15_16_offset_pos = {...p21_pos}
    const new_p15_pos = {x:(target.x - p15_16_offset_pos.x),y:(target.y - p15_16_offset_pos.y),z:(target.z - p15_16_offset_pos.z)}
    target15_update(new_p15_pos,direction,angle,target_move)
  }

  const target15_update = (target15,wrist_direction,wrist_angle,target_move)=>{
    let dsp_message = ""
    const distance_center_t15 = distance({x:0,y:0,z:0},{x:target15.x,y:0,z:target15.z})
    const {k:kakudo_t15} = calc_side_4(distance_center_t15,joint_pos.j5.x)

    const dir_sign_t15 = target15.x < 0 ? -1 : 1
    const xz_vector_t15 = new THREE.Vector3(target15.x,0,target15.z).normalize()
    const direction_t15 = toAngle(z_vec_base.angleTo(xz_vector_t15))*dir_sign_t15
    if(isNaN(direction_t15)){
      console.log("target15 指定可能範囲外！")
      set_dsp_message("target15 指定可能範囲外！")
      set_target_error(true)
      return
    }
    let wk_j1_rotate = normalize180(round(direction_t15 - (90 - kakudo_t15)))
    if(isNaN(wk_j1_rotate)){
      console.log("wk_j1_rotate 指定可能範囲外！")
      dsp_message = "wk_j1_rotate 指定可能範囲外！"
      wk_j1_rotate = j1_rotate
    }

    const p14q = new THREE.Quaternion().multiply(
      new THREE.Quaternion().setFromAxisAngle(y_vec_base,toRadian(wk_j1_rotate))
    )
    const direction_offset = normalize180(wrist_direction - wk_j1_rotate)
    const distance_target_t15 = distance({x:target.x,y:0,z:target.z},{x:target15.x,y:0,z:target15.z})
    const elevation_target_t15 =  target15.y - target.y
    const {a:j1_extension} = calc_side_1(distance_target_t15,direction_offset)
    const j4_radian = Math.atan2(elevation_target_t15, j1_extension)
    const wk_j4_rotate_sabun = normalize180(toAngle(j4_radian))

    p14q.multiply(
      new THREE.Quaternion().setFromAxisAngle(x_vec_base,j4_radian)
    )
    const p14_extension_pos = quaternionToRotation(p14q,{x:0,y:0,z:p15_16_len})
    const wk_j5_kakudo = round(toAngle(p14_extension_pos.angleTo(get_p21_pos())))

    let wk_j5_rotate = normalize180(wk_j5_kakudo*(direction_offset<0?-1:1))
    if(isNaN(wk_j5_rotate)){
      console.log("wk_j5_rotate 指定可能範囲外！")
      dsp_message = "wk_j5_rotate 指定可能範囲外！"
      wk_j5_rotate = j5_rotate
    }
    p14q.multiply(
      new THREE.Quaternion().setFromAxisAngle(y_vec_base,toRadian(wk_j5_rotate))
    )
    const j5q = get_j5_quaternion()
    const p14_j5_diff = quaternionToAngle(quaternionDifference(p14q,j5q))
    const wk_j6_rotate = p14_j5_diff.angle * ((p14_j5_diff.axis.z < 0)?-1:1)

    const p14_offset_pos = quaternionToRotation(p14q,{x:0,y:joint_pos.j5.y,z:0})

    const target14 = pos_sub(target15,p14_offset_pos)

    const syahen_t14 = distance({x:0,y:0,z:0},{x:target14.x,y:0,z:target14.z})
    if(syahen_t14 < joint_pos.j5.x){
      console.log("p14 指定可能範囲外！")
      set_dsp_message("p14 指定可能範囲外！")
      set_target_error(true)
      return
    }

    const takasa_t14 = target14.y - joint_pos.j2.y
    const {t:teihen_t14} = calc_side_4(syahen_t14,joint_pos.j5.x)
    const {s:side_c,k:angle_base} = calc_side_2(teihen_t14,takasa_t14)
    if(isNaN(angle_base)){
      console.log("angle_base 指定可能範囲外！")
      set_dsp_message("angle_base 指定可能範囲外！")
      set_target_error(true)
      return
    }

    const side_a = joint_pos.j3.y
    const side_b = joint_pos.j4.y
    const max_dis = side_a + side_b
    const min_dis = Math.abs(joint_pos.j3.y - joint_pos.j4.y)

    let wk_j2_rotate = 0
    let wk_j3_rotate = 0
    if(min_dis > side_c){
      wk_j2_rotate = angle_base
      wk_j3_rotate = 180
    }else
    if(side_c >= max_dis){
      wk_j2_rotate = angle_base
      wk_j3_rotate = 0
    }else{
      let angle_B = toAngle(Math.acos((side_a ** 2 + side_c ** 2 - side_b ** 2) / (2 * side_a * side_c)))
      let angle_C = toAngle(Math.acos((side_a ** 2 + side_b ** 2 - side_c ** 2) / (2 * side_a * side_b)))

      if(isNaN(angle_B)) angle_B = 0
      if(isNaN(angle_C)) angle_C = 0

      const angle_j2 = normalize180(round(angle_base - angle_B))
      const angle_j3 = normalize180(round(angle_C === 0 ? 0 : 180 - angle_C))
      if(isNaN(angle_j2)){
        console.log("angle_j2 指定可能範囲外！")
        dsp_message = "angle_j2 指定可能範囲外！"
        wk_j2_rotate = j2_rotate
      }else{
        wk_j2_rotate = angle_j2
      }
      if(isNaN(angle_j3)){
        console.log("angle_j3 指定可能範囲外！")
        dsp_message = "angle_j3 指定可能範囲外！"
        wk_j3_rotate = j3_rotate
      }else{
        wk_j3_rotate = angle_j3
      }
    }
    let wk_j4_rotate = normalize180(round(((wk_j2_rotate + wk_j3_rotate) * -1) + wk_j4_rotate_sabun))
    if(isNaN(wk_j4_rotate)){
      console.log("wk_j4_rotate 指定可能範囲外！")
      dsp_message = "wk_j4_rotate 指定可能範囲外！"
    }
    if(dsp_message  === ""){
      const wk_j6_rotate_value = normalize180(round(wk_j6_rotate + tool_rotate))

      const base_m4 = new THREE.Matrix4().multiply(
        new THREE.Matrix4().makeRotationY(toRadian(wk_j1_rotate)).setPosition(joint_pos.j1.x,joint_pos.j1.y,joint_pos.j1.z)
      ).multiply(
        new THREE.Matrix4().makeRotationX(toRadian(wk_j2_rotate)).setPosition(joint_pos.j2.x,joint_pos.j2.y,joint_pos.j2.z)
      ).multiply(
        new THREE.Matrix4().makeRotationX(toRadian(wk_j3_rotate)).setPosition(joint_pos.j3.x,joint_pos.j3.y,joint_pos.j3.z)
      ).multiply(
        new THREE.Matrix4().makeRotationX(toRadian(wk_j4_rotate)).setPosition(joint_pos.j4.x,joint_pos.j4.y,joint_pos.j4.z)
      ).multiply(
        new THREE.Matrix4().makeRotationY(toRadian(wk_j5_rotate)).setPosition(joint_pos.j5.x,joint_pos.j5.y,joint_pos.j5.z)
      ).multiply(
        new THREE.Matrix4().makeRotationZ(toRadian(wk_j6_rotate_value)).setPosition(joint_pos.j6.x,joint_pos.j6.y,joint_pos.j6.z)
      ).multiply(
        new THREE.Matrix4().setPosition(joint_pos.j7.x,joint_pos.j7.y,joint_pos.j7.z)
      )
      const result_target = new THREE.Vector3().applyMatrix4(base_m4)
      const sabun_pos = pos_sub(target,result_target)
      const sabun_distance = sabun_pos.x**2+sabun_pos.y**2+sabun_pos.z**2
      if(round(sabun_distance) <= 0){
        set_target_error(false)
        set_j1_rotate(wk_j1_rotate)
        set_j2_rotate(wk_j2_rotate)
        set_j3_rotate(wk_j3_rotate)
        set_j4_rotate(wk_j4_rotate)
        set_j5_rotate(wk_j5_rotate)
        set_j6_rotate(wk_j6_rotate_value)
        real_target = {...result_target}
      }else{
        console.log("target 不一致！")
        dsp_message = "target 不一致！"
        set_target_error(true)
      }
    }else{
      set_target_error(true)
    }
    set_dsp_message(dsp_message)
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

  const toAngle = (radian)=>{
    return normalize180(radian*(180/Math.PI))
  }

  const toRadian = (angle)=>{
    return normalize180(angle)*(Math.PI/180)
  }

  const getposq = (parts_obj)=>{
    const mat = parts_obj.matrix  //matrixWorld
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
    const teihen = round(Math.abs(kakudo)===90  ? 0:(syahen * Math.cos(toRadian(kakudo))))
    const takasa = round(Math.abs(kakudo)===180 ? 0:(syahen * Math.sin(toRadian(kakudo))))
    return {a:teihen, b:takasa}
  }

  const calc_side_2 = (teihen, takasa)=>{
    const syahen = round(Math.sqrt(teihen ** 2 + takasa ** 2))
    const kakudo = round(toAngle(Math.atan2(teihen, takasa)))
    return {s:syahen, k:kakudo}
  }

  const calc_side_4 = (syahen, teihen)=>{
    const wk_rad = Math.acos(teihen / syahen)
    const takasa = round(teihen * Math.tan(wk_rad))
    const kakudo = round(toAngle(wk_rad))
    return {k:kakudo, t:takasa}
  }

  React.useEffect(() => {
    if(rendered){
      const p15_pos = new THREE.Vector4().applyMatrix4(p15_object.matrix)
      const p16_pos = new THREE.Vector4().applyMatrix4(p16_object.matrix)
      set_p15_16_len(distance(p15_pos,p16_pos))
    }
  },[now])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      //require("aframe");
      setTimeout(()=>set_rendered(true),500)
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
            if(this.data === 15){
              set_p15_object(this.el.object3D)
            }else
            if(this.data === 16){
              set_p16_object(this.el.object3D)
            }else
            if(this.data === 51){
              set_p51_object(this.el.object3D)
            }
          },
          remove: function () {
            if(this.data === 16){
              set_p16_object(this.el.object3D)
            }
          }
        });
        AFRAME.registerComponent('vr-controller-right', {
          schema: {type: 'string', default: ''},
          init: function () {
            set_controller_object(this.el.object3D)
            this.el.object3D.rotation.order = order
            this.el.addEventListener('triggerdown', (evt)=>{
              start_rotation = this.el.object3D.rotation.clone()
              const wk_start_pos = new THREE.Vector4(0,0,0,1).applyMatrix4(this.el.object3D.matrix)
              set_start_pos(wk_start_pos)
              trigger_on = true
            });
            this.el.addEventListener('triggerup', (evt)=>{
              save_rotation = current_rotation.clone()
              set_save_target(undefined)
              trigger_on = false
            });
          }
        });
        AFRAME.registerComponent('scene', {
          schema: {type: 'string', default: ''},
          init: function () {
            //this.el.enterVR();
            this.el.addEventListener('enter-vr', ()=>{
              vrModeRef.current = true;
              console.log('enter-vr')
            });
            this.el.addEventListener('exit-vr', ()=>{
              vrModeRef.current = false;
              console.log('exit-vr')
            });
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
    wrist_rot_x,set_wrist_rot_x,wrist_rot_y,set_wrist_rot_y,wrist_rot_z,set_wrist_rot_z,
    tool_rotate,set_tool_rotate,normalize180
  }

  const robotProps = {
    robotNameList, robotName, joint_pos, j2_rotate, j3_rotate, j4_rotate, j5_rotate, j6_rotate, j7_rotate,
    toolNameList, toolName, cursor_vis, box_vis, edit_pos
  }

  if(rendered){
    return (
    <>
      <a-scene scene>
        <a-entity oculus-touch-controls="hand: right" vr-controller-right visible={`${false}`}></a-entity>
        <a-plane position="0 0 0" rotation="-90 0 0" width="10" height="10" color={target_error?"#ff7f50":"#7BC8A4"}></a-plane>
        <Assets/>
        <Select_Robot {...robotProps}/>
        <Cursor3dp j_id="20" pos={{x:0,y:0,z:0}} visible={cursor_vis}>
          <Cursor3dp j_id="21" pos={{x:0,y:0,z:p15_16_len}} visible={cursor_vis}></Cursor3dp>
          <Cursor3dp j_id="22" pos={{x:0,y:-joint_pos.j5.y,z:0}} rot={{x:0,y:j1_rotate,z:0}} visible={cursor_vis}></Cursor3dp>
        </Cursor3dp>
        <a-entity light="type: directional; color: #FFF; intensity: 0.35" position="1 1 1"></a-entity>
        <a-entity light="type: directional; color: #FFF; intensity: 0.35" position="-1 1 1"></a-entity>
        <a-entity light="type: directional; color: #FFF; intensity: 0.35" position="-1 1 -1"></a-entity>
        <a-entity light="type: directional; color: #EEE; intensity: 0.35" position="1 1 -1"></a-entity>
        <a-entity light="type: directional; color: #EEE; intensity: 0.2" position="0 -1 0"></a-entity>
        <a-entity id="rig" position={`${c_pos_x} ${c_pos_y} ${c_pos_z}`} rotation={`${c_deg_x} ${c_deg_y} ${c_deg_z}`}>
          <a-camera id="camera" wasd-controls-enabled={false} look-controls-enabled={false} position="0 0 0"></a-camera>
        </a-entity>
        <a-sphere position={edit_pos(target)} scale="0.012 0.012 0.012" color="yellow" visible={`${true}`}></a-sphere>
        <a-sphere position={edit_pos(target)} scale="0.012 0.012 0.012" color={target_error?"red":"yellow"}></a-sphere>
        <a-box position={edit_pos(test_pos)} scale="0.03 0.03 0.03" color="green" visible={`${box_vis}`}></a-box>
        <Line pos1={{x:1,y:0.0001,z:1}} pos2={{x:-1,y:0.0001,z:-1}} visible={cursor_vis} color="white"></Line>
        <Line pos1={{x:1,y:0.0001,z:-1}} pos2={{x:-1,y:0.0001,z:1}} visible={cursor_vis} color="white"></Line>
        <Line pos1={{x:1,y:0.0001,z:0}} pos2={{x:-1,y:0.0001,z:0}} visible={cursor_vis} color="white"></Line>
        <Line pos1={{x:0,y:0.0001,z:1}} pos2={{x:0,y:0.0001,z:-1}} visible={cursor_vis} color="white"></Line>
        {/*<a-cylinder j_id="51" color="green" height="0.1" radius="0.005" position={edit_pos({x:0.3,y:0.3,z:0.3})}></a-cylinder>*/}
      </a-scene>
      <Controller {...controllerProps}/>
      <div className="footer" >
        <div>{`wrist_degree:{direction:${wrist_degree.direction},angle:${wrist_degree.angle}}  ${dsp_message}`}</div>
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
      {/*Model*/}
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

const Model = (props)=>{
  const {visible, cursor_vis, edit_pos, joint_pos} = props
  return (<>{visible?
    <a-entity robot-click="" gltf-model="#base" position={edit_pos(joint_pos.base)} visible={`${visible}`}>
      <a-entity j_id="1" gltf-model="#j1" position={edit_pos(joint_pos.j1)}>
        <a-entity j_id="2" gltf-model="#j2" position={edit_pos(joint_pos.j2)}>
          <a-entity j_id="3" gltf-model="#j3" position={edit_pos(joint_pos.j3)}>
            <a-entity j_id="4" gltf-model="#j4" position={edit_pos(joint_pos.j4)}>
              <a-entity j_id="5" gltf-model="#j5" position={edit_pos(joint_pos.j5)}>
                <a-entity j_id="6" gltf-model="#j6" position={edit_pos(joint_pos.j6)}>
                  <Model_Tool {...props}/>
                  {/*<a-cylinder color="crimson" height="0.1" radius="0.005" position={edit_pos(joint_pos.j7)}></a-cylinder>*/}
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

const Model_Tool = (props)=>{
  const Gripperpos = {x:0,y:0,z:0.1037}
  const Pickpos = {x:0,y:0,z:0.09254}
  const {j7_rotate, joint_pos:{j7:j7pos}, cursor_vis, box_vis, edit_pos} = props
  const return_table = [
    <>
      <Cursor3dp j_id="16" pos={j7pos} visible={cursor_vis}/>
      <a-box color="yellow" scale="0.02 0.02 0.02" position={edit_pos(j7pos)} visible={`${box_vis}`}></a-box>
    </>,
    <a-entity gltf-model="#GripperBase" position={edit_pos(Gripperpos)} rotation={`0 0 0`}>
    <a-entity gltf-model="#GripperFinger1" position="0 0 0" rotation={`0 ${j7_rotate} 0`}></a-entity>
    <a-entity gltf-model="#GripperFinger2" position="0 0 0" rotation={`0 ${-j7_rotate} 0`}></a-entity>  
      <Cursor3dp j_id="16" pos={{x:0,y:0,z:0.22}} visible={cursor_vis}/>
      <a-box color="yellow" scale="0.02 0.02 0.02" position={edit_pos({x:0,y:0,z:0.14})} visible={`${box_vis}`}></a-box>
    </a-entity>,
    <a-entity gltf-model="#E-Pick" position={edit_pos(Pickpos)} rotation={`0 0 0`}>
      <Cursor3dp j_id="16" pos={{x:0,y:0,z:0.24}} visible={cursor_vis}/>
      <a-box color="yellow" scale="0.02 0.02 0.02" position={edit_pos({x:0,y:0,z:0.15})} visible={`${box_vis}`}></a-box>
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
  // const robotNameList = ["Model"]
  const findindex = robotNameList.findIndex((e)=>e===robotName)
  if(findindex >= 0){
    visibletable[findindex] = true
  }
  return (<>
    <Model visible={visibletable[0]} {...rotateProps}/>
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
      visible={`${visible}`}
  >{children}</a-entity>
}

const Line = (props) => {
  const { pos1={x:0,y:0,z:0}, pos2={x:0,y:0,z:0}, color="magenta", opa=1, visible=false, ...otherprops } = props;

  const line_para = `start: ${pos1.x} ${pos1.y} ${pos1.z}; end: ${pos2.x} ${pos2.y} ${pos2.z}; color: ${color}; opacity: ${opa};`

  return <a-entity
      {...otherprops}
      line={line_para}
      position={`0 0 0`}
      visible={`${visible}`}
  ></a-entity>
}
