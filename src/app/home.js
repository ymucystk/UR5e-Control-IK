"use client";
import 'aframe'
import * as React from 'react'
const THREE = window.AFRAME.THREE; // これで　AFRAME と　THREEを同時に使える
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

const x_vec_base = new THREE.Vector3(1,0,0).normalize()
const y_vec_base = new THREE.Vector3(0,1,0).normalize()
const z_vec_base = new THREE.Vector3(0,0,1).normalize()

let start_rotation = new THREE.Euler(0.6654549523360951,0,0,order)
let save_rotation = new THREE.Euler(0.6654549523360951,0,0,order)
let current_rotation = new THREE.Euler(0.6654549523360951,0,0,order)
const max_move_unit = (1/180)
const rotate_table = [[],[],[],[],[],[]]
const object3D_table = []
const rotvec_table = [y_vec_base,x_vec_base,x_vec_base,x_vec_base,y_vec_base,z_vec_base]
let target_move_distance = 0.2
const target_move_speed = (1000/1)
let real_target = {x:0.3,y:0.65,z:-0.3}

const j1_Correct_value = 0.0
const j2_Correct_value = 0.0
const j3_Correct_value = 0.0
const j4_Correct_value = 0.0
const j5_Correct_value = 90.0
const j6_Correct_value = 0.0
const j7_Correct_value = 0.0

let tickprev = 0
const controller_object_position = new THREE.Vector3()
const controller_object_rotation = new THREE.Euler(0,0,0,order)

