$.ajax({
    type: 'get',
    url: 'https://xhydsy.cn/getMusic',
    success(data) {
        createMusicPlayer({
            musicList: data,
            musicName: 'musicName',
            musicPath: 'path',
            apiHost: 'https://xhydsy.cn'
        })
    }
})

/**
 * musicList 音乐列表数组
 * musicName 音乐名对应字段名
 * musicPath 音乐路径对应字段名
 * apiHost 音乐数据获取域名
 * musicBackground 音乐背景图对应字段名 可选参数
 * @param options
 */
function createMusicPlayer(options) {
    var musicList = options.musicList
    var musicIndex = 0
    if (!options.musicBackground) {
        options.musicBackground = 'https://xhydsy.cn/public/img/2020-4-3/music.png'
    }
    document.querySelector('body').innerHTML += `<audio preload="auto" src="https://xhydsy.cn/public/img/4-3-2020,/%E8%B5%B7%E9%A3%8E%E4%BA%86.mp3"></audio>
<div class="audio_box">
    <div class="open_box">
        <div class="left_audio_box">
            <div class="control_left"></div>
        </div>
        <div class="right_audio_box">
            <div class="audio_top">
                <div class="music_name">
                    <span>起风了</span>
                </div>
                <div class="control_right">
                    <img class="lastMusic" src="https://xhydsy.cn/public/img/2020-4-3/last.png" alt="" srcset="">
                    <img class="control" src="https://xhydsy.cn/public/img/2020-4-3/start.png" alt="" srcset="">
                    <img class="nextMusic" src="https://xhydsy.cn/public/img/2020-4-3/next.png" alt="" srcset="">
                </div>
            </div>
            <div class="audio_bottom">
                <div class="progress_wrap">
                    <div class="progress_bar">
                        <div class="load_progress"></div>
                        <div class="inner_progress"></div>
                    </div>
                </div>
                <div class="musicTime">
                    <span class="currentTime">00:00</span>
                    <span>/</span>
                    <span class="duration">00:00</span>
                </div>
                <div class="volume">
                    <img src="https://xhydsy.cn/public/img/2020-4-3/volume.png" alt="" srcset="">
                    <div class="volume_progress_wrap">
                        <div class="volume_progress">
                            <div class="inner_volume_progress"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="switcher">
        <img src="https://xhydsy.cn/public/img/2020-4-4/1585966075575jt.png" alt="" srcset="">
    </div>
</div>`
    //audio为audio标签的dom，outerProgress为外部进度条，innerProgress为内部进度条，loadProgress为加载进度条
    //duration为显示总时长的dom，currentTime为显示进度时间的dom,wrapProgress为进度条最外层盒子用于拉动进度条
    //positionBox为wrapProgress的定位父级dom,需要保证positionBox为wrapProgress最近定位父级并且该父级的父级为document，否则不适用需要另外写计算麻烦些
    //distance 右边盒子与最外层盒子的距离
    //该类只对音乐的播放暂停与进度条进行操作
    //音量，图标更换以及上下一首另外编写
    function Music(options) {
        this.isFirst = true //是否第一次加载
        this.audio = options.audio
        this.timer = null //音乐播放器只需要一个定时器
        this.outerProgress = options.outerProgress
        this.innerProgress = options.innerProgress
        this.loadProgress = options.loadProgress
        this.outerProgressW = 0
        this.duration = options.duration
        this.currentTime = options.currentTime
        this.wrapProgress = options.wrapProgress
        this.innerProgressW = 0
        this.positionBox = options.positionBox
        this.distance = options.distance
        this.isLoaded = false;
        let _this = this
        //控制进度条
        this.wrapProgress.onmousedown = function () {
            clearInterval(_this.timer) //必须清除否则会在onmousedown和onmouseup之间设置了innerProgressW使得调整音乐无效
            _this.outerProgressW = _this.outerProgress.offsetWidth
            _this.innerProgressW = window.event.offsetX
            if (_this.innerProgressW > _this.outerProgress.offsetWidth) {
                _this.innerProgressW = _this.outerProgress.offsetWidth
            }
            _this.innerProgress.style.width = _this.innerProgressW + 'px'
            document.onmousemove = () => {
                _this.innerProgressW = window.event.offsetX
                if (_this.innerProgressW > _this.outerProgress.offsetWidth) {
                    _this.innerProgressW = _this.outerProgress.offsetWidth
                }
                _this.innerProgress.style.width = _this.innerProgressW + 'px'
            }
            document.onmouseup = () => {
                _this.audio.currentTime = _this.innerProgressW / this.offsetWidth * _this.audio.duration
                if (!isToPlay) _this.musicPlay()
                _this.setAll()
                document.onmousemove = null
                document.onmouseup = null
            }
        }
        //     //监听audio的src属性变化
        // Object.defineProperty(this.audio, 'src', {
        //     get: function() {
        //         return src;
        //     },
        //     set: function(newValue) {
        //         src = newValue;
        //         // 这样修改dom页面不渲染？？？
        //     }
        // })

    }

    Music.prototype.musicSwitch = function (src) {
        this.audio.src = src
        this.switchRender()
    }
    Music.prototype.musicPause = function () {
        this.audio.pause()
        clearInterval(this.timer)
    }
    Music.prototype.showDuration = function () {
        this.durationM = parseInt(this.audio.duration / 60)
        if (this.durationM < 10) {
            this.durationM = '0' + this.durationM
        }
        this.durationS = parseInt(this.audio.duration % 60)
        if (this.durationS < 10) {
            this.durationS = '0' + this.durationS
        }
        this.duration.innerText = this.durationM + ':' + this.durationS
    }
    Music.prototype.musicPlay = function () {
        this.outerProgressW = this.outerProgress.offsetWidth
        clearInterval(this.timer)
        if (!this.isLoaded) {
            return
        }
        this.audio.play()
        this.timer = setInterval(() => {
            this.setAll()
        }, 1000)
    }

    // 同步显示的所有进度方法总方法
    Music.prototype.setAll = function () {
        this.showDuration()
        this.musicProgress()
        this.calculationTime()
        this.setLoadProgress()
    }
    //进度条同步
    Music.prototype.musicProgress = function () {
        this.innerProgressW = this.audio.currentTime / this.audio.duration * this.outerProgressW
        this.innerProgress.style.width = this.innerProgressW + 'px'
    }
    Music.prototype.run = function () { //实例化第一次初始化页面音乐基本数据
        this.showDuration()
        this.calculationTime()
        this.timer = setInterval(() => {
            this.setLoadProgress()
        }, 1000)
    }
    // 音乐切换还未加载完前的初始化页面数据
    Music.prototype.switchRender = function () {
        this.currentTime.innerText = '00:00'
        this.duration.innerText = '00:00'
        this.innerProgress.style.width = '0px'
        this.loadProgress.style.width = 0
    }
    //加载进度条设置
    Music.prototype.setLoadProgress = function () {
        if (this.isLoaded) return
        let timeRanges = this.audio.buffered
        this.loadProgress.style.width = this.outerProgressW * timeRanges.end(timeRanges.length - 1) / this.audio.duration + 'px'
        if ((timeRanges.end(timeRanges.length - 1) / this.audio.duration) >= 1) {
            this.isLoaded = true
        }
    }
    // 时间同步
    Music.prototype.calculationTime = function () {
        this.currentTimeM = parseInt(this.audio.currentTime / 60)
        if (this.currentTimeM < 10) {
            this.currentTimeM = '0' + this.currentTimeM
        }
        this.currentTimeS = parseInt(this.audio.currentTime % 60)
        if (this.currentTimeS < 10) {
            this.currentTimeS = '0' + this.currentTimeS
        }
        this.currentTime.innerText = this.currentTimeM + ':' + this.currentTimeS
    }
    var musicObj = new Music({
        audio: document.querySelector('audio'),
        outerProgress: document.querySelector('.progress_bar'),
        innerProgress: document.querySelector('.inner_progress'),
        duration: document.querySelector('.duration'),
        currentTime: document.querySelector('.currentTime'),
        wrapProgress: document.querySelector('.progress_wrap'),
        positionBox: document.querySelector('.audio_box'),
        loadProgress: document.querySelector('.load_progress'),
        distance: 67
    })
    var isToPlay = true
    var isMute = false
    var volume = 1
    musicObj.audio.addEventListener("canplay", function () { //在每次修改audio的currentTime时，如果加载完成都会触发一次
        musicObj.setAll()
        if (musicObj.isFirst) {
            musicObj.isFirst = !musicObj.isFirst
            musicObj.run()
        }
        //监听audio是否加载完毕，如果加载完毕，则读取audio播放时间，并不代表全部音乐加载完毕，只是部分加载完毕以及其它基本信息获取        
        musicObj.isLoaded = true
        if (!isToPlay) {
            musicObj.musicPlay()
        }
    });
    musicObj.audio.addEventListener('ended', function () {
        $('.nextMusic').click()
    }, false);

    //开始暂停音乐方法调用与图标切换
    function control() {
        if (isToPlay) {
            musicObj.musicPlay()
            $('.control_left').css('background-image', 'url(https://xhydsy.cn/public/img/2020-4-3/pause.png)')
            $('.control')[0].src = 'https://xhydsy.cn/public/img/2020-4-3/pause2.png'
        } else {
            musicObj.musicPause()
            $('.control_left').css('background-image', 'url(https://xhydsy.cn/public/img/2020-4-3/play.png)')
            $('.control')[0].src = 'https://xhydsy.cn/public/img/2020-4-3/start.png'
        }
        isToPlay = !isToPlay
    }

    $('.control_left').click(control)
    $('.control').click(control)

    //音量
    document.querySelector('.volume img').onclick = function () {
        if (isMute) {
            musicObj.audio.volume = 0
            this.src = 'https://xhydsy.cn/public/img/2020-4-3/mute.png'
        } else {
            this.src = 'https://xhydsy.cn/public/img/2020-4-3/volume.png'
            musicObj.audio.volume = volume
        }
        isMute = !isMute
    }
    document.querySelector('.volume_progress_wrap').onmousedown = function () {
        var outerH = $('.volume_progress').height()
        let h = 0
        if (window.event.target == document.querySelector('.inner_volume_progress')) {
            h = window.event.offsetY
        } else {
            h = outerH - window.event.offsetY
        }
        if (h > outerH) {
            h = outerH
        }
        $('.inner_volume_progress').css('height', h)
        document.onmousemove = () => {
            if (window.event.target == document.querySelector('.inner_volume_progress')) {
                h = window.event.offsetY
            } else {
                h = outerH - window.event.offsetY
            }
            if (h > outerH) {
                h = outerH
            }
            $('.inner_volume_progress').css('height', h)
        }
        document.onmouseup = () => {
            document.onmousemove = null
            document.onmouseup = null
            volume = h / outerH
            if (volume > 1) {
                volume = 1
            }
            musicObj.audio.volume = volume
        }
    }

    // 切换歌曲
    $('.lastMusic').click(function () {
        clearInterval(musicObj.timer)
        // musicObj.switchRender()
        musicObj.isLoaded = false
        if (--musicIndex < 0) {
            musicIndex = musicList.length - 1
        }
        changMusic(musicList[musicIndex])
    })
    $('.nextMusic').click(function () {
        clearInterval(musicObj.timer)
        // musicObj.switchRender()
        musicObj.isLoaded = false
        if (++musicIndex > musicList.length - 1) {
            musicIndex = 0
        }
        changMusic(musicList[musicIndex])
    })

    function changMusic(music) {
        $('.left_audio_box').css({
            'background-image': options.musicBackground
        })
        $('.music_name span')[0].innerText = music.musicName
        musicObj.musicSwitch(options.apiHost + music[options.musicPath])
    }

    //音乐播放器伸展
    var isOpen = false
    $('.switcher').click(function () {
        if (!isOpen) {
            $('.audio_box').addClass('outer_box')
            $('.right_audio_box').addClass('open')
            $('.switcher>img').addClass('rotateZ')
        } else {
            $('.audio_box').removeClass('outer_box')
            $('.right_audio_box').removeClass('open')
            $('.switcher>img').removeClass('rotateZ')
        }
        isOpen = !isOpen
    })

    $('.audio_box').show()
    changMusic(musicList[0])
}