"use client";
import * as React from 'react'


export const VR_INFO_Camera = () => {
    <a-entity id="camera" camera cursor="rayOrigin: mouse;" look-controls position="0 -0.3 0">
        <a-text id="txt" value="text" position="0.3 0 -1" scale="0.4 0.4 0.4" align="center" color="#800000"></a-text>
        <a-text id="txt2" value="0,0,0" position="0.3 -0.15 -1" scale="0.4 0.4 0.4" align="center" color="#805000"></a-text>
        <a-text id="txt3" value="0,0,0" position="0.3 -0.30 -1" scale="0.4 0.4 0.4" align="center" color="#805000"></a-text>
    </a-entity>
}

export const VR_Controller_Right = () => {
    <a-entity id="ctlR" laser-controls="hand: right" raycaster="showLine: true" vr-ctrl-listener="hand: right"></a-entity>
}
export const VR_Controller_Left = () => {
    <a-entity id="ctlL" laser-controls="hand: left" raycaster="showLine: true" vr-ctrl-listener="hand: left"></a-entity>
}

export const VR_mode_detector = (myaframe,set_c_pos_y) => {
    myaframe.registerComponent('vr-mode-detector', {
        init: function () {
            var el = this.el;
            console.log("Set VR-Event Detector ",el.sceneEl);
            el.sceneEl.addEventListener('enter-vr', function () {
                console.log('VRモードが開始されました');

                // ここで、カメラ位置を修正すべき！

                set_c_pos_y( (y)=>y-0.8);
                myaframe.vrmode = true;
                //              set_controller();
            });
            el.sceneEl.addEventListener('exit-vr', function () {
                console.log('VRモードが終了しました');
                myaframe.vrmode = false;
                // VRモード終了時の関数を呼び出す
            });
        }
    });
}

export const add_vr_component = (myaframe, props) => {
    const { set_target,  set_trigger, set_grip, set_abutton, set_bbutton, set_vr_quartanion, set_send_mq} = props;
    console.log("Register vr ctrl")
    myaframe.registerComponent('vr-ctrl-listener', {
        init: function () {
            
//            const txt = document.getElementById("txt");
//            const txt2 = document.getElementById("txt2");
//            console.log("listener regist!", txt, txt2)
            console.log("Start Controller")

            this.el.addEventListener('gripdown', function (event) {
                console.log("value", "Right grip down");
//                txt.setAttribute("value", "Right grip down");
                set_grip(true);
                set_send_mq((i)=>i+1);
            });
            this.el.addEventListener('gripup', function (event) {
                console.log("value", "Right grip up");
//                txt.setAttribute("value", "Right grip up");
                set_grip(false);
                set_send_mq((i)=>i+1);
            });

            this.el.addEventListener('triggerdown', function (event) {
                console.log("value", "Right Trigger down");
//                txt.setAttribute("value", "Right TriggerDown");
                set_trigger(true);
                set_send_mq((i)=>i+1);
            });
            this.el.addEventListener('triggerup', function (event) {
                console.log("value", "Right Trigger up");
//                txt.setAttribute("value", "Right TriggerUp");
                set_trigger(false);
                set_send_mq((i)=>i+1);
            });
            this.el.addEventListener('abuttondown', function (event) {
//                txt.setAttribute("value", "Right A-button down");
                set_abutton(true);
                set_send_mq((i)=>i+1);
            });
            this.el.addEventListener('abuttonup', function (event) {
//                txt.setAttribute("value", "Right A-button Up");
                set_abutton(false);
                set_send_mq((i)=>i+1);
            });
            this.el.addEventListener('bbuttondown', function (event) {
//                txt.setAttribute("value", "Right B-button down");
                set_bbutton(true);
                set_send_mq((i)=>i+1);
            });
            this.el.addEventListener('bbuttonup', function (event) {
//                txt.setAttribute("value", "Right B-button Up");
                set_bbutton(false);
                set_send_mq((i)=>i+1);
            });
            console.log("Set Controller event listeners")
            this.el.lastt={x:0,y:0,z:0};
            this.el.lastq=new THREE.Quaternion(0,0,0,1);
        },
        tick: function () {
            //            console.log("Controller tick!", this.el.object3D);
//            const txt2 = document.getElementById("txt2");
//            const txt3 = document.getElementById("txt3");
//            txt2.setAttribute("value", "R-Pos: " + p.x.toFixed(2) + ", " + p.y.toFixed(2) + ", " + p.z.toFixed(2));

            //
            // we need to check VR mode.
            if (myaframe.vrmode) {
                // ここで Trigger をチェックして、on の場合だけ、差分を送る
                const p = this.el.object3D.position; // ここがコントローラの回転中心とは限らないのがちょっと問題
                const q = this.el.object3D.quaternion;// これも向き？
                const lq = this.el.lastq;
                const dx = p.x-this.el.lastt.x;
                const dy = p.y-this.el.lastt.y;
                const dz = p.z-this.el.lastt.z;
                const diffq = new THREE.Quaternion(0,0,0,1);
                if (q.x != lq.x || q.y != lq.y || q.z != lq.z  || q.w != lq.w) {
//                    console.log("Q not same!", q, lq);
                    const iq = new THREE.Quaternion(-lq.x,-lq.y,-lq.z,lq.w);
                    iq.normalize();
                    diffq.multiplyQuaternions(q,iq);// 差分を取得してるつもり
                    diffq.normalize();
                }
            
                if (dx ==0 && dy==0 && dz==0 && diffq.x==0 && diffq.y==0 && diffq.z==0 && diffq.w==1) {
                    return;
                }else{
                    set_trigger((t)=>{
                       if (t) {
                            set_target((tgt)=>
                                {
                                    return { x: tgt.x+dx, y: tgt.y+dy, z: tgt.z+dz }
                                });
                            set_vr_quartanion((cur)=>{
//                                    console.log("Qua",cur,diffq);
                                    const newvr = new THREE.Quaternion(0,0,0,1);
                                    return newvr.multiplyQuaternions(cur,diffq);
//                                    return q;
                                }
                            );
                        }
                        return t;
                    })
                }
                this.el.lastt={x:p.x, y:p.y, z:p.z};
                this.el.lastq.copy(q).normalize();
            
            }

//            txt3.setAttribute("value", "Q: " + q.x.toFixed(2) + ", " + q.y.toFixed(2) + ", " + q.z.toFixed(2) + ", " + q.w.toFixed(2));

        }
    });

}
