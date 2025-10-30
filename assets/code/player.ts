import { _decorator, Collider, Component, director, Input, input, Label, math, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {

    //弹窗节点
    @property(Node)
    Tips_Node: Node = null 

    //文本组件 修改内容：文本组件.string = '要修改的内容'
    @property(Label)
    Tips_label: Label

    @property // 使变量可以在编辑器编辑
    player_Speed: number = 18

    @property(Node)
    player_Node: Node = null //后续在编辑器中拉进来 想绑定节点自身this.node

    player_Colider: Collider = null //定义一个空的碰撞组件
    // player_Colider = this.player_Node.getComponent(Collider) 不能这样写 不然就在一个类内重复声明一个属性了

    @property(Node)
    Camera_Node: Node = null //这是ts创建新对象的格式 对象名:类 先在property下创建一个空节点 以后绑定相机

    player_MOVE = {a: false, d: false} //控制角色移动
    is_MOVE = true //赛车是否移动
    origin_player_pos = null //赛车初始位置
    origin_camera_pos = null //初始相机位置

    onLoad(){
        
        // this.origin_player_pos = this.player_Node.getPosition() //赛车初始位置
        // this.origin_camera_pos = this.Camera_Node.getPosition() //初始相机位置


        //Input.on(监听类型, 触发后执行的函数, this)
        input.on(Input.EventType.KEY_DOWN, this.KEY_DOWN, this); //监听开启.注册一个 按下 事件类型
        input.on(Input.EventType.KEY_UP, this.KEY_UP, this); //监听开启. 注册一个 抬起 事件类型


        // 监听碰撞触发类型：onTriggerEnter 开始触发
 		// 			 onTriggerStay 持续触发
        //             onTriggerExit  结束触发
        this.player_Colider = this.player_Node.getComponent(Collider) //获取当前节点的碰撞组件
        this.player_Colider.on('onTriggerEnter', this.Start_colide, this) //.on, 注册碰撞监听 类型：碰撞触发
    }

    onDestroy(){
        input.off(Input.EventType.KEY_DOWN, this.KEY_DOWN, this); //监听关闭
        input.off(Input.EventType.KEY_UP, this.KEY_UP, this); //监听开启. 抬起

        this.player_Colider.off('onTriggerEnter', this.Start_colide, this) //关闭监听
    }

    //碰撞事件触发的执行函数
    Start_colide(C){ // 默认参数C 返回碰撞组件的信息
        this.Tips_Node.active = true //当触发碰撞事件时，提示框弹出。
        this.is_MOVE = false
        console.log(C) //C.otherCollider.node.name就是碰撞到的节点的名字
        if(C.otherCollider.node.name == "airwall"){
            this.Tips_label.string = "成功" //修改文本
            console.log(C.otherCollider.node.name, "成功")
        }else{
            console.log(C.otherCollider.node.name, "失败")
            this.Tips_label.string = "失败"
        }
    }


    //按下按钮的执行函数
    Star_game(Button){ // 按钮执行函数的默认参数Button显示按钮信息
        console.log("按下了按钮")
        // this.Tips_Node.active = false///1、隐藏提示框
        // this.player_Node.setPosition(this.origin_player_pos.x, this.origin_player_pos.y, this.origin_player_pos.z)//2、初始化赛车节点
        // this.Camera_Node.setPosition(this.origin_camera_pos.x, this.origin_camera_pos.y, this.origin_camera_pos.z)//3、初始化相机节点
        // this.is_MOVE = true//4、允许移动 Is_Move是控制整个游戏是否进行的别忘记了。

        director.loadScene('littlecar') //重新加载场景

    }



    //键盘事件触发的执行函数KEY_DOWN, KEY_UP
    KEY_DOWN(key){
        if(key.keyCode == 65){
            this.player_MOVE.a = true
            // console.log("按下了A")
        }else if(key.keyCode == 68){
            this.player_MOVE.d = true
            // console.log("按下了D")
        }
    }

    KEY_UP(key){
        if(key.keyCode == 65){
            this.player_MOVE.a = false
            // console.log("抬起了A")
        }else if(key.keyCode == 68){
            this.player_MOVE.d = false
            // console.log("抬起了D")
        }
    }

    start() {

    }

    update(deltaTime: number) { //deltaTime指的是每帧的时间 假如每秒60帧，那每帧就是0.01s（1毫秒） 1/60
        // console.log(deltaTime)

        if(!this.is_MOVE){
            return; // 每帧都在判断是否发生碰撞 如果发生了就不再移动
        }
        //获取节点位置
        //先获取节点位置: 节点.getPosition()
        //再修改节点位置  节点.setPosition(x,y,z)
        const pos = this.node.getPosition()
        const Speed = deltaTime*this.player_Speed //帧时间补偿
        if(this.player_MOVE.a && !this.player_MOVE.d){
            pos.x = pos.x - Speed //每个坐标都要帧时间补偿
        }else if(this.player_MOVE.d && !this.player_MOVE.a){
            pos.x = pos.x + Speed
        }//同时按下左右就不移动

        //限制节点移动范围（左右）
        if(pos.x > 3){
            pos.x = 3
        }else if(pos.x < -3){
            pos.x = -3
        }



        //player前后移动 修改节点坐标
        this.node.setPosition(pos.x, pos.y, pos.z - Speed )
        const C_pos = this.Camera_Node.getPosition() //获得相机节点的坐标
        this.Camera_Node.setPosition(C_pos.x, C_pos.y, C_pos.z - Speed) //相机节点的z跟着移动就可以 x y不需要变
        // console.log(deltaTime*this.player_Speed)
        //帧时间补偿 不管帧率怎么下降 总能让坐标每秒移动0.3*正常帧数 = 18(正常帧数每秒能移动的距离)
        //0.3是正常的每帧移动距离，18是每秒移动距离也就是速度
        //每帧移动距离*帧数=速度
        //每帧移动距离=速度/帧数
        //每帧移动距离=速度*帧时间（1/帧数)
    
    }
}