export default function Home(props) {
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

  const [p15_object,set_p15_object] = React.useState(new THREE.Object3D())
  const [p16_object,set_p16_object] = React.useState(new THREE.Object3D())
  const [p51_object,set_p51_object] = React.useState(new THREE.Object3D())

  const [start_pos,set_start_pos] = React.useState(new THREE.Vector3())
  const [save_target,set_save_target] = React.useState()

  const vrModeRef = React.useRef(false); // vr_mode はref のほうが使いやすい

  const [test_pos,set_test_pos] = React.useState(new THREE.Vector3())

  const [c_pos_x,set_c_pos_x] = React.useState(0)
  const [c_pos_y,set_c_pos_y] = React.useState(0.4)
  const [c_pos_z,set_c_pos_z] = React.useState(1.0)
  const [c_deg_x,set_c_deg_x] = React.useState(0)
  const [c_deg_y,set_c_deg_y] = React.useState(0)
  const [c_deg_z,set_c_deg_z] = React.useState(0)

  const [wrist_rot,set_wrist_rot_org] = React.useState({x:180,y:0,z:0})
  const [tool_rotate,set_tool_rotate] = React.useState(0)
  const [wrist_degree,set_wrist_degree] = React.useState({direction:0,angle:0})
  const [dsp_message,set_dsp_message] = React.useState("")

  const toolNameList = ["No tool","Gripper","E-Pick"]
  const [toolName,set_toolName] = React.useState(toolNameList[0])

  const [target,set_target_org] = React.useState(real_target)
  const [p15_16_len,set_p15_16_len] = React.useState(joint_pos.j7.z)
 
  const [do_target_update, set_do_target_update] = React.useState(0)
  const [vrcontroller_move, set_vrcontroller_move] = React.useState(false)

  const set_target = (new_pos)=>{
    target_move_distance = distance(real_target,new_pos)
    set_target_org(new_pos)
  }

  const set_wrist_rot = (new_rot)=>{
    target_move_distance = 0
    set_wrist_rot_org({...new_rot})
  }

  React.useEffect(() => {
    if(rendered && vrModeRef.current && trigger_on){
      const move_pos = pos_sub(start_pos,controller_object_position)
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
      set_target({x:round(target_pos.x),y:round(target_pos.y),z:round(target_pos.z)})
    }
  },[controller_object_position.x,controller_object_position.y,controller_object_position.z])

  React.useEffect(() => {
    if(rendered && vrModeRef.current && trigger_on){
      const quat_start = new THREE.Quaternion().setFromEuler(start_rotation);
      const quat_controller = new THREE.Quaternion().setFromEuler(controller_object_rotation);
      const quatDifference1 = quat_start.clone().invert().multiply(quat_controller);

      const quat_save = new THREE.Quaternion().setFromEuler(save_rotation);
      const quatDifference2 = quat_start.clone().invert().multiply(quat_save);

      const wk_mtx = quat_start.clone().multiply(quatDifference1).multiply(quatDifference2)
      current_rotation = new THREE.Euler().setFromQuaternion(wk_mtx,controller_object_rotation.order)

      wk_mtx.multiply(
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            (0.6654549523360951*-1),  //x
            Math.PI,  //y
            Math.PI,  //z
            controller_object_rotation.order
          )
        )
      )

      const wk_euler = new THREE.Euler().setFromQuaternion(wk_mtx,controller_object_rotation.order)
      set_wrist_rot({x:round(toAngle(wk_euler.x)),y:round(toAngle(wk_euler.y)),z:round(toAngle(wk_euler.z))})
    }
  },[controller_object_rotation.x,controller_object_rotation.y,controller_object_rotation.z])

  React.useEffect(() => {
    if(rendered){
      set_do_target_update((prev) => prev + 1)
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

  //React.useEffect(()=>{
  const joint_slerp = () => {
    let raw_data = 0
    for(let i=0; i<rotate_table.length; i=i+1){
      const current_table = rotate_table[i]
      const current_object3D = object3D_table[i]
      raw_data = raw_data + current_table.length
      if(current_object3D !== undefined && current_table.length > 0){
        const current_data = current_table[0]
        if(i===1 || i===2 || i===3){
          if(current_data.first){
            current_data.first = false
            current_data.starttime = performance.now()
            current_data.start_quaternion = current_object3D.quaternion.clone()
            const start_angle = quaternionToAngle2(current_data.start_quaternion)
            const end_angle = current_data.rot
            const middle_angle = start_angle + ((end_angle - start_angle)/2)
            current_data.end_quaternion = new THREE.Quaternion().setFromAxisAngle(rotvec_table[i],toRadian(end_angle))
            current_data.middle_quaternion = new THREE.Quaternion().setFromAxisAngle(rotvec_table[i],toRadian(middle_angle))
            const move_time_1 = target_move_distance*target_move_speed
            const wk_euler1 = new THREE.Quaternion().angleTo(
              current_data.start_quaternion.clone().invert().multiply(current_data.middle_quaternion))
            const wk_euler2 = new THREE.Quaternion().angleTo(
              current_data.middle_quaternion.clone().invert().multiply(current_data.end_quaternion))
            const wk_angle = toAngle(wk_euler1) + toAngle(wk_euler2)
            const move_time_2 = (wk_angle*max_move_unit)*1000
            current_data.move_time = Math.max(move_time_1,move_time_2)
            current_data.midtime = current_data.starttime + (current_data.move_time/2)
            current_data.endtime = current_data.starttime + current_data.move_time
          }
          const current_time = performance.now()
          if(current_time < current_data.midtime){
            const elapsed_time = current_time - current_data.starttime
            current_object3D.quaternion.slerpQuaternions(
              current_data.start_quaternion,current_data.middle_quaternion,(elapsed_time/(current_data.move_time/2)))
          }else
          if(current_time < current_data.endtime){
            const elapsed_time = current_time - current_data.midtime
            current_object3D.quaternion.slerpQuaternions(
              current_data.middle_quaternion,current_data.end_quaternion,(elapsed_time/(current_data.move_time/2)))
          }else{
            current_object3D.quaternion.copy(current_data.end_quaternion)
            current_table.shift()
          }
        }else{
          if(current_data.first){
            current_data.first = false
            current_data.starttime = performance.now()
            current_data.start_quaternion = current_object3D.quaternion.clone()
            current_data.end_quaternion = new THREE.Quaternion().setFromAxisAngle(rotvec_table[i],toRadian(current_data.rot))
            const move_time_1 = target_move_distance*target_move_speed
            const wk_euler = new THREE.Quaternion().angleTo(
              current_data.start_quaternion.clone().invert().multiply(current_data.end_quaternion))
            const move_time_2 = (toAngle(wk_euler)*max_move_unit)*1000
            current_data.move_time = Math.max(move_time_1,move_time_2)
            current_data.endtime = current_data.starttime + current_data.move_time
          }
          const current_time = performance.now()
          if(current_time < current_data.endtime){
            const elapsed_time = current_time - current_data.starttime
            current_object3D.quaternion.slerpQuaternions(
              current_data.start_quaternion,current_data.end_quaternion,(elapsed_time/current_data.move_time))
          }else{
            current_object3D.quaternion.copy(current_data.end_quaternion)
            current_table.shift()
          }
        }
      }
    }
    if(raw_data > 0){
      requestAnimationFrame(joint_slerp)
      //setTimeout(()=>{joint_slerp()},0)
    }
  }
  //}, [now])

  React.useEffect(() => {
    if(rotate_table[0].length > 1){
      rotate_table[0].pop()
    }
    rotate_table[0].push({rot:j1_rotate,first:true})
  }, [j1_rotate])

  React.useEffect(() => {
    if(rotate_table[1].length > 1){
      rotate_table[1].pop()
    }
    rotate_table[1].push({rot:j2_rotate,first:true})
  }, [j2_rotate])

  React.useEffect(() => {
    if(rotate_table[2].length > 1){
      rotate_table[2].pop()
    }
    rotate_table[2].push({rot:j3_rotate,first:true})
  }, [j3_rotate])

  React.useEffect(() => {
    if(rotate_table[3].length > 1){
      rotate_table[3].pop()
    }
    rotate_table[3].push({rot:j4_rotate,first:true})
  }, [j4_rotate])

  React.useEffect(() => {
    if(rotate_table[4].length > 1){
      rotate_table[4].pop()
    }
    rotate_table[4].push({rot:j5_rotate,first:true})
  }, [j5_rotate])

  React.useEffect(() => {
    if(rotate_table[5].length > 1){
      rotate_table[5].pop()
    }
    rotate_table[5].push({rot:j6_rotate,first:true})
  }, [j6_rotate])

  React.useEffect(() => {
    requestAnimationFrame(joint_slerp)
    //setTimeout(()=>{joint_slerp()},0)

    if(rendered){
      const new_rotate = [
        round(normalize180(j1_rotate+j1_Correct_value),3),
        round(normalize180(j2_rotate+j2_Correct_value),3),
        round(normalize180(j3_rotate+j3_Correct_value),3),
        round(normalize180(j4_rotate+j4_Correct_value),3),
        round(normalize180(j5_rotate+j5_Correct_value),3),
        round(normalize180(j6_rotate+j6_Correct_value),3),
        round(j7_rotate+j7_Correct_value,3)
      ]
      set_rotate(new_rotate)
    }
  }, [j1_rotate,j2_rotate,j3_rotate,j4_rotate,j5_rotate,j6_rotate,j7_rotate])

  React.useEffect(() => {
    target_move_distance = 0
    const rotate_value = round(normalize180(input_rotate[0]-j1_Correct_value))
    set_j1_rotate(rotate_value)
  }, [input_rotate[0]])

  React.useEffect(() => {
    target_move_distance = 0
    const rotate_value = round(normalize180(input_rotate[1]-j2_Correct_value))
    set_j2_rotate(rotate_value)
  }, [input_rotate[1]])

  React.useEffect(() => {
    target_move_distance = 0
    const rotate_value = round(normalize180(input_rotate[2]-j3_Correct_value))
    set_j3_rotate(rotate_value)
  }, [input_rotate[2]])

  React.useEffect(() => {
    target_move_distance = 0
    const rotate_value = round(normalize180(input_rotate[3]-j4_Correct_value))
    set_j4_rotate(rotate_value)
  }, [input_rotate[3]])

  React.useEffect(() => {
    target_move_distance = 0
    const rotate_value = round(normalize180(input_rotate[4]-j5_Correct_value))
    set_j5_rotate(rotate_value)
  }, [input_rotate[4]])

  React.useEffect(() => {
    target_move_distance = 0
    const rotate_value = round(normalize180(input_rotate[5]-j6_Correct_value))
    set_j6_rotate(rotate_value)
  }, [input_rotate[5]])

  React.useEffect(() => {
    const rotate_value = input_rotate[6]
    set_j7_rotate(rotate_value)
  }, [input_rotate[6]])

  const get_j5_quaternion = (rot_x=wrist_rot.x,rot_y=wrist_rot.y,rot_z=wrist_rot.z)=>{
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
      set_do_target_update((prev) => prev + 1)
      p51_object.quaternion.copy(get_j5_quaternion())
    }
  },[wrist_rot.x,wrist_rot.y,wrist_rot.z])

  const quaternionToRotation = (q,v)=>{
    const q_conjugate = q.clone().conjugate()
    const q_vector = new THREE.Quaternion(v.x, v.y, v.z, 0)
    const result = q.clone().multiply(q_vector).multiply(q_conjugate)
    return new THREE.Vector3(result.x,result.y,result.z)
  }

  const quaternionToAngle = (q)=>{
    const wk_angle = 2 * Math.acos(round(q.w))
    if(wk_angle === 0){
      return {angle:(toAngle(wk_angle)),axis:new THREE.Vector3(0,0,0)}
    }
    const angle = (toAngle(wk_angle))
    const sinHalfAngle = Math.sqrt(1 - q.w * q.w)
    if (sinHalfAngle > 0) {
      const axisX = (q.x / sinHalfAngle)
      const axisY = (q.y / sinHalfAngle)
      const axisZ = (q.z / sinHalfAngle)
      return {angle,axis:new THREE.Vector3(axisX,axisY,axisZ)}
    }else{
      return {angle,axis:new THREE.Vector3(0,0,0)}
    }
  }

  const quaternionToAngle2 = (q)=>{
    const wk_angle = 2 * Math.acos(round(q.w))
    if(wk_angle === 0){
      return toAngle(wk_angle)
    }
    let angle = toAngle(wk_angle)
    const sinHalfAngle = Math.sqrt(1 - q.w * q.w)
    if (sinHalfAngle > 0) {
      const axisX = (q.x / sinHalfAngle)
      const axisY = (q.y / sinHalfAngle)
      const axisZ = (q.z / sinHalfAngle)
      const sum = round(axisX + axisY + axisZ)
      if(Math.abs(sum) === 1){
        if(sum < 0){
          angle = angle * -1
        }
      }else{
        console.log("axisX, axisY, axisZ の合計が 1 ではありません。",axisX, axisY, axisZ)
      }
    }
    return angle
  }

  const quaternionDifference = (q1,q2)=>{
    return q1.clone().invert().multiply(q2).normalize()
  }

  const pos_sub = (pos1, pos2)=>{
    return {x:(pos1.x - pos2.x), y:(pos1.y - pos2.y), z:(pos1.z - pos2.z)}
  }

  React.useEffect(() => {
    if(rendered){
      set_do_target_update((prev) => prev + 1)
    }
  },[target.x,target.y,target.z,tool_rotate,p15_16_len])

  React.useEffect(() => {
    target_update()
  },[do_target_update])

  const target_update = ()=>{
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
    target15_update(new_p15_pos,direction,angle)
  }

  const target15_update = (target15,wrist_direction,wrist_angle)=>{
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
        new THREE.Matrix4().setPosition(joint_pos.j7.x,joint_pos.j7.y,p15_16_len)
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
    if(amari === 0){
      return amari
    }else
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
      const p15_pos = new THREE.Vector3().applyMatrix4(p15_object.matrix)
      const p16_pos = new THREE.Vector3().applyMatrix4(p16_object.matrix)
      set_p15_16_len(distance(p15_pos,p16_pos))
    }
  },[p16_object.matrix.elements[14]])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      //require("aframe");
      setTimeout(()=>set_rendered(true),1)
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
              object3D_table[0] = this.el.object3D
            }else
            if(this.data === 2){
              object3D_table[1] = this.el.object3D
            }else
            if(this.data === 3){
              object3D_table[2] = this.el.object3D
            }else
            if(this.data === 4){
              object3D_table[3] = this.el.object3D
            }else
            if(this.data === 5){
              object3D_table[4] = this.el.object3D
            }else
            if(this.data === 6){
              object3D_table[5] = this.el.object3D
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
            this.el.object3D.rotation.order = order
            this.el.addEventListener('triggerdown', (evt)=>{
              start_rotation = this.el.object3D.rotation.clone()
              const wk_start_pos = new THREE.Vector3().applyMatrix4(this.el.object3D.matrix)
              set_start_pos(wk_start_pos)
              trigger_on = true
            });
            this.el.addEventListener('triggerup', (evt)=>{
              save_rotation = current_rotation.clone()
              set_save_target(undefined)
              trigger_on = false
            });
          },
          tick: function (time) {
            if((tickprev + 30) < time){
              tickprev = time
              let move = false
              const obj = this.el.object3D
              if(!controller_object_position.equals(obj.position)){
                controller_object_position.set(obj.position.x,obj.position.y,obj.position.z)
                move = true
              }
              if(!controller_object_rotation.equals(obj.rotation)){
                controller_object_rotation.set(obj.rotation.x,obj.rotation.y,obj.rotation.z,obj.rotation.order)
                move = true
              }
              if(move){
                set_vrcontroller_move((flg)=>!flg)
              }
            }
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
    wrist_rot,set_wrist_rot,
    tool_rotate,set_tool_rotate,normalize180
  }

  const robotProps = {
    robotNameList, robotName, joint_pos, j2_rotate, j3_rotate, j4_rotate, j5_rotate, j6_rotate, j7_rotate,
    toolNameList, toolName, cursor_vis, box_vis, edit_pos
  }

  if(rendered){
    return (
    <>
      <a-scene scene xr-mode-ui="XRMode: ar" >
        <a-entity oculus-touch-controls="hand: right" vr-controller-right visible={`${false}`}></a-entity>
        <a-plane position="0 0 0" rotation="-90 0 0" width="0.5" height="0.5" color={target_error?"#ff7f50":"#7BC8A4"}></a-plane>
        <Assets viewer={props.viewer}/>
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
        <a-sphere position={edit_pos(target)} scale="0.012 0.012 0.012" color={target_error?"red":"yellow"} visible={`${!props.viewer}`}></a-sphere>
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
      <a-scene xr-mode-ui="XRMode: xr">
        <Assets viewer={props.viewer}/>
      </a-scene>
    )
  }
}

const Assets = (props)=>{
  const path = props.viewer?"../":""
  return (
    <a-assets>
      {/*Model*/}
      <a-asset-items id="base" src={`${path}UR5e_Base.gltf`} ></a-asset-items>
      <a-asset-items id="j1" src={`${path}UR5e_j1.gltf`} ></a-asset-items>
      <a-asset-items id="j2" src={`${path}UR5e_j2.gltf`} ></a-asset-items>
      <a-asset-items id="j3" src={`${path}UR5e_j3.gltf`} ></a-asset-items>
      <a-asset-items id="j4" src={`${path}UR5e_j4.gltf`} ></a-asset-items>
      <a-asset-items id="j5" src={`${path}UR5e_j5.gltf`} ></a-asset-items>
      <a-asset-items id="j6" src={`${path}UR5e_j6.gltf`} ></a-asset-items>
      <a-asset-items id="GripperBase" src={`${path}GripperBase.gltf`} ></a-asset-items>
      <a-asset-items id="GripperFinger1" src={`${path}GripperFinger1.gltf`} ></a-asset-items>
      <a-asset-items id="GripperFinger2" src={`${path}GripperFinger2.gltf`} ></a-asset-items>
      <a-asset-items id="E-Pick" src={`${path}E-Pick.gltf`} ></a-asset-items>
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
